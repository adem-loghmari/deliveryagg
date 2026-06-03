import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { OrderStatus } from '../generated/prisma/client'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { requireRole } from '../middleware/requireRole'
import { validate } from '../middleware/validate'
import { orderCreateSchema, orderStatusSchema, bulkOrderSchema } from '../schemas/order.schema'
import { sendEmail, orderStatusEmail } from '../lib/email'

const router = Router()
router.use(authenticate)

const TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['DISPATCHED'],
  DISPATCHED: ['IN_DELIVERY'],
  IN_DELIVERY: ['DELIVERED', 'CANCELLED', 'RETURNED'],
}

router.post('/', async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.role === 'ADMIN' ? (req.body.businessId as string | undefined) : req.user!.businessId
  if (!businessId) { res.status(400).json({ error: 'businessId required' }); return }
  const parsed = orderCreateSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return }
  const order = await prisma.order.create({ data: { ...parsed.data, businessId } as Parameters<typeof prisma.order.create>[0]['data'] })
  res.status(201).json(order)
})

router.post('/bulk', async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.role === 'ADMIN' ? (req.body.businessId as string | undefined) : req.user!.businessId
  if (!businessId) { res.status(400).json({ error: 'businessId required' }); return }
  const parsed = bulkOrderSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return }
  const created = await prisma.order.createMany({ data: parsed.data.orders.map((o) => ({ ...o, businessId })) as Parameters<typeof prisma.order.createMany>[0] extends { data: infer D } ? D : never })
  res.status(201).json({ created: created.count })
})

router.patch('/bulk-status', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const { orderIds, status, trackingRef } = req.body as { orderIds: string[]; status: string; trackingRef?: string }
  if (!Array.isArray(orderIds) || !orderIds.length) { res.status(400).json({ error: 'orderIds required' }); return }
  const now = new Date()
  const ts: Record<string, Date> = {}
  if (status === 'DISPATCHED') ts.dispatchedAt = now
  if (status === 'DELIVERED') ts.deliveredAt = now
  if (status === 'CANCELLED' || status === 'RETURNED') ts.cancelledAt = now
  const updated = await prisma.order.updateMany({ where: { id: { in: orderIds } }, data: { status: status as OrderStatus, ...(trackingRef ? { trackingRef } : {}), ...ts } })
  res.json({ updated: updated.count })
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'), 10)
  const limit = parseInt(String(req.query.limit ?? '50'), 10)
  const search = req.query.q as string | undefined
  const where: Record<string, unknown> = {}
  if (req.user!.role === 'BUSINESS') where.businessId = req.user!.businessId
  else if (req.query.businessId) where.businessId = req.query.businessId
  if (req.query.status) where.status = req.query.status
  if (search) where.OR = [{ recipientName: { contains: search, mode: 'insensitive' } }, { recipientPhone: { contains: search } }, { trackingRef: { contains: search } }]
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { business: { select: { name: true } } } }),
    prisma.order.count({ where }),
  ])
  res.json({ orders, total })
})

router.get('/track/:ref', async (req, res: Response) => {
  const order = await prisma.order.findFirst({ where: { trackingRef: req.params.ref as string }, select: { id: true, recipientName: true, governorate: true, city: true, status: true, trackingRef: true, createdAt: true, dispatchedAt: true, deliveredAt: true, cancelledAt: true } })
  if (!order) { res.status(404).json({ error: 'Not found' }); return }
  res.json(order)
})

router.get('/export/csv', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const where: Record<string, unknown> = {}
  if (req.query.businessId) where.businessId = req.query.businessId
  if (req.query.status) where.status = req.query.status
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, include: { business: { select: { name: true } } }, take: 10000 })
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const headers = ['ID','Business','Recipient','Phone','Governorate','City','COD','Status','Tracking','Created']
  type ExportOrder = typeof orders[0] & { business?: { name: string } }
  const rows = orders.map((o: ExportOrder) => [o.id, o.business?.name ?? '', o.recipientName, o.recipientPhone, o.governorate, o.city, o.codAmount.toString(), o.status, o.trackingRef ?? '', o.createdAt.toISOString()].map(esc).join(','))
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`)
  res.send([headers.join(','), ...rows].join('\n'))
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id as string }, include: { business: { select: { name: true, deliveryRate: true, cancellationRate: true } } } })
  if (!order) { res.status(404).json({ error: 'Not found' }); return }
  if (req.user!.role === 'BUSINESS' && order.businessId !== req.user!.businessId) { res.status(403).json({ error: 'Forbidden' }); return }
  res.json(order)
})

router.patch('/:id/status', requireRole('ADMIN'), validate(orderStatusSchema), async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id as string }, include: { business: { include: { users: { select: { email: true } } } } } })
  if (!order) { res.status(404).json({ error: 'Not found' }); return }
  const { status, trackingRef } = req.body as { status: OrderStatus; trackingRef?: string }
  if (!(TRANSITIONS[order.status] ?? []).includes(status)) { res.status(422).json({ error: `Cannot transition ${order.status} → ${status}` }); return }
  const now = new Date()
  const ts: Record<string, Date> = {}
  if (status === 'DISPATCHED') ts.dispatchedAt = now
  if (status === 'DELIVERED') ts.deliveredAt = now
  if (status === 'CANCELLED' || status === 'RETURNED') ts.cancelledAt = now
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status, trackingRef: trackingRef ?? order.trackingRef ?? undefined, ...ts } })
  const email = order.business.users[0]?.email
  if (email) { const { subject, html } = orderStatusEmail(order.business.name, order.id, order.recipientName, status, trackingRef); sendEmail(email, subject, html).catch(() => null) }
  res.json(updated)
})

router.patch('/:id/notes', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const { trackingRef, notes } = req.body as { trackingRef?: string; notes?: string }
  const updated = await prisma.order.update({ where: { id: req.params.id as string }, data: { ...(trackingRef !== undefined ? { trackingRef } : {}), ...(notes !== undefined ? { notes } : {}) } }).catch(() => null)
  if (!updated) { res.status(404).json({ error: 'Not found' }); return }
  res.json(updated)
})

router.delete('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id as string } })
  if (!order) { res.status(404).json({ error: 'Not found' }); return }
  if (order.status !== 'PENDING') { res.status(422).json({ error: 'Only PENDING orders can be deleted' }); return }
  await prisma.order.delete({ where: { id: order.id } })
  res.status(204).send()
})

export default router
