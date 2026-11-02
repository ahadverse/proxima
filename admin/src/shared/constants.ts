export const LOCALES = ['en', 'bn'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const PRODUCT_TYPES = ['website', 'plugin', 'membership'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

/** Product types that an active membership unlocks. */
export const MEMBERSHIP_COVERED_TYPES: ProductType[] = ['website', 'plugin'];

export const TECH_STACKS = ['nextjs', 'react', 'html', 'wordpress', 'other'] as const;
export type TechStack = (typeof TECH_STACKS)[number];
export const TECH_STACK_LABELS: Record<TechStack, string> = {
  nextjs: 'Next.js',
  react: 'React',
  html: 'HTML / CSS',
  wordpress: 'WordPress',
  other: 'Other',
};

export const PRODUCT_STATUSES = ['draft', 'published'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const ORDER_STATUSES = ['pending', 'paid', 'failed', 'cancelled', 'refunded'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_PROVIDERS = ['paystation', 'free', 'manual'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const COUPON_TYPES = ['percent', 'fixed'] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const COUPON_SCOPES = ['all', 'membership', 'products'] as const;
export type CouponScope = (typeof COUPON_SCOPES)[number];

export const RATING_STATUSES = ['approved', 'hidden'] as const;
export type RatingStatus = (typeof RATING_STATUSES)[number];

// 'default' is newest first. 'featured' is the hand-picked order (featured, then the admin's manual order). 'latest' is kept as an alias of 'default' so older links keep working.
export const SORT_OPTIONS = ['default', 'featured', 'popular', 'latest', 'price-asc', 'price-desc'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const OFFER_MODES = ['fixed', 'evergreen-daily'] as const;
export type OfferMode = (typeof OFFER_MODES)[number];

export const LIBRARY_SOURCES = ['purchase', 'membership', 'free'] as const;
export type LibrarySource = (typeof LIBRARY_SOURCES)[number];

export const CURRENCY = 'BDT';
export const PAGE_SIZE = 18;
export const MAX_PAGE_SIZE = 48;
export const ORDER_EXPIRY_HOURS = 24;
export const DOWNLOAD_URL_TTL_SECONDS = 300;

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] as const;
export const FILE_MIME_TYPES = ['application/zip', 'application/x-zip-compressed'] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024;

/** Bangladeshi mobile number, with or without the +88 / 88 prefix. */
export const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;
