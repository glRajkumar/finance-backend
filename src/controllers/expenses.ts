import type { Context } from "hono"
import { eq, and, gte, lte } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { expenses } from "../db/schema/expenses"
import type { CreateExpense, UpdateExpense } from "../validations/expenses"

export const list = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const { categoryId, from, to } = c.req.valid("query") as {
    categoryId?: string
    from?: string
    to?: string
  }

  const conditions = [eq(expenses.userId, userId)]

  if (categoryId) conditions.push(eq(expenses.categoryId, categoryId))
  if (from) conditions.push(gte(expenses.date, from))
  if (to) conditions.push(lte(expenses.date, to))

  const rows = await db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(expenses.date)

  return c.json(rows)
}

export const create = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const body = c.req.valid("json") as CreateExpense

  const [row] = await db
    .insert(expenses)
    .values({ ...body, userId, amount: String(body.amount) })
    .returning()

  return c.json(row, 201)
}

export const update = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")
  const body = c.req.valid("json") as UpdateExpense

  const data: Record<string, unknown> = { ...body }
  if (body.amount !== undefined) data.amount = String(body.amount)

  const [row] = await db
    .update(expenses)
    .set(data)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .returning()

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json(row)
}

export const remove = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")

  const [row] = await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .returning({ id: expenses.id })

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json({ message: "Deleted" })
}
