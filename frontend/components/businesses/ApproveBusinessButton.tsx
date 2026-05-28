'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { approveBusiness } from '@/actions/business.actions'
import { Button } from '../ui/Button'

export function ApproveBusinessButton({ businessId }: { businessId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  return (
    <Button size="sm" loading={pending} onClick={() => start(async () => { await approveBusiness(businessId); toast.success('Business approved'); router.refresh() })}>Approve</Button>
  )
}
