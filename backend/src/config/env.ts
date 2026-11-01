import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

const required = (name: string) => z.string().trim().min(1, `${name} is required`);
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

  CLIENT_URL: z.url('CLIENT_URL must be a URL'),
  ADMIN_URL: z.url('ADMIN_URL must be a URL'),
  REVALIDATE_SECRET: z.string().min(16, 'REVALIDATE_SECRET must be at least 16 characters'),

  R2_ACCOUNT_ID: required('R2_ACCOUNT_ID'),
  R2_ACCESS_KEY_ID: required('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: required('R2_SECRET_ACCESS_KEY'),
  R2_BUCKET: required('R2_BUCKET'),
  R2_PUBLIC_URL: z.url('R2_PUBLIC_URL must be a URL'),
  R2_PRIVATE_BUCKET: optional,

  PAYSTATION_BASE_URL: z.url('PAYSTATION_BASE_URL must be a URL'),
  PAYSTATION_MERCHANT_ID: required('PAYSTATION_MERCHANT_ID'),
  PAYSTATION_PASSWORD: required('PAYSTATION_PASSWORD'),
  PAYSTATION_CALLBACK_URL: z.url('PAYSTATION_CALLBACK_URL must be a URL'),

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
