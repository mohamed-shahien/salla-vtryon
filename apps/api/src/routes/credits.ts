import { Router } from 'express'
import { z } from 'zod'

import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import { getMerchantCreditsSummary } from '../services/credits.service.js'
import { AppError } from '../utils/app-error.js'

const creditsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const creditsRouter = Router()

creditsRouter.get(
  '/',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const query = creditsQuerySchema.parse(request.query)
      const summary = await getMerchantCreditsSummary(
        request.dashboardSession.merchant_uuid,
        query.limit,
      )

      response.status(200).json({
        ok: true,
        data: summary,
      })
    } catch (error) {
      next(error)
    }
  },
)
