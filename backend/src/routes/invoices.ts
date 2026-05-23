import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { requireRole } from '../middleware/requireRole'
import { validate } from '../middleware/validate'
import { generateInvoicePdf } from '../lib/pdf'
import { generateInvoiceSchema } from '../schemas/invoice.schema'

const router = Router()
router.use(authenticate)

router.post('/generate', requireRole('ADMIN'), validate(generateInvoiceSchema), async (req: AuthRequest, res: Response) => {
  const { businessId, month, year } = req.body as { businessId: string; month: number; year: number }
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  if (!business) { res.status(404).json({ error: 'Business not found' }); return }
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  const orders = await prisma.order.findMany({ where: { businessId, status: { in: ['DELIVERED', 'CANCELLED', 'RETURNED'] }, createdAt: { gte: start, lt: end }, invoiceLine: null } })
  if (!orders.length) { res.status(422).json({ error: 'No uninvoiced orders found for this period' }); return }
  const lines = orders.map((o) => {
    const type = o.status === 'DELIVERED' ? 'DELIVERY' : 'CANCELLATION'
    const rate = type === 'DELIVERY' ? Number(business.deliveryRate) : Number(business.cancellationRate)
    return { orderId: o.id, type, rate }
  })
  const total = lines.reduce((s, l) => s + l.rate, 0)
  const invoice = await prisma.invoice.create({ data: { businessId, month, year, totalAmount: total, lines: { create: lines } }, include: { lines: { include: { order: { select: { id: true, recipientName: true, governorate: true } } } } } })
  res.status(201).json(invoice)
})

router.get('/', async (req: AuthRequest, res: Response) => {
  const where: Record<string, unknown> = {}
  if (req.user!.role === 'BUSINESS') where.businessId = req.user!.businessId
  else if (req.query.businessId) where.businessId = req.query.businessId
  const invoices = await prisma.invoice.findMany({ where, orderBy: { generatedAt: 'desc' }, include: { business: { select: { name: true } } } })
  res.json(invoices)
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id as string }, include: { business: { select: { name: true, contactName: true, phone: true } }, lines: { include: { order: { select: { id: true, recipientName: true, governorate: true } } } } } })
  if (!invoice) { res.status(404).json({ error: 'Not found' }); return }
  if (req.user!.role === 'BUSINESS' && invoice.businessId !== req.user!.businessId) { res.status(403).json({ error: 'Forbidden' }); return }
  res.json(invoice)
})

router.patch('/:id/mark-paid', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.update({ where: { id: req.params.id as string }, data: { status: 'PAID', paidAt: new Date() } }).catch(() => null)
  if (!invoice) { res.status(404).json({ error: 'Not found' }); return }
  res.json(invoice)
})

router.get('/:id/pdf', async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id as string }, include: { business: { select: { name: true, contactName: true, phone: true } }, lines: { include: { order: { select: { id: true, recipientName: true, governorate: true } } } } } })
  if (!invoice) { res.status(404).json({ error: 'Not found' }); return }
  if (req.user!.role === 'BUSINESS' && invoice.businessId !== req.user!.businessId) { res.status(403).json({ error: 'Forbidden' }); return }
  const buf = await generateInvoicePdf({ ...invoice, generatedAt: invoice.generatedAt.toISOString(), totalAmount: Number(invoice.totalAmount), month: invoice.month, year: invoice.year, lines: invoice.lines.map((l) => ({ ...l, rate: Number(l.rate) })) })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.id.slice(0, 8)}.pdf"`)
  res.send(buf)
})

export default router
