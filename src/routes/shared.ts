import { Hono } from "hono"

import type { AppEnv } from "../types/hono"
import * as sharedController from "../controllers/shared"

const sharedRouter = new Hono<AppEnv>()

sharedRouter.get("/:userId", sharedController.get)

export { sharedRouter }
