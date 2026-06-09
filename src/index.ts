import { HTTPException } from 'hono/http-exception'
import { secureHeaders } from 'hono/secure-headers'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { Hono } from "hono"

import { requireAuth } from './middlewares/auth'
import { auth } from './lib/auth'
import { env } from './utils/env'

import { authRouter } from './routes/auth'
import { profileRouter } from './routes/profile'
import { incomeRouter } from './routes/income'
import { expenseCategoriesRouter } from './routes/expense-categories'
import { expensesRouter } from './routes/expenses'
import { investmentsRouter } from './routes/investments'
import { loansRouter } from './routes/loans'
import { connectionsRouter } from './routes/connections'
import { dashboardRouter } from './routes/dashboard'
import { sharedRouter } from './routes/shared'

const app = new Hono().basePath("/api")

app.use(logger())
app.use(cors({ origin: env.BETTER_AUTH_URL, credentials: true }))
app.use(secureHeaders())
app.use(compress())

app.get("/health", c => c.json({ status: "ok" }))

app.route("/auth", authRouter)

app.use(requireAuth)

app.route("/profile", profileRouter)
app.route("/income", incomeRouter)
app.route("/expense-categories", expenseCategoriesRouter)
app.route("/expenses", expensesRouter)
app.route("/investments", investmentsRouter)
app.route("/loans", loansRouter)
app.route("/connections", connectionsRouter)
app.route("/dashboard", dashboardRouter)
app.route("/shared", sharedRouter)


app.notFound(c => c.json({ message: 'Route not found' }, 404))

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse()
  console.log(err)
  return c.json({ message: err?.message || "Internal sever eror" }, 500)
})

export default app
