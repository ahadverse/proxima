import type { PaginationMeta } from '@/shared';

export function toSkip(page: number, limit: number): number {
  return (Math.max(page, 1) - 1) * limit;
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function containsRegex(value: string): RegExp {
  return new RegExp(escapeRegex(value.trim()), 'i');
}
