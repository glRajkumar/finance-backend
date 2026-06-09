import { pgTable, pgEnum, text, timestamp, boolean, integer, numeric, date, index } from "drizzle-orm/pg-core"
import type { AnyPgColumn } from "drizzle-orm/pg-core"

import { users } from "./auth"
import { frequencyEnum, interestTypeEnum } from "./enums"

export const investmentSubtypeEnum = pgEnum("investment_subtype", [
  "sip",
  "fd",
  "gold",
  "silver",
  "bond",
  "crypto",
  "stocks",
  "other",
])

export const compoundFrequencyEnum = pgEnum("compound_frequency", [
  "monthly",
  "quarterly",
  "annual",
])

export const investments = pgTable(
  "investments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subtype: investmentSubtypeEnum("subtype").notNull(),
    name: text("name").notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    startDate: date("start_date").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
    recurringFrequency: frequencyEnum("recurring_frequency"),
    recurringDay: integer("recurring_day"),
    recurringEndDate: date("recurring_end_date"),
    parentInvestmentId: text("parent_investment_id").references(
      (): AnyPgColumn => investments.id,
      { onDelete: "set null" },
    ),
    // physical / quantity-based (gold, silver, crypto, stocks)
    quantity: numeric("quantity", { precision: 15, scale: 6 }),
    unit: text("unit"),
    // institution — bank (fd), issuer (bond), exchange (crypto), broker (stocks), platform (sip)
    institution: text("institution"),
    // interest-bearing (fd, bond)
    interestRate: numeric("interest_rate", { precision: 5, scale: 2 }),
    interestType: interestTypeEnum("interest_type"),
    compoundFrequency: compoundFrequencyEnum("compound_frequency"),
    maturityDate: date("maturity_date"),
    maturityAmount: numeric("maturity_amount", { precision: 15, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("investments_userId_idx").on(table.userId),
    index("investments_userId_subtype_idx").on(table.userId, table.subtype),
  ],
)
