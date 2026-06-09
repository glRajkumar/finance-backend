import { Hono } from "hono"
import { zValidator as zv } from "@hono/zod-validator"

import type { AppEnv } from "../types/hono"
import * as expensesController from "../controllers/expenses"
import { createExpenseSchema, updateExpenseSchema, listExpensesSchema } from "../validations/expenses"

const expensesRouter = new Hono<AppEnv>()

expensesRouter.get("/", zv("query", listExpensesSchema), expensesController.list)
expensesRouter.post("/", zv("json", createExpenseSchema), expensesController.create)
expensesRouter.put("/:id", zv("json", updateExpenseSchema), expensesController.update)
expensesRouter.delete("/:id", expensesController.remove)

export { expensesRouter }
