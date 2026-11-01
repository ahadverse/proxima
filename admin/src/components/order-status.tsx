import type { OrderDTO } from '@/shared';
import { Badge } from '@/components/ui/misc';

const TONES = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  refunded: 'info',
} as const;

export function OrderStatus({ order }: { order: Pick<OrderDTO, 'status' | 'isExpired'> }) {
  if (order.isExpired) {
    return (
      <Badge tone="neutral" dot>
        Expired
      </Badge>
    );
  }
  return (
    <Badge tone={TONES[order.status]} dot className="capitalize">
      {order.status}
    </Badge>
  );
}
