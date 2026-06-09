import type { Context } from "hono"
import { eq, and, or } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { users } from "../db/schema/auth"
import { connections, connectionPermissions } from "../db/schema/connections"
import type { CreateConnection, UpdateConnection, UpdatePermissions } from "../validations/connections"

export const list = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const { status } = c.req.valid("query") as { status?: string }

  const conditions = [or(eq(connections.requesterId, userId), eq(connections.receiverId, userId))!]

  if (status) conditions.push(eq(connections.status, status as typeof connections.status.dataType))

  const rows = await db
    .select()
    .from(connections)
    .where(and(...conditions))
    .orderBy(connections.createdAt)

  return c.json(rows)
}

export const create = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const { receiverEmail } = c.req.valid("json") as CreateConnection

  const [receiver] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, receiverEmail))

  if (!receiver) return c.json({ message: "User not found" }, 404)
  if (receiver.id === userId) return c.json({ message: "Cannot connect with yourself" }, 400)

  const [existing] = await db
    .select({ id: connections.id })
    .from(connections)
    .where(
      or(
        and(eq(connections.requesterId, userId), eq(connections.receiverId, receiver.id)),
        and(eq(connections.requesterId, receiver.id), eq(connections.receiverId, userId)),
      )!,
    )

  if (existing) return c.json({ message: "Connection already exists" }, 400)

  const [row] = await db
    .insert(connections)
    .values({ requesterId: userId, receiverId: receiver.id })
    .returning()

  return c.json(row, 201)
}

export const updateStatus = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")
  const { status } = c.req.valid("json") as UpdateConnection

  const [conn] = await db
    .select()
    .from(connections)
    .where(and(eq(connections.id, id), eq(connections.receiverId, userId)))

  if (!conn) return c.json({ message: "Not found" }, 404)

  const [row] = await db
    .update(connections)
    .set({ status })
    .where(eq(connections.id, id))
    .returning()

  return c.json(row)
}

export const remove = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")

  const [row] = await db
    .delete(connections)
    .where(
      and(
        eq(connections.id, id),
        or(eq(connections.requesterId, userId), eq(connections.receiverId, userId))!,
      ),
    )
    .returning({ id: connections.id })

  if (!row) return c.json({ message: "Not found" }, 404)
  return c.json({ message: "Deleted" })
}

export const updatePermissions = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")
  const { categories } = c.req.valid("json") as UpdatePermissions

  const [conn] = await db
    .select()
    .from(connections)
    .where(
      and(
        eq(connections.id, id),
        eq(connections.status, "accepted"),
        or(eq(connections.requesterId, userId), eq(connections.receiverId, userId))!,
      ),
    )

  if (!conn) return c.json({ message: "Not found or not accepted" }, 404)

  await db.delete(connectionPermissions).where(eq(connectionPermissions.connectionId, id))

  if (categories.length > 0) {
    await db.insert(connectionPermissions).values(
      categories.map((category) => ({ connectionId: id, category })),
    )
  }

  const perms = await db
    .select()
    .from(connectionPermissions)
    .where(eq(connectionPermissions.connectionId, id))

  return c.json(perms)
}

export const getPermissions = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const id = c.req.param("id")

  const [conn] = await db
    .select()
    .from(connections)
    .where(
      and(
        eq(connections.id, id),
        or(eq(connections.requesterId, userId), eq(connections.receiverId, userId))!,
      ),
    )

  if (!conn) return c.json({ message: "Not found" }, 404)

  const perms = await db
    .select()
    .from(connectionPermissions)
    .where(eq(connectionPermissions.connectionId, id))

  return c.json(perms)
}
