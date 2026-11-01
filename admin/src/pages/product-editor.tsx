import { useEffect, useMemo, useRef } from 'react';
import { Controller, useFieldArray, useForm, useWatch, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useBlocker, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ExternalLink, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  PRODUCT_TYPES,
  TECH_STACKS,
  TECH_STACK_LABELS,
  productInputSchema,
  slugify,
  type AdminProductDTO,
  type CategoryDTO,
  type ProductInput,
} from '@/shared';
import { LocalizedListEditor, TagInput } from '@/components/form/list-editors';
import { LocalizedField } from '@/components/form/localized-field';
import { FileUploader, GalleryUploader, ImageUploader } from '@/components/form/uploaders';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/dialog';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/form';
import { Badge, Card, Skeleton } from '@/components/ui/misc';
import { ApiError, api, errorMessage, fieldMessage } from '@/lib/api';
import { STOREFRONT_URL } from '@/lib/utils';

const emptyLocalized = () => ({ en: '', bn: '' });

const DEFAULT_HIGHLIGHTS = [
  { en: 'Full source code', bn: 'সম্পূর্ণ সোর্স কোড' },
  { en: 'Lifetime updates', bn: 'লাইফটাইম আপডেট' },
  { en: 'Free Vercel setup', bn: 'ফ্রি Vercel সেটআপ' },
  { en: 'Commercial license', bn: 'কমার্শিয়াল লাইসেন্স' },
  { en: '6 months support', bn: '৬ মাস সাপোর্ট' },
  { en: 'Instant access', bn: 'তাৎক্ষণিক অ্যাক্সেস' },
];

function emptyProduct(): ProductInput {
  return {
    type: 'website',
    status: 'draft',
    slug: '',
    category: null,
    title: emptyLocalized(),
    shortDescription: emptyLocalized(),
    description: emptyLocalized(),
    techStack: 'nextjs',
    techTags: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'MongoDB'],
    price: 0,
    compareAtPrice: null,
    isFree: false,
    thumbnail: '',
    gallery: [],
    previewUrl: '',
    tutorialUrl: '',
    githubUrl: '',
    demoAdmin: { url: '', email: '', password: '', isPublic: false },
    file: null,
    version: '1.0.0',
    highlights: DEFAULT_HIGHLIGHTS,
    features: [],
    changelog: [],
    seo: { title: '', description: '' },
    featured: false,
    order: 0,
  };
}

function toInput(product: AdminProductDTO): ProductInput {
  return {
    type: product.type,
    status: product.status,
    slug: product.slug,
    category: product.category?._id ?? null,
    title: product.title,
    shortDescription: product.shortDescription,
    description: product.description,
    techStack: product.techStack,
    techTags: product.techTags,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    isFree: product.isFree,
    thumbnail: product.thumbnail,
    gallery: product.gallery,
    previewUrl: product.previewUrl,
    tutorialUrl: product.tutorialUrl,
    githubUrl: product.githubUrl,
    demoAdmin: product.demoAdminFull,
    file: product.file,
    version: product.version,
    highlights: product.highlights,
    features: product.features,
    changelog: product.changelog,
    seo: product.seo,
    featured: product.featured,
    order: product.order,
  };
}

function ChangelogEditor({ control }: { control: Control<ProductInput> }) {
  const { fields, prepend, remove } = useFieldArray({ control, name: 'changelog' });
  return (
    <div className="space-y-3">
      {fields.map((entry, index) => (
        <div key={entry.id} className="rounded-xl border border-line bg-surface-2 p-4">
          <div className="grid gap-3 sm:grid-cols-[140px_180px_1fr_auto] sm:items-end">
            <Controller
              control={control}
              name={`changelog.${index}.version`}
              render={({ field, fieldState }) => (
                <Field label="Version" error={fieldMessage(fieldState.error?.message)}>
                  <Input {...field} placeholder="1.1.0" />
                </Field>
              )}
            />
            <Controller
              control={control}
              name={`changelog.${index}.date`}
              render={({ field }) => (
                <Field label="Release date">
                  <Input type="date" value={field.value ? field.value.slice(0, 10) : ''} onChange={(e) => field.onChange(e.target.value ? new Date(`${e.target.value}T00:00:00+06:00`).toISOString() : '')} />
                </Field>
              )}
            />
            <span />
            <Button type="button" variant="danger-ghost" size="icon" onClick={() => remove(index)} aria-label="Remove release">
              <Trash2 />
            </Button>
          </div>
          <LocalizedField control={control} name={`changelog.${index}.notes`} label="Release notes" kind="textarea" className="mt-3" />
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => prepend({ version: '', date: new Date().toISOString(), notes: emptyLocalized() })}>
        <Plus /> Add release
      </Button>
    </div>
  );
}

export default function ProductEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const slugTouched = useRef(!isNew);

  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => (await api.get<CategoryDTO[]>('/admin/categories')).data,
  });

  const product = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => (await api.get<AdminProductDTO>(`/admin/products/${id}`)).data,
    enabled: !isNew,
  });

  const form = useForm<ProductInput>({ resolver: zodResolver(productInputSchema), defaultValues: emptyProduct(), mode: 'onTouched' });
  const { control, register, handleSubmit, reset, setValue, setError, formState } = form;
  const { errors, isDirty, isSubmitting } = formState;

  useEffect(() => {
    if (product.data) reset(toInput(product.data));
  }, [product.data, reset]);

  const [type, isFree, titleEn, seoTitle, seoDescription, status, slug] = useWatch({
    control,
    name: ['type', 'isFree', 'title.en', 'seo.title', 'seo.description', 'status', 'slug'],
  });

  useEffect(() => {
    if (!slugTouched.current && titleEn) setValue('slug', slugify(titleEn), { shouldDirty: true });
  }, [titleEn, setValue]);

  useEffect(() => {
    if (isFree) setValue('price', 0, { shouldDirty: true });
  }, [isFree, setValue]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && !isSubmitting && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    void confirm({ title: 'Discard changes?', description: 'You have unsaved changes on this product.', confirmLabel: 'Discard' }).then((ok) =>
      ok ? blocker.proceed() : blocker.reset(),
    );
  }, [blocker, confirm]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (isDirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const save = useMutation({
    mutationFn: (values: ProductInput) =>
      isNew ? api.post<AdminProductDTO>('/admin/products', values) : api.put<AdminProductDTO>(`/admin/products/${id}`, values),
    onSuccess: ({ data }) => {
      toast.success(isNew ? 'Product created' : 'Product saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.setQueryData(['admin', 'product', data._id], data);
      reset(toInput(data));
      if (isNew) navigate(`/products/${data._id}`, { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors?.length) {
        for (const item of error.errors) setError(item.path as never, { message: item.message });
        toast.error('Please fix the highlighted fields');
      } else {
        toast.error(errorMessage(error));
      }
    },
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      reset(emptyProduct());
      navigate('/products', { replace: true });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const categoryOptions = useMemo(() => categories.data ?? [], [categories.data]);

  if (!isNew && product.isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-[520px] rounded-2xl" />
      </div>
    );
  }

  if (!isNew && product.isError) {
    return (
      <div className="panel p-10 text-center">
        <p className="font-semibold text-ink">{errorMessage(product.error)}</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link to="/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  const onInvalid = () => toast.error('Please fix the highlighted fields');

  return (
    <form onSubmit={handleSubmit((values) => save.mutate(values), onInvalid)} noValidate>
      <div className="sticky top-16 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <Button asChild variant="ghost" size="icon" aria-label="Back to products">
          <Link to="/products">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold text-ink">{isNew ? 'New product' : titleEn || 'Edit product'}</h1>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge tone={status === 'published' ? 'success' : 'warning'} dot>
              {status === 'published' ? 'Published' : 'Draft'}
            </Badge>
            {isDirty && <span className="text-[12px] font-medium text-amber-600">Unsaved changes</span>}
          </div>
        </div>
        {!isNew && STOREFRONT_URL && status === 'published' && type !== 'membership' && (
          <Button asChild variant="secondary">
            <a href={`${STOREFRONT_URL}/product/${slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> View
            </a>
          </Button>
        )}
        {!isNew && (
          <Button
            type="button"
            variant="danger-ghost"
            loading={remove.isPending}
            onClick={async () => {
              const ok = await confirm({ title: 'Delete this product?', description: 'Products with orders cannot be deleted; set them to draft instead.', confirmLabel: 'Delete' });
              if (ok) remove.mutate();
            }}
          >
            <Trash2 /> Delete
          </Button>
        )}
        <Button type="submit" loading={save.isPending} disabled={!isDirty && !isNew}>
          <Save /> {isNew ? 'Create product' : 'Save changes'}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Card title="Content" description="Shown on the product page. Fill both languages for the best experience.">
            <div className="space-y-5">
              <LocalizedField control={control} name="title" label="Title" required />
              <LocalizedField control={control} name="shortDescription" label="Short description" kind="textarea" hint="One or two sentences shown under the title." />
              <LocalizedField control={control} name="description" label="Description" kind="rich" placeholder="Describe the product, its features and what buyers get…" />
            </div>
          </Card>

          <Card title="Media" description="The thumbnail should be a tall full-page screenshot; it scrolls on hover.">
            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
              <Controller
                control={control}
                name="thumbnail"
                render={({ field, fieldState }) => (
                  <Field label="Thumbnail" required error={fieldMessage(fieldState.error?.message)}>
                    <ImageUploader value={field.value} onChange={field.onChange} aspect="aspect-[3/4]" hint="Tall screenshot, at least 900px wide" />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="gallery"
                render={({ field }) => (
                  <Field label="Gallery" hint="Drag to reorder. The first image is shown first on the product page.">
                    <GalleryUploader value={field.value} onChange={field.onChange} />
                  </Field>
                )}
              />
            </div>
          </Card>

          <Card title="Delivery" description="Only buyers and members can see these in My Products.">
            <div className="space-y-5">
              <Field label="GitHub repository link" htmlFor="githubUrl" error={fieldMessage(errors.githubUrl?.message)} hint="Make sure buyers have access on GitHub.">
                <Input id="githubUrl" placeholder="https://github.com/…" {...register('githubUrl')} />
              </Field>
              <Controller
                control={control}
                name="file"
                render={({ field }) => (
                  <Field label="Source zip">
                    <FileUploader value={field.value} onChange={field.onChange} />
                  </Field>
                )}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Current version" htmlFor="version" error={fieldMessage(errors.version?.message)}>
                  <Input id="version" {...register('version')} />
                </Field>
              </div>
              <Field label="Changelog">
                <ChangelogEditor control={control} />
              </Field>
            </div>
          </Card>

          <Card title="Highlights & features">
            <div className="space-y-6">
              <Controller
                control={control}
                name="highlights"
                render={({ field }) => (
                  <Field label="Highlights" hint="Short checklist items shown in the purchase box.">
                    <LocalizedListEditor value={field.value} onChange={field.onChange} placeholder="Highlight" max={12} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="features"
                render={({ field }) => (
                  <Field label="Features" hint="Shown in the Tech stack tab.">
                    <LocalizedListEditor value={field.value} onChange={field.onChange} placeholder="Feature" />
                  </Field>
                )}
              />
            </div>
          </Card>

          <Card title="Demo & links">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Live demo URL" htmlFor="previewUrl" error={fieldMessage(errors.previewUrl?.message)}>
                <Input id="previewUrl" placeholder="https://" {...register('previewUrl')} />
              </Field>
              <Field label="Tutorial video (YouTube)" htmlFor="tutorialUrl" error={fieldMessage(errors.tutorialUrl?.message)}>
                <Input id="tutorialUrl" placeholder="https://www.youtube.com/watch?v=…" {...register('tutorialUrl')} />
              </Field>
              <Field label="Demo admin URL" htmlFor="demoUrl" error={fieldMessage(errors.demoAdmin?.url?.message)}>
                <Input id="demoUrl" placeholder="https://" {...register('demoAdmin.url')} />
              </Field>
              <Field label="Demo admin email" htmlFor="demoEmail">
                <Input id="demoEmail" {...register('demoAdmin.email')} />
              </Field>
              <Field label="Demo admin password" htmlFor="demoPassword">
                <Input id="demoPassword" {...register('demoAdmin.password')} />
              </Field>
              <Controller
                control={control}
                name="demoAdmin.isPublic"
                render={({ field }) => (
                  <div className="sm:pt-6">
                    <Switch id="demoPublic" checked={field.value} onCheckedChange={field.onChange} label="Show demo login publicly" description="Otherwise only buyers see it." />
                  </div>
                )}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Publishing">
            <div className="space-y-4">
              <Field label="Status" htmlFor="status">
                <Select id="status" {...register('status')}>
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
              <Controller
                control={control}
                name="featured"
                render={({ field }) => <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} label="Featured" description="Shown first in the default sort." />}
              />
              <Field label="Sort order" htmlFor="order" hint="Lower numbers appear first.">
                <Input id="order" type="number" min={0} {...register('order', { valueAsNumber: true })} />
              </Field>
            </div>
          </Card>

          <Card title="Organization">
            <div className="space-y-4">
              <Field label="Type" htmlFor="type">
                <Select id="type" {...register('type')}>
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Controller
                control={control}
                name="category"
                render={({ field, fieldState }) => (
                  <Field label="Category" htmlFor="category" required={type !== 'membership'} error={fieldMessage(fieldState.error?.message)}>
                    <Select id="category" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)}>
                      <option value="">{type === 'membership' ? 'None' : 'Select a category'}</option>
                      {categoryOptions.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name.en || c.name.bn}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}
              />
              <Field label="Tech stack" htmlFor="techStack">
                <Select id="techStack" {...register('techStack')}>
                  {TECH_STACKS.map((t) => (
                    <option key={t} value={t}>
                      {TECH_STACK_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Controller
                control={control}
                name="techTags"
                render={({ field }) => (
                  <Field label="Tech tags">
                    <TagInput value={field.value} onChange={field.onChange} />
                  </Field>
                )}
              />
            </div>
          </Card>

          <Card title="Pricing" description="Prices are in Taka (৳).">
            <div className="space-y-4">
              <Controller
                control={control}
                name="isFree"
                render={({ field }) => <Switch id="isFree" checked={field.value} onCheckedChange={field.onChange} label="Free product" />}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price" htmlFor="price" error={fieldMessage(errors.price?.message)}>
                  <Input id="price" type="number" min={0} disabled={isFree} {...register('price', { valueAsNumber: true })} />
                </Field>
                <Controller
                  control={control}
                  name="compareAtPrice"
                  render={({ field, fieldState }) => (
                    <Field label="Compare at" htmlFor="compareAtPrice" error={fieldMessage(fieldState.error?.message)}>
                      <Input
                        id="compareAtPrice"
                        type="number"
                        min={0}
                        disabled={isFree}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      />
                    </Field>
                  )}
                />
              </div>
            </div>
          </Card>

          <Card title="URL & SEO">
            <div className="space-y-4">
              <Field label="Slug" htmlFor="slug" required error={fieldMessage(errors.slug?.message)} hint={`/product/${slug || '…'}`}>
                <Input id="slug" {...register('slug', { onChange: () => (slugTouched.current = true) })} />
              </Field>
              <Field label="SEO title" htmlFor="seoTitle" hint={`${seoTitle?.length ?? 0}/70`} error={fieldMessage(errors.seo?.title?.message)}>
                <Input id="seoTitle" {...register('seo.title')} />
              </Field>
              <Field label="SEO description" htmlFor="seoDescription" hint={`${seoDescription?.length ?? 0}/170`} error={fieldMessage(errors.seo?.description?.message)}>
                <Textarea id="seoDescription" rows={3} {...register('seo.description')} />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
