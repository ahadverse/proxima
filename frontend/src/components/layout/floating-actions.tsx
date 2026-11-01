import { whatsappLink } from '@/lib/utils';
import { WhatsappIcon } from './brand-icons';

export function WhatsappButton({ number, label }: { number: string; label: string }) {
  if (!number) return null;
  return (
    <a
      href={whatsappLink(number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-20 left-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[#25d366] pl-3 pr-4 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgb(37_211_102/0.8)] animate-pulse-ring transition hover:-translate-y-0.5 hover:brightness-105 lg:bottom-6 lg:left-6"
    >
      <WhatsappIcon className="size-6" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
