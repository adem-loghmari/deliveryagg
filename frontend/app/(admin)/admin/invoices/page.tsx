import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'

interface Invoice { id: string; month: number; year: number; totalAmount: string; status: string; generatedAt: string; business?: { name: string } }
const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default async function AdminInvoicesPage({ searchParams }: { searchParams: Promise<{ businessId?: string }> }) {
  const p = await searchParams
  const q = new URLSearchParams(p.businessId ? { businessId: p.businessId } : {})
  const invoices = await apiClient<Invoice[]>(`/api/invoices?${q}`)
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
        <Link href="/admin/invoices/generate" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Generate invoice</Link>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500"><th className="px-5 py-3">Business</th><th className="px-5 py-3">Period</th><th className="px-5 py-3">Amount (TND)</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Generated</th><th className="px-5 py-3"></th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{inv.business?.name ?? '—'}</td>
                <td className="px-5 py-3">{MONTHS[inv.month]} {inv.year}</td>
                <td className="px-5 py-3">{Number(inv.totalAmount).toFixed(3)}</td>
                <td className="px-5 py-3"><Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge></td>
                <td className="px-5 py-3 text-gray-500">{new Date(inv.generatedAt).toLocaleDateString('fr-TN')}</td>
                <td className="px-5 py-3"><Link href={`/admin/invoices/${inv.id}`} className="text-xs text-blue-600 hover:underline">View</Link></td>
              </tr>
            ))}
            {!invoices.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No invoices yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
