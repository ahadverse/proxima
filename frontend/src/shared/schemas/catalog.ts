import { z } from 'zod';
import {
  MAX_PAGE_SIZE,
  PAGE_SIZE,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  SORT_OPTIONS,
  TECH_STACKS,
} from '../constants';
import {
  isoDateTimeSchema,
  localizedSchema,
  objectIdSchema,
  optionalUrlSchema,
  requiredLocalizedSchema,
  slugSchema,
  urlSchema,
} from './common';

export const productQuerySchema = z.object({
  category: z.string().trim().max(120).optional(),
  q: z.string().trim().max(80).optional(),
  type: z.enum(PRODUCT_TYPES).optional().catch(undefined),
  sort: z.enum(SORT_OPTIONS).catch('default'),
  page: z.coerce.number().int().min(1).max(1000).catch(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).catch(PAGE_SIZE),
});

export const suggestQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
});

const fileSchema = z.object({
  key: z.string().trim().min(1).max(400),
  name: z.string().trim().min(1).max(200),
  size: z.number().int().min(0),
});

const changelogEntrySchema = z.object({
  version: z.string().trim().min(1, 'required').max(30, 'too_long'),
  date: isoDateTimeSchema,
  notes: localizedSchema(4000),
});

export const productInputSchema = z
  .object({
    type: z.enum(PRODUCT_TYPES),
    status: z.enum(PRODUCT_STATUSES),
    slug: slugSchema,
    category: objectIdSchema.nullable(),
    title: requiredLocalizedSchema(160),
    shortDescription: localizedSchema(300),
    description: localizedSchema(200_000),
    techStack: z.enum(TECH_STACKS),
    techTags: z.array(z.string().trim().min(1).max(40)).max(20),
    price: z.number().int('integer').min(0).max(10_000_000),
    compareAtPrice: z.number().int('integer').min(0).max(10_000_000).nullable(),
    isFree: z.boolean(),
    thumbnail: urlSchema,
    gallery: z.array(urlSchema).max(12),
    previewUrl: optionalUrlSchema,
    tutorialUrl: optionalUrlSchema,
    githubUrl: optionalUrlSchema,
    demoAdmin: z.object({
      url: optionalUrlSchema,
      email: z.string().trim().max(120, 'too_long'),
      password: z.string().max(120, 'too_long'),
      isPublic: z.boolean(),
    }),
    file: fileSchema.nullable(),
    version: z.string().trim().max(30, 'too_long'),
    highlights: z.array(requiredLocalizedSchema(80)).max(12),
    features: z.array(requiredLocalizedSchema(200)).max(40),
    changelog: z.array(changelogEntrySchema).max(60),
    seo: z.object({
      title: z.string().trim().max(70, 'too_long'),
      description: z.string().trim().max(170, 'too_long'),
    }),
    featured: z.boolean(),
    order: z.number().int().min(0).max(100_000),
  })
  .superRefine((value, ctx) => {
    if (value.type !== 'membership' && !value.category) {
      ctx.addIssue({ code: 'custom', path: ['category'], message: 'required' });
    }
    if (value.isFree && value.price !== 0) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'free_price_zero' });
    }
    if (!value.isFree && value.price <= 0) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'price_required' });
    }
    if (value.compareAtPrice !== null && value.compareAtPrice <= value.price) {
      ctx.addIssue({ code: 'custom', path: ['compareAtPrice'], message: 'compare_price_higher' });
    }
  });

export const productStatusSchema = z.object({
  status: z.enum(PRODUCT_STATUSES),
});

export const categoryInputSchema = z.object({
  name: requiredLocalizedSchema(60),
  slug: slugSchema,
  icon: z.string().trim().max(40, 'too_long'),
  isActive: z.boolean(),
});

export const reorderSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
