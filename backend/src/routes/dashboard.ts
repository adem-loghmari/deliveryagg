import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { requireRole } from '../middleware/requireRole'
import { config } from '../config'

const router = Router()
router.use(authenticate)

router.get('/business', async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId
  if (!businessId) { res.status(400).json({ error: 'No business associated' }); return }
  const now = new Date()
  const month = req.query.month ? parseInt(String(req.query.month), 10) : now.getMonth() + 1
  const year = req.query.year ? parseInt(String(req.query.year), 10) : now.getFullYear()
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  if (!business) { res.status(404).json({ error: 'Not found' }); return }
  const [allOrders, periodOrders, codAgg] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], where: { businessId }, _count: { id: true } }),
    prisma.order.groupBy({ by: ['status'], where: { businessId, createdAt: { gte: start, lt: end } }, _count: { id: true } }),
    prisma.order.aggregate({ where: { businessId, status: 'DELIVERED', createdAt: { gte: start, lt: end } }, _sum: { codAmount: true } }),
  ])
  const toMap = (g: Array<{ status: string; _count: { id: number } }>) => Object.fromEntries(g.map((x) => [x.status, x._count.id]))
  const all = toMap(allOrders)
  const thisPeriod = toMap(periodOrders)
  const delivered = thisPeriod.DELIVERED ?? 0
  const cancelled = (thisPeriod.CANCELLED ?? 0) + (thisPeriod.RETURNED ?? 0)
  const dr = Number(business.deliveryRate), cr = Number(business.cancellationRate)
  const periodCost = delivered * dr + cancelled * cr
  const marketCost = delivered * config.marketDeliveryRate + cancelled * config.marketCancellationRate
  res.json({ all, thisPeriod, periodCost, savings: marketCost - periodCost, deliveryRate: dr, cancellationRate: cr, marketDeliveryRate: config.marketDeliveryRate, marketCancellationRate: config.marketCancellationRate, month, year, totalCodDelivered: Number(codAgg._sum.codAmount ?? 0) })
})

router.get('/admin', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const now = new Date()
  const month = req.query.month ? parseInt(String(req.query.month), 10) : now.getMonth() + 1
  const year = req.query.year ? parseInt(String(req.query.year), 10) : now.getFullYear()
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  const [allStatuses, periodStatuses, businesses] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.order.groupBy({ by: ['status'], where: { createdAt: { gte: start, lt: end } }, _count: { id: true } }),
    prisma.business.findMany({ where: { approved: true }, include: { orders: { where: { createdAt: { gte: start, lt: end }, status: { in: ['DELIVERED', 'CANCELLED', 'RETURNED'] } }, select: { status: true } }, _count: { select: { orders: true } } } }),
  ])
  const toMap = (g: Array<{ status: string; _count: { id: number } }>) => Object.fromEntries(g.map((x) => [x.status, x._count.id]))
  const perBusiness = businesses.map((b) => {
    const delivered = b.orders.filter((o: { status: string }) => o.status === 'DELIVERED').length
    const cancelled = b.orders.filter((o: { status: string }) => o.status !== 'DELIVERED').length
    const dr = Number(b.deliveryRate), cr = Number(b.cancellationRate)
    const revenue = delivered * dr + cancelled * cr
    return { id: b.id, name: b.name, totalOrders: b._count.orders, monthDelivered: delivered, monthCancelled: cancelled, monthRevenue: revenue, monthMargin: revenue - (delivered * config.platformDeliveryCost + cancelled * config.platformCancellationCost) }
  })
  type Row = (typeof perBusiness)[0]
  res.json({ all: toMap(allStatuses), thisPeriod: toMap(periodStatuses), totalRevenue: perBusiness.reduce((s: number, b: Row) => s + b.monthRevenue, 0), totalMargin: perBusiness.reduce((s: number, b: Row) => s + b.monthMargin, 0), perBusiness, month, year })
})

export default router
