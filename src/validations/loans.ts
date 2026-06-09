import { z } from "zod"

const loanTypes = ["lent", "borrowed"] as const
const interestTypes = ["simple", "compound", "none"] as const
const frequencies = ["daily", "weekly", "monthly", "quarterly", "annual", "one_time"] as const

export const createLoanSchema = z.object({
  type: z.enum(loanTypes),
  personName: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1).max(3),
  interestRate: z.number().min(0).max(100).optional().nullable(),
  interestType: z.enum(interestTypes).optional().default("none"),
  startDate: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  isSettled: z.boolean().optional().default(false),
  recurringFrequency: z.enum(frequencies).optional().nullable(),
  recurringDay: z.number().int().min(1).max(31).optional().nullable(),
  recurringEndDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateLoanSchema = createLoanSchema.partial()

export const listLoansSchema = z.object({
  type: z.enum(loanTypes).optional(),
  isSettled: z.enum(["true", "false"]).optional(),
})

export const createRepaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1).max(3),
  paidAt: z.string().min(1),
  notes: z.string().optional().nullable(),
})

export type CreateLoan = z.infer<typeof createLoanSchema>
export type UpdateLoan = z.infer<typeof updateLoanSchema>
export type CreateRepayment = z.infer<typeof createRepaymentSchema>
