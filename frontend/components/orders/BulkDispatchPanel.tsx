'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { bulkUpdateStatus } from '@/actions/order.actions'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface Order { id: string; status: string; recipientName: string }

export function BulkDispatchPanel({ orders }: { orders: Order[] }) {
  const pending_orders = orders.filter((o) => o.status === 'PENDING')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [trackingRef, setTrackingRef] = useState('')
  const [show, setShow] = useState(false)
  const [busy, startTransition] = useTransition()
  const router = useRouter()
  if (!pending_orders.length) return null
  const toggleAll = () => setSelected(selected.size === pending_orders.length ? new Set() : new Set(pending_orders.map((o) => o.id)))
  const toggle = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s) }
  function handleDispatch() {
    if (!selected.size) { toast.error('Select at least one order'); return }
    startTransition(async () => {
      const r = await bulkUpdateStatus(Array.from(selected), 'DISPATCHED', trackingRef || undefined)
      if (r.error) toast.error(r.error)
      else { toast.success(`${r.updated} orders dispatched`); setSelected(new Set()); setShow(false); setTrackingRef(''); router.refresh() }
    })
  }
  if (!show) return <Button variant="secondary" size="sm" onClick={() => setShow(true)}>Bulk dispatch ({pending_orders.length} pending)</Button>
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-blue-800">Select orders to dispatch</p>
        <button onClick={() => setShow(false)} className="text-xs text-gray-500">Cancel</button>
      </div>
      <div className="mb-3 max-w-xs"><Input label="Tracking ref (optional)" value={trackingRef} onChange={(e) => setTrackingRef(e.target.value)} placeholder="Applied to all selected" /></div>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden mb-3 max-h-48 overflow-y-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-gray-100 bg-gray-50"><th className="px-3 py-2 w-8"><input type="checkbox" checked={selected.size === pending_orders.length} onChange={toggleAll} /></th><th className="px-3 py-2 text-left text-gray-500">Recipient</th><th className="px-3 py-2 text-left text-gray-500">ID</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {pending_orders.map((o) => (
              <tr key={o.id} className={selected.has(o.id) ? 'bg-blue-50' : ''}>
                <td className="px-3 py-2"><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} /></td>
                <td className="px-3 py-2">{o.recipientName}</td>
                <td className="px-3 py-2 font-mono text-gray-400">{o.id.slice(0, 8).toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" loading={busy} onClick={handleDispatch} disabled={!selected.size}>Dispatch {selected.size || ''} orders</Button>
        <p className="text-xs text-gray-500">{selected.size}/{pending_orders.length} selected</p>
      </div>
    </div>
  )
}
