import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { ExternalLink, FileText, Plus } from 'lucide-react';
import type { PageDTO } from '@/shared';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, PageHeader, Skeleton } from '@/components/ui/misc';
import { api } from '@/lib/api';
import { STOREFRONT_URL, formatDate } from '@/lib/utils';

export default function PagesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pages'],
    queryFn: async () => (await api.get<PageDTO[]>('/admin/pages')).data,
  });

  return (
    <>
      <PageHeader
        title="Pages"
        description="About, policies and guides linked from the storefront footer."
        actions={
          <Button asChild>
            <Link to="/pages/new">
              <Plus /> New page
            </Link>
          </Button>
        }
      />
      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : !data?.length ? (
          <EmptyState icon={<FileText />} title="No pages yet" />
        ) : (
          <ul className="divide-y divide-line">
            {data.map((page) => (
              <li key={page._id} className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition hover:bg-hover/60" onClick={() => navigate(`/pages/${page._id}`)}>
                <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                  <FileText className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {page.title.en} <span className="font-normal text-muted">· {page.title.bn}</span>
                  </p>
                  <p className="font-mono text-[11.5px] text-muted">/p/{page.slug}</p>
                </div>
                <Badge tone={page.isPublished ? 'success' : 'neutral'} dot>
                  {page.isPublished ? 'Published' : 'Hidden'}
                </Badge>
                <span className="hidden text-[12.5px] text-muted sm:block">Updated {formatDate(page.updatedAt)}</span>
                {STOREFRONT_URL && page.isPublished && (
                  <a href={`${STOREFRONT_URL}/p/${page.slug}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted hover:text-brand-600" aria-label="View page">
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
