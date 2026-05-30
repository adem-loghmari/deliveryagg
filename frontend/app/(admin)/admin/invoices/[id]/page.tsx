import { notFound } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { MarkPaidButton } from '@/components/invoices/MarkPaidButton'

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']
interface Invoice { id: string; month: number; year: number; totalAmount: string; status: string; generatedAt: string; paidAt?: string; business: { name: string; contactName: string; phone: string }; lines: Array<{ id: string; type: string; rate: string; order: { id: string; recipientName: string; governorate: string } }> }

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let inv: Invoice
  try { inv = await apiClient<Invoice>(`/api/invoices/${id}`) } catch { notFound() }
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/invoices" className="text-sm text-gray-500 hover:text-gray-700">← Invoices</Link>
        <h1 className="text-xl font-semibold text-gray-900">{inv.business.name} — {MONTHS[inv.month]} {inv.year}</h1>
        <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500"><th className="px-5 py-3">Recipient</th><th className="px-5 py-3">Governorate</th><th className="px-5 py-3">Type</th><th className="px-5 py-3 text-right">Rate (TND)</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {inv.lines.map((l) => (
              <tr key={l.id}>
                <td className="px-5 py-3 text-gray-900">{l.order.recipientName}</td>
                <td className="px-5 py-3 text-gray-500">{l.order.governorate}</td>
                <td className="px-5 py-3 text-gray-500">{l.type}</td>
                <td className="px-5 py-3 text-right">{Number(l.rate).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-gray-900">Total: {Number(inv.totalAmount).toFixed(3)} TND</p>
        <div className="flex gap-2">
          {inv.status !== 'PAID' && <MarkPaidButton invoiceId={inv.id} />}
          <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Download PDF</a>
        </div>
      </div>
      {inv.paidAt && <p className="mt-2 text-xs text-gray-400">Paid on {new Date(inv.paidAt).toLocaleDateString('fr-TN')}</p>}
    </div>
  )
}
