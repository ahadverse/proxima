'use client';

import { useTranslations } from 'next-intl';
import type { OrderDTO } from '@/shared';
import { Badge } from '@/components/ui/misc';

const TONES = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  refunded: 'neutral',
  expired: 'neutral',
} as const;

export function OrderStatusBadge({ order }: { order: Pick<OrderDTO, 'status' | 'isExpired'> }) {
  const t = useTranslations('account.status');
  const status = order.isExpired ? 'expired' : order.status;
  return (
    <Badge tone={TONES[status]} size="sm">
      <span className="size-1.5 rounded-full bg-current" />
      {t(status)}
    </Badge>
  );
}
