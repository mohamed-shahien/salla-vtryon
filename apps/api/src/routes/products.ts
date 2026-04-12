import { Router } from 'express'
import { z } from 'zod'

import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import {
  extractSallaProductCategoryIds,
  getMerchantCategoriesPage,
  getMerchantProductDetail,
  getMerchantProductsPage,
} from '../services/products.service.js'
import { SallaProduct } from '../services/salla-api.service.js'
import {
  getMerchantProductRules,
  getMerchantWidgetSettings,
  updateMerchantProductRules,
  updateMerchantWidgetSettings,
} from '../services/merchant.service.js'
import { AppError } from '../utils/app-error.js'
import { productsLimiter } from '../middleware/rate-limit.js'

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
      const merchantId = request.dashboardSession.merchant_id
      const merchantUuid = request.dashboardSession.merchant_uuid

      const [payload, rules, settings] = await Promise.all([
        getMerchantProductsPage(merchantId, query.page),
        getMerchantProductRules(merchantUuid),
        getMerchantWidgetSettings(merchantUuid),
      ])

      const rulesMap = new Map(rules.map((r) => [r.product_id, r.enabled]))
      const legacyEnabled = new Set(settings.display_rules.selected_product_ids)
      const selectedCategoryIds = new Set(settings.display_rules.selected_category_ids)

      const productsWithStatus = payload.data.map((product: SallaProduct) => {
        const productId = product.id
        const categoryIds = extractSallaProductCategoryIds(product)
        const rule = rulesMap.get(productId)
        let enabled = rule ?? false

        if (rule === false) {
          enabled = false
        } else if (settings.display_rules.eligibility_mode === 'all') {
          enabled = true
        } else if (settings.display_rules.eligibility_mode === 'selected') {
          enabled = rule ?? legacyEnabled.has(productId)
        } else if (settings.display_rules.eligibility_mode === 'selected-categories') {
          enabled = rule === true || categoryIds.some((categoryId) => selectedCategoryIds.has(categoryId))
        }

        return {
          ...product,
          category_ids: categoryIds,
          widget_enabled: enabled,
        }
      })

      response.status(200).json({
        ok: true,
        data: productsWithStatus,
        pagination: payload.pagination ?? null,
      })
    } catch (error) {
      next(error)
    }
  },
)

productsRouter.get(
  '/categories',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const query = productsQuerySchema.parse(request.query)
      const payload = await getMerchantCategoriesPage(request.dashboardSession.merchant_id, query.page)

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

// POST /api/products/enable — batch enable products
productsRouter.post(
  '/enable',
  productsLimiter,
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const body = productIdsBodySchema.parse(request.body)
      const merchantUuid = request.dashboardSession.merchant_uuid

      await updateMerchantProductRules(merchantUuid, body.product_ids, true)

      // Automatically ensure widget is enabled and in selected mode if merchant is activating products
      const settings = await updateMerchantWidgetSettings(merchantUuid, {
        widget_enabled: true,
        display_rules: {
          eligibility_mode: 'selected',
        },
      })

      response.status(200).json({ ok: true, data: settings })
    } catch (error) {
      next(error)
    }
  },
)

// POST /api/products/disable — batch disable products
productsRouter.post(
  '/disable',
  productsLimiter,
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const body = productIdsBodySchema.parse(request.body)
      const merchantUuid = request.dashboardSession.merchant_uuid

      await updateMerchantProductRules(merchantUuid, body.product_ids, false)

      // Ensure widget is in selected mode so the disable takes effect for these products
      const settings = await updateMerchantWidgetSettings(merchantUuid, {
        display_rules: {
          eligibility_mode: 'selected',
        },
      })

      response.status(200).json({ ok: true, data: settings })
    } catch (error) {
      next(error)
    }
  },
)
