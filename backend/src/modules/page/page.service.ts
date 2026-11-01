import type { PageInput, PageSummaryDTO } from '@/shared';
import { CacheTags, revalidateStorefront } from '../../lib/revalidate';
import { ApiError } from '../../utils/ApiError';
import { cleanLocalizedHtml } from '../../utils/html';
import { Page, toPageDTO } from './page.model';

export async function getPublished(slug: string) {
  const page = await Page.findOne({ slug, isPublished: true }).lean();
  if (!page) throw ApiError.notFound('Page not found', 'PAGE_NOT_FOUND');
  return toPageDTO(page);
}

export async function listPublished(): Promise<PageSummaryDTO[]> {
  const pages = await Page.find({ isPublished: true }).select('slug title updatedAt').sort({ slug: 1 }).lean();
  return pages.map((page) => ({ slug: page.slug, title: page.title, updatedAt: new Date(page.updatedAt).toISOString() }));
}

export async function listAll() {
  const pages = await Page.find().sort({ slug: 1 }).lean();
  return pages.map(toPageDTO);
}

export async function getById(id: string) {
  const page = await Page.findById(id).lean();
  if (!page) throw ApiError.notFound('Page not found');
  return toPageDTO(page);
}

export async function create(input: PageInput) {
  const page = await Page.create({ ...input, content: await cleanLocalizedHtml(input.content) });
  revalidateStorefront([CacheTags.pages, CacheTags.page(page.slug)]);
  return toPageDTO(page);
}

export async function update(id: string, input: PageInput) {
  const existing = await Page.findById(id).select('slug').lean();
  if (!existing) throw ApiError.notFound('Page not found');
  const page = await Page.findByIdAndUpdate(
    id,
    { $set: { ...input, content: await cleanLocalizedHtml(input.content) } },
    { new: true },
  ).lean();
  revalidateStorefront([CacheTags.pages, CacheTags.page(existing.slug), CacheTags.page(input.slug)]);
  return toPageDTO(page!);
}

export async function remove(id: string) {
  const page = await Page.findByIdAndDelete(id).lean();
  if (!page) throw ApiError.notFound('Page not found');
  revalidateStorefront([CacheTags.pages, CacheTags.page(page.slug)]);
}
