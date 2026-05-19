import { z } from 'zod'

export const createBusinessSchema = z.object({
  name: z.string().min(2),
  contactName: z.string().min(2),
  phone: z.string().min(8),
  email: z.email(),
  password: z.string().min(8),
  deliveryRate: z.coerce.number().min(0),
  cancellationRate: z.coerce.number().min(0),
})

export const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  contactName: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  deliveryRate: z.coerce.number().min(0).optional(),
  cancellationRate: z.coerce.number().min(0).optional(),
})
