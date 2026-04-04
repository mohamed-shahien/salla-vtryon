export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode = 500,
    readonly code = 'APP_ERROR',
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function isErrorWithStatusCode(
  error: unknown,
): error is Error & { statusCode: number; code?: string; details?: unknown } {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  )
}
