import { z } from "zod"

const frequencies = ["daily", "weekly", "monthly", "quarterly", "annual", "one_time"] as const

export const createCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().min(1),
})

export const updateCategorySchema = createCategorySchema.partial()

export const createExpenseSchema = z.object({
  categoryId: z.string().optional().nullable(),
  amount: z.number().positive(),
  currency: z.string().min(1).max(3),
  date: z.string().min(1),
  note: z.string().optional().nullable(),
  recurringFrequency: z.enum(frequencies).optional().nullable(),
  recurringDay: z.number().int().min(1).max(31).optional().nullable(),
  recurringEndDate: z.string().optional().nullable(),
})

export const updateExpenseSchema = createExpenseSchema.partial()

export const listExpensesSchema = z.object({
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export type CreateCategory = z.infer<typeof createCategorySchema>
export type UpdateCategory = z.infer<typeof updateCategorySchema>
export type CreateExpense = z.infer<typeof createExpenseSchema>
export type UpdateExpense = z.infer<typeof updateExpenseSchema>
