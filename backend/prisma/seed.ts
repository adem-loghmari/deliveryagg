import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = process.env.ADMIN_EMAIL!
  if (await prisma.user.findUnique({ where: { email } })) { console.log('Admin already exists'); return }
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10)
  await prisma.user.create({ data: { email, passwordHash, role: 'ADMIN' } })
  console.log(`Admin created: ${email}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
