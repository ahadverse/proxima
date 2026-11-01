import type { S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export const PUBLIC_BUCKET = env.R2_BUCKET;
export const PRIVATE_BUCKET = env.R2_PRIVATE_BUCKET ?? env.R2_BUCKET;

type Storage = {
  s3: typeof import('@aws-sdk/client-s3');
  client: S3Client;
  getSignedUrl: typeof import('@aws-sdk/s3-request-presigner').getSignedUrl;
};

let storage: Promise<Storage> | null = null;

/** The AWS SDK is a large share of cold start time and most requests never touch storage, so it loads on first use. */
function loadStorage(): Promise<Storage> {
  storage ??= Promise.all([import('@aws-sdk/client-s3'), import('@aws-sdk/s3-request-presigner')]).then(([s3, presigner]) => ({
    s3,
    getSignedUrl: presigner.getSignedUrl,
    client: new s3.S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      // R2 rejects some of the SDK's default CRC32 checksum headers (presigned URLs, multipart parts).
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    }),
  }));
  // A failed load must not stay cached for the life of the instance.
  storage.catch(() => {
    storage = null;
  });
  return storage;
}

export async function getR2Client(): Promise<S3Client> {
  return (await loadStorage()).client;
}

export function publicUrl(key: string): string {
  return `${env.R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`;
}

export async function presignUpload(params: { bucket: string; key: string; contentType: string; expiresIn: number }) {
  const { s3, client, getSignedUrl } = await loadStorage();
  const command = new s3.PutObjectCommand({ Bucket: params.bucket, Key: params.key, ContentType: params.contentType });
  return getSignedUrl(client, command, { expiresIn: params.expiresIn });
}

export async function presignDownload(params: { bucket: string; key: string; fileName: string; expiresIn: number }) {
  const { s3, client, getSignedUrl } = await loadStorage();
  const safeName = params.fileName.replace(/[^\w.\- ]+/g, '_');
  const command = new s3.GetObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ResponseContentDisposition: `attachment; filename="${safeName}"`,
  });
  return getSignedUrl(client, command, { expiresIn: params.expiresIn });
}

export async function putObject(params: { bucket: string; key: string; body: Buffer; contentType: string; cacheControl?: string }) {
  const { s3, client } = await loadStorage();
  await client.send(
    new s3.PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? 'public, max-age=31536000, immutable',
    }),
  );
}

export async function deleteObject(bucket: string, key: string) {
  const { s3, client } = await loadStorage();
  await client.send(new s3.DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
