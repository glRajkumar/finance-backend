import type { Context } from "hono"
import { eq } from "drizzle-orm"

import type { AppEnv } from "../types/hono"
import { db } from "../lib/db"
import { profile } from "../db/schema/profile"
import type { UpdateProfile } from "../validations/profile"

export const get = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")

  const [row] = await db.select().from(profile).where(eq(profile.userId, userId))

  if (!row) {
    const [created] = await db
      .insert(profile)
      .values({ userId, currency: "INR", otherCurrencies: [] })
      .returning()
    return c.json(created)
  }

  return c.json(row)
}

export const update = async (c: Context<AppEnv>) => {
  const userId = c.get("userId")
  const body = c.req.valid("json") as UpdateProfile

  const [existing] = await db.select().from(profile).where(eq(profile.userId, userId))

  if (!existing) {
    const [created] = await db
      .insert(profile)
      .values({ userId, currency: "INR", otherCurrencies: [], ...body })
      .returning()
    return c.json(created)
  }

  const [updated] = await db
    .update(profile)
    .set(body)
    .where(eq(profile.userId, userId))
    .returning()

  return c.json(updated)
}
