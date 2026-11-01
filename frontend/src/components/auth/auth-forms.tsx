'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  forgotPasswordSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type UserDTO,
} from '@/shared';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { meQueryKey } from '@/hooks/use-auth';
import { applyServerErrors, useErrorMessage } from '@/hooks/use-error-message';
import { Link, useRouter } from '@/i18n/navigation';
import { api } from '@/lib/client-api';
import { safeNext } from '@/lib/redirect';
import { PasswordInput } from './password-input';

function useAuthSuccess() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const t = useTranslations('auth');
  return (user: UserDTO) => {
    queryClient.setQueryData(meQueryKey, user);
    queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== 'me' });
    toast.success(t('welcome', { name: user.name.split(' ')[0] }));
    router.replace(next);
  };
}

export function LoginForm() {
  const t = useTranslations('auth');
  const { message, field } = useErrorMessage();
  const onSuccess = useAuthSuccess();
  const next = useSearchParams().get('next');
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (values: LoginInput) => api<UserDTO>('/auth/login', { method: 'POST', body: values }),
    onSuccess: ({ data }) => onSuccess(data),
    onError: (error) => {
      if (!applyServerErrors(error, form.setError)) toast.error(message(error));
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-5" noValidate>
      <Field label={t('email')} htmlFor="email" error={field(errors.email?.message)}>
        <Input id="email" type="email" autoComplete="email" autoFocus aria-invalid={Boolean(errors.email)} {...form.register('email')} />
      </Field>
      <Field
        label={t('password')}
        htmlFor="password"
        error={field(errors.password?.message)}
        action={
          <Link href="/forgot-password" className="text-[13px] font-semibold text-brand-700 hover:underline">
            {t('forgot')}
          </Link>
        }
      >
        <PasswordInput id="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} {...form.register('password')} />
      </Field>
      <Button type="submit" block size="lg" loading={mutation.isPending}>
        {t('login')}
      </Button>
      <p className="text-center text-sm text-muted">
        {t('noAccount')}{' '}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} className="font-semibold text-brand-700 hover:underline">
          {t('register')}
        </Link>
      </p>
    </form>
  );
}

const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'password_mismatch' });
type RegisterForm = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const t = useTranslations('auth');
  const { message, field } = useErrorMessage();
  const onSuccess = useAuthSuccess();
  const next = useSearchParams().get('next');
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: ({ confirmPassword: _confirm, ...values }: RegisterForm) => api<UserDTO>('/auth/register', { method: 'POST', body: values }),
    onSuccess: ({ data }) => onSuccess(data),
    onError: (error) => {
      if (!applyServerErrors(error, form.setError)) toast.error(message(error));
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-5" noValidate>
      <Field label={t('name')} htmlFor="name" error={field(errors.name?.message)}>
        <Input id="name" autoComplete="name" autoFocus aria-invalid={Boolean(errors.name)} {...form.register('name')} />
      </Field>
      <Field label={t('email')} htmlFor="email" error={field(errors.email?.message)}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...form.register('email')} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('password')} htmlFor="password" error={field(errors.password?.message)} hint={t('passwordHint')}>
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...form.register('password')} />
        </Field>
        <Field label={t('confirmPassword')} htmlFor="confirmPassword" error={field(errors.confirmPassword?.message)}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} {...form.register('confirmPassword')} />
        </Field>
      </div>
      <Button type="submit" block size="lg" loading={mutation.isPending}>
        {t('register')}
      </Button>
      <p className="text-center text-sm text-muted">
        {t('haveAccount')}{' '}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-semibold text-brand-700 hover:underline">
          {t('login')}
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const { message, field } = useErrorMessage();
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordInput) => api<null>('/auth/forgot-password', { method: 'POST', body: values }),
    onSuccess: () => setSent(true),
    onError: (error) => toast.error(message(error)),
  });

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <MailCheck className="mx-auto size-10 text-emerald-600" />
        <p className="mt-3 text-sm leading-relaxed text-emerald-800">{t('sent')}</p>
        <Link href="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
          <ArrowLeft className="size-4" />
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-5" noValidate>
      <Field label={t('email')} htmlFor="email" error={field(errors.email?.message)}>
        <Input id="email" type="email" autoComplete="email" autoFocus aria-invalid={Boolean(errors.email)} {...form.register('email')} />
      </Field>
      <Button type="submit" block size="lg" loading={mutation.isPending}>
        {t('sendLink')}
      </Button>
      <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" />
        {t('backToLogin')}
      </Link>
    </form>
  );
}

const resetFormSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'password_mismatch' });
type ResetForm = z.infer<typeof resetFormSchema>;

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const { message, field } = useErrorMessage();
  const token = useSearchParams().get('token') ?? '';
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<ResetForm>({ resolver: zodResolver(resetFormSchema), defaultValues: { password: '', confirmPassword: '' } });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (values: ResetForm) => api<UserDTO>('/auth/reset-password', { method: 'POST', body: { token, password: values.password } }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(meQueryKey, data);
      toast.success(t('resetDone'));
      router.replace('/account');
    },
    onError: (error) => {
      if (!applyServerErrors(error, form.setError)) toast.error(message(error));
    },
  });

  if (token.length < 20) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm text-amber-800">{t('invalidLink')}</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href="/forgot-password">{t('requestNew')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-5" noValidate>
      <Field label={t('password')} htmlFor="password" error={field(errors.password?.message)} hint={t('passwordHint')}>
        <PasswordInput id="password" autoComplete="new-password" autoFocus aria-invalid={Boolean(errors.password)} {...form.register('password')} />
      </Field>
      <Field label={t('confirmPassword')} htmlFor="confirmPassword" error={field(errors.confirmPassword?.message)}>
        <PasswordInput id="confirmPassword" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} {...form.register('confirmPassword')} />
      </Field>
      <Button type="submit" block size="lg" loading={mutation.isPending}>
        {t('resetSubmit')}
      </Button>
    </form>
  );
}
