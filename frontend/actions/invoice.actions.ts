'use server'
import { revalidatePath } from 'next/cache'
import { apiClient } from '@/lib/api-client'
import { verifyAdminSession } from '@/lib/dal'

export type ActionState = { error?: string; message?: string } | undefined

export async function generateInvoice(_state: ActionState, formData: FormData): Promise<ActionState> {
  await verifyAdminSession()
  const businessId = formData.get('businessId') as string
  const month = parseInt(formData.get('month') as string, 10)
  const year = parseInt(formData.get('year') as string, 10)
  if (!businessId) return { error: 'Business ID required' }
  try {
    await apiClient('/api/invoices/generate', { method: 'POST', body: JSON.stringify({ businessId, month, year }) })
    revalidatePath('/admin/invoices')
    return { message: 'Invoice generated successfully.' }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to generate invoice' }
  }
}

export async function markInvoicePaid(id: string) {
  await verifyAdminSession()
  await apiClient(`/api/invoices/${id}/mark-paid`, { method: 'PATCH' })
  revalidatePath(`/admin/invoices/${id}`)
  revalidatePath('/admin/invoices')
}
