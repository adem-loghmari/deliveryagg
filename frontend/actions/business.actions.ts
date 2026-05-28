'use server'
import { revalidatePath } from 'next/cache'
import { apiClient } from '@/lib/api-client'
import { verifyAdminSession } from '@/lib/dal'
import { createBusinessSchema, updateBusinessSchema } from '@/lib/schemas/business.schema'

export type ActionState = { error?: string } | undefined

export async function createBusiness(_state: ActionState, formData: FormData): Promise<ActionState> {
  await verifyAdminSession()
  const parsed = createBusinessSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  try {
    await apiClient('/api/businesses', { method: 'POST', body: JSON.stringify(parsed.data) })
    revalidatePath('/admin/businesses')
    return {}
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create business' }
  }
}

export async function updateBusiness(id: string, _state: ActionState, formData: FormData): Promise<ActionState> {
  await verifyAdminSession()
  const parsed = updateBusinessSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  try {
    await apiClient(`/api/businesses/${id}`, { method: 'PATCH', body: JSON.stringify(parsed.data) })
    revalidatePath(`/admin/businesses/${id}`)
    return {}
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update business' }
  }
}

export async function approveBusiness(id: string) {
  await verifyAdminSession()
  await apiClient(`/api/businesses/${id}/approve`, { method: 'PATCH' })
  revalidatePath(`/admin/businesses/${id}`)
  revalidatePath('/admin/businesses')
}
