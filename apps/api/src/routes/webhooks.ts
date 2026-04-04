import express, { Router } from 'express'

import { processSallaWebhook } from '../services/salla-webhooks.service.js'

export const webhookRouter = Router()

webhookRouter.post(
  '/salla',
  express.raw({ type: 'application/json', limit: '1mb' }),
  async (request, response, next) => {
    try {
      const rawBody = Buffer.isBuffer(request.body)
        ? request.body
        : Buffer.from(request.body ?? '', 'utf8')

      const result = await processSallaWebhook(rawBody, request.headers['x-salla-signature'])

      response.status(200).json({
        ok: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },
)
