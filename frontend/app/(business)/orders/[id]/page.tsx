import { notFound } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

interface Order { id: string; recipientName: string; recipientPhone: string; governorate: string; city: string; addressDetails?: string; codAmount: string; productDesc?: string; weightKg?: string; status: string; trackingRef?: string; notes?: string; createdAt: string; dispatchedAt?: string; deliveredAt?: string; cancelledAt?: string }

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let order: Order
  try { order = await apiClient<Order>(`/api/orders/${id}`) } catch { notFound() }
  const rows = [['Recipient', order.recipientName],['Phone', order.recipientPhone],['Location', `${order.governorate}, ${order.city}${order.addressDetails ? ` — ${order.addressDetails}` : ''}`],['COD amount', `${Number(order.codAmount).toFixed(3)} TND`],...(order.productDesc?[['Product',order.productDesc]]:[]),...(order.weightKg?[['Weight',`${order.weightKg} kg`]]:[]),...(order.trackingRef?[['Tracking ref',order.trackingRef]]:[]),...(order.notes?[['Notes',order.notes]]:[]),['Created',new Date(order.createdAt).toLocaleString('fr-TN')],...(order.dispatchedAt?[['Dispatched',new Date(order.dispatchedAt).toLocaleString('fr-TN')]]:[]),...(order.deliveredAt?[['Delivered',new Date(order.deliveredAt).toLocaleString('fr-TN')]]:[]),...(order.cancelledAt?[['Cancelled/Returned',new Date(order.cancelledAt).toLocaleString('fr-TN')]]:[])]
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-700">← Orders</Link>
        <h1 className="text-xl font-semibold text-gray-900">Order {order.id.slice(0,8).toUpperCase()}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex px-5 py-3 text-sm">
            <span className="w-36 text-gray-500 shrink-0">{label}</span>
            <span className="text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
