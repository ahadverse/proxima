import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FolderTree, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoryInputSchema, slugify, type CategoryDTO, type CategoryInput } from '@/shared';
import { LocalizedField } from '@/components/form/localized-field';
import { Button } from '@/components/ui/button';
import { Dialog, useConfirm } from '@/components/ui/dialog';
import { Field, Input, Switch } from '@/components/ui/form';
import { Badge, EmptyState, PageHeader, Skeleton } from '@/components/ui/misc';
import { ApiError, api, errorMessage, fieldMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

function CategoryDialog({ open, onOpenChange, category }: { open: boolean; onOpenChange: (open: boolean) => void; category: CategoryDTO | null }) {
  const queryClient = useQueryClient();
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: { name: { en: '', bn: '' }, slug: '', icon: '', isActive: true },
  });
  const { register, control, handleSubmit, reset, setValue, watch, setError, formState } = form;

  useEffect(() => {
    if (open) reset(category ? { name: category.name, slug: category.slug, icon: category.icon, isActive: category.isActive } : { name: { en: '', bn: '' }, slug: '', icon: '', isActive: true });
  }, [open, category, reset]);

  const nameEn = watch('name.en');
  useEffect(() => {
    if (!category && nameEn) setValue('slug', slugify(nameEn));
  }, [nameEn, category, setValue]);

  const save = useMutation({
    mutationFn: (values: CategoryInput) => (category ? api.put(`/admin/categories/${category._id}`, values) : api.post('/admin/categories', values)),
    onSuccess: () => {
      toast.success(category ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
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
      title={category ? 'Edit category' : 'New category'}
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
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
        <LocalizedField control={control} name="name" label="Name" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" htmlFor="slug" required error={fieldMessage(formState.errors.slug?.message)}>
            <Input id="slug" {...register('slug')} />
          </Field>
          <Field label="Icon" htmlFor="icon" hint="Lucide icon name, optional">
            <Input id="icon" {...register('icon')} />
          </Field>
        </div>
        <Switch id="isActive" checked={watch('isActive')} onCheckedChange={(v) => setValue('isActive', v, { shouldDirty: true })} label="Visible on storefront" />
      </form>
    </Dialog>
  );
}

function Row({ category, onEdit, onDelete }: { category: CategoryDTO; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category._id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-3 bg-surface px-4 py-3', isDragging && 'relative z-10 shadow-xl ring-1 ring-brand-300')}
    >
      <button type="button" {...attributes} {...listeners} className="grid size-8 cursor-grab place-items-center rounded-md text-muted hover:bg-hover" aria-label="Drag to reorder">
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">
          {category.name.en} <span className="font-normal text-muted">· {category.name.bn}</span>
        </p>
        <p className="font-mono text-[11.5px] text-muted">/{category.slug}</p>
      </div>
      <Badge tone="brand">{category.productCount} products</Badge>
      {!category.isActive && <Badge tone="warning">Hidden</Badge>}
      <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit">
        <Pencil />
      </Button>
      <Button variant="danger-ghost" size="icon-sm" onClick={onDelete} aria-label="Delete">
        <Trash2 />
      </Button>
    </li>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [dialog, setDialog] = useState<{ open: boolean; category: CategoryDTO | null }>({ open: false, category: null });
  const [items, setItems] = useState<CategoryDTO[]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const query = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => (await api.get<CategoryDTO[]>('/admin/categories')).data,
  });
  useEffect(() => {
    if (query.data) setItems(query.data);
  }, [query.data]);

  const reorder = useMutation({
    mutationFn: (ids: string[]) => api.patch<CategoryDTO[]>('/admin/categories/reorder', { ids }),
    onSuccess: ({ data }) => queryClient.setQueryData(['admin', 'categories'], data),
    onError: (error) => {
      toast.error(errorMessage(error));
      if (query.data) setItems(query.data);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const next = arrayMove(items, items.findIndex((c) => c._id === active.id), items.findIndex((c) => c._id === over.id));
    setItems(next);
    reorder.mutate(next.map((c) => c._id));
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="Drag to change the order shown in the storefront sidebar."
        actions={
          <Button onClick={() => setDialog({ open: true, category: null })}>
            <Plus /> New category
          </Button>
        }
      />
      <div className="panel overflow-hidden">
        {query.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={<FolderTree />} title="No categories yet" />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((c) => c._id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-line">
                {items.map((category) => (
                  <Row
                    key={category._id}
                    category={category}
                    onEdit={() => setDialog({ open: true, category })}
                    onDelete={async () => {
                      const ok = await confirm({
                        title: `Delete ${category.name.en}?`,
                        description: category.productCount ? 'This category still has products. Move them first.' : 'This cannot be undone.',
                        confirmLabel: 'Delete',
                      });
                      if (ok) remove.mutate(category._id);
                    }}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <CategoryDialog open={dialog.open} category={dialog.category} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
    </>
  );
}
