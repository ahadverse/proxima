import argon2 from 'argon2';
import sharp from 'sharp';
import { env } from '../config/env';
import { connectDatabase, createAllIndexes, disconnectDatabase } from '../db/connect';
import { PUBLIC_BUCKET, publicUrl, putObject } from '../lib/r2';
import { Category } from '../modules/category/category.model';
import { syncProductCounts } from '../modules/category/category.service';
import { Coupon } from '../modules/coupon/coupon.model';
import { Page } from '../modules/page/page.model';
import { Product } from '../modules/product/product.model';
import { defaultSettings } from '../modules/setting/setting.defaults';
import { SITE_SETTINGS_KEY, Setting } from '../modules/setting/setting.model';
import { User } from '../modules/user/user.model';
import { HIGHLIGHTS, categories, descriptionFor, featuresFor, membership, pages, products } from './seed/data';
import { dashboardMockup, membershipMockup, websiteMockup } from './seed/mockups';

const log = (message: string) => console.log(`  ${message}`);

async function uploadSvg(svg: string, key: string, width: number): Promise<string> {
  const body = await sharp(Buffer.from(svg)).resize({ width }).webp({ quality: 84 }).toBuffer();
  await putObject({ bucket: PUBLIC_BUCKET, key, body, contentType: 'image/webp' });
  return publicUrl(key);
}

async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    log('Skipped admin account: set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env and run the seed again.');
    return;
  }
  if (env.ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters.');

  const email = env.ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      log(`Promoted ${email} to admin`);
    } else {
      log(`Admin ${email} already exists`);
    }
    return;
  }
  await User.create({
    name: 'Proxima Admin',
    email,
    passwordHash: await argon2.hash(env.ADMIN_PASSWORD, { type: argon2.argon2id }),
    role: 'admin',
  });
  log(`Created admin ${email}`);
}

async function seedCategories() {
  const ids = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const doc = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $setOnInsert: { ...category, order: index, isActive: true } },
      { upsert: true, new: true },
    );
    ids.set(category.slug, String(doc._id));
  }
  log(`Categories ready (${ids.size})`);
  return ids;
}

async function seedProducts(categoryIds: Map<string, string>) {
  let created = 0;
  for (const [index, item] of products.entries()) {
    if (await Product.exists({ slug: item.slug })) continue;

    const thumbnail = await uploadSvg(
      websiteMockup({ name: item.name, tagline: item.tagline, palette: item.palette, seed: item.slug }),
      `images/seed/${item.slug}.webp`,
      900,
    );
    const dashboard = await uploadSvg(
      dashboardMockup({ name: item.name, palette: item.palette, seed: item.slug }),
      `images/seed/${item.slug}-dashboard.webp`,
      1400,
    );

    const releasedAt = new Date(Date.now() - (products.length - index) * 6 * 24 * 60 * 60 * 1000);
    await Product.create({
      type: item.type,
      status: 'published',
      slug: item.slug,
      category: categoryIds.get(item.category),
      title: {
        en: `${item.name} - ${capitalize(item.kind.en)}`,
        bn: `${item.name} - ${item.kind.bn}`,
      },
      shortDescription: {
        en: `A production-ready ${item.kind.en} built with Next.js, with an admin dashboard and local payment support.`,
        bn: `Next.js দিয়ে তৈরি প্রোডাকশন-রেডি ${item.kind.bn}, অ্যাডমিন ড্যাশবোর্ড ও লোকাল পেমেন্ট সাপোর্টসহ।`,
      },
      description: descriptionFor(item),
      techStack: item.techStack,
      techTags: item.techTags,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      isFree: item.price === 0,
      thumbnail,
      gallery: [thumbnail, dashboard],
      highlights: item.type === 'plugin' ? HIGHLIGHTS.filter((h) => h.en !== 'Free Vercel setup') : HIGHLIGHTS,
      features: featuresFor(item),
      version: '1.2.0',
      changelog: [
        {
          version: '1.2.0',
          date: new Date(releasedAt.getTime() + 20 * 24 * 60 * 60 * 1000),
          notes: { en: 'Upgraded to Next.js 16 and improved checkout speed.', bn: 'Next.js 16-এ আপগ্রেড এবং চেকআউটের গতি বৃদ্ধি।' },
        },
        {
          version: '1.0.0',
          date: releasedAt,
          notes: { en: 'Initial release.', bn: 'প্রথম রিলিজ।' },
        },
      ],
      featured: Boolean(item.featured),
      order: index,
      views: item.views,
      sales: item.sales,
      createdAt: releasedAt,
    });
    created += 1;
    log(`Product ${item.slug}`);
  }
  log(`Products created: ${created}`);
}

async function seedMembership() {
  if (await Product.exists({ type: 'membership' })) {
    log('Membership product already exists');
    return;
  }
  const thumbnail = await uploadSvg(membershipMockup(), 'images/seed/lifetime-membership.webp', 900);
  await Product.create({
    type: 'membership',
    status: 'published',
    slug: membership.slug,
    category: null,
    title: membership.title,
    shortDescription: membership.shortDescription,
    description: membership.description,
    techStack: 'nextjs',
    techTags: [],
    price: membership.price,
    compareAtPrice: membership.compareAtPrice,
    thumbnail,
    gallery: [thumbnail],
    highlights: membership.highlights,
    features: [],
    version: '',
    featured: false,
  });
  log('Membership product created');
}

async function seedCoupon() {
  const code = defaultSettings().promoPopup.couponCode;
  const exists = await Coupon.exists({ code });
  if (exists) return;
  await Coupon.create({ code, type: 'percent', value: 20, appliesTo: 'membership', minAmount: 0, isActive: true });
  log(`Coupon ${code} created (20% off membership)`);
}

async function seedSettingsAndPages() {
  await Setting.updateOne(
    { key: SITE_SETTINGS_KEY },
    { $setOnInsert: { key: SITE_SETTINGS_KEY, data: defaultSettings() } },
    { upsert: true },
  );
  for (const page of pages) {
    await Page.updateOne({ slug: page.slug }, { $setOnInsert: { ...page, isPublished: true } }, { upsert: true });
  }
  log(`Settings and ${pages.length} pages ready`);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function main() {
  console.log('\nSeeding Proxima database');
  await connectDatabase();
  await createAllIndexes();
  log('Indexes created');
  await seedAdmin();
  const categoryIds = await seedCategories();
  await seedProducts(categoryIds);
  await seedMembership();
  await seedCoupon();
  await seedSettingsAndPages();
  await syncProductCounts();
  log('Category counts synced');
  await disconnectDatabase();
  console.log('Done.\n');
}

main().catch(async (error: Error) => {
  console.error(`\nSeed failed: ${error.message}\n`);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
