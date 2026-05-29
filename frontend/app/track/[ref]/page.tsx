import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000'
const STEPS = [{ status: 'PENDING', label: 'Order created' }, { status: 'DISPATCHED', label: 'Dispatched to courier' }, { status: 'IN_DELIVERY', label: 'Out for delivery' }, { status: 'DELIVERED', label: 'Delivered' }]
const ORDER = ['PENDING','DISPATCHED','IN_DELIVERY','DELIVERED']

interface TrackOrder { id: string; recipientName: string; governorate: string; city: string; status: string; trackingRef: string; createdAt: string }

export default async function TrackingPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  let order: TrackOrder | null = null
  try { const r = await fetch(`${BACKEND}/api/orders/track/${ref}`, { next: { revalidate: 60 } }); if (r.ok) order = await r.json() } catch {}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">DeliveryAgg</h1>
          <p className="text-sm text-gray-500 mt-1">Order Tracking</p>
        </div>
        {!order ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-700">Order not found</p>
            <p className="text-sm text-gray-500 mt-1">Ref: <code className="bg-gray-100 px-1 rounded text-xs">{ref}</code></p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs text-gray-500">Tracking ref</p><p className="font-mono font-semibold">{order.trackingRef}</p></div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="border-t border-gray-100 pt-4 mb-6">
              <p className="text-sm text-gray-500">Recipient</p>
              <p className="font-medium text-gray-900">{order.recipientName}</p>
              <p className="text-sm text-gray-500 mt-1">{order.governorate}, {order.city}</p>
            </div>
            {order.status !== 'CANCELLED' && order.status !== 'RETURNED' ? (
              <div className="flex flex-col gap-3">
                {STEPS.map(({ status, label }, i) => {
                  const done = ORDER.indexOf(status) <= ORDER.indexOf(order!.status)
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>{done ? '✓' : i + 1}</div>
                      <p className={`text-sm ${done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{label}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center">{order.status === 'CANCELLED' ? 'This order has been cancelled.' : 'This order has been returned.'}</div>
            )}
            <p className="text-xs text-gray-400 mt-6 text-center">Created {new Date(order.createdAt).toLocaleDateString('fr-TN')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
