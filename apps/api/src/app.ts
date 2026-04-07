import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import compression from 'compression'
import cookieParser from 'cookie-parser'
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

const __dirname = dirname(fileURLToPath(import.meta.url))
const widgetDistPath = resolve(__dirname, '../../widget/dist')

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

  app.use(
    helmet({
      frameguard: false,
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Crucial for widget.js
    }),
  )
  app.use(cookieParser())

  // Helmet sets Cross-Origin-Resource-Policy: same-origin globally.
  // Widget routes are loaded by Salla storefronts (cross-origin) — override it here,
  // after Helmet runs, so the correct header reaches the browser.
  app.use((request, response, next) => {
    if (request.path.startsWith('/api/widget') || request.path === '/widget.js') {
      response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    }
    next()
  })

  app.use((request, response, next) => {
    if (request.path.startsWith('/api/widget') || request.path === '/widget.js') {
      return widgetCors(request, response, next)
    }

    dashboardCors(request, response, next)
  })
  app.use(compression())
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

  // Serve the compiled widget bundle — must be reachable cross-origin by Salla storefronts
  const widgetFilePath = resolve(widgetDistPath, 'widget.js')

  app.get('/widget.js', (_req, res) => {
    // Override Helmet's same-origin CORP so Salla storefronts can load this script cross-origin
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.setHeader(
      'Cache-Control',
      env.NODE_ENV === 'production'
        ? 'public, max-age=300, stale-while-revalidate=60'
        : 'no-store',
    )
    res.sendFile(widgetFilePath)
  })

  app.use('/webhooks', webhookRouter)
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use('/api/widget', widgetRouter)
  app.use(apiLimiter)

  app.use('/api/auth', authRouter)
  app.use('/api/credits', creditsRouter)
  app.use('/api/jobs', jobsRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/health', healthRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
