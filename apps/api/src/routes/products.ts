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
import {
  getMerchantWidgetSettings,
  updateMerchantWidgetSettings,
} from '../services/merchant.service.js'
import { AppError } from '../utils/app-error.js'

const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
})

const productParamsSchema = z.object({
  id: z.string().min(1, 'product id is required'),
})

const productIdsBodySchema = z.object({
  product_ids: z.array(z.coerce.number().int().positive()).min(1).max(500),
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

// POST /api/products/enable — add product IDs to the selected list and switch to selected mode
productsRouter.post(
  '/enable',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const body = productIdsBodySchema.parse(request.body)
      const merchantId = request.dashboardSession.merchant_uuid
      const current = await getMerchantWidgetSettings(merchantId)

      const merged = Array.from(new Set([...current.widget_products, ...body.product_ids]))

      const settings = await updateMerchantWidgetSettings(merchantId, {
        widget_products: merged,
        widget_mode: 'selected',
      })

      response.status(200).json({ ok: true, data: settings })
    } catch (error) {
      next(error)
    }
  },
)

// POST /api/products/disable — remove product IDs from the selected list
productsRouter.post(
  '/disable',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const body = productIdsBodySchema.parse(request.body)
      const merchantId = request.dashboardSession.merchant_uuid
      const current = await getMerchantWidgetSettings(merchantId)

      const disableSet = new Set(body.product_ids)
      const remaining = current.widget_products.filter((id) => !disableSet.has(id))

      const settings = await updateMerchantWidgetSettings(merchantId, {
        widget_products: remaining,
      })

      response.status(200).json({ ok: true, data: settings })
    } catch (error) {
      next(error)
    }
  },
)
