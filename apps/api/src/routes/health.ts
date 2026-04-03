import { Router } from 'express'

import { getConfigReadiness } from '../config/readiness.js'

export const healthRouter = Router()

healthRouter.get('/', (_request, response) => {
  response.status(200).json({
    ok: true,
    phase: 'Phase 0 - Project Setup & Infrastructure',
    service: 'api',
    timestamp: new Date().toISOString(),
    readiness: getConfigReadiness(),
  })
})
