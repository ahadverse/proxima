import type { RequestHandler } from 'express';

/** Removes keys that could be read as MongoDB operators ($gt, a.b) from request bodies. */
function strip(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(strip);
    return;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete (value as Record<string, unknown>)[key];
      } else {
        strip((value as Record<string, unknown>)[key]);
      }
    }
  }
}

export const sanitizeBody: RequestHandler = (req, _res, next) => {
  strip(req.body);
  next();
};
