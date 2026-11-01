import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AccountShell } from '@/components/account/account-shell';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('accountTitle'), robots: { index: false, follow: false } };
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
