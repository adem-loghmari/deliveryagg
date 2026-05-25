'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from './Button'

export function Pagination({ total, page, limit }: { total: number; page: number; limit: number }) {
  const totalPages = Math.ceil(total / limit)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  if (totalPages <= 1) return null
  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>← Prev</Button>
        <span className="px-3 py-1.5 text-gray-700">Page {page} of {totalPages}</span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>Next →</Button>
      </div>
    </div>
  )
}
