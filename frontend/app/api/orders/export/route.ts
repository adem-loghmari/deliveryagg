import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const q = req.nextUrl.searchParams.toString()
  const res = await fetch(`${BACKEND}/api/orders/export/csv?${q}`, { headers: { Authorization: `Bearer ${session.token}` } })
  const csv = await res.text()
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="orders.csv"' } })
}
