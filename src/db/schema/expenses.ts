import { pgTable, text, timestamp, integer, numeric, index, date } from "drizzle-orm/pg-core"

import { users } from "./auth"
import { frequencyEnum } from "./enums"

export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    icon: text("icon").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("expense_categories_userId_idx").on(table.userId)],
)

export const expenses = pgTable(
  "expenses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => expenseCategories.id, {
      onDelete: "set null",
    }),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    date: date("date").notNull(),
    note: text("note"),
    recurringFrequency: frequencyEnum("recurring_frequency"),
    recurringDay: integer("recurring_day"),
    recurringEndDate: date("recurring_end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expenses_userId_idx").on(table.userId),
    index("expenses_userId_categoryId_idx").on(table.userId, table.categoryId),
    index("expenses_userId_date_idx").on(table.userId, table.date),
  ],
)
