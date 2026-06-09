import { z } from "zod"

const incomeTypes = ["salary", "freelance", "rental", "business", "other"] as const
const frequencies = ["daily", "weekly", "monthly", "quarterly", "annual", "one_time"] as const

export const createIncomeSchema = z.object({
  name: z.string().min(1),
  type: z.enum(incomeTypes),
  amount: z.number().positive(),
  currency: z.string().min(1).max(3),
  frequency: z.enum(frequencies),
  isActive: z.boolean().optional().default(true),
  recurringFrequency: z.enum(frequencies).optional().nullable(),
  recurringDay: z.number().int().min(1).max(31).optional().nullable(),
  recurringEndDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateIncomeSchema = createIncomeSchema.partial()

export const listIncomeSchema = z.object({
  type: z.enum(incomeTypes).optional(),
  isActive: z.enum(["true", "false"]).optional(),
})

export type CreateIncome = z.infer<typeof createIncomeSchema>
export type UpdateIncome = z.infer<typeof updateIncomeSchema>
