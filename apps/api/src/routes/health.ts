import { Router } from 'express'

import { getConfigReadiness } from '../config/readiness.js'

export const healthRouter = Router()

healthRouter.get('/', (_request, response) => {
  response.status(200).json({
    ok: true,
    phase: 'Phase 1 - Salla External OAuth Integration',
    service: 'api',
    timestamp: new Date().toISOString(),
    readiness: getConfigReadiness(),
  })
})
