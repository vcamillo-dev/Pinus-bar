import { STATUS_LABEL, STATUS_COLOR } from '@/types';
import type { StatusPedido } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  status:    StatusPedido;
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span className={cn('badge', STATUS_COLOR[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  );
}
