import { Badge } from '../ui/Badge'

const STATUS_VARIANT = { PENDING: 'default', DISPATCHED: 'info', IN_DELIVERY: 'info', DELIVERED: 'success', CANCELLED: 'danger', RETURNED: 'warning' } as const

export function OrderStatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANT[status as keyof typeof STATUS_VARIANT] ?? 'default'
  return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>
}
