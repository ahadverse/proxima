import type {
  CouponScope,
  CouponType,
  LibrarySource,
  OfferMode,
  OrderStatus,
  PaymentProvider,
  ProductStatus,
  ProductType,
  RatingStatus,
  TechStack,
  UserRole,
} from './constants';

export interface Localized {
  en: string;
  bn: string;
}

/* ----------------------------- API envelope ----------------------------- */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiFieldError {
  path: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  code: string;
  errors?: ApiFieldError[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/* -------------------------------- Catalog -------------------------------- */

export interface CategoryDTO {
  _id: string;
  name: Localized;
  slug: string;
  icon: string;
  order: number;
  productCount: number;
  isActive: boolean;
}

export interface CategoryRefDTO {
  _id: string;
  name: Localized;
  slug: string;
}

export interface ProductCardDTO {
  _id: string;
  slug: string;
  type: ProductType;
  title: Localized;
  shortDescription: Localized;
  category: CategoryRefDTO | null;
  techStack: TechStack;
  price: number;
  compareAtPrice: number | null;
  isFree: boolean;
  thumbnail: string;
  previewUrl: string;
  views: number;
  sales: number;
  ratingAvg: number;
  ratingCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChangelogEntryDTO {
  version: string;
  date: string;
  notes: Localized;
}

export interface DemoAdminDTO {
  url: string;
  email: string;
  password: string;
}

export interface ProductDetailDTO extends ProductCardDTO {
  description: Localized;
  gallery: string[];
  tutorialUrl: string;
  techTags: string[];
  highlights: Localized[];
  features: Localized[];
  changelog: ChangelogEntryDTO[];
  version: string;
  demoAdmin: DemoAdminDTO | null;
  seo: { title: string; description: string };
}

export interface ProductSuggestionDTO {
  _id: string;
  slug: string;
  title: Localized;
  thumbnail: string;
  price: number;
  isFree: boolean;
  category: CategoryRefDTO | null;
}

export interface MembershipDTO {
  product: ProductDetailDTO | null;
  counts: { websites: number; plugins: number };
  featured: ProductCardDTO[];
}

/* -------------------------------- Ratings -------------------------------- */

export interface RatingDTO {
  _id: string;
  stars: number;
  comment: string;
  status: RatingStatus;
  user: { _id: string; name: string } | null;
  product?: { _id: string; slug: string; title: Localized; thumbnail: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingSummaryDTO {
  avg: number;
  count: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface ProductRatingsDTO {
  summary: RatingSummaryDTO;
  items: RatingDTO[];
  mine: RatingDTO | null;
  canRate: boolean;
}

/* -------------------------------- Content -------------------------------- */

export interface VideoReviewDTO {
  _id: string;
  youtubeId: string;
  url: string;
  title: Localized;
  description: Localized;
  order: number;
  isActive: boolean;
}

export interface PageDTO {
  _id: string;
  slug: string;
  title: Localized;
  content: Localized;
  isPublished: boolean;
  updatedAt: string;
}

export interface PageSummaryDTO {
  slug: string;
  title: Localized;
  updatedAt: string;
}

export interface SiteSettingsDTO {
  brand: { name: string; tagline: Localized; logo: string; footerAbout: Localized };
  contact: {
    whatsapp: string;
    messenger: string;
    email: string;
    phone: string;
    hours: Localized;
    address: Localized;
    tradeLicense: string;
  };
  socials: { facebook: string; youtube: string; instagram: string; linkedin: string; tiktok: string };
  offerBar: {
    enabled: boolean;
    label: Localized;
    price: number;
    comparePrice: number;
    mode: OfferMode;
    endsAt: string | null;
    ctaLabel: Localized;
    ctaHref: string;
  };
  promoPopup: {
    enabled: boolean;
    title: Localized;
    subtitle: Localized;
    couponCode: string;
    discountText: Localized;
    delaySeconds: number;
  };
  hostingPromo: { enabled: boolean; title: Localized; text: Localized; ctaLabel: Localized; url: string };
  paymentLogos: string;
  helpTopics: Localized[];
  membershipFaq: { q: Localized; a: Localized }[];
  updatedAt?: string;
}

/* ---------------------------------- Users --------------------------------- */

export interface MembershipStateDTO {
  active: boolean;
  activatedAt: string | null;
}

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isBanned: boolean;
  membership: MembershipStateDTO;
  createdAt: string;
  lastLoginAt: string | null;
}

/* --------------------------------- Commerce -------------------------------- */

export type QuoteLineStatus = 'ok' | 'owned' | 'unavailable';

export interface QuoteLineDTO {
  productId: string;
  product: ProductCardDTO | null;
  price: number;
  status: QuoteLineStatus;
}

export interface CartQuoteDTO {
  lines: QuoteLineDTO[];
  subtotal: number;
  discount: number;
  total: number;
  coupon: { code: string; discount: number } | null;
  couponError: string | null;
}

export interface OrderItemDTO {
  product: string;
  type: ProductType;
  title: Localized;
  slug: string;
  thumbnail: string;
  price: number;
}

export interface OrderDTO {
  _id: string;
  invoiceNo: string;
  user: string | { _id: string; name: string; email: string };
  customer: { name: string; email: string; phone: string };
  items: OrderItemDTO[];
  subtotal: number;
  discount: number;
  total: number;
  coupon: { code: string; discount: number } | null;
  status: OrderStatus;
  isExpired: boolean;
  payment: {
    provider: PaymentProvider | null;
    trxId: string;
    method: string;
    amount: number;
    paidAt: string | null;
  };
  statusHistory: { status: OrderStatus; at: string; note: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResultDTO {
  order: OrderDTO;
  paymentUrl: string | null;
}

export interface LibraryItemDTO {
  product: ProductCardDTO & {
    version: string;
    techTags: string[];
    changelog: ChangelogEntryDTO[];
  };
  githubUrl: string;
  hasFile: boolean;
  fileName: string;
  fileSize: number;
  demoAdmin: DemoAdminDTO | null;
  source: LibrarySource;
  acquiredAt: string;
}

export interface CouponDTO {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount: number | null;
  minAmount: number;
  appliesTo: CouponScope;
  products: string[];
  maxUses: number | null;
  usedCount: number;
  perUserLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
}

/* ---------------------------------- Admin --------------------------------- */

export interface AdminProductDTO extends ProductDetailDTO {
  status: ProductStatus;
  order: number;
  githubUrl: string;
  file: { key: string; name: string; size: number } | null;
  demoAdminFull: DemoAdminDTO & { isPublic: boolean };
}

export interface AdminOverviewDTO {
  revenue: { last30: number; allTime: number };
  orders: { paid: number; pending: number; last30: number };
  customers: number;
  members: number;
  series: { date: string; revenue: number; orders: number }[];
  topProducts: { _id: string; title: Localized; slug: string; thumbnail: string; sales: number; revenue: number }[];
  recentOrders: OrderDTO[];
}

export interface AdminUserDetailDTO {
  user: UserDTO;
  orders: OrderDTO[];
  stats: { spent: number; paidOrders: number };
}

export interface UploadedFileDTO {
  key: string;
  /** Public URL for images; null for private files. */
  url: string | null;
  name: string;
  size: number;
}

/** A signed URL the browser PUTs a source zip to, with the headers it must send. */
export interface FileUploadTicketDTO {
  uploadUrl: string;
  key: string;
  headers: Record<string, string>;
}
