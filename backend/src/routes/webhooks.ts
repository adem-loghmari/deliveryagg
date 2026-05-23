import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { OrderStatus } from '../generated/prisma/client'

const router = Router()

const STATUS_MAP: Record<string, OrderStatus> = {
  dispatched: 'DISPATCHED', in_transit: 'IN_DELIVERY',
  delivered: 'DELIVERED', cancelled: 'CANCELLED', returned: 'RETURNED',
}

router.post('/:agencyId', async (req: Request, res: Response) => {
  const { trackingRef, status } = req.body as { trackingRef?: string; status?: string }
  if (!trackingRef || !status) { res.status(400).json({ error: 'trackingRef and status required' }); return }
  const mapped = STATUS_MAP[status.toLowerCase()]
  if (!mapped) { res.status(400).json({ error: `Unknown status: ${status}` }); return }
  const order = await prisma.order.findFirst({ where: { trackingRef } })
  if (!order) { res.status(404).json({ error: 'Order not found' }); return }
  const now = new Date()
  const ts: Record<string, Date> = {}
  if (mapped === 'DISPATCHED') ts.dispatchedAt = now
  if (mapped === 'DELIVERED') ts.deliveredAt = now
  if (mapped === 'CANCELLED' || mapped === 'RETURNED') ts.cancelledAt = now
  await prisma.order.update({ where: { id: order.id }, data: { status: mapped, ...ts } })
  res.json({ ok: true, orderId: order.id, status: mapped })
})

export default router
