import { revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string' && tag.length <= 256) : [];
  if (tags.length === 0) {
    return Response.json({ success: false, message: 'No tags provided' }, { status: 400 });
  }

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ success: true, data: { revalidated: tags, at: Date.now() } });
}
