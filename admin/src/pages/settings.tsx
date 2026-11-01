import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { siteSettingsSchema, type SiteSettingsDTO, type SiteSettingsInput } from '@/shared';
import { LocalizedListEditor } from '@/components/form/list-editors';
import { LocalizedField } from '@/components/form/localized-field';
import { ImageUploader } from '@/components/form/uploaders';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Switch } from '@/components/ui/form';
import { Card, PageHeader, Skeleton } from '@/components/ui/misc';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { ApiError, api, errorMessage, fieldMessage } from '@/lib/api';
import { fromLocalInput, toLocalInput } from '@/lib/utils';

const TABS = [
  { value: 'brand', label: 'Brand' },
  { value: 'contact', label: 'Contact' },
  { value: 'social', label: 'Social' },
  { value: 'offer', label: 'Offer bar' },
  { value: 'promo', label: 'Promo popup' },
  { value: 'hosting', label: 'Hosting & payments' },
  { value: 'help', label: 'Help & FAQ' },
];

function strip(settings: SiteSettingsDTO): SiteSettingsInput {
  const { updatedAt: _updatedAt, ...rest } = settings;
  return rest;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get<SiteSettingsDTO>('/admin/settings')).data,
  });

  const form = useForm<SiteSettingsInput>({ resolver: zodResolver(siteSettingsSchema) });
  const { control, register, handleSubmit, reset, setError, formState } = form;
  const { errors, isDirty } = formState;
  const faq = useFieldArray({ control, name: 'membershipFaq' });
  const offerMode = useWatch({ control, name: 'offerBar.mode' });

  useEffect(() => {
    if (data) reset(strip(data));
  }, [data, reset]);

  const save = useMutation({
    mutationFn: (values: SiteSettingsInput) => api.put<SiteSettingsDTO>('/admin/settings', values),
    onSuccess: ({ data: saved }) => {
      toast.success('Settings saved. The storefront updates in a few seconds.');
      queryClient.setQueryData(['admin', 'settings'], saved);
      reset(strip(saved));
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        error.errors.forEach((e) => setError(e.path as never, { message: e.message }));
        toast.error('Please fix the highlighted fields');
      } else toast.error(errorMessage(error));
    },
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v), () => toast.error('Please fix the highlighted fields'))} noValidate>
      <PageHeader
        title="Settings"
        description="Storefront content, contact details and promotions."
        actions={
          <Button type="submit" loading={save.isPending} disabled={!isDirty}>
            <Save /> Save settings
          </Button>
        }
      />
      <Tabs defaultValue="brand">
        <TabsList items={TABS} className="mb-5 flex-wrap" />

        <TabsContent value="brand">
          <Card title="Brand">
            <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
              <div className="space-y-5">
                <Field label="Brand name" htmlFor="brandName" required error={fieldMessage(errors.brand?.name?.message)}>
                  <Input id="brandName" {...register('brand.name')} />
                </Field>
                <LocalizedField control={control} name="brand.tagline" label="Tagline" hint="Shown under the logo." />
                <LocalizedField control={control} name="brand.footerAbout" label="Footer about text" kind="textarea" />
              </div>
              <Controller
                control={control}
                name="brand.logo"
                render={({ field }) => (
                  <Field label="Logo" hint="Optional. Without a logo the built-in mark is used.">
                    <ImageUploader value={field.value} onChange={field.onChange} aspect="aspect-[3/1]" label="Upload logo" />
                  </Field>
                )}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card title="Contact details" description="Empty fields are hidden on the Help page.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="WhatsApp number" htmlFor="whatsapp" hint="Bangladeshi number; also powers the floating WhatsApp button.">
                <Input id="whatsapp" {...register('contact.whatsapp')} />
              </Field>
              <Field label="Messenger link" htmlFor="messenger" error={fieldMessage(errors.contact?.messenger?.message)}>
                <Input id="messenger" placeholder="https://m.me/…" {...register('contact.messenger')} />
              </Field>
              <Field label="Support email" htmlFor="email" error={fieldMessage(errors.contact?.email?.message)}>
                <Input id="email" type="email" {...register('contact.email')} />
              </Field>
              <Field label="Phone" htmlFor="phone">
                <Input id="phone" {...register('contact.phone')} />
              </Field>
              <LocalizedField control={control} name="contact.hours" label="Support hours" />
              <Field label="Trade license" htmlFor="tradeLicense">
                <Input id="tradeLicense" {...register('contact.tradeLicense')} />
              </Field>
              <LocalizedField control={control} name="contact.address" label="Address" kind="textarea" className="sm:col-span-2" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card title="Social links" description="Shown in the footer and on the Help page.">
            <div className="grid gap-5 sm:grid-cols-2">
              {(['facebook', 'youtube', 'instagram', 'linkedin', 'tiktok'] as const).map((key) => (
                <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} htmlFor={key} error={fieldMessage(errors.socials?.[key]?.message)}>
                  <Input id={key} placeholder="https://" {...register(`socials.${key}`)} />
                </Field>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="offer">
          <Card title="Offer bar" description="The countdown strip at the top of every page.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={control}
                name="offerBar.enabled"
                render={({ field }) => (
                  <div className="sm:col-span-2">
                    <Switch id="offerEnabled" checked={field.value} onCheckedChange={field.onChange} label="Show the offer bar" />
                  </div>
                )}
              />
              <LocalizedField control={control} name="offerBar.label" label="Label" />
              <LocalizedField control={control} name="offerBar.ctaLabel" label="Button text" />
              <Field label="Offer price (৳)" htmlFor="offerPrice">
                <Input id="offerPrice" type="number" min={0} {...register('offerBar.price', { valueAsNumber: true })} />
              </Field>
              <Field label="Regular price (৳)" htmlFor="offerCompare" hint="Shown crossed out">
                <Input id="offerCompare" type="number" min={0} {...register('offerBar.comparePrice', { valueAsNumber: true })} />
              </Field>
              <Field label="Countdown mode" htmlFor="mode">
                <Select id="mode" {...register('offerBar.mode')}>
                  <option value="evergreen-daily">Resets every day at midnight</option>
                  <option value="fixed">Ends on a fixed date</option>
                </Select>
              </Field>
              {offerMode === 'fixed' && (
                <Controller
                  control={control}
                  name="offerBar.endsAt"
                  render={({ field }) => (
                    <Field label="Ends at" htmlFor="endsAt" hint="Dhaka time. The bar hides when it ends.">
                      <Input id="endsAt" type="datetime-local" value={toLocalInput(field.value)} onChange={(e) => field.onChange(fromLocalInput(e.target.value))} />
                    </Field>
                  )}
                />
              )}
              <Field label="Button link" htmlFor="ctaHref" hint="A storefront path such as /membership, or a full URL" className="sm:col-span-2">
                <Input id="ctaHref" {...register('offerBar.ctaHref')} />
              </Field>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="promo">
          <Card title="Promo popup" description="Shown once a day to visitors after the delay. Hidden on checkout, membership and account pages.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={control}
                name="promoPopup.enabled"
                render={({ field }) => (
                  <div className="sm:col-span-2">
                    <Switch id="promoEnabled" checked={field.value} onCheckedChange={field.onChange} label="Show the promo popup" />
                  </div>
                )}
              />
              <LocalizedField control={control} name="promoPopup.title" label="Title" />
              <LocalizedField control={control} name="promoPopup.discountText" label="Discount text" />
              <LocalizedField control={control} name="promoPopup.subtitle" label="Subtitle" kind="textarea" className="sm:col-span-2" />
              <Field label="Coupon code" htmlFor="couponCode" hint="Create the matching coupon in Coupons.">
                <Input id="couponCode" className="font-mono uppercase" {...register('promoPopup.couponCode')} />
              </Field>
              <Field label="Delay (seconds)" htmlFor="delay">
                <Input id="delay" type="number" min={0} max={300} {...register('promoPopup.delaySeconds', { valueAsNumber: true })} />
              </Field>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hosting">
          <div className="space-y-6">
            <Card title="Hosting promotion" description="Footer card linking to your hosting partner.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="hostingPromo.enabled"
                  render={({ field }) => (
                    <div className="sm:col-span-2">
                      <Switch id="hostingEnabled" checked={field.value} onCheckedChange={field.onChange} label="Show hosting promotion" />
                    </div>
                  )}
                />
                <LocalizedField control={control} name="hostingPromo.title" label="Title" />
                <LocalizedField control={control} name="hostingPromo.ctaLabel" label="Button text" />
                <LocalizedField control={control} name="hostingPromo.text" label="Text" kind="textarea" />
                <Field label="Link" htmlFor="hostingUrl" error={fieldMessage(errors.hostingPromo?.url?.message)}>
                  <Input id="hostingUrl" placeholder="https://" {...register('hostingPromo.url')} />
                </Field>
              </div>
            </Card>
            <Card title="Payment methods image" description="Shown in the footer under Secure Payment Gateways.">
              <Controller
                control={control}
                name="paymentLogos"
                render={({ field }) => (
                  <div className="max-w-md">
                    <ImageUploader value={field.value} onChange={field.onChange} aspect="aspect-[4/1]" label="Upload payment logos" />
                  </div>
                )}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="help">
          <div className="space-y-6">
            <Card title="Help topics" description="Listed on the Help page.">
              <Controller
                control={control}
                name="helpTopics"
                render={({ field }) => <LocalizedListEditor value={field.value} onChange={field.onChange} placeholder="Topic" max={20} />}
              />
            </Card>
            <Card title="Membership FAQ" description="Shown on the Membership page.">
              <div className="space-y-4">
                {faq.fields.map((item, index) => (
                  <div key={item.id} className="rounded-xl border border-line bg-surface-2 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[12.5px] font-semibold text-muted">Question {index + 1}</span>
                      <Button type="button" variant="danger-ghost" size="icon-sm" onClick={() => faq.remove(index)} aria-label="Remove question">
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <LocalizedField control={control} name={`membershipFaq.${index}.q`} label="Question" />
                      <LocalizedField control={control} name={`membershipFaq.${index}.a`} label="Answer" kind="textarea" />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => faq.append({ q: { en: '', bn: '' }, a: { en: '', bn: '' } })}>
                  <Plus /> Add question
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
