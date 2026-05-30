import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const res = await fetch(`${BACKEND}/api/invoices/${id}/pdf`, { headers: { Authorization: `Bearer ${session.token}` } })
  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const buf = await res.arrayBuffer()
  return new NextResponse(buf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="invoice-${id.slice(0,8)}.pdf"` } })
}
