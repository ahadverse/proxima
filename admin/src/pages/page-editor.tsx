import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { pageInputSchema, slugify, type PageDTO, type PageInput } from '@/shared';
import { LocalizedField } from '@/components/form/localized-field';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/dialog';
import { Field, Input, Switch } from '@/components/ui/form';
import { Card, Skeleton } from '@/components/ui/misc';
import { ApiError, api, errorMessage, fieldMessage } from '@/lib/api';

const EMPTY: PageInput = { slug: '', title: { en: '', bn: '' }, content: { en: '', bn: '' }, isPublished: true };

export default function PageEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const page = useQuery({
    queryKey: ['admin', 'page', id],
    queryFn: async () => (await api.get<PageDTO>(`/admin/pages/${id}`)).data,
    enabled: !isNew,
  });

  const form = useForm<PageInput>({ resolver: zodResolver(pageInputSchema), defaultValues: EMPTY });
  const { control, register, handleSubmit, reset, watch, setValue, setError, formState } = form;

  useEffect(() => {
    if (page.data) reset({ slug: page.data.slug, title: page.data.title, content: page.data.content, isPublished: page.data.isPublished });
  }, [page.data, reset]);

  const titleEn = watch('title.en');
  useEffect(() => {
    if (isNew && titleEn) setValue('slug', slugify(titleEn));
  }, [isNew, titleEn, setValue]);

  const save = useMutation({
    mutationFn: (values: PageInput) => (isNew ? api.post<PageDTO>('/admin/pages', values) : api.put<PageDTO>(`/admin/pages/${id}`, values)),
    onSuccess: ({ data }) => {
      toast.success('Page saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      reset({ slug: data.slug, title: data.title, content: data.content, isPublished: data.isPublished });
      if (isNew) navigate(`/pages/${data._id}`, { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) error.errors.forEach((e) => setError(e.path as never, { message: e.message }));
      else toast.error(errorMessage(error));
    },
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`/admin/pages/${id}`),
    onSuccess: () => {
      toast.success('Page deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      navigate('/pages', { replace: true });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (!isNew && page.isLoading) return <Skeleton className="h-[520px] rounded-2xl" />;

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link to="/pages">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="flex-1 text-xl font-extrabold text-ink">{isNew ? 'New page' : titleEn || 'Edit page'}</h1>
        {!isNew && (
          <Button
            type="button"
            variant="danger-ghost"
            onClick={async () => {
              if (await confirm({ title: 'Delete this page?', description: 'Links to it from the footer will show a 404.', confirmLabel: 'Delete' })) remove.mutate();
            }}
          >
            <Trash2 /> Delete
          </Button>
        )}
        <Button type="submit" loading={save.isPending} disabled={!formState.isDirty && !isNew}>
          <Save /> Save page
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card>
          <div className="space-y-5">
            <LocalizedField control={control} name="title" label="Title" required />
            <LocalizedField control={control} name="content" label="Content" kind="rich" />
          </div>
        </Card>
        <Card title="Settings">
          <div className="space-y-4">
            <Field label="Slug" htmlFor="slug" required error={fieldMessage(formState.errors.slug?.message)} hint={`/p/${watch('slug') || '…'}`}>
              <Input id="slug" {...register('slug')} />
            </Field>
            <Controller
              control={control}
              name="isPublished"
              render={({ field }) => <Switch id="published" checked={field.value} onCheckedChange={field.onChange} label="Published" />}
            />
          </div>
        </Card>
      </div>
    </form>
  );
}
