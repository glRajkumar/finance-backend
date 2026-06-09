import type { Context } from "hono"
import { eq, and } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { investments } from "../db/schema/investments"
import type { CreateInvestment, UpdateInvestment } from "../validations/investments"

export const list = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const { subtype, isActive } = c.req.valid("query") as {
    subtype?: string
    isActive?: string
  }

  const conditions = [eq(investments.userId, userId)]

  if (subtype) conditions.push(eq(investments.subtype, subtype as typeof investments.subtype.dataType))
  if (isActive !== undefined) conditions.push(eq(investments.isActive, isActive === "true"))

  const rows = await db
    .select()
    .from(investments)
    .where(and(...conditions))
    .orderBy(investments.startDate)

  return c.json(rows)
}

export const create = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const body = c.req.valid("json") as CreateInvestment

  const [row] = await db
    .insert(investments)
    .values({
      ...body,
      userId,
      amount: String(body.amount),
      quantity: body.quantity != null ? String(body.quantity) : null,
      interestRate: body.interestRate != null ? String(body.interestRate) : null,
      maturityAmount: body.maturityAmount != null ? String(body.maturityAmount) : null,
    })
    .returning()

  return c.json(row, 201)
}

export const update = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")
  const body = c.req.valid("json") as UpdateInvestment

  const data: Record<string, unknown> = { ...body }
  if (body.amount !== undefined) data.amount = String(body.amount)
  if (body.quantity !== undefined) data.quantity = body.quantity != null ? String(body.quantity) : null
  if (body.interestRate !== undefined) data.interestRate = body.interestRate != null ? String(body.interestRate) : null
  if (body.maturityAmount !== undefined) data.maturityAmount = body.maturityAmount != null ? String(body.maturityAmount) : null

  const [row] = await db
    .update(investments)
    .set(data)
    .where(and(eq(investments.id, id), eq(investments.userId, userId)))
    .returning()

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json(row)
}

export const remove = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")

  const [row] = await db
    .delete(investments)
    .where(and(eq(investments.id, id), eq(investments.userId, userId)))
    .returning({ id: investments.id })

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json({ message: "Deleted" })
}
