/**
 * Adds (or updates) a theme in the catalog from a theme folder. One script for every theme: a theme is only data.
 * Run from `backend/`:
 *
 *   pnpm tsx src/scripts/add-theme.ts <themes/slug folder> [--dry-run] [--force] [--images]
 *
 * The folder holds `theme.json` (see themes/README.md for every field) and the screenshots it names. The screenshots are
 * full-page captures; they are converted to WebP and uploaded to the public bucket under images/<yyyy>/<mm>/ like any admin
 * upload. The first gallery image is also the card thumbnail.
 *
 * A new product is always created as a DRAFT: nothing is visible to shoppers until it is published in the admin, where the
 * GitHub link and the source zip (which buyers receive) are also filled in.
 *   (none)     stops if the slug already exists
 *   --force    replaces the product's data and keeps its status, its current images, its sales and its ratings
 *   --images   with --force, uploads the screenshots again and points the product at the new files
 *   --images-only  only replaces the thumbnail and gallery of an existing product (theme.json then needs just slug and gallery);
 *              every other field, including edits made in the admin, is left alone
 *   --dry-run  checks theme.json against the admin's own schema and converts the images into <folder>/webp;
 *              touches neither the bucket nor the database
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { productInputSchema, type Localized } from '@/shared';
import { connectDatabase, disconnectDatabase } from '../db/connect';
import { PUBLIC_BUCKET, publicUrl, putObject } from '../lib/r2';
import { Category } from '../modules/category/category.model';
import { syncProductCounts } from '../modules/category/category.service';
import { Product } from '../modules/product/product.model';
import { randomKey } from '../utils/ids';
import { HIGHLIGHTS } from './seed/data';

interface ImageRef {
  file: string;
  /** Output width in px (never enlarged). Defaults to 900 for the thumbnail and 1400 for gallery images. */
  width?: number;
}

interface Theme {
  slug: string;
  category: string;
  title: Localized;
  shortDescription: Localized;
  /** HTML paragraphs that open the description, per language. */
  intro: { en: string[]; bn: string[] };
  features: Localized[];
  whatYouGet: Localized[];
  techStack?: 'nextjs' | 'react' | 'html' | 'wordpress' | 'other';
  techTags: string[];
  price: number;
  compareAtPrice: number | null;
  previewUrl: string;
  tutorialUrl?: string;
  demoAdmin?: { url: string; email: string; password: string; isPublic: boolean };
  version?: string;
  changelog?: { version: string; notes: Localized }[];
  /** Defaults to the standard six selling points every website theme carries. */
  highlights?: Localized[];
  seo: { title: string; description: string };
  featured?: boolean;
  order?: number;
  /** The first gallery image is used for the card thumbnail unless `thumbnail` names another file. */
  gallery: ImageRef[];
  thumbnail?: ImageRef;
}

const FREE_HOSTING: Localized = { en: 'Free hosting', bn: 'ফ্রি হোস্টিং' };

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const reuploadImages = args.includes('--images');
const imagesOnly = args.includes('--images-only');
const folder = args.find((a) => !a.startsWith('--'));

const log = (message: string) => console.log(`  ${message}`);
const list = (items: Localized[], lang: 'en' | 'bn') => `<ul>${items.map((i) => `<li>${i[lang]}</li>`).join('')}</ul>`;

function buildDescription(theme: Theme): Localized {
  return {
    en: `${theme.intro.en.join('')}<h3>Key features</h3>${list(theme.features, 'en')}<h3>What you get</h3>${list(theme.whatYouGet, 'en')}`,
    bn: `${theme.intro.bn.join('')}<h3>প্রধান ফিচারসমূহ</h3>${list(theme.features, 'bn')}<h3>যা পাবেন</h3>${list(theme.whatYouGet, 'bn')}`,
  };
}

function monthFolder(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function upload(name: string, ref: ImageRef, defaultWidth: number): Promise<string> {
  const source = path.join(folder!, ref.file);
  const body = await sharp(source)
    .resize({ width: ref.width ?? defaultWidth, withoutEnlargement: true })
    .webp({ quality: 84, effort: 5, smartSubsample: true })
    .toBuffer();
  const meta = await sharp(body).metadata();
  if (dryRun) {
    const out = path.join(folder!, 'webp');
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, `${name}.webp`), body);
    log(`${name}.webp  ${meta.width}x${meta.height}  ${(body.length / 1024).toFixed(0)} KB (not uploaded)`);
    return `https://example.com/dry-run/${name}.webp`;
  }
  const key = `images/${monthFolder()}/${randomKey()}-${name}.webp`;
  await putObject({ bucket: PUBLIC_BUCKET, key, body, contentType: 'image/webp' });
  log(`${key}  ${meta.width}x${meta.height}  ${(body.length / 1024).toFixed(0)} KB`);
  return publicUrl(key);
}

async function main() {
  if (!folder || !fs.existsSync(path.join(folder, 'theme.json'))) throw new Error('Pass a theme folder that contains theme.json.');
  const theme = JSON.parse(fs.readFileSync(path.join(folder, 'theme.json'), 'utf8')) as Theme;
  const slug = theme.slug;
  if (!slug || !theme.gallery?.length) throw new Error('theme.json needs a slug and at least one gallery image.');

  const needImages = dryRun || !force || reuploadImages || imagesOnly;
  if (needImages) {
    for (const ref of [...theme.gallery, ...(theme.thumbnail ? [theme.thumbnail] : [])]) {
      if (!fs.existsSync(path.join(folder, ref.file))) throw new Error(`Missing screenshot ${ref.file} in ${folder}`);
    }
  }

  console.log(`\n${dryRun ? 'Checking' : 'Adding'} the theme "${slug}"${dryRun ? ' (dry run)' : ''}`);

  const uploadImages = async () => {
    const thumbRef = theme.thumbnail ?? theme.gallery[0];
    const thumbnail = await upload(`${slug}-card`, thumbRef, 900);
    const gallery: string[] = [];
    for (const ref of theme.gallery) gallery.push(await upload(`${slug}-${path.parse(ref.file).name}`, ref, 1400));
    return { thumbnail, gallery };
  };

  const buildData = (images: { thumbnail: string; gallery: string[] }) => ({
    type: 'website' as const,
    slug,
    title: theme.title,
    shortDescription: theme.shortDescription,
    description: buildDescription(theme),
    techStack: theme.techStack ?? ('nextjs' as const),
    techTags: theme.techTags,
    price: theme.price,
    compareAtPrice: theme.compareAtPrice,
    isFree: theme.price === 0,
    thumbnail: images.thumbnail,
    gallery: images.gallery,
    previewUrl: theme.previewUrl,
    tutorialUrl: theme.tutorialUrl ?? '',
    demoAdmin: theme.demoAdmin ?? { url: '', email: '', password: '', isPublic: false },
    version: theme.version ?? '1.0.0',
    // Proxima hosts every theme for free, so it is one of the standard selling points next to the usual six.
    highlights: theme.highlights ?? [...HIGHLIGHTS, FREE_HOSTING],
    features: theme.features,
    changelog: (theme.changelog ?? [{ version: '1.0.0', notes: { en: 'Initial release.', bn: 'প্রথম রিলিজ।' } }]).map((c) => ({
      version: c.version,
      notes: c.notes,
      date: new Date(),
    })),
    seo: theme.seo,
    featured: theme.featured ?? false,
    order: theme.order ?? 0,
  });

  /** The same check the admin form runs on save, so the product can be edited there later without errors. */
  const validate = (data: ReturnType<typeof buildData>, status: 'draft' | 'published', category: string) => {
    const result = productInputSchema.safeParse({
      ...data,
      status,
      category,
      githubUrl: '',
      file: null,
      changelog: data.changelog.map((c) => ({ ...c, date: c.date.toISOString() })),
    });
    if (!result.success) throw new Error(`theme.json does not pass the admin's product schema: ${JSON.stringify(result.error.issues.slice(0, 5))}`);
  };

  if (dryRun) {
    const images = await uploadImages();
    if (!imagesOnly) {
      validate(buildData(images), 'draft', '000000000000000000000000');
      log('theme.json passes the admin product schema');
    }
    console.log('Done. Nothing was uploaded and the database was not touched.\n');
    return;
  }

  await connectDatabase();
  if (imagesOnly) {
    const existing = await Product.findOne({ slug }).select('_id').lean();
    if (!existing) throw new Error(`No product "${slug}" to update: --images-only only replaces the images of an existing product.`);
    const images = await uploadImages();
    await Product.updateOne({ slug }, { $set: { thumbnail: images.thumbnail, gallery: images.gallery } });
    log(`Images of "${slug}" replaced; every other field is untouched`);
    console.log('Done. The storefront shows them once its cache refreshes (or after the next save in the admin).\n');
    return;
  }

  const category = await Category.findOne({ slug: theme.category });
  if (!category) throw new Error(`Category "${theme.category}" does not exist. Run the seed first.`);
  const current = await Product.findOne({ slug }).select('thumbnail gallery status').lean();
  if (current && !force) {
    log(`A product with the slug "${slug}" already exists. Use --force to replace its data (add --images to upload the screenshots again).`);
    return;
  }

  let images: { thumbnail: string; gallery: string[] };
  if (current && !reuploadImages) {
    images = { thumbnail: current.thumbnail, gallery: current.gallery };
    log('Keeping the existing images');
  } else {
    images = await uploadImages();
  }

  const data = { ...buildData(images), category: category._id };
  validate(buildData(images), current?.status ?? 'draft', String(category._id));
  log('theme.json passes the admin product schema');

  if (current) await Product.updateOne({ slug }, { $set: data });
  else await Product.create({ ...data, status: 'draft' });
  await syncProductCounts();
  log(`Product "${slug}" ${current ? `updated (status stays "${current.status}")` : 'created as a draft'} in category "${theme.category}"`);
  if (!current) console.log('Done. Publish it from the admin once the GitHub link and source zip are added.\n');
  else console.log('Done.\n');
}

main()
  .catch((error: Error) => {
    console.error(`\nFailed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase().catch(() => undefined));
