import type {
  ApiSuccess,
  CategoryDTO,
  MembershipDTO,
  PageDTO,
  PageSummaryDTO,
  PaginationMeta,
  ProductCardDTO,
  ProductDetailDTO,
  RatingDTO,
  SiteSettingsDTO,
  SortOption,
  VideoReviewDTO,
} from '@/shared';

/**
 * Server-side data access for the storefront. Every call is cached by Next.js
 * and tagged so the API can expire it the moment admins change something.
 */

const API_URL = (process.env.API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  tags?: string[];
  revalidate?: number;
}

async function request<T>(path: string, { tags = [], revalidate = 300 }: RequestOptions = {}): Promise<ApiSuccess<T>> {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    headers: { Accept: 'application/json' },
    next: { tags, revalidate },
  });
  const json = (await response.json().catch(() => null)) as (ApiSuccess<T> & { code?: string; message?: string }) | null;
  if (!response.ok || !json?.success) {
    throw new ApiRequestError(response.status, json?.code ?? 'REQUEST_FAILED', json?.message ?? `Request to ${path} failed`);
  }
  return json;
}

async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
}

export const EMPTY_SETTINGS: SiteSettingsDTO = {
  brand: { name: 'Proxima', tagline: { en: 'Marketplace', bn: 'মার্কেটপ্লেস' }, logo: '', footerAbout: { en: '', bn: '' } },
  contact: { whatsapp: '', messenger: '', email: '', phone: '', hours: { en: '', bn: '' }, address: { en: '', bn: '' }, tradeLicense: '' },
  socials: { facebook: '', youtube: '', instagram: '', linkedin: '', tiktok: '' },
  offerBar: {
    enabled: false,
    label: { en: '', bn: '' },
    price: 0,
    comparePrice: 0,
    mode: 'evergreen-daily',
    endsAt: null,
    ctaLabel: { en: '', bn: '' },
    ctaHref: '/membership',
  },
  promoPopup: { enabled: false, title: { en: '', bn: '' }, subtitle: { en: '', bn: '' }, couponCode: '', discountText: { en: '', bn: '' }, delaySeconds: 30 },
  hostingPromo: { enabled: false, title: { en: '', bn: '' }, text: { en: '', bn: '' }, ctaLabel: { en: '', bn: '' }, url: '' },
  paymentLogos: '',
  helpTopics: [],
  membershipFaq: [],
};

export async function getSettings(): Promise<SiteSettingsDTO> {
  try {
    return (await request<SiteSettingsDTO>('/settings/public', { tags: ['settings'], revalidate: 600 })).data;
  } catch {
    return EMPTY_SETTINGS;
  }
}

export async function getCategories(): Promise<CategoryDTO[]> {
  return (await request<CategoryDTO[]>('/categories', { tags: ['categories'], revalidate: 600 })).data;
}

export interface ProductListParams {
  category?: string;
  q?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export async function getProducts(params: ProductListParams): Promise<{ items: ProductCardDTO[]; meta: PaginationMeta }> {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.q) search.set('q', params.q);
  if (params.sort && params.sort !== 'default') search.set('sort', params.sort);
  if (params.page && params.page > 1) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  const result = await request<ProductCardDTO[]>(`/products${query ? `?${query}` : ''}`, {
    tags: ['products'],
    revalidate: params.q ? 120 : 300,
  });
  return { items: result.data, meta: result.meta! };
}

export async function getProduct(slug: string): Promise<ProductDetailDTO | null> {
  return orNull(
    request<ProductDetailDTO>(`/products/${encodeURIComponent(slug)}`, { tags: ['products', `product:${slug}`] }).then((r) => r.data),
  );
}

export async function getRelatedProducts(slug: string): Promise<ProductCardDTO[]> {
  try {
    return (await request<ProductCardDTO[]>(`/products/${encodeURIComponent(slug)}/related`, { tags: ['products'] })).data;
  } catch {
    return [];
  }
}

export async function getMembership(): Promise<MembershipDTO> {
  try {
    return (await request<MembershipDTO>('/membership', { tags: ['products'] })).data;
  } catch {
    return { product: null, counts: { websites: 0, plugins: 0 }, featured: [] };
  }
}

export async function getVideoReviews(): Promise<VideoReviewDTO[]> {
  try {
    return (await request<VideoReviewDTO[]>('/video-reviews', { tags: ['video-reviews'], revalidate: 600 })).data;
  } catch {
    return [];
  }
}

export async function getLatestRatings(): Promise<RatingDTO[]> {
  try {
    return (await request<RatingDTO[]>('/ratings/latest', { tags: ['ratings'], revalidate: 600 })).data;
  } catch {
    return [];
  }
}

export async function getPages(): Promise<PageSummaryDTO[]> {
  return (await request<PageSummaryDTO[]>('/pages', { tags: ['pages'], revalidate: 3600 })).data;
}

export async function getPage(slug: string): Promise<PageDTO | null> {
  return orNull(request<PageDTO>(`/pages/${encodeURIComponent(slug)}`, { tags: ['pages', `page:${slug}`], revalidate: 3600 }).then((r) => r.data));
}
