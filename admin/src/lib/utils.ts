import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number) {
  return `৳${new Intl.NumberFormat('en-US').format(value)}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(value: string | Date | null | undefined, withTime = false) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value));
}

export function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

/** Converts an ISO string to the value an <input type="datetime-local"> expects (Dhaka time). */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  const dhaka = new Date(date.getTime() + 6 * 60 * 60 * 1000);
  return dhaka.toISOString().slice(0, 16);
}

/** Converts a datetime-local value (entered in Dhaka time) back to an ISO string. */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}:00+06:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const STOREFRONT_URL = (import.meta.env.VITE_STOREFRONT_URL ?? '').replace(/\/+$/, '');
