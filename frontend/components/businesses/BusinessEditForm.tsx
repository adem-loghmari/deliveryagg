'use client'
import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBusiness, ActionState } from '@/actions/business.actions'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props { businessId: string; name: string; contactName: string; phone: string; deliveryRate: number; cancellationRate: number }

export function BusinessEditForm({ businessId, name, contactName, phone, deliveryRate, cancellationRate }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const bound = updateBusiness.bind(null, businessId)
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (s: ActionState, fd: FormData) => { const r = await bound(s, fd); if (!r?.error) { setOpen(false); router.refresh() } return r },
    undefined
  )
  if (!open) return <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Edit business</Button>
  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      {state?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}
      <Input label="Business name" name="name" defaultValue={name} />
      <Input label="Contact name" name="contactName" defaultValue={contactName} />
      <Input label="Phone" name="phone" defaultValue={phone} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Delivery rate (TND)" name="deliveryRate" type="number" min="0" step="0.001" defaultValue={String(deliveryRate)} />
        <Input label="Cancellation rate (TND)" name="cancellationRate" type="number" min="0" step="0.001" defaultValue={String(cancellationRate)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={pending} size="sm">Save</Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  )
}
