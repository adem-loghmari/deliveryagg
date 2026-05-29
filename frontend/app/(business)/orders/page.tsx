import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'

interface Order { id: string; recipientName: string; recipientPhone: string; governorate: string; city: string; codAmount: string; status: string; createdAt: string }
const STATUSES = ['','PENDING','DISPATCHED','IN_DELIVERY','DELIVERED','CANCELLED','RETURNED']
const LIMIT = 50

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string; q?: string }> }) {
  const p = await searchParams
  const page = parseInt(p.page ?? '1', 10)
  const q = new URLSearchParams({ page: String(page), limit: String(LIMIT), ...(p.status ? { status: p.status } : {}), ...(p.q ? { q: p.q } : {}) })
  const { orders, total } = await apiClient<{ orders: Order[]; total: number }>(`/api/orders?${q}`)
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Orders <span className="text-gray-400 text-base font-normal">({total})</span></h1>
        <div className="flex gap-2">
          <SearchInput placeholder="Search recipient..." />
          <Link href="/orders/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ New order</Link>
          <Link href="/orders/bulk" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Bulk upload</Link>
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map((s) => <Link key={s||'all'} href={s ? `?status=${s}` : '?'} className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${(p.status??'')=== s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>{s||'All'}</Link>)}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500"><th className="px-5 py-3">ID</th><th className="px-5 py-3">Recipient</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">COD</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-5 py-3"><Link href={`/orders/${o.id}`} className="font-mono text-xs text-blue-600 hover:underline">{o.id.slice(0,8).toUpperCase()}</Link></td>
                <td className="px-5 py-3"><p className="font-medium text-gray-900">{o.recipientName}</p><p className="text-xs text-gray-500">{o.recipientPhone}</p></td>
                <td className="px-5 py-3 text-gray-600">{o.governorate}, {o.city}</td>
                <td className="px-5 py-3">{Number(o.codAmount).toFixed(3)}</td>
                <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                <td className="px-5 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString('fr-TN')}</td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination total={total} page={page} limit={LIMIT} />
    </div>
  )
}
