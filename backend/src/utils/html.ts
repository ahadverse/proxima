import type sanitizeHtml from 'sanitize-html';
import type { Localized } from '@/shared';

let sanitizer: Promise<(html: string) => string> | null = null;

/** sanitize-html is only needed when admins save rich text, so it loads on first use instead of at cold start. */
function loadSanitizer() {
  sanitizer ??= import('sanitize-html').then(({ default: sanitize }) => {
    const options: sanitizeHtml.IOptions = {
      allowedTags: [
        'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'code', 'pre',
        'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody',
        'tr', 'th', 'td', 'span',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height', 'loading'],
        '*': ['class'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      transformTags: {
        a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }, true),
        img: sanitize.simpleTransform('img', { loading: 'lazy' }, true),
      },
    };
    return (html: string) => sanitize(html, options).trim();
  });
  // Don't keep a failed load cached, or every later save on this instance would fail too.
  sanitizer.catch(() => {
    sanitizer = null;
  });
  return sanitizer;
}

export async function cleanHtml(html: string): Promise<string> {
  return (await loadSanitizer())(html);
}

export async function cleanLocalizedHtml(value: Localized): Promise<Localized> {
  const clean = await loadSanitizer();
  return { en: clean(value.en), bn: clean(value.bn) };
}
