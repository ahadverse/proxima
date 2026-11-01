import { GetBucketCorsCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { PRIVATE_BUCKET, getR2Client } from '../lib/r2';

/**
 * Lets the admin panel upload source zips straight to the private bucket.
 * Replaces the bucket's CORS rules. ADMIN_URL is always allowed; pass extra
 * origins as arguments, e.g. `pnpm r2:cors http://localhost:5173`.
 */
const origins = [env.ADMIN_URL, ...process.argv.slice(2)].map((origin) => {
  try {
    return new URL(origin).origin;
  } catch {
    console.error(`Not a valid origin: ${origin}`);
    process.exit(1);
  }
});

const r2 = await getR2Client();
await r2.send(
  new PutBucketCorsCommand({
    Bucket: PRIVATE_BUCKET,
    CORSConfiguration: {
      CORSRules: [{ AllowedOrigins: [...new Set(origins)], AllowedMethods: ['PUT'], AllowedHeaders: ['content-type'], MaxAgeSeconds: 3600 }],
    },
  }),
);

const { CORSRules } = await r2.send(new GetBucketCorsCommand({ Bucket: PRIVATE_BUCKET }));
console.log(`Bucket "${PRIVATE_BUCKET}" now accepts uploads from: ${CORSRules?.[0]?.AllowedOrigins?.join(', ')}`);
