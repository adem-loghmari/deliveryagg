import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { SearchInput } from '@/components/ui/SearchInput'

interface Business { id: string; name: string; contactName: string; phone: string; approved: boolean; deliveryRate: string; cancellationRate: string; createdAt: string; _count: { orders: number } }

export default async function BusinessesPage({ searchParams }: { searchParams: Promise<{ q?: string; approved?: string }> }) {
  const p = await searchParams
  const q = new URLSearchParams({ ...(p.q?{q:p.q}:{}), ...(p.approved?{approved:p.approved}:{}) })
  const businesses = await apiClient<Business[]>(`/api/businesses?${q}`)
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Businesses <span className="text-gray-400 text-base font-normal">({businesses.length})</span></h1>
        <div className="flex gap-2">
          <SearchInput placeholder="Search businesses..." />
          <Link href="/admin/businesses/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Add business</Link>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {[{l:'All',v:''},{l:'Active',v:'true'},{l:'Pending',v:'false'}].map(({l,v}) => <Link key={l} href={v?`?approved=${v}`:'?'} className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${(p.approved??'')=== v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>{l}</Link>)}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500"><th className="px-5 py-3">Business</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Rates</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Joined</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-5 py-3"><Link href={`/admin/businesses/${b.id}`} className="font-medium text-blue-600 hover:underline">{b.name}</Link></td>
                <td className="px-5 py-3 text-gray-600"><p>{b.contactName}</p><p className="text-xs text-gray-400">{b.phone}</p></td>
                <td className="px-5 py-3 text-gray-600 text-xs"><p>Del: {Number(b.deliveryRate).toFixed(3)}</p><p>Can: {Number(b.cancellationRate).toFixed(3)}</p></td>
                <td className="px-5 py-3 text-gray-600">{b._count.orders}</td>
                <td className="px-5 py-3"><Badge variant={b.approved?'success':'warning'}>{b.approved?'Active':'Pending'}</Badge></td>
                <td className="px-5 py-3 text-gray-500">{new Date(b.createdAt).toLocaleDateString('fr-TN')}</td>
              </tr>
            ))}
            {!businesses.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No businesses found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
