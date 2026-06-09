import { Hono } from "hono"
import { zValidator as zv } from "@hono/zod-validator"

import type { AppEnv } from "../types/hono"
import * as investmentsController from "../controllers/investments"
import { createInvestmentSchema, updateInvestmentSchema, listInvestmentsSchema } from "../validations/investments"

const investmentsRouter = new Hono<AppEnv>()

investmentsRouter.get("/", zv("query", listInvestmentsSchema), investmentsController.list)
investmentsRouter.post("/", zv("json", createInvestmentSchema), investmentsController.create)
investmentsRouter.put("/:id", zv("json", updateInvestmentSchema), investmentsController.update)
investmentsRouter.delete("/:id", investmentsController.remove)

export { investmentsRouter }
