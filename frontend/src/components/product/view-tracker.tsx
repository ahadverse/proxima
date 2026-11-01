'use client';

import { useEffect } from 'react';

/** Counts one view per product per browser session. */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `px_viewed_${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* storage unavailable: still count */
    }
    fetch(`/api/v1/products/${encodeURIComponent(slug)}/view`, { method: 'POST', keepalive: true }).catch(() => undefined);
  }, [slug]);
  return null;
}
