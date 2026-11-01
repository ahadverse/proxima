import { z } from 'zod';
import { MAX_FILE_BYTES, OFFER_MODES, USER_ROLES } from '../constants';
import { youtubeId } from '../utils';
import { EMAIL_REGEX, isoDateTimeSchema, localizedSchema, optionalUrlSchema, slugSchema } from './common';

export const pageInputSchema = z.object({
  slug: slugSchema,
  title: localizedSchema(120).refine((v) => v.en.length > 0 || v.bn.length > 0, {
    message: 'required',
    path: ['en'],
  }),
  content: localizedSchema(300_000),
  isPublished: z.boolean(),
});

export const videoReviewInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'required')
    .refine((v) => youtubeId(v) !== null, 'invalid_youtube'),
  title: localizedSchema(120).refine((v) => v.en.length > 0 || v.bn.length > 0, {
    message: 'required',
    path: ['en'],
  }),
  description: localizedSchema(300),
  isActive: z.boolean(),
});

const faqItemSchema = z.object({
  q: localizedSchema(200),
  a: localizedSchema(1000),
});

export const siteSettingsSchema = z.object({
  brand: z.object({
    name: z.string().trim().min(1, 'required').max(60, 'too_long'),
    tagline: localizedSchema(120),
    logo: optionalUrlSchema,
    footerAbout: localizedSchema(400),
  }),
  contact: z.object({
    whatsapp: z.string().trim().max(30, 'too_long'),
    messenger: optionalUrlSchema,
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .refine((v) => v === '' || EMAIL_REGEX.test(v), 'invalid_email'),
    phone: z.string().trim().max(30, 'too_long'),
    hours: localizedSchema(120),
    address: localizedSchema(300),
    tradeLicense: z.string().trim().max(80, 'too_long'),
  }),
  socials: z.object({
    facebook: optionalUrlSchema,
    youtube: optionalUrlSchema,
    instagram: optionalUrlSchema,
    linkedin: optionalUrlSchema,
    tiktok: optionalUrlSchema,
  }),
  offerBar: z.object({
    enabled: z.boolean(),
    label: localizedSchema(80),
    price: z.number().int().min(0),
    comparePrice: z.number().int().min(0),
    mode: z.enum(OFFER_MODES),
    endsAt: isoDateTimeSchema.nullable(),
    ctaLabel: localizedSchema(40),
    ctaHref: z.string().trim().max(300, 'too_long'),
  }),
  promoPopup: z.object({
    enabled: z.boolean(),
    title: localizedSchema(80),
    subtitle: localizedSchema(200),
    couponCode: z.string().trim().toUpperCase().max(30, 'too_long'),
    discountText: localizedSchema(40),
    delaySeconds: z.number().int().min(0).max(300),
  }),
  hostingPromo: z.object({
    enabled: z.boolean(),
    title: localizedSchema(80),
    text: localizedSchema(200),
    ctaLabel: localizedSchema(40),
    url: optionalUrlSchema,
  }),
  paymentLogos: optionalUrlSchema,
  helpTopics: z.array(localizedSchema(160)).max(20),
  membershipFaq: z.array(faqItemSchema).max(20),
});

export const adminUserUpdateSchema = z
  .object({
    role: z.enum(USER_ROLES).optional(),
    isBanned: z.boolean().optional(),
  })
  .refine((v) => v.role !== undefined || v.isBanned !== undefined, 'nothing_to_update');

export const membershipActionSchema = z.object({
  action: z.enum(['grant', 'revoke']),
});

/** Source zips go straight from the browser to storage; the API only signs the upload. */
export const fileUploadRequestSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine((name) => name.toLowerCase().endsWith('.zip'), 'file_type_not_allowed'),
  size: z.number().int().positive().max(MAX_FILE_BYTES, 'file_too_large'),
});

export type PageInput = z.infer<typeof pageInputSchema>;
export type VideoReviewInput = z.infer<typeof videoReviewInputSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type FileUploadRequestInput = z.infer<typeof fileUploadRequestSchema>;
