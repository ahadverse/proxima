import type {
  AdminProductDTO,
  CategoryRefDTO,
  ChangelogEntryDTO,
  ProductCardDTO,
  ProductDetailDTO,
} from '@/shared';
import type { IProduct } from './product.model';

type PopulatedCategory = { _id: unknown; name: CategoryRefDTO['name']; slug: string } | null;
type ProductDoc = Omit<Partial<IProduct>, 'category'> & { _id: unknown; category?: unknown };

function toCategoryRef(category: unknown): CategoryRefDTO | null {
  const value = category as PopulatedCategory;
  if (!value || typeof value !== 'object' || !('slug' in value)) return null;
  return { _id: String(value._id), name: value.name, slug: value.slug };
}

const iso = (value: Date | string | undefined | null) => (value ? new Date(value).toISOString() : '');

export function toCardDTO(product: ProductDoc): ProductCardDTO {
  return {
    _id: String(product._id),
    slug: product.slug ?? '',
    type: product.type ?? 'website',
    title: product.title ?? { en: '', bn: '' },
    shortDescription: product.shortDescription ?? { en: '', bn: '' },
    category: toCategoryRef(product.category),
    techStack: product.techStack ?? 'nextjs',
    price: product.price ?? 0,
    compareAtPrice: product.compareAtPrice ?? null,
    isFree: Boolean(product.isFree),
    thumbnail: product.thumbnail ?? '',
    previewUrl: product.previewUrl ?? '',
    views: product.views ?? 0,
    sales: product.sales ?? 0,
    ratingAvg: Math.round((product.ratingAvg ?? 0) * 10) / 10,
    ratingCount: product.ratingCount ?? 0,
    featured: Boolean(product.featured),
    createdAt: iso(product.createdAt),
    updatedAt: iso(product.updatedAt),
  };
}

function toChangelog(entries: IProduct['changelog'] | undefined): ChangelogEntryDTO[] {
  return (entries ?? [])
    .map((entry) => ({ version: entry.version, date: iso(entry.date), notes: entry.notes }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function toDetailDTO(product: ProductDoc): ProductDetailDTO {
  const demo = product.demoAdmin;
  const showDemo = Boolean(demo?.isPublic && (demo.url || demo.email));
  return {
    ...toCardDTO(product),
    description: product.description ?? { en: '', bn: '' },
    gallery: product.gallery ?? [],
    tutorialUrl: product.tutorialUrl ?? '',
    techTags: product.techTags ?? [],
    highlights: product.highlights ?? [],
    features: product.features ?? [],
    changelog: toChangelog(product.changelog),
    version: product.version ?? '',
    demoAdmin: showDemo && demo ? { url: demo.url, email: demo.email, password: demo.password } : null,
    seo: product.seo ?? { title: '', description: '' },
  };
}

export function toAdminDTO(product: ProductDoc): AdminProductDTO {
  const demo = product.demoAdmin ?? { url: '', email: '', password: '', isPublic: false };
  return {
    ...toDetailDTO(product),
    status: product.status ?? 'draft',
    order: product.order ?? 0,
    githubUrl: product.githubUrl ?? '',
    file: product.file ? { key: product.file.key, name: product.file.name, size: product.file.size } : null,
    demoAdminFull: { url: demo.url, email: demo.email, password: demo.password, isPublic: demo.isPublic },
  };
}
