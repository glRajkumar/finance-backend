import type { Context } from "hono"
import { eq, and, sql } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { income } from "../db/schema/income"
import { expenses } from "../db/schema/expenses"
import { investments } from "../db/schema/investments"
import { loans } from "../db/schema/loans"

export const get = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-01`

  const [incomeData, expenseData, investmentData, loanData] = await Promise.all([
    db
      .select({
        totalMonthly: sql<string>`COALESCE(SUM(CASE WHEN frequency = 'monthly' THEN ${income.amount}::numeric ELSE 0 END), 0)`,
        activeCount: sql<number>`COUNT(CASE WHEN ${income.isActive} THEN 1 END)::int`,
      })
      .from(income)
      .where(eq(income.userId, userId)),

    db
      .select({
        totalThisMonth: sql<string>`COALESCE(SUM(${expenses.amount}::numeric), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          sql`${expenses.date} >= ${monthStart}`,
          sql`${expenses.date} < ${monthEnd}`,
        ),
      ),

    db
      .select({
        subtype: investments.subtype,
        totalInvested: sql<string>`COALESCE(SUM(${investments.amount}::numeric), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(investments)
      .where(and(eq(investments.userId, userId), eq(investments.isActive, true)))
      .groupBy(investments.subtype),

    db
      .select({
        type: loans.type,
        totalOutstanding: sql<string>`COALESCE(SUM(${loans.amount}::numeric), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(loans)
      .where(and(eq(loans.userId, userId), eq(loans.isSettled, false)))
      .groupBy(loans.type),
  ])

  const investmentsBySubtype = investmentData.reduce(
    (acc, row) => {
      acc[row.subtype] = { totalInvested: row.totalInvested, count: row.count }
      return acc
    },
    {} as Record<string, { totalInvested: string; count: number }>,
  )

  const loansByType = loanData.reduce(
    (acc, row) => {
      acc[row.type] = { totalOutstanding: row.totalOutstanding, count: row.count }
      return acc
    },
    {} as Record<string, { totalOutstanding: string; count: number }>,
  )

  return c.json({
    income: incomeData[0] ?? { totalMonthly: "0", activeCount: 0 },
    expenses: expenseData[0] ?? { totalThisMonth: "0", count: 0 },
    investments: investmentsBySubtype,
    loans: loansByType,
  })
}
