import { useRef, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileArchive, GripVertical, ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from '@/shared';
import { errorMessage } from '@/lib/api';
import { uploadFile } from '@/lib/upload';
import { cn, formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-hover">
      <div className="h-full rounded-full bg-brand-700 transition-[width] duration-200" style={{ width: `${value}%` }} />
    </div>
  );
}

function validateImage(file: File): string | null {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) return `${file.name}: use JPG, PNG, WebP, AVIF or GIF`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: images must be under ${formatBytes(MAX_IMAGE_BYTES)}`;
  return null;
}

export function ImageUploader({ value, onChange, aspect = 'aspect-[4/3]', label = 'Upload image', hint }: {
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
  label?: string;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    const problem = validateImage(file);
    if (problem) return toast.error(problem);
    setProgress(0);
    try {
      const result = await uploadFile(file, 'image', setProgress);
      onChange(result.url ?? '');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage(error));
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl border-2 border-dashed border-line bg-surface-2 transition hover:border-brand-300',
          aspect,
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handle(e.dataTransfer.files[0]);
        }}
      >
        {value ? (
          <>
            <img src={value} alt="" className="absolute inset-0 size-full object-cover object-top" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
              <Button type="button" size="sm" variant="secondary" onClick={() => input.current?.click()}>
                <UploadCloud /> Replace
              </Button>
              <Button type="button" size="sm" variant="danger" onClick={() => onChange('')}>
                <Trash2 /> Remove
              </Button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted transition hover:text-brand-600">
            <ImagePlus className="size-7" />
            <span className="text-[13px] font-semibold">{label}</span>
            {hint && <span className="px-4 text-center text-[11.5px]">{hint}</span>}
          </button>
        )}
        {progress !== null && (
          <div className="absolute inset-x-3 bottom-3 rounded-lg bg-surface/95 p-2 shadow">
            <ProgressBar value={progress} />
            <p className="mt-1 text-center text-[11px] font-semibold text-muted">{progress}%</p>
          </div>
        )}
      </div>
      <input ref={input} type="file" accept={IMAGE_MIME_TYPES.join(',')} className="hidden" onChange={(e) => void handle(e.target.files?.[0])} />
    </div>
  );
}

function SortableImage({ url, onRemove }: { url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface-2', isDragging && 'z-10 shadow-xl ring-2 ring-brand-400')}
    >
      <img src={url} alt="" className="size-full object-cover object-top" />
      <button type="button" {...attributes} {...listeners} className="absolute left-1.5 top-1.5 grid size-7 cursor-grab place-items-center rounded-md bg-surface/90 text-muted shadow" aria-label="Drag to reorder">
        <GripVertical className="size-4" />
      </button>
      <button type="button" onClick={onRemove} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-md bg-red-600 text-white opacity-0 shadow transition group-hover:opacity-100" aria-label="Remove image">
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function GalleryUploader({ value, onChange, max = 12 }: { value: string[]; onChange: (urls: string[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, max - value.length);
    const urls: string[] = [];
    for (const [index, file] of list.entries()) {
      const problem = validateImage(file);
      if (problem) {
        toast.error(problem);
        continue;
      }
      try {
        const result = await uploadFile(file, 'image', (p) => setProgress(Math.round(((index + p / 100) / list.length) * 100)));
        if (result.url) urls.push(result.url);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : errorMessage(error));
      }
    }
    setProgress(null);
    if (urls.length) onChange([...value, ...urls]);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onChange(arrayMove(value, value.indexOf(String(active.id)), value.indexOf(String(over.id))));
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {value.map((url) => (
              <SortableImage key={url} url={url} onRemove={() => onChange(value.filter((item) => item !== url))} />
            ))}
            {value.length < max && (
              <button
                type="button"
                onClick={() => input.current?.click()}
                disabled={progress !== null}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line text-muted transition hover:border-brand-300 hover:text-brand-600"
              >
                <ImagePlus className="size-6" />
                <span className="text-[12px] font-semibold">{progress !== null ? `${progress}%` : 'Add images'}</span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <input ref={input} type="file" multiple accept={IMAGE_MIME_TYPES.join(',')} className="hidden" onChange={(e) => void add(e.target.files)} />
    </div>
  );
}

export function FileUploader({ value, onChange }: {
  value: { key: string; name: string; size: number } | null;
  onChange: (file: { key: string; name: string; size: number } | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) return toast.error('Upload a .zip file');
    setProgress(0);
    try {
      const result = await uploadFile(file, 'file', setProgress);
      onChange({ key: result.key, name: result.name, size: result.size });
      toast.success('File uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage(error));
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4">
      {value ? (
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30">
            <FileArchive className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold text-ink">{value.name}</p>
            <p className="text-[12px] text-muted">{formatBytes(value.size)} · private download</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => input.current?.click()} disabled={progress !== null}>
            Replace
          </Button>
          <Button type="button" size="icon-sm" variant="danger-ghost" onClick={() => onChange(null)} aria-label="Remove file">
            <Trash2 />
          </Button>
        </div>
      ) : (
        <button type="button" onClick={() => input.current?.click()} disabled={progress !== null} className="flex w-full items-center gap-3 text-left">
          <span className="grid size-11 place-items-center rounded-lg border-2 border-dashed border-line text-muted">
            <UploadCloud className="size-5" />
          </span>
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">Upload source zip</span>
            <span className="block text-[12px] text-muted">Optional. Buyers can download it from My Products.</span>
          </span>
        </button>
      )}
      {progress !== null && (
        <div className="mt-3">
          <ProgressBar value={progress} />
          <p className="mt-1 text-[11.5px] font-semibold text-muted">Uploading… {progress}%</p>
        </div>
      )}
      <input ref={input} type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => void handle(e.target.files?.[0])} />
    </div>
  );
}
