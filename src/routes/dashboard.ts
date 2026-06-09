import { Hono } from "hono"

import type { AppEnv } from "../types/hono"
import * as dashboardController from "../controllers/dashboard"

const dashboardRouter = new Hono<AppEnv>()

dashboardRouter.get("/", dashboardController.get)

export { dashboardRouter }
