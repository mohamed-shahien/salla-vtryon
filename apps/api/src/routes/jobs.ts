import { Router } from 'express'
import { z } from 'zod'

import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import {
  createMerchantTryOnJob,
  getMerchantJobById,
  getMerchantRoiStats,
  listMerchantJobs,
  TRYON_CATEGORIES,
  TRYON_JOB_STATUSES,
} from '../services/jobs.service.js'
import { AppError } from '../utils/app-error.js'

const createJobBodySchema = z.object({
  user_image_url: z.string().url('user_image_url must be a valid URL'),
  product_image_url: z.string().url('product_image_url must be a valid URL'),
  product_id: z.string().min(1, 'product_id is required'),
  category: z.enum(TRYON_CATEGORIES).default('upper_body'),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const jobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(TRYON_JOB_STATUSES).optional(),
})

const jobParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
})

export const jobsRouter = Router()

jobsRouter.get(
  '/stats/roi',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const stats = await getMerchantRoiStats(request.dashboardSession.merchant_uuid)

      response.status(200).json({
        ok: true,
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  },
)

jobsRouter.post(
  '/',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const body = createJobBodySchema.parse(request.body)
      const job = await createMerchantTryOnJob({
        merchantId: request.dashboardSession.merchant_uuid,
        userImageUrl: body.user_image_url,
        productImageUrl: body.product_image_url,
        productId: body.product_id,
        category: body.category,
        metadata: body.metadata,
      })

      response.status(201).json({
        ok: true,
        data: job,
      })
    } catch (error) {
      next(error)
    }
  },
)

jobsRouter.get(
  '/',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const query = jobsQuerySchema.parse(request.query)
      const payload = await listMerchantJobs(request.dashboardSession.merchant_uuid, query)

      response.status(200).json({
        ok: true,
        data: payload.jobs,
        pagination: payload.pagination,
      })
    } catch (error) {
      next(error)
    }
  },
)

jobsRouter.get(
  '/:id',
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      const params = jobParamsSchema.parse(request.params)
      const job = await getMerchantJobById(request.dashboardSession.merchant_uuid, params.id)

      response.status(200).json({
        ok: true,
        data: job,
      })
    } catch (error) {
      next(error)
    }
  },
)
