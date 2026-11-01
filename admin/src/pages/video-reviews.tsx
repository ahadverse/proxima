import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Play, Plus, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { videoReviewInputSchema, youtubeId, type VideoReviewDTO, type VideoReviewInput } from '@/shared';
import { LocalizedField } from '@/components/form/localized-field';
import { Button } from '@/components/ui/button';
import { Dialog, useConfirm } from '@/components/ui/dialog';
import { Field, Input, Switch } from '@/components/ui/form';
import { Badge, EmptyState, PageHeader, Skeleton } from '@/components/ui/misc';
import { ApiError, api, errorMessage, fieldMessage } from '@/lib/api';

const EMPTY: VideoReviewInput = { url: '', title: { en: '', bn: '' }, description: { en: '', bn: '' }, isActive: true };

function ReviewDialog({ open, onOpenChange, review }: { open: boolean; onOpenChange: (open: boolean) => void; review: VideoReviewDTO | null }) {
  const queryClient = useQueryClient();
  const form = useForm<VideoReviewInput>({ resolver: zodResolver(videoReviewInputSchema), defaultValues: EMPTY });
  const { register, control, handleSubmit, reset, watch, setError, formState } = form;
  const id = youtubeId(watch('url'));

  useEffect(() => {
    if (open) reset(review ? { url: review.url, title: review.title, description: review.description, isActive: review.isActive } : EMPTY);
  }, [open, review, reset]);

  const save = useMutation({
    mutationFn: (values: VideoReviewInput) => (review ? api.put(`/admin/video-reviews/${review._id}`, values) : api.post('/admin/video-reviews', values)),
    onSuccess: () => {
      toast.success('Video saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'video-reviews'] });
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) error.errors.forEach((e) => setError(e.path as never, { message: e.message }));
      else toast.error(errorMessage(error));
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={review ? 'Edit video' : 'Add video review'}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => save.mutate(v))} loading={save.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form className="space-y-4" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Field label="YouTube link" htmlFor="url" required error={fieldMessage(formState.errors.url?.message)}>
          <Input id="url" placeholder="https://www.youtube.com/watch?v=…" {...register('url')} />
        </Field>
        {id && <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="aspect-video w-full rounded-lg object-cover" />}
        <LocalizedField control={control} name="title" label="Title" required />
        <LocalizedField control={control} name="description" label="Short description" kind="textarea" />
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => <Switch id="active" checked={field.value} onCheckedChange={field.onChange} label="Show on the Reviews page" />}
        />
      </form>
    </Dialog>
  );
}

export default function VideoReviewsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [dialog, setDialog] = useState<{ open: boolean; review: VideoReviewDTO | null }>({ open: false, review: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'video-reviews'],
    queryFn: async () => (await api.get<VideoReviewDTO[]>('/admin/video-reviews')).data,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/video-reviews/${id}`),
    onSuccess: () => {
      toast.success('Video removed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'video-reviews'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <>
      <PageHeader
        title="Video reviews"
        description="YouTube videos shown on the storefront Reviews page."
        actions={
          <Button onClick={() => setDialog({ open: true, review: null })}>
            <Plus /> Add video
          </Button>
        }
      />
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="panel">
          <EmptyState icon={<Video />} title="No videos yet" text="Add YouTube reviews and walkthroughs to build trust." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((review) => (
            <article key={review._id} className="panel overflow-hidden">
              <div className="relative">
                <img src={`https://i.ytimg.com/vi/${review.youtubeId}/hqdefault.jpg`} alt="" className="aspect-video w-full object-cover" />
                <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-700 shadow">
                  <Play className="ml-0.5 size-5 fill-current" />
                </span>
                {!review.isActive && <Badge tone="neutral" className="absolute left-3 top-3">Hidden</Badge>}
              </div>
              <div className="flex items-start gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-ink">{review.title.en || review.title.bn}</p>
                  {review.description.en && <p className="mt-0.5 line-clamp-1 text-[12.5px] text-muted">{review.description.en}</p>}
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setDialog({ open: true, review })}>
                  <Pencil />
                </Button>
                <Button
                  variant="danger-ghost"
                  size="icon-sm"
                  aria-label="Delete"
                  onClick={async () => {
                    if (await confirm({ title: 'Remove this video?', description: 'It disappears from the Reviews page.', confirmLabel: 'Remove' })) remove.mutate(review._id);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      <ReviewDialog open={dialog.open} review={dialog.review} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
    </>
  );
}
