'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateOrderStatus } from '@/actions/order.actions'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const NEXT: Record<string, string[]> = { PENDING: ['DISPATCHED'], DISPATCHED: ['IN_DELIVERY'], IN_DELIVERY: ['DELIVERED', 'CANCELLED', 'RETURNED'] }

export function OrderStatusControls({ orderId, currentStatus, trackingRef: initRef }: { orderId: string; currentStatus: string; trackingRef?: string }) {
  const next = NEXT[currentStatus] ?? []
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trackingRef, setTrackingRef] = useState(initRef ?? '')
  const router = useRouter()
  if (!next.length) return null
  async function handleClick(status: string) {
    setLoading(status); setError(null)
    const result = await updateOrderStatus(orderId, status, trackingRef || undefined)
    setLoading(null)
    if (result.error) { setError(result.error); toast.error(result.error) }
    else { toast.success(`Marked as ${status.toLowerCase()}`); router.refresh() }
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      {next.includes('DISPATCHED') && (
        <Input label="Tracking reference" value={trackingRef} onChange={(e) => setTrackingRef(e.target.value)} placeholder="Agency tracking number" />
      )}
      <div className="flex gap-2 flex-wrap">
        {next.map((s) => (
          <Button key={s} size="sm" variant={s === 'DELIVERED' ? 'primary' : s === 'CANCELLED' ? 'danger' : 'secondary'} loading={loading === s} onClick={() => handleClick(s)}>
            Mark as {s.replace('_', ' ')}
          </Button>
        ))}
      </div>
    </div>
  )
}
