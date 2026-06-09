import { z } from "zod"

export const updateProfileSchema = z.object({
  currency: z.string().min(1).max(3).optional(),
  otherCurrencies: z.array(z.string().min(1).max(3)).optional(),
})

export type UpdateProfile = z.infer<typeof updateProfileSchema>
