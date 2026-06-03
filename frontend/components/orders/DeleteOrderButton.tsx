'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { deleteOrder } from '@/actions/order.actions'
import { Button } from '../ui/Button'

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('Delete this order? This cannot be undone.')) return
    start(async () => {
      const result = await deleteOrder(orderId)
      if (result.error) toast.error(result.error)
      else { toast.success('Order deleted'); router.push('/admin/orders') }
    })
  }

  return <Button variant="danger" size="sm" loading={pending} onClick={handleDelete}>Delete order</Button>
}
