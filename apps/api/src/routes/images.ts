import { Router } from 'express'
import { z } from 'zod'

import { getBrandedJobImage } from '../services/branding.service.js'

const brandedImageParamsSchema = z.object({
  jobId: z.string().uuid('jobId must be a valid UUID'),
})

export const imagesRouter = Router()

imagesRouter.get('/branded/:jobId', async (request, response, next) => {
  try {
    const params = brandedImageParamsSchema.parse(request.params)
    const result = await getBrandedJobImage(params.jobId)

    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    response.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=300')

    if (result.kind === 'redirect') {
      response.redirect(302, result.url)
      return
    }

    response.setHeader('Content-Type', result.contentType)
    response.status(200).send(result.buffer)
  } catch (error) {
    next(error)
  }
})
