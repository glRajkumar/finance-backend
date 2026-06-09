import { pgTable, pgEnum, text, timestamp, boolean, integer, numeric, index } from "drizzle-orm/pg-core"
import { date } from "drizzle-orm/pg-core"

import { users } from "./auth"
import { frequencyEnum } from "./enums"

export const incomeTypeEnum = pgEnum("income_type", [
  "salary",
  "freelance",
  "rental",
  "business",
  "other",
])

export const income = pgTable(
  "income",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: incomeTypeEnum("type").notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    frequency: frequencyEnum("frequency").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    recurringFrequency: frequencyEnum("recurring_frequency"),
    recurringDay: integer("recurring_day"),
    recurringEndDate: date("recurring_end_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("income_userId_idx").on(table.userId),
    index("income_userId_type_idx").on(table.userId, table.type),
  ],
)
