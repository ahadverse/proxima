/** Only allows same-site relative paths, so ?next= can't send people to another domain. */
export function safeNext(value: string | null | undefined, fallback = '/account'): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
