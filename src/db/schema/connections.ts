import { pgTable, pgEnum, text, timestamp, index, unique } from "drizzle-orm/pg-core"

import { users } from "./auth"

export const connectionStatusEnum = pgEnum("connection_status", [
  "pending",
  "accepted",
  "rejected",
])

export const permissionCategoryEnum = pgEnum("permission_category", [
  "income",
  "expense",
  "investment",
  "loan",
])

export const connections = pgTable(
  "connections",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: connectionStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("connections_requesterId_idx").on(table.requesterId),
    index("connections_receiverId_idx").on(table.receiverId),
  ],
)

export const connectionPermissions = pgTable(
  "connection_permissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    connectionId: text("connection_id")
      .notNull()
      .references(() => connections.id, { onDelete: "cascade" }),
    category: permissionCategoryEnum("category").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("connection_permissions_connectionId_idx").on(table.connectionId),
    unique("connection_permissions_unique_idx").on(
      table.connectionId,
      table.category,
    ),
  ],
)
