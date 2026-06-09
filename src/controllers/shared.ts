import type { Context } from "hono"
import { eq, and, or } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { connections, connectionPermissions } from "../db/schema/connections"
import { income } from "../db/schema/income"
import { expenses, expenseCategories } from "../db/schema/expenses"
import { investments } from "../db/schema/investments"
import { loans } from "../db/schema/loans"

export const get = async (c: Context<AppEnv>) => {
  const callerId = c.get("userId")
  const targetUserId = c.req.param("userId")

  const [conn] = await db
    .select({ id: connections.id })
    .from(connections)
    .where(
      and(
        eq(connections.status, "accepted"),
        or(
          and(eq(connections.requesterId, callerId), eq(connections.receiverId, targetUserId)),
          and(eq(connections.requesterId, targetUserId), eq(connections.receiverId, callerId)),
        )!,
      ),
    )

  if (!conn) return c.json({ message: "No accepted connection" }, 403)

  const perms = await db
    .select({ category: connectionPermissions.category })
    .from(connectionPermissions)
    .where(eq(connectionPermissions.connectionId, conn.id))

  const allowedCategories = new Set(perms.map((p) => p.category))

  const result: Record<string, unknown> = {}

  await Promise.all([
    allowedCategories.has("income") &&
      db
        .select()
        .from(income)
        .where(eq(income.userId, targetUserId))
        .then((rows) => {
          result.income = rows
        }),

    allowedCategories.has("expense") &&
      db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, targetUserId))
        .then((rows) => {
          result.expenses = rows
        }),

    allowedCategories.has("expense") &&
      db
        .select()
        .from(expenseCategories)
        .where(eq(expenseCategories.userId, targetUserId))
        .then((rows) => {
          result.expenseCategories = rows
        }),

    allowedCategories.has("investment") &&
      db
        .select()
        .from(investments)
        .where(eq(investments.userId, targetUserId))
        .then((rows) => {
          result.investments = rows
        }),

    allowedCategories.has("loan") &&
      db
        .select()
        .from(loans)
        .where(eq(loans.userId, targetUserId))
        .then((rows) => {
          result.loans = rows
        }),
  ])

  return c.json(result)
}
