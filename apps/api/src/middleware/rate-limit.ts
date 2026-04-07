import { rateLimit } from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests for the current API surface.',
  },
})

export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

export const widgetConfigLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,             // config lookups — one per page load
  standardHeaders: true,
  legacyHeaders: false,
})

export const widgetJobCreateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,             // job creation — expensive, keep strict
  standardHeaders: true,
  legacyHeaders: false,
})

export const widgetJobPollLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,            // job status polling — widget polls every 2-3 sec during processing
  standardHeaders: true,
  legacyHeaders: false,
})

export const productsLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30, // 30 operations per minute per merchant
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many product management actions. Please wait a minute.',
  },
})
