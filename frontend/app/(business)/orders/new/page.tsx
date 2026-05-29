import { verifyBusinessSession } from '@/lib/dal'
import { OrderForm } from '@/components/orders/OrderForm'

export default async function NewOrderPage() {
  const session = await verifyBusinessSession()
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">New Order</h1>
      <OrderForm businessId={session.businessId} />
    </div>
  )
}
