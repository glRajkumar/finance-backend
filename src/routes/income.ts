import { Hono } from "hono"
import { zValidator as zv } from "@hono/zod-validator"

import type { AppEnv } from "../types/hono"
import * as incomeController from "../controllers/income"
import { createIncomeSchema, updateIncomeSchema, listIncomeSchema } from "../validations/income"

const incomeRouter = new Hono<AppEnv>()

incomeRouter.get("/", zv("query", listIncomeSchema), incomeController.list)
incomeRouter.post("/", zv("json", createIncomeSchema), incomeController.create)
incomeRouter.put("/:id", zv("json", updateIncomeSchema), incomeController.update)
incomeRouter.delete("/:id", incomeController.remove)

export { incomeRouter }
