import type { ApiFieldError, PaginationMeta } from '@/shared';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly errors?: ApiFieldError[],
  ) {
    super(message);
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Empty in development (Vite proxies /api); the API's public URL in production builds. */
export const API_BASE = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')}/api/v1`;

let refreshing: Promise<boolean> | null = null;

export function refreshSession() {
  refreshing ??= fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

const NO_REFRESH = ['/auth/login', '/auth/refresh', '/auth/logout'];

export async function request<T>(
  path: string,
  options: { method?: Method; body?: unknown; signal?: AbortSignal } = {},
  allowRefresh = true,
): Promise<{ data: T; meta?: PaginationMeta }> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the API server');
  }

  if (response.status === 204) return { data: undefined as T };
  const json = await response.json().catch(() => null);

  if (response.status === 401 && allowRefresh && !NO_REFRESH.some((p) => path.startsWith(p))) {
    if (await refreshSession()) return request<T>(path, options, false);
  }

  if (!response.ok || !json?.success) {
    throw new ApiError(response.status, json?.code ?? 'REQUEST_FAILED', json?.message ?? 'Request failed', json?.errors);
  }
  return { data: json.data as T, meta: json.meta };
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ?? {} }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Something went wrong';
}

export function toQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== false) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

const FIELD_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  invalid_email: 'Enter a valid email address',
  invalid_url: 'Enter a full URL starting with https://',
  invalid_slug: 'Use lowercase letters, numbers and hyphens only',
  invalid_id: 'Select a valid option',
  too_long: 'This is too long',
  too_short: 'This is too short',
  too_small: 'Value is too small',
  integer: 'Use a whole number',
  free_price_zero: 'Free products must have a price of 0',
  price_required: 'Set a price above 0 or mark the product as free',
  compare_price_higher: 'Compare price must be higher than the price',
  already_exists: 'This value is already in use',
  percent_max: 'Percent discounts cannot exceed 100',
  end_after_start: 'End date must be after the start date',
  invalid_coupon_code: 'Use letters, numbers, dashes or underscores',
  invalid_youtube: 'Enter a valid YouTube link',
  invalid_date: 'Enter a valid date',
  password_min: 'Use at least 8 characters',
  file_type_not_allowed: 'This file type is not allowed',
  file_too_large: 'This file is too large',
};

export function fieldMessage(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return FIELD_MESSAGES[key] ?? key;
}
