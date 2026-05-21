import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { prisma } from '../lib/prisma'
import { Prisma } from '../generated/prisma/client'
import { signToken } from '../lib/jwt'
import { validate } from '../middleware/validate'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { sendEmail } from '../lib/email'
import { config } from '../config'
import { loginSchema, registerSchema } from '../schemas/auth.schema'

const router = Router()

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string }
  const user = await prisma.user.findUnique({ where: { email }, include: { business: true } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' }); return
  }
  if (user.role === 'BUSINESS' && (!user.business || !user.business.approved)) {
    res.status(403).json({ error: 'Account pending approval' }); return
  }
  const token = signToken({ userId: user.id, role: user.role, businessId: user.businessId ?? undefined })
  res.json({ token, role: user.role, businessId: user.businessId })
})

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { email, password, businessName, contactName, phone } = req.body as z.infer<typeof registerSchema>
  if (await prisma.user.findUnique({ where: { email } })) {
    res.status(409).json({ error: 'Email already registered' }); return
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const business = await tx.business.create({
      data: { name: businessName, contactName, phone, approved: false, deliveryRate: 7, cancellationRate: 2 },
    })
    const user = await tx.user.create({ data: { email, passwordHash, role: 'BUSINESS', businessId: business.id } })
    return { user, business }
  })
  res.status(201).json({ message: 'Registration successful. Await admin approval.', userId: result.user.id })
})

const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) })

router.patch('/change-password',
  authenticate as (req: Request, res: Response, next: NextFunction) => void,
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const parsed = changePasswordSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return }
    const user = await prisma.user.findUnique({ where: { id: authReq.user!.userId } })
    if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
      res.status(401).json({ error: 'Current password is incorrect' }); return
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) } })
    res.json({ message: 'Password changed successfully' })
  }
)

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string }
  if (!email) { res.status(400).json({ error: 'Email required' }); return }
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    const token = randomBytes(32).toString('hex')
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 3600_000) } })
    const url = `${config.frontendUrl}/reset-password?token=${token}`
    await sendEmail(email, 'Reset your DeliveryAgg password',
      `<p>Click to reset your password (expires in 1 hour):</p><p><a href="${url}">${url}</a></p>`
    ).catch(() => null)
  }
  res.json({ message: 'If that email is registered, a reset link has been sent.' })
})

router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string }
  if (!token || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'Token and new password (min 8 chars) required' }); return
  }
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    res.status(400).json({ error: 'Invalid or expired reset token' }); return
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ])
  res.json({ message: 'Password reset successfully. You can now log in.' })
})

export default router
