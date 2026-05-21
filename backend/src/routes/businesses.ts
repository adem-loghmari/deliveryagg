import { Router, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma'
import { Prisma } from '../generated/prisma/client'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { requireRole } from '../middleware/requireRole'
import { validate } from '../middleware/validate'
import { createBusinessSchema, updateBusinessSchema } from '../schemas/business.schema'

const router = Router()
router.use(authenticate, requireRole('ADMIN'))

router.get('/', async (req: AuthRequest, res: Response) => {
  const search = req.query.q as string | undefined
  const approved = req.query.approved as string | undefined
  const where: Record<string, unknown> = {}
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { contactName: { contains: search, mode: 'insensitive' } }]
  if (approved === 'true') where.approved = true
  if (approved === 'false') where.approved = false
  const businesses = await prisma.business.findMany({ where, orderBy: { createdAt: 'desc' }, include: { _count: { select: { orders: true, users: true } } } })
  res.json(businesses)
})

router.post('/', validate(createBusinessSchema), async (req: AuthRequest, res: Response) => {
  const { email, password, ...businessData } = req.body as { email: string; password: string; name: string; contactName: string; phone: string; deliveryRate: number; cancellationRate: number }
  if (await prisma.user.findUnique({ where: { email } })) { res.status(409).json({ error: 'Email already registered' }); return }
  const passwordHash = await bcrypt.hash(password, 10)
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const business = await tx.business.create({ data: { ...businessData, approved: true } })
    const user = await tx.user.create({ data: { email, passwordHash, role: 'BUSINESS', businessId: business.id } })
    return { business, user }
  })
  res.status(201).json(result.business)
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const business = await prisma.business.findUnique({ where: { id: req.params.id as string }, include: { users: { select: { id: true, email: true, createdAt: true } }, _count: { select: { orders: true } } } })
  if (!business) { res.status(404).json({ error: 'Not found' }); return }
  res.json(business)
})

router.patch('/:id', validate(updateBusinessSchema), async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const { deliveryRate, cancellationRate, ...rest } = req.body as { deliveryRate?: number; cancellationRate?: number; name?: string; contactName?: string; phone?: string }
  const existing = await prisma.business.findUnique({ where: { id } })
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const rateChanged = (deliveryRate !== undefined && Number(existing.deliveryRate) !== deliveryRate) || (cancellationRate !== undefined && Number(existing.cancellationRate) !== cancellationRate)
  const business = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updated = await tx.business.update({ where: { id }, data: { ...rest, ...(deliveryRate !== undefined ? { deliveryRate } : {}), ...(cancellationRate !== undefined ? { cancellationRate } : {}) } })
    if (rateChanged) await tx.rateChange.create({ data: { businessId: id, deliveryRate: updated.deliveryRate, cancellationRate: updated.cancellationRate, changedBy: req.user!.userId } })
    return updated
  })
  res.json(business)
})

router.patch('/:id/approve', async (req: AuthRequest, res: Response) => {
  const business = await prisma.business.update({ where: { id: req.params.id as string }, data: { approved: true } }).catch(() => null)
  if (!business) { res.status(404).json({ error: 'Not found' }); return }
  res.json(business)
})

router.get('/:id/rate-history', async (_req: AuthRequest, res: Response) => {
  const history = await prisma.rateChange.findMany({ where: { businessId: _req.params.id as string }, orderBy: { changedAt: 'desc' }, take: 20 })
  res.json(history)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.business.delete({ where: { id: req.params.id as string } }).catch(() => null)
  res.status(204).send()
})

export default router
