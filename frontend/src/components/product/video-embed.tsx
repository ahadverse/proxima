'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoEmbedProps {
  videoId: string;
  title: string;
  playLabel: string;
  className?: string;
  autoPlay?: boolean;
}

/** Shows a lightweight thumbnail and only loads the YouTube player when clicked. */
export function VideoEmbed({ videoId, title, playLabel, className, autoPlay = false }: VideoEmbedProps) {
  const [active, setActive] = useState(autoPlay);

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-2xl bg-ink', className)}>
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group absolute inset-0" aria-label={`${playLabel}: ${title}`}>
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid size-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-brand-700 shadow-2xl ring-8 ring-white/25 transition group-hover:scale-110">
            <Play className="ml-1 size-7" fill="currentColor" />
          </span>
          <span className="absolute inset-x-5 bottom-4 line-clamp-1 text-left text-sm font-semibold text-white">{title}</span>
        </button>
      )}
    </div>
  );
}
