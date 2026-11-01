/** Vercel functions reject request bodies over 4.5 MB; stay under it with room for the form envelope. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 16_000;
// Safari refuses to draw canvases above roughly 16.7 megapixels.
const MAX_PIXELS = 16_000_000;
const QUALITIES = [0.82, 0.72, 0.6];
const SCALES = [1, 0.75, 0.5];

let webpSupport: boolean | null = null;

function canEncodeWebp(): boolean {
  if (webpSupport === null) {
    const probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    webpSupport = probe.toDataURL('image/webp').startsWith('data:image/webp');
  }
  return webpSupport;
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function renamed(name: string, extension: string): string {
  return `${name.replace(/\.[^.]+$/, '') || 'image'}${extension}`;
}

/**
 * Resizes an image to at most 1920px wide and converts it to WebP in the browser,
 * so uploads are quick and fit the API's request limit. The API still checks the
 * result and stores it as WebP.
 */
export async function compressImage(file: File): Promise<File> {
  // A canvas would drop GIF animation, so small GIFs go up untouched and the API converts them.
  if (file.type === 'image/gif' && file.size <= MAX_UPLOAD_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // Unreadable here; let the API return a proper error.
  }

  const webp = canEncodeWebp();
  const type = webp ? 'image/webp' : 'image/jpeg';
  const base = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height, Math.sqrt(MAX_PIXELS / (bitmap.width * bitmap.height)));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  let result: Blob | null = null;
  let resized = base < 1;

  try {
    if (!context) return file;
    outer: for (const step of SCALES) {
      canvas.width = Math.max(1, Math.round(bitmap.width * base * step));
      canvas.height = Math.max(1, Math.round(bitmap.height * base * step));
      if (!webp) {
        // JPEG has no transparency; paint white so transparent areas don't turn black.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      resized ||= step < 1;
      for (const quality of QUALITIES) {
        const blob = await encode(canvas, type, quality);
        if (!blob) break outer;
        result = blob;
        if (blob.size <= MAX_UPLOAD_BYTES) break outer;
      }
    }
  } finally {
    bitmap.close();
  }

  if (!result) return file;
  // An already optimized WebP that needed no resizing can be smaller than our re-encode.
  if (!resized && file.type === 'image/webp' && file.size <= Math.min(result.size, MAX_UPLOAD_BYTES)) return file;
  return new File([result], renamed(file.name, webp ? '.webp' : '.jpg'), { type });
}
