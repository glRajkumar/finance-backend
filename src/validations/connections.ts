import { z } from "zod"

const statuses = ["accepted", "rejected"] as const
const categories = ["income", "expense", "investment", "loan"] as const

export const createConnectionSchema = z.object({
  receiverEmail: z.string().email(),
})

export const updateConnectionSchema = z.object({
  status: z.enum(statuses),
})

export const updatePermissionsSchema = z.object({
  categories: z.array(z.enum(categories)).min(0),
})

export const listConnectionsSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
})

export type CreateConnection = z.infer<typeof createConnectionSchema>
export type UpdateConnection = z.infer<typeof updateConnectionSchema>
export type UpdatePermissions = z.infer<typeof updatePermissionsSchema>
