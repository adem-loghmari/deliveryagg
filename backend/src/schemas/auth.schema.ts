import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  phone: z.string().min(8),
})
