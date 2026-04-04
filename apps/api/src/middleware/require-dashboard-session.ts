import type { NextFunction, Request, Response } from 'express'

import { readDashboardSession } from '../services/dashboard-session.service.js'

export interface DashboardAuthenticatedRequest extends Request {
  dashboardSession?: ReturnType<typeof readDashboardSession>
}

export function requireDashboardSession(
  request: DashboardAuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  const session = readDashboardSession(request.headers.cookie)

  if (!session) {
    response.status(401).json({
      error: 'DASHBOARD_AUTH_REQUIRED',
      message: 'A valid dashboard session is required.',
    })
    return
  }

  request.dashboardSession = session
  next()
}
