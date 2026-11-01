import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordForm } from '@/components/auth/auth-forms';
import { Skeleton } from '@/components/ui/misc';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('forgotTitle'), robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  return (
    <AuthShell title={t('forgotTitle')} subtitle={t('forgotSubtitle')}>
      <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
