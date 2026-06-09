import type { Context } from "hono"
import { eq, and } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { expenseCategories } from "../db/schema/expenses"
import type { CreateCategory, UpdateCategory } from "../validations/expenses"

export const list = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const rows = await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.userId, userId))
    .orderBy(expenseCategories.name)
  return c.json(rows)
}

export const create = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const body = c.req.valid("json") as CreateCategory

  const [row] = await db
    .insert(expenseCategories)
    .values({ ...body, userId })
    .returning()

  return c.json(row, 201)
}

export const update = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")
  const body = c.req.valid("json") as UpdateCategory

  const [row] = await db
    .update(expenseCategories)
    .set(body)
    .where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)))
    .returning()

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json(row)
}

export const remove = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")

  const [row] = await db
    .delete(expenseCategories)
    .where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)))
    .returning({ id: expenseCategories.id })

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json({ message: "Deleted" })
}
