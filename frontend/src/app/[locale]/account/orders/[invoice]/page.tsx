import { OrderDetailView } from '@/components/account/account-views';

export default async function Page({ params }: { params: Promise<{ invoice: string }> }) {
  const { invoice } = await params;
  return <OrderDetailView invoiceNo={decodeURIComponent(invoice).toUpperCase()} />;
}
