import multer from 'multer'
import { Router } from 'express'
import { z } from 'zod'

import { env } from '../config/env.js'
import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import {
  apiLimiter,
} from '../middleware/rate-limit.js'
import {
  getMerchantWidgetSettings,
  updateMerchantWidgetSettings,
} from '../services/merchant.service.js'
import { TRYON_CATEGORIES } from '../services/jobs.service.js'
import { createWidgetTryOnJob, getWidgetConfig, getWidgetJob } from '../services/widget.service.js'
import { AppError } from '../utils/app-error.js'
import {
  widgetSettingsSchema,
  createDefaultWidgetSettings,
  type WidgetSettings,
} from '@virtual-tryon/shared-types'

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
  pageSlug: z.string().trim().min(1).optional(),
})

const widgetJobParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

const widgetSettingsUpdateSchema = widgetSettingsSchema.partial()

type WidgetSettingsInput = z.infer<typeof widgetSettingsSchema>

const widgetJobBodySchema = z.object({
  product_image_url: z.string().url().optional(),
  request_id: z.string().trim().min(1).max(100).optional(),
  customer_id: z.string().trim().min(1).max(100).optional(),
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

widgetRouter.get('/config/:merchantId', async (request, response, next) => {
  try {
    const params = widgetConfigParamsSchema.parse(request.params)
    const query = widgetConfigQuerySchema.parse(request.query)
    const config = await getWidgetConfig(params.merchantId, query.productId, query.pageSlug)

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

      // Validate full settings object
      const settingsInput = widgetSettingsSchema.parse(request.body) as WidgetSettings

      const settings = await updateMerchantWidgetSettings(
        request.dashboardSession.merchant_uuid,
        settingsInput,
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

widgetRouter.get(
  '/embed-script',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const publicApiUrl = (env.API_URL ?? '').replace(/\/$/, '')

      if (!publicApiUrl) {
        throw new AppError(
          'API_URL is not configured. Set it in your environment to generate the embed script.',
          500,
          'CONFIGURATION_ERROR',
        )
      }

      const merchantId = request.dashboardSession.merchant_id
      const scriptSrc = `${publicApiUrl}/widget.js`
      const scriptTag = `<script src="${scriptSrc}" data-merchant-id="${merchantId}" data-api-url="${publicApiUrl}" defer></script>`

      response.status(200).json({
        ok: true,
        data: {
          merchant_id: merchantId,
          api_url: publicApiUrl,
          script_src: scriptSrc,
          script_tag: scriptTag,
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

widgetRouter.post(
  '/job',
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
        productImageUrl: body.product_image_url,
        requestId: body.request_id,
        customerId: body.customer_id,
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

widgetRouter.get('/job/:id', async (request, response, next) => {
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
