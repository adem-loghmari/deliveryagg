import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const GOV = ['Tunis','Ariana','Ben Arous','Sousse','Sfax','Nabeul','Monastir']
const NAMES = ['Mohamed Ben Ali','Fatma Trabelsi','Ahmed Mansouri','Amira Bouazizi','Khaled Jendoubi']
const STATUSES = ['PENDING','DISPATCHED','IN_DELIVERY','DELIVERED','DELIVERED','DELIVERED','CANCELLED'] as const
const rand = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)]

async function main() {
  const email = 'demo@shop.tn'
  if (await prisma.user.findUnique({ where: { email } })) { console.log('Demo business already exists'); return }
  const passwordHash = await bcrypt.hash('Demo@123456', 10)
  const business = await prisma.business.create({ data: { name: 'Demo Shop', contactName: 'Demo User', phone: '71123456', approved: true, deliveryRate: 7, cancellationRate: 2 } })
  await prisma.user.create({ data: { email, passwordHash, role: 'BUSINESS', businessId: business.id } })
  const now = new Date()
  await prisma.order.createMany({
    data: Array.from({ length: 30 }, (_, i) => {
      const daysAgo = Math.floor(Math.random() * 45)
      const createdAt = new Date(now.getTime() - daysAgo * 86_400_000)
      const status = rand(STATUSES)
      return { businessId: business.id, recipientName: rand(NAMES), recipientPhone: `2${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`, governorate: rand(GOV), city: `${rand(GOV)} Centre`, codAmount: Math.round(Math.random() * 135 + 15), productDesc: 'Sample product', status, trackingRef: status !== 'PENDING' ? `TN-${10000 + i}` : null, createdAt, updatedAt: createdAt }
    }),
  })
  console.log('Demo Shop created: demo@shop.tn / Demo@123456 with 30 orders')
}

main().catch(console.error).finally(() => prisma.$disconnect())
