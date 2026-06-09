import { Hono } from "hono"
import { zValidator as zv } from "@hono/zod-validator"

import type { AppEnv } from "../types/hono"
import * as connectionsController from "../controllers/connections"
import {
  createConnectionSchema,
  updateConnectionSchema,
  updatePermissionsSchema,
  listConnectionsSchema,
} from "../validations/connections"

const connectionsRouter = new Hono<AppEnv>()

connectionsRouter.get("/", zv("query", listConnectionsSchema), connectionsController.list)
connectionsRouter.post("/", zv("json", createConnectionSchema), connectionsController.create)
connectionsRouter.patch("/:id", zv("json", updateConnectionSchema), connectionsController.updateStatus)
connectionsRouter.delete("/:id", connectionsController.remove)
connectionsRouter.get("/:id/permissions", connectionsController.getPermissions)
connectionsRouter.put("/:id/permissions", zv("json", updatePermissionsSchema), connectionsController.updatePermissions)

export { connectionsRouter }
