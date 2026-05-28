'use client'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createBusiness, ActionState } from '@/actions/business.actions'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function NewBusinessForm() {
  const router = useRouter()
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (s: ActionState, fd: FormData) => { const r = await createBusiness(s, fd); if (!r?.error) { router.push('/admin/businesses') } return r },
    undefined
  )
  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      {state?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}
      <Input label="Business name" id="name" name="name" required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Contact name" id="contactName" name="contactName" required />
        <Input label="Phone" id="phone" name="phone" type="tel" required />
      </div>
      <Input label="Email (for login)" id="email" name="email" type="email" required />
      <Input label="Password" id="password" name="password" type="password" minLength={8} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Delivery rate (TND)" id="deliveryRate" name="deliveryRate" type="number" min="0" step="0.001" defaultValue="7" required />
        <Input label="Cancellation rate (TND)" id="cancellationRate" name="cancellationRate" type="number" min="0" step="0.001" defaultValue="2" required />
      </div>
      <Button type="submit" loading={pending}>Create business</Button>
    </form>
  )
}
