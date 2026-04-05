import multer from 'multer'
import { Router } from 'express'
import { z } from 'zod'

import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import { widgetLimiter } from '../middleware/rate-limit.js'
import {
  getMerchantWidgetSettings,
  updateMerchantWidgetSettings,
} from '../services/merchant.service.js'
import { TRYON_CATEGORIES } from '../services/jobs.service.js'
import { createWidgetTryOnJob, getWidgetConfig, getWidgetJob } from '../services/widget.service.js'
import { AppError } from '../utils/app-error.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
})

const widgetConfigParamsSchema = z.object({
  merchantId: z.coerce.number().int().positive(),
})

const widgetConfigQuerySchema = z.object({
  productId: z.string().trim().min(1).optional(),
})

const widgetJobParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

const widgetSettingsSchema = z.object({
  widget_enabled: z.boolean().optional(),
  widget_mode: z.enum(['all', 'selected']).optional(),
  widget_products: z.array(z.coerce.number().int().positive()).max(500).optional(),
  widget_button_text: z.string().trim().min(1).max(40).optional(),
  default_category: z.enum(TRYON_CATEGORIES).optional(),
})

const widgetJobBodySchema = z.object({
  category: z.enum(TRYON_CATEGORIES).optional(),
  product_image_url: z.string().url().optional(),
})

function getWidgetTokenFromRequest(request: DashboardAuthenticatedRequest) {
  const tokenHeader = request.headers['x-widget-token']
  const tokenValue = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader

  if (!tokenValue || tokenValue.trim().length === 0) {
    throw new AppError('A valid widget token is required.', 401, 'WIDGET_AUTH_REQUIRED')
  }

  return tokenValue.trim()
}

export const widgetRouter = Router()

widgetRouter.get('/config/:merchantId', widgetLimiter, async (request, response, next) => {
  try {
    const params = widgetConfigParamsSchema.parse(request.params)
    const query = widgetConfigQuerySchema.parse(request.query)
    const config = await getWidgetConfig(params.merchantId, query.productId)

    response.status(200).json({
      ok: true,
      data: config,
    })
  } catch (error) {
    next(error)
  }
})

widgetRouter.get(
  '/settings',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const settings = await getMerchantWidgetSettings(request.dashboardSession.merchant_uuid)

      response.status(200).json({
        ok: true,
        data: settings,
      })
    } catch (error) {
      next(error)
    }
  },
)

widgetRouter.put(
  '/settings',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const body = widgetSettingsSchema.parse(request.body)
      const settings = await updateMerchantWidgetSettings(
        request.dashboardSession.merchant_uuid,
        body,
      )

      response.status(200).json({
        ok: true,
        data: settings,
      })
    } catch (error) {
      next(error)
    }
  },
)

widgetRouter.post(
  '/job',
  widgetLimiter,
  upload.single('file'),
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.file?.buffer) {
        throw new AppError(
          'A shopper image file is required in the `file` field.',
          400,
          'FILE_REQUIRED',
        )
      }

      const token = getWidgetTokenFromRequest(request)
      const body = widgetJobBodySchema.parse(request.body)
      const result = await createWidgetTryOnJob({
        token,
        shopperImageBuffer: request.file.buffer,
        category: body.category,
        productImageUrl: body.product_image_url,
      })

      response.status(201).json({
        ok: true,
        data: result.job,
      })
    } catch (error) {
      next(error)
    }
  },
)

widgetRouter.get('/job/:id', widgetLimiter, async (request, response, next) => {
  try {
    const params = widgetJobParamsSchema.parse(request.params)
    const token = getWidgetTokenFromRequest(request as DashboardAuthenticatedRequest)
    const job = await getWidgetJob(token, params.id)

    response.status(200).json({
      ok: true,
      data: job,
    })
  } catch (error) {
    next(error)
  }
})
