'use client'
import { useRouter, usePathname } from 'next/navigation'

export function DashboardMonthSelector({ month, year }: { month: number; year: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const go = (m: number, y: number) => router.push(`${pathname}?month=${m}&year=${y}`)
  const now = new Date()
  const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1
  const prev = () => month === 1 ? go(12, year - 1) : go(month - 1, year)
  const next = () => { if (!isCurrent) month === 12 ? go(1, year + 1) : go(month + 1, year) }
  return (
    <div className="flex items-center gap-1">
      <button onClick={prev} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">◀</button>
      <button onClick={() => go(now.getMonth() + 1, now.getFullYear())} disabled={isCurrent} className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40">This month</button>
      <button onClick={next} disabled={isCurrent} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-40">▶</button>
    </div>
  )
}
