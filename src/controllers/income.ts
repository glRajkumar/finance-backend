import type { Context } from "hono"
import { eq, and } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { income } from "../db/schema/income"
import type { CreateIncome, UpdateIncome } from "../validations/income"

export const list = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const { type, isActive } = c.req.valid("query") as { type?: string; isActive?: string }

  const conditions = [eq(income.userId, userId)]

  if (type) conditions.push(eq(income.type, type as typeof income.type.dataType))
  if (isActive !== undefined) conditions.push(eq(income.isActive, isActive === "true"))

  const rows = await db
    .select()
    .from(income)
    .where(and(...conditions))
    .orderBy(income.createdAt)

  return c.json(rows)
}

export const create = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const body = c.req.valid("json") as CreateIncome

  const [row] = await db
    .insert(income)
    .values({ ...body, userId, amount: String(body.amount) })
    .returning()

  return c.json(row, 201)
}

export const update = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")
  const body = c.req.valid("json") as UpdateIncome

  const data: Record<string, unknown> = { ...body }
  if (body.amount !== undefined) data.amount = String(body.amount)

  const [row] = await db
    .update(income)
    .set(data)
    .where(and(eq(income.id, id), eq(income.userId, userId)))
    .returning()

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json(row)
}

export const remove = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")

  const [row] = await db
    .delete(income)
    .where(and(eq(income.id, id), eq(income.userId, userId)))
    .returning({ id: income.id })

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json({ message: "Deleted" })
}
