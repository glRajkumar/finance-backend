import { Hono } from "hono"
import { zValidator as zv } from "@hono/zod-validator"

import type { AppEnv } from "../types/hono"
import * as loansController from "../controllers/loans"
import {
  createLoanSchema,
  updateLoanSchema,
  listLoansSchema,
  createRepaymentSchema,
} from "../validations/loans"

const loansRouter = new Hono<AppEnv>()

loansRouter.get("/", zv("query", listLoansSchema), loansController.list)
loansRouter.post("/", zv("json", createLoanSchema), loansController.create)
loansRouter.put("/:id", zv("json", updateLoanSchema), loansController.update)
loansRouter.delete("/:id", loansController.remove)
loansRouter.get("/:id/repayments", loansController.listRepayments)
loansRouter.post("/:id/repayments", zv("json", createRepaymentSchema), loansController.createRepayment)

export { loansRouter }
