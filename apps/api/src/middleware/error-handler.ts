import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import { AppError, isErrorWithStatusCode } from '../utils/app-error.js'

export function notFoundHandler(_request: Request, response: Response) {
  response.status(404).json({
    error: 'NOT_FOUND',
    message: 'The requested endpoint does not exist.',
  })
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  void next
  console.error('[api] unhandled error', error)

  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed.',
      details: error.flatten(),
    })
    return
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    })
    return
  }

  if (isErrorWithStatusCode(error)) {
    response.status(error.statusCode).json({
      error: error.code ?? 'REQUEST_FAILED',
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    })
    return
  }

  response.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected server error.',
  })
}
