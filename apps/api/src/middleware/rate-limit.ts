import { rateLimit } from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10000, // Effectively disabled for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests for the current API surface.',
  },
})

export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10000,
  standardHeaders: true,
  legacyHeaders: false,
})

export const widgetConfigLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10000,
  standardHeaders: true,
  legacyHeaders: false,
})

export const widgetJobCreateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many try-on requests. Please wait a minute before trying again.',
  },
})

export const widgetJobPollLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10000,
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
