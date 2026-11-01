import path from 'node:path';
import { IMAGE_MIME_TYPES, type FileUploadRequestInput, type FileUploadTicketDTO, type UploadedFileDTO } from '@/shared';
import { fileTooLarge, type IncomingFile } from '../../lib/multipart';
import { PRIVATE_BUCKET, PUBLIC_BUCKET, presignUpload, publicUrl, putObject } from '../../lib/r2';
import { ApiError } from '../../utils/ApiError';
import { randomKey } from '../../utils/ids';

const MAX_IMAGE_WIDTH = 1920;
// WebP caps each side at 16383px; full-page theme screenshots can get close to that.
const MAX_IMAGE_HEIGHT = 16_000;
const WEBP_QUALITY = 82;

function safeBaseName(fileName: string): string {
  const base = path.parse(fileName).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return base.slice(0, 60) || 'file';
}

function monthFolder(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

async function readAll(file: IncomingFile): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of file.stream) chunks.push(chunk as Buffer);
  if (file.stream.truncated) throw fileTooLarge();
  return Buffer.concat(chunks);
}

/** Re-encodes any supported image as WebP, capped at 1920px wide, and stores it in the public bucket. */
export async function storeImage(file: IncomingFile): Promise<UploadedFileDTO> {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.mimeType)) {
    file.stream.resume();
    throw ApiError.badRequest('Use a JPG, PNG, WebP, AVIF or GIF image', 'FILE_TYPE_NOT_ALLOWED');
  }
  const input = await readAll(file);
  // Loaded on demand: libvips is heavy and only this route needs it, which keeps cold starts fast.
  const { default: sharp } = await import('sharp');

  let body: Buffer;
  try {
    const meta = await sharp(input).metadata();
    const animated = (meta.pages ?? 1) > 1;
    const oversized = (meta.width ?? 0) > MAX_IMAGE_WIDTH || (meta.height ?? 0) > MAX_IMAGE_HEIGHT;

    const image = sharp(input, { animated });
    if (animated) image.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true });
    else image.rotate().resize({ width: MAX_IMAGE_WIDTH, height: MAX_IMAGE_HEIGHT, fit: 'inside', withoutEnlargement: true });
    body = await image.webp({ quality: WEBP_QUALITY, effort: 5, smartSubsample: true }).toBuffer();

    // The admin already sends compressed WebP; re-encoding it again can only add size or blur.
    if (meta.format === 'webp' && !oversized && input.length <= body.length) body = input;
  } catch {
    throw ApiError.badRequest('This file could not be read as an image', 'INVALID_IMAGE');
  }

  const key = `images/${monthFolder()}/${randomKey()}-${safeBaseName(file.fileName)}.webp`;
  await putObject({ bucket: PUBLIC_BUCKET, key, body, contentType: 'image/webp' });
  return { key, url: publicUrl(key), name: `${path.parse(file.fileName).name}.webp`, size: body.length };
}

/**
 * Signs a direct browser-to-storage upload for a source zip. Zips can be far larger
 * than a serverless request body allows, so they never pass through the API.
 */
export async function createFileUpload(input: FileUploadRequestInput): Promise<FileUploadTicketDTO> {
  const key = `files/${randomKey()}/${safeBaseName(input.fileName)}.zip`;
  const headers = { 'Content-Type': 'application/zip' };
  const uploadUrl = await presignUpload({ bucket: PRIVATE_BUCKET, key, contentType: headers['Content-Type'], expiresIn: 3600 });
  return { uploadUrl, key, headers };
}
