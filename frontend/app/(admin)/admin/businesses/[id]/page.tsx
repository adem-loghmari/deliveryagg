import { notFound } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { CopyButton } from '@/components/ui/CopyButton'
import { ApproveBusinessButton } from '@/components/businesses/ApproveBusinessButton'
import { BusinessEditForm } from '@/components/businesses/BusinessEditForm'

interface Business { id: string; name: string; contactName: string; phone: string; approved: boolean; deliveryRate: string; cancellationRate: string; createdAt: string; users: Array<{ id: string; email: string; createdAt: string }>; _count: { orders: number } }
interface RateChange { id: string; deliveryRate: string; cancellationRate: string; changedAt: string }

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let business: Business; let rateHistory: RateChange[] = []
  try {
    [business, rateHistory] = await Promise.all([apiClient<Business>(`/api/businesses/${id}`), apiClient<RateChange[]>(`/api/businesses/${id}/rate-history`).catch(()=>[])])
  } catch { notFound() }
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/businesses" className="text-sm text-gray-500 hover:text-gray-700">← Businesses</Link>
        <h1 className="text-xl font-semibold text-gray-900">{business.name}</h1>
        <CopyButton value={business.id} label="business ID" />
        <Badge variant={business.approved?'success':'warning'}>{business.approved?'Active':'Pending'}</Badge>
      </div>
      {!business.approved && <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex items-center justify-between"><p className="text-sm text-yellow-800">Pending approval.</p><ApproveBusinessButton businessId={business.id} /></div>}
      <div className="mb-4"><BusinessEditForm businessId={business.id} name={business.name} contactName={business.contactName} phone={business.phone} deliveryRate={Number(business.deliveryRate)} cancellationRate={Number(business.cancellationRate)} /></div>
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 mb-4">
        {[['Contact', business.contactName],['Phone', business.phone],['Delivery rate', `${Number(business.deliveryRate).toFixed(3)} TND`],['Cancellation rate', `${Number(business.cancellationRate).toFixed(3)} TND`],['Total orders', String(business._count.orders)],['Joined', new Date(business.createdAt).toLocaleDateString('fr-TN')]].map(([l,v]) => <div key={l} className="flex px-5 py-3 text-sm"><span className="w-36 text-gray-500 shrink-0">{l}</span><span className="text-gray-900">{v}</span></div>)}
      </div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Users</h2>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-4">
        <table className="w-full text-sm"><thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500"><th className="px-5 py-3">Email</th><th className="px-5 py-3">Joined</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{business.users.map((u) => <tr key={u.id}><td className="px-5 py-3">{u.email}</td><td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('fr-TN')}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="flex gap-2 mb-6">
        <Link href={`/admin/orders?businessId=${business.id}`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">View orders</Link>
        <Link href={`/admin/invoices?businessId=${business.id}`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">View invoices</Link>
        <Link href={`/admin/invoices/generate?businessId=${business.id}`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Generate invoice</Link>
      </div>
      {rateHistory.length > 0 && <>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Rate history</h2>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Delivery</th><th className="px-5 py-3">Cancellation</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{rateHistory.map((r) => <tr key={r.id}><td className="px-5 py-3 text-gray-500">{new Date(r.changedAt).toLocaleString('fr-TN')}</td><td className="px-5 py-3">{Number(r.deliveryRate).toFixed(3)} TND</td><td className="px-5 py-3">{Number(r.cancellationRate).toFixed(3)} TND</td></tr>)}</tbody>
          </table>
        </div>
      </>}
    </div>
  )
}
