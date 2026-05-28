'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { markInvoicePaid } from '@/actions/invoice.actions'
import { Button } from '../ui/Button'

export function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  return (
    <Button size="sm" loading={pending} onClick={() => start(async () => { await markInvoicePaid(invoiceId); toast.success('Invoice marked as paid'); router.refresh() })}>Mark as paid</Button>
  )
}
