import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'
import { apiLimiter } from './middleware/rate-limit.js'
import { authRouter } from './routes/auth.js'
import { healthRouter } from './routes/health.js'
import { webhookRouter } from './routes/webhooks.js'

const allowedOrigins = [env.APP_URL, env.DASHBOARD_URL].filter(Boolean)

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      credentials: true,
    }),
  )
  app.use(compression())
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
  app.use('/webhooks', webhookRouter)
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(apiLimiter)

  app.use('/api/auth', authRouter)
  app.use('/health', healthRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
