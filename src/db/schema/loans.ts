import { pgTable, pgEnum, text, timestamp, boolean, integer, numeric, date, index } from "drizzle-orm/pg-core"

import { users } from "./auth"
import { frequencyEnum, interestTypeEnum } from "./enums"

export const loanTypeEnum = pgEnum("loan_type", ["lent", "borrowed"])

export const loans = pgTable(
  "loans",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: loanTypeEnum("type").notNull(),
    personName: text("person_name").notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    interestRate: numeric("interest_rate", { precision: 5, scale: 2 }),
    interestType: interestTypeEnum("interest_type").notNull().default("none"),
    startDate: date("start_date").notNull(),
    dueDate: date("due_date"),
    isSettled: boolean("is_settled").notNull().default(false),
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
    index("loans_userId_idx").on(table.userId),
    index("loans_userId_type_idx").on(table.userId, table.type),
  ],
)

export const loanRepayments = pgTable(
  "loan_repayments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    loanId: text("loan_id")
      .notNull()
      .references(() => loans.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    paidAt: date("paid_at").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("loan_repayments_loanId_idx").on(table.loanId)],
)
