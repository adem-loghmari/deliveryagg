'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'
import { Button } from '../ui/Button'

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  function handleDelete() {
    if (!confirm('Delete this order? This cannot be undone.')) return
    start(async () => {
      try { await apiClient(`/api/orders/${orderId}`, { method: 'DELETE' }); toast.success('Order deleted'); router.push('/admin/orders') }
      catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed to delete') }
    })
  }
  return <Button variant="danger" size="sm" loading={pending} onClick={handleDelete}>Delete order</Button>
}
