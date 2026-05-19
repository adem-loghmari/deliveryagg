import { z } from 'zod'

export const TUNISIAN_GOVERNORATES = [
  'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte','Béja',
  'Jendouba','Kef','Siliana','Sousse','Monastir','Mahdia','Sfax','Kairouan',
  'Kasserine','Sidi Bouzid','Gabès','Médenine','Tataouine','Gafsa','Tozeur','Kébili',
]

export const orderCreateSchema = z.object({
  recipientName: z.string().min(2),
  recipientPhone: z.string().min(8),
  governorate: z.enum(TUNISIAN_GOVERNORATES as [string, ...string[]]),
  city: z.string().min(2),
  addressDetails: z.string().optional(),
  codAmount: z.coerce.number().min(0),
  productDesc: z.string().optional(),
  weightKg: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
})

export const bulkOrderSchema = z.object({
  orders: z.array(orderCreateSchema).min(1),
})

export const orderStatusSchema = z.object({
  status: z.enum(['DISPATCHED', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  trackingRef: z.string().optional(),
})

export type OrderCreateInput = z.infer<typeof orderCreateSchema>
