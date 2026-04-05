import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'
import { apiLimiter } from './middleware/rate-limit.js'
import { authRouter } from './routes/auth.js'
import { creditsRouter } from './routes/credits.js'
import { healthRouter } from './routes/health.js'
import { jobsRouter } from './routes/jobs.js'
import { productsRouter } from './routes/products.js'
import { uploadRouter } from './routes/upload.js'
import { widgetRouter } from './routes/widget.js'
import { webhookRouter } from './routes/webhooks.js'

const allowedOrigins = [env.APP_URL, env.DASHBOARD_URL].filter(Boolean)
const dashboardCors = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true)
      return
    }

    callback(null, allowedOrigins.length === 0 || allowedOrigins.includes(origin))
  },
  credentials: true,
})
const widgetCors = cors({
  origin: true,
  credentials: false,
})

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use((request, response, next) => {
    if (request.path.startsWith('/api/widget')) {
      widgetCors(request, response, next)
      return
    }

    dashboardCors(request, response, next)
  })
  app.use(compression())
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
  app.use('/webhooks', webhookRouter)
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(apiLimiter)

  app.use('/api/auth', authRouter)
  app.use('/api/credits', creditsRouter)
  app.use('/api/jobs', jobsRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/api/widget', widgetRouter)
  app.use('/health', healthRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
