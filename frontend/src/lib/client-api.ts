import type { ApiFieldError, PaginationMeta } from '@/shared';

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly errors?: ApiFieldError[],
  ) {
    super(message);
  }
}

interface RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => {
        refreshing = null;
      }, 0);
    });
  return refreshing;
}

/** Browser-side API client. Retries once after silently refreshing an expired session. */
export async function api<T>(path: string, init: RequestInit = {}, allowRefresh = true): Promise<{ data: T; meta?: PaginationMeta }> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method: init.method ?? 'GET',
      credentials: 'include',
      headers: init.body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiClientError(0, 'NETWORK_ERROR', 'Network error');
  }

  if (response.status === 204) return { data: undefined as T };

  const json = await response.json().catch(() => null);

  if (response.status === 401 && allowRefresh && !NO_REFRESH.some((p) => path.startsWith(p))) {
    if (await refreshSession()) return api<T>(path, init, false);
  }

  if (!response.ok || !json?.success) {
    throw new ApiClientError(
      response.status,
      json?.code ?? 'REQUEST_FAILED',
      json?.message ?? 'Request failed',
      json?.errors,
    );
  }
  return { data: json.data as T, meta: json.meta };
}

export function hasSessionHint(): boolean {
  return typeof document !== 'undefined' && document.cookie.split('; ').some((c) => c === 'px_s=1');
}
