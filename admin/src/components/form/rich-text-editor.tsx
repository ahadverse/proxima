import { useEffect } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow' } },
      }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && !(value === '' && current === '<p></p>')) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            strike: e.isActive('strike'),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            quote: e.isActive('blockquote'),
            link: e.isActive('link'),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  if (!editor) return <div className="skeleton h-64 rounded-lg" />;

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const buttons = [
    { icon: Bold, label: 'Bold', active: state?.bold, run: () => editor.chain().focus().toggleBold().run() },
    { icon: Italic, label: 'Italic', active: state?.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { icon: UnderlineIcon, label: 'Underline', active: state?.underline, run: () => editor.chain().focus().toggleUnderline().run() },
    { icon: Strikethrough, label: 'Strike', active: state?.strike, run: () => editor.chain().focus().toggleStrike().run() },
    'divider',
    { icon: Heading2, label: 'Heading', active: state?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: Heading3, label: 'Subheading', active: state?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { icon: List, label: 'Bullet list', active: state?.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
    { icon: ListOrdered, label: 'Numbered list', active: state?.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: Quote, label: 'Quote', active: state?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
    'divider',
    { icon: Link2, label: 'Link', active: state?.link, run: setLink },
    { icon: Unlink, label: 'Remove link', active: false, run: () => editor.chain().focus().unsetLink().run(), disabled: !state?.link },
    'divider',
    { icon: Undo2, label: 'Undo', active: false, run: () => editor.chain().focus().undo().run(), disabled: !state?.canUndo },
    { icon: Redo2, label: 'Redo', active: false, run: () => editor.chain().focus().redo().run(), disabled: !state?.canRedo },
  ] as const;

  return (
    <div className={cn('overflow-hidden rounded-lg border border-line bg-surface focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/15', className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface-2 px-2 py-1.5">
        {buttons.map((button, index) =>
          button === 'divider' ? (
            <span key={index} className="mx-1 h-5 w-px bg-line" />
          ) : (
            <button
              key={button.label}
              type="button"
              title={button.label}
              aria-label={button.label}
              aria-pressed={Boolean(button.active)}
              disabled={'disabled' in button ? button.disabled : false}
              onClick={button.run}
              className={cn(
                'grid size-8 place-items-center rounded-md text-ink-soft transition hover:bg-hover hover:text-ink disabled:opacity-35',
                button.active && 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200',
              )}
            >
              <button.icon className="size-4" />
            </button>
          ),
        )}
      </div>
      <EditorContent editor={editor} className="editor-content max-h-[520px] overflow-y-auto" />
    </div>
  );
}
