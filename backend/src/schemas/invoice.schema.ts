import { z } from 'zod'

export const generateInvoiceSchema = z.object({
  businessId: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2024),
})
