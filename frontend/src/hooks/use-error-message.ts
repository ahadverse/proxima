'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiClientError } from '@/lib/client-api';

/** Translates API error codes and field message keys into the active language. */
export function useErrorMessage() {
  const t = useTranslations('errors');

  const message = useCallback(
    (error: unknown): string => {
      if (error instanceof ApiClientError) {
        if (error.code === 'NETWORK_ERROR') return t('network');
        if (t.has(`codes.${error.code}`)) return t(`codes.${error.code}`);
        return error.message || t('generic');
      }
      return t('generic');
    },
    [t],
  );

  const field = useCallback(
    (key: string | undefined): string | undefined => {
      if (!key) return undefined;
      return t.has(`fields.${key}`) ? t(`fields.${key}`) : key;
    },
    [t],
  );

  return { message, field };
}

/** Copies server-side field errors onto a react-hook-form instance. Returns true when any were applied. */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  if (!(error instanceof ApiClientError) || !error.errors?.length) return false;
  for (const item of error.errors) {
    setError(item.path as Path<T>, { type: 'server', message: item.message });
  }
  return true;
}
