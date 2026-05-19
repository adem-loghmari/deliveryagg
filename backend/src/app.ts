import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRouter from './routes/auth'
import businessesRouter from './routes/businesses'
import ordersRouter from './routes/orders'
import invoicesRouter from './routes/invoices'
import dashboardRouter from './routes/dashboard'
import webhooksRouter from './routes/webhooks'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/businesses', businessesRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/invoices', invoicesRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/webhooks/agency', webhooksRouter)

export default app
