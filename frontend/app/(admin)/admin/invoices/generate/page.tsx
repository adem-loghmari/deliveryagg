'use client'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { generateInvoice, ActionState } from '@/actions/invoice.actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function GenerateInvoicePage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(generateInvoice, undefined)
  const prefill = useSearchParams().get('businessId') ?? ''
  const now = new Date()
  return (
    <div className="max-w-sm">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/invoices" className="text-sm text-gray-500 hover:text-gray-700">← Invoices</Link>
        <h1 className="text-xl font-semibold text-gray-900">Generate Invoice</h1>
      </div>
      <form action={action} className="flex flex-col gap-4">
        {state?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>}
        {state?.message && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{state.message} <Link href="/admin/invoices" className="font-medium underline">View invoices</Link></div>}
        <Input label="Business ID" id="businessId" name="businessId" defaultValue={prefill} placeholder="Paste business cuid..." required />
        {!prefill && <p className="text-xs text-gray-500 -mt-2">Copy it from the <Link href="/admin/businesses" className="text-blue-600 hover:underline">business detail</Link> page (⧉ button).</p>}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Month (1–12)" id="month" name="month" type="number" min="1" max="12" defaultValue={String(now.getMonth() + 1)} required />
          <Input label="Year" id="year" name="year" type="number" min="2024" defaultValue={String(now.getFullYear())} required />
        </div>
        <Button type="submit" loading={pending}>Generate invoice</Button>
      </form>
    </div>
  )
}
