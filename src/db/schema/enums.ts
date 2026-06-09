import { pgEnum } from "drizzle-orm/pg-core"

export const frequencyEnum = pgEnum("frequency", [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "annual",
  "one_time",
])

export const interestTypeEnum = pgEnum("interest_type", [
  "simple",
  "compound",
  "none",
])
