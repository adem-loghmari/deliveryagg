import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { OrderForm } from '@/components/orders/OrderForm'

interface Business { id: string; name: string }

export default async function AdminNewOrderPage() {
  const businesses = await apiClient<Business[]>('/api/businesses?approved=true')
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-700">← Orders</Link>
        <h1 className="text-xl font-semibold text-gray-900">Create Order</h1>
      </div>
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 block mb-1">Business</label>
        <select name="businessId" form="order-form" className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full focus:border-blue-500 focus:outline-none">
          {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <OrderForm />
    </div>
  )
}
