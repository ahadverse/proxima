'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { z } from 'zod';
import { ArrowRight, Lock, LogIn, ShieldCheck, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { emailSchema, nameSchema, phoneSchema, pickLocalized, type CreateOrderResultDTO, type Locale } from '@/shared';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { ProductImage } from '@/components/ui/product-image';
import { useMe } from '@/hooks/use-auth';
import { useCartQuote } from '@/hooks/use-cart-quote';
import { applyServerErrors, useErrorMessage } from '@/hooks/use-error-message';
import { Link, useRouter } from '@/i18n/navigation';
import { api } from '@/lib/client-api';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/stores/cart';
import { CouponField, SummaryRows } from './order-summary';

const customerSchema = z.object({ name: nameSchema, email: emailSchema, phone: phoneSchema });
type CustomerForm = z.infer<typeof customerSchema>;

export function CheckoutView() {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const tc = useTranslations('common');
  const tNav = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { message, field } = useErrorMessage();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: quote, isLoading, hydrated, items, couponCode } = useCartQuote();
  const clear = useCart((state) => state.clear);
  const [redirecting, setRedirecting] = useState(false);

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name, email: user.email, phone: user.phone ?? '' });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: (customer: CustomerForm) =>
      api<CreateOrderResultDTO>('/orders', {
        method: 'POST',
        body: { items: items.map((item) => item.id), couponCode: couponCode || undefined, customer, locale },
      }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      if (data.paymentUrl) {
        setRedirecting(true);
        window.location.assign(data.paymentUrl);
        return;
      }
      clear();
      router.push(`/checkout/success?invoice=${data.order.invoiceNo}`);
    },
    onError: (error) => {
      if (!applyServerErrors(error, form.setError)) toast.error(message(error));
    },
  });

  if (!hydrated || userLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={<LogIn />}
        title={t('signInRequired')}
        text={t('signInText')}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/login?next=/checkout">
                <LogIn className="size-4" />
                {tNav('signIn')}
              </Link>
            </Button>
          </div>
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart />}
        title={tCart('empty')}
        text={tCart('emptyText')}
        action={
          <Button asChild>
            <Link href="/">{tCart('browse')}</Link>
          </Button>
        }
      />
    );
  }

  const payable = quote?.lines.filter((line) => line.status === 'ok' && line.product) ?? [];
  const total = quote?.total ?? 0;
  const nothingToPay = Boolean(quote) && payable.length === 0;

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start" noValidate>
      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-ink">{t('details')}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label={t('name')} htmlFor="name" error={field(form.formState.errors.name?.message)} className="sm:col-span-2">
            <Input id="name" autoComplete="name" aria-invalid={Boolean(form.formState.errors.name)} {...form.register('name')} />
          </Field>
          <Field label={t('email')} htmlFor="email" error={field(form.formState.errors.email?.message)}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register('email')} />
          </Field>
          <Field label={t('phone')} htmlFor="phone" error={field(form.formState.errors.phone?.message)} hint={t('phoneHint')}>
            <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.phone)} {...form.register('phone')} />
          </Field>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-slate-50/70 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheck className="size-4 text-emerald-600" />
            {t('secure')}
          </p>
          <p className="mt-1.5 text-sm text-muted">{t('methods')}</p>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          {t.rich('agree', {
            terms: (chunks) => (
              <Link href="/p/terms" className="font-semibold text-brand-700 hover:underline">
                {chunks}
              </Link>
            ),
            refund: (chunks) => (
              <Link href="/p/refund-policy" className="font-semibold text-brand-700 hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>

      <aside className="card space-y-5 p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-extrabold text-ink">{tCart('summary')}</h2>
        <ul className="space-y-3">
          {(quote ? payable.map((line) => line.product!) : []).map((product) => (
            <li key={product._id} className="flex items-center gap-3">
              <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-lavender ring-1 ring-black/5">
                <ProductImage src={product.thumbnail} alt="" fill sizes="64px" className="object-cover object-top" />
              </span>
              <span className="line-clamp-2 flex-1 text-sm font-semibold text-ink">{pickLocalized(product.title, locale)}</span>
              <span className="text-sm font-bold text-ink">{product.price === 0 ? tc('free') : formatPrice(product.price, locale)}</span>
            </li>
          ))}
          {!quote && <Skeleton className="h-12 rounded-lg" />}
        </ul>
        <div className="border-t border-line pt-5">
          <CouponField quote={quote} />
        </div>
        <SummaryRows quote={quote} loading={isLoading} />
        {nothingToPay && <p className="text-sm font-medium text-amber-700">{tCart('nothingToPay')}</p>}
        <Button type="submit" block size="lg" className="h-[54px] text-[15px]" loading={mutation.isPending || redirecting} disabled={!quote || nothingToPay}>
          {redirecting ? (
            t('redirecting')
          ) : (
            <>
              <Lock className="size-4" />
              {total > 0 ? t('pay', { amount: formatPrice(total, locale) }) : t('complete')}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </aside>
    </form>
  );
}
