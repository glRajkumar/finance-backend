import type { Context } from "hono"
import { eq, and } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { loans, loanRepayments } from "../db/schema/loans"
import type { CreateLoan, UpdateLoan, CreateRepayment } from "../validations/loans"

export const list = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const { type, isSettled } = c.req.valid("query") as {
    type?: string
    isSettled?: string
  }

  const conditions = [eq(loans.userId, userId)]

  if (type) conditions.push(eq(loans.type, type as typeof loans.type.dataType))
  if (isSettled !== undefined) conditions.push(eq(loans.isSettled, isSettled === "true"))

  const rows = await db
    .select()
    .from(loans)
    .where(and(...conditions))
    .orderBy(loans.startDate)

  return c.json(rows)
}

export const create = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const body = c.req.valid("json") as CreateLoan

  const [row] = await db
    .insert(loans)
    .values({
      ...body,
      userId,
      amount: String(body.amount),
      interestRate: body.interestRate != null ? String(body.interestRate) : null,
    })
    .returning()

  return c.json(row, 201)
}

export const update = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")
  const body = c.req.valid("json") as UpdateLoan

  const data: Record<string, unknown> = { ...body }
  if (body.amount !== undefined) data.amount = String(body.amount)
  if (body.interestRate !== undefined) data.interestRate = body.interestRate != null ? String(body.interestRate) : null

  const [row] = await db
    .update(loans)
    .set(data)
    .where(and(eq(loans.id, id), eq(loans.userId, userId)))
    .returning()

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json(row)
}

export const remove = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")

  const [row] = await db
    .delete(loans)
    .where(and(eq(loans.id, id), eq(loans.userId, userId)))
    .returning({ id: loans.id })

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json({ message: "Deleted" })
}

export const listRepayments = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const loanId = c.req.param("id")

  const [loan] = await db
    .select({ id: loans.id })
    .from(loans)
    .where(and(eq(loans.id, loanId), eq(loans.userId, userId)))

  if (!loan) return c.json({ message: "Not found" }, 404)

  const rows = await db
    .select()
    .from(loanRepayments)
    .where(eq(loanRepayments.loanId, loanId))
    .orderBy(loanRepayments.paidAt)

  return c.json(rows)
}

export const createRepayment = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const loanId = c.req.param("id")
  const body = c.req.valid("json") as CreateRepayment

  const [loan] = await db
    .select({ id: loans.id })
    .from(loans)
    .where(and(eq(loans.id, loanId), eq(loans.userId, userId)))

  if (!loan) return c.json({ message: "Not found" }, 404)

  const [row] = await db
    .insert(loanRepayments)
    .values({ ...body, loanId, amount: String(body.amount) })
    .returning()

  return c.json(row, 201)
}
