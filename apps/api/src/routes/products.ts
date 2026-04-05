import { Router } from 'express'
import { z } from 'zod'

import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import {
  getMerchantProductDetail,
  getMerchantProductsPage,
} from '../services/products.service.js'
import { AppError } from '../utils/app-error.js'

const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
})

const productParamsSchema = z.object({
  id: z.string().min(1, 'product id is required'),
})

export const productsRouter = Router()

productsRouter.get(
  '/',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const query = productsQuerySchema.parse(request.query)
      const payload = await getMerchantProductsPage(request.dashboardSession.merchant_id, query.page)

      response.status(200).json({
        ok: true,
        data: payload.data,
        pagination: payload.pagination ?? null,
      })
    } catch (error) {
      next(error)
    }
  },
)

productsRouter.get(
  '/:id',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const params = productParamsSchema.parse(request.params)
      const payload = await getMerchantProductDetail(
        request.dashboardSession.merchant_id,
        params.id,
      )

      response.status(200).json({
        ok: true,
        data: payload.data,
      })
    } catch (error) {
      next(error)
    }
  },
)
