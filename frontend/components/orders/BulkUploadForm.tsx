'use client'
import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { bulkCreateOrders } from '@/actions/order.actions'
import { orderCreateSchema, OrderCreateInput } from '@/lib/schemas/order.schema'
import { Button } from '../ui/Button'

interface Row { row: number; data: Record<string, string>; parsed?: OrderCreateInput; error?: string }

export function BulkUploadForm({ businessId }: { businessId?: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [result, setResult] = useState<{ created?: number; error?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return; setResult(null)
    Papa.parse<Record<string, string>>(file, { header: true, skipEmptyLines: true, complete: (res) => {
      setRows(res.data.map((data, i) => {
        const r = orderCreateSchema.safeParse({ ...data, codAmount: parseFloat(data.codAmount), weightKg: data.weightKg ? parseFloat(data.weightKg) : undefined })
        return r.success ? { row: i + 2, data, parsed: r.data } : { row: i + 2, data, error: r.error.issues[0]?.message ?? 'Invalid' }
      }))
    }})
  }

  async function handleSubmit() {
    const valid = rows.filter((r) => r.parsed).map((r) => r.parsed!)
    if (!valid.length) return
    setSubmitting(true)
    const res = await bulkCreateOrders(valid, businessId)
    setResult(res); setSubmitting(false)
    if (res.created) { setRows([]); if (fileRef.current) fileRef.current.value = '' }
  }

  return (
    <div className="max-w-4xl">
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4">
        <p className="text-sm text-gray-600 mb-3">Required columns: <strong>recipientName, recipientPhone, governorate, city, codAmount</strong></p>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="text-sm" />
      </div>
      {result && <div className={`rounded-lg p-3 text-sm mb-4 ${result.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{result.error ?? `Created ${result.created} orders.`}</div>}
      {rows.length > 0 && <>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">{rows.filter(r=>r.parsed).length} valid, {rows.filter(r=>r.error).length} errors</p>
          <Button size="sm" onClick={handleSubmit} loading={submitting} disabled={!rows.some(r=>r.parsed)}>Submit {rows.filter(r=>r.parsed).length} orders</Button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white overflow-auto max-h-72">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-left text-gray-500"><th className="px-3 py-2">#</th><th className="px-3 py-2">Recipient</th><th className="px-3 py-2">Governorate</th><th className="px-3 py-2">COD</th><th className="px-3 py-2">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.row} className={r.error ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2 text-gray-400">{r.row}</td>
                  <td className="px-3 py-2">{r.data.recipientName}</td>
                  <td className="px-3 py-2">{r.data.governorate}</td>
                  <td className="px-3 py-2">{r.data.codAmount}</td>
                  <td className="px-3 py-2">{r.error ? <span className="text-red-600">{r.error}</span> : <span className="text-green-600">✓</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}
    </div>
  )
}
