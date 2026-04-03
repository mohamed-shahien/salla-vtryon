import type { NextFunction, Request, Response } from 'express'

export function notFoundHandler(_request: Request, response: Response) {
  response.status(404).json({
    error: 'NOT_FOUND',
    message: 'The requested Phase 0 endpoint does not exist.',
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

  response.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected server error.',
  })
}
