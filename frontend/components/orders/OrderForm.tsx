'use client'
import { useActionState } from 'react'
import { createOrder, ActionState } from '@/actions/order.actions'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { TUNISIAN_GOVERNORATES } from '@/lib/schemas/order.schema'

const govOptions = TUNISIAN_GOVERNORATES.map((g) => ({ value: g, label: g }))

export function OrderForm({ businessId }: { businessId?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createOrder, undefined)
  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      {state?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}
      {businessId && <input type="hidden" name="businessId" value={businessId} />}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Recipient name" id="recipientName" name="recipientName" required />
        <Input label="Phone" id="recipientPhone" name="recipientPhone" type="tel" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Governorate" id="governorate" name="governorate" options={govOptions} placeholder="Select governorate" required />
        <Input label="City" id="city" name="city" required />
      </div>
      <Input label="Address details" id="addressDetails" name="addressDetails" placeholder="Street, building..." />
      <div className="grid grid-cols-2 gap-4">
        <Input label="COD amount (TND)" id="codAmount" name="codAmount" type="number" min="0" step="0.001" required />
        <Input label="Weight (kg)" id="weightKg" name="weightKg" type="number" min="0" step="0.001" />
      </div>
      <Input label="Product description" id="productDesc" name="productDesc" />
      <Input label="Notes" id="notes" name="notes" />
      <Button type="submit" loading={pending}>Create order</Button>
    </form>
  )
}
