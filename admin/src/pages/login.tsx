import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import { loginSchema, type LoginInput, type UserDTO } from '@/shared';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { useMe } from '@/hooks/use-auth';
import { api, errorMessage, fieldMessage } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const next = params.get('next');
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';

  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (values: LoginInput) => api.post<UserDTO>('/auth/login', values),
    onSuccess: ({ data }) => {
      if (data.role !== 'admin') {
        toast.error('This account does not have admin access');
        void api.post('/auth/logout');
        return;
      }
      queryClient.setQueryData(['me'], data);
      navigate(target, { replace: true });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (user?.role === 'admin') return <Navigate to={target} replace />;

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_20%_10%,rgb(85_28_150/0.18),transparent),radial-gradient(500px_260px_at_85%_90%,rgb(85_28_150/0.14),transparent)]" />
      <div className="panel relative w-full max-w-sm p-8 shadow-xl">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-700 text-white shadow-[0_10px_24px_-10px_rgb(85_28_150/0.9)]">
          <LockKeyhole className="size-5" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-ink">Proxima Admin</h1>
        <p className="mt-1 text-[13.5px] text-muted">Sign in with an administrator account.</p>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="mt-7 space-y-4" noValidate>
          <Field label="Email" htmlFor="email" error={fieldMessage(errors.email?.message)}>
            <Input id="email" type="email" autoComplete="email" autoFocus aria-invalid={Boolean(errors.email)} {...form.register('email')} />
          </Field>
          <Field label="Password" htmlFor="password" error={fieldMessage(errors.password?.message)}>
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} {...form.register('password')} />
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
