import { z } from "zod"

const subtypes = ["sip", "fd", "gold", "silver", "bond", "crypto", "stocks", "other"] as const
const frequencies = ["daily", "weekly", "monthly", "quarterly", "annual", "one_time"] as const
const interestTypes = ["simple", "compound", "none"] as const
const compoundFrequencies = ["monthly", "quarterly", "annual"] as const

export const createInvestmentSchema = z.object({
  subtype: z.enum(subtypes),
  name: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1).max(3),
  startDate: z.string().min(1),
  isActive: z.boolean().optional().default(true),
  notes: z.string().optional().nullable(),
  recurringFrequency: z.enum(frequencies).optional().nullable(),
  recurringDay: z.number().int().min(1).max(31).optional().nullable(),
  recurringEndDate: z.string().optional().nullable(),
  parentInvestmentId: z.string().optional().nullable(),
  quantity: z.number().positive().optional().nullable(),
  unit: z.string().optional().nullable(),
  institution: z.string().optional().nullable(),
  interestRate: z.number().min(0).max(100).optional().nullable(),
  interestType: z.enum(interestTypes).optional().nullable(),
  compoundFrequency: z.enum(compoundFrequencies).optional().nullable(),
  maturityDate: z.string().optional().nullable(),
  maturityAmount: z.number().positive().optional().nullable(),
})

export const updateInvestmentSchema = createInvestmentSchema.partial()

export const listInvestmentsSchema = z.object({
  subtype: z.enum(subtypes).optional(),
  isActive: z.enum(["true", "false"]).optional(),
})

export type CreateInvestment = z.infer<typeof createInvestmentSchema>
export type UpdateInvestment = z.infer<typeof updateInvestmentSchema>
