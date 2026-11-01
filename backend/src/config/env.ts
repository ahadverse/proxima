import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

const required = (name: string) => z.string().trim().min(1, `${name} is required`);
// Trimmed first: a stray space pasted into a dashboard would otherwise break origin checks and links.
const url = (name: string) => z.string().trim().pipe(z.url(`${name} must be a URL`));
const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));
const optionalNumber = z.preprocess(
  (v) => (v === '' || v === undefined ? undefined : Number(v)),
  z.number().int().positive().optional(),
);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: required('MONGODB_URI'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  COOKIE_DOMAIN: optional,

  CLIENT_URL: url('CLIENT_URL'),
  ADMIN_URL: url('ADMIN_URL'),
  REVALIDATE_SECRET: z.string().min(16, 'REVALIDATE_SECRET must be at least 16 characters'),

  R2_ACCOUNT_ID: required('R2_ACCOUNT_ID'),
  R2_ACCESS_KEY_ID: required('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: required('R2_SECRET_ACCESS_KEY'),
  R2_BUCKET: required('R2_BUCKET'),
  R2_PUBLIC_URL: url('R2_PUBLIC_URL'),
  R2_PRIVATE_BUCKET: optional,

  PAYSTATION_BASE_URL: url('PAYSTATION_BASE_URL'),
  PAYSTATION_MERCHANT_ID: required('PAYSTATION_MERCHANT_ID'),
  PAYSTATION_PASSWORD: required('PAYSTATION_PASSWORD'),
  PAYSTATION_CALLBACK_URL: url('PAYSTATION_CALLBACK_URL'),

  SMTP_HOST: optional,
  SMTP_PORT: optionalNumber,
  SMTP_USER: optional,
  SMTP_PASS: optional,
  MAIL_FROM: optional,

  ADMIN_EMAIL: optional,
  ADMIN_PASSWORD: optional,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const lines = parsed.error.issues.map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`);
  console.error(`\nInvalid environment configuration (${envPath}):\n${lines.join('\n')}\n`);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';

if (isProduction) {
  const local = (['CLIENT_URL', 'ADMIN_URL', 'PAYSTATION_CALLBACK_URL'] as const).filter((key) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(env[key]),
  );
  if (local.length) console.warn(`Production is running with local URLs in: ${local.join(', ')}. Set them to the public URLs.`);
}
