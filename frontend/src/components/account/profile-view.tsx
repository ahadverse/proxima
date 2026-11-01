'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { toast } from 'sonner';
import { changePasswordSchema, updateProfileSchema, type ChangePasswordInput, type UpdateProfileInput, type UserDTO } from '@/shared';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { meQueryKey, useMe } from '@/hooks/use-auth';
import { applyServerErrors, useErrorMessage } from '@/hooks/use-error-message';
import { api } from '@/lib/client-api';
import { AccountHeading } from './account-shell';

function ProfileForm({ user }: { user: UserDTO }) {
  const t = useTranslations('account.profilePage');
  const tAuth = useTranslations('auth');
  const tCheckout = useTranslations('checkout');
  const tc = useTranslations('common');
  const { message, field } = useErrorMessage();
  const queryClient = useQueryClient();
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? '' },
  });
  const { errors, isDirty } = form.formState;

  useEffect(() => form.reset({ name: user.name, phone: user.phone ?? '' }), [user, form]);

  const mutation = useMutation({
    mutationFn: (values: UpdateProfileInput) => api<UserDTO>('/auth/me', { method: 'PATCH', body: values }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(meQueryKey, data);
      toast.success(t('updated'));
    },
    onError: (error) => {
      if (!applyServerErrors(error, form.setError)) toast.error(message(error));
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="card p-6 sm:p-8" noValidate>
      <h2 className="text-lg font-bold text-ink">{t('details')}</h2>
      <p className="mt-1 text-sm text-muted">{t('detailsText')}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={tAuth('name')} htmlFor="name" error={field(errors.name?.message)}>
          <Input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...form.register('name')} />
        </Field>
        <Field label={tAuth('email')} htmlFor="email">
          <Input id="email" value={user.email} disabled readOnly />
        </Field>
        <Field label={tCheckout('phone')} htmlFor="phone" error={field(errors.phone?.message)} hint={tCheckout('phoneHint')}>
          <Input id="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} {...form.register('phone')} />
        </Field>
      </div>
      <Button type="submit" className="mt-6" loading={mutation.isPending} disabled={!isDirty}>
        {mutation.isPending ? tc('saving') : tc('save')}
      </Button>
    </form>
  );
}

const passwordFormSchema = changePasswordSchema
  .extend({ confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'password_mismatch' });
type PasswordForm = z.infer<typeof passwordFormSchema>;

function PasswordFormCard() {
  const t = useTranslations('account.profilePage');
  const tAuth = useTranslations('auth');
  const tc = useTranslations('common');
  const { message, field } = useErrorMessage();
  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: ({ confirmPassword: _confirm, ...values }: PasswordForm) =>
      api<null>('/auth/me/password', { method: 'PATCH', body: values satisfies ChangePasswordInput }),
    onSuccess: () => {
      toast.success(t('passwordUpdated'));
      form.reset();
    },
    onError: (error) => {
      if (!applyServerErrors(error, form.setError)) toast.error(message(error));
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="card p-6 sm:p-8" noValidate>
      <h2 className="text-lg font-bold text-ink">{t('password')}</h2>
      <p className="mt-1 text-sm text-muted">{t('passwordText')}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={t('current')} htmlFor="currentPassword" error={field(errors.currentPassword?.message)} className="sm:col-span-2">
          <PasswordInput id="currentPassword" autoComplete="current-password" aria-invalid={Boolean(errors.currentPassword)} {...form.register('currentPassword')} />
        </Field>
        <Field label={t('new')} htmlFor="newPassword" error={field(errors.newPassword?.message)} hint={tAuth('passwordHint')}>
          <PasswordInput id="newPassword" autoComplete="new-password" aria-invalid={Boolean(errors.newPassword)} {...form.register('newPassword')} />
        </Field>
        <Field label={tAuth('confirmPassword')} htmlFor="confirmPassword" error={field(errors.confirmPassword?.message)}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} {...form.register('confirmPassword')} />
        </Field>
      </div>
      <Button type="submit" variant="dark" className="mt-6" loading={mutation.isPending}>
        {mutation.isPending ? tc('saving') : t('password')}
      </Button>
    </form>
  );
}

export function ProfileView() {
  const t = useTranslations('account');
  const { data: user } = useMe();
  if (!user) return null;
  return (
    <>
      <AccountHeading title={t('profile')} />
      <div className="space-y-6">
        <ProfileForm user={user} />
        <PasswordFormCard />
      </div>
    </>
  );
}
