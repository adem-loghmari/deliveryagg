'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { verifySession } from '@/lib/dal'
import { orderCreateSchema, OrderCreateInput } from '@/lib/schemas/order.schema'

export type ActionState = { error?: string } | undefined

export async function createOrder(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession()
  const parsed = orderCreateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const businessId = formData.get('businessId') as string | null
  try {
    const order = await apiClient<{ id: string }>('/api/orders', { method: 'POST', body: JSON.stringify({ ...parsed.data, ...(businessId ? { businessId } : {}) }) })
    revalidatePath('/orders')
    redirect(session.role === 'ADMIN' ? `/admin/orders/${order.id}` : `/orders/${order.id}`)
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to create order' }
  }
}

export async function bulkCreateOrders(orders: OrderCreateInput[], businessId?: string): Promise<{ created?: number; error?: string }> {
  await verifySession()
  try {
    const result = await apiClient<{ created: number }>('/api/orders/bulk', { method: 'POST', body: JSON.stringify({ orders, ...(businessId ? { businessId } : {}) }) })
    revalidatePath('/orders')
    return { created: result.created }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Bulk upload failed' }
  }
}

export async function updateOrderStatus(id: string, status: string, trackingRef?: string): Promise<{ error?: string }> {
  await verifySession()
  try {
    await apiClient(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, trackingRef }) })
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${id}`)
    return {}
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to update status' }
  }
}

export async function deleteOrder(id: string): Promise<{ error?: string }> {
  await verifySession()
  try {
    await apiClient(`/api/orders/${id}`, { method: 'DELETE' })
    revalidatePath('/admin/orders')
    return {}
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Failed to delete order' }
  }
}

export async function bulkUpdateStatus(orderIds: string[], status: string, trackingRef?: string): Promise<{ updated?: number; error?: string }> {
  await verifySession()
  try {
    const result = await apiClient<{ updated: number }>('/api/orders/bulk-status', { method: 'PATCH', body: JSON.stringify({ orderIds, status, trackingRef }) })
    revalidatePath('/admin/orders')
    return { updated: result.updated }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Bulk update failed' }
  }
}
