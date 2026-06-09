import { Hono } from "hono"
import { zValidator as zv } from "@hono/zod-validator"

import type { AppEnv } from "../types/hono"
import * as profileController from "../controllers/profile"
import { updateProfileSchema } from "../validations/profile"

const profileRouter = new Hono<AppEnv>()

profileRouter.get("/", profileController.get)
profileRouter.put("/", zv("json", updateProfileSchema), profileController.update)

export { profileRouter }
