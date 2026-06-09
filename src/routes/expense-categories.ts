import { Hono } from "hono"
import { zValidator as zv } from "@hono/zod-validator"

import type { AppEnv } from "../types/hono"
import * as categoryController from "../controllers/expense-categories"
import { createCategorySchema, updateCategorySchema } from "../validations/expenses"

const expenseCategoriesRouter = new Hono<AppEnv>()

expenseCategoriesRouter.get("/", categoryController.list)
expenseCategoriesRouter.post("/", zv("json", createCategorySchema), categoryController.create)
expenseCategoriesRouter.put("/:id", zv("json", updateCategorySchema), categoryController.update)
expenseCategoriesRouter.delete("/:id", categoryController.remove)

export { expenseCategoriesRouter }
