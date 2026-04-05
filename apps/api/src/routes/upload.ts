import multer from 'multer'
import { Router } from 'express'

import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import { processAndUploadMerchantImage } from '../services/upload.service.js'
import { AppError } from '../utils/app-error.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
})

export const uploadRouter = Router()

uploadRouter.post(
  '/',
  requireDashboardSession,
  upload.single('file'),
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      if (!request.dashboardSession) {
        throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
      }

      if (!request.file?.buffer) {
        throw new AppError(
          'A multipart form-data image file is required in the `file` field.',
          400,
          'FILE_REQUIRED',
        )
      }

      const uploadResult = await processAndUploadMerchantImage({
        merchantId: request.dashboardSession.merchant_id,
        buffer: request.file.buffer,
      })

      response.status(201).json({
        ok: true,
        data: uploadResult,
      })
    } catch (error) {
      next(error)
    }
  },
)
