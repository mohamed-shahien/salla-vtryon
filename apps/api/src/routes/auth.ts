import { Router } from 'express'
import { z } from 'zod'

import { authLimiter } from '../middleware/rate-limit.js'
import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import {
  clearDashboardSessionCookie,
  consumeDashboardAuthHandoff,
  consumeOauthState,
  createDashboardAuthHandoff,
  createDashboardSession,
  createOauthState,
  setDashboardSessionCookie,
} from '../services/dashboard-session.service.js'
import { ensureMerchantRecord, storeMerchantOauthTokens } from '../services/merchant.service.js'
import {
  buildSallaAuthorizationUrl,
  exchangeAuthorizationCode,
  fetchMerchantUserInfo,
} from '../services/salla-api.service.js'
import { AppError } from '../utils/app-error.js'

const verifyRequestSchema = z.object({
  handoff: z.string().min(1, 'handoff is required'),
})

const callbackQuerySchema = z.object({
  code: z.string().min(1, 'code is required'),
  state: z.string().min(1, 'state is required'),
})

export const authRouter = Router()

authRouter.get('/salla/start', authLimiter, (request, response, next) => {
  try {
    void request
    const state = createOauthState()
    response.redirect(302, buildSallaAuthorizationUrl(state))
  } catch (error) {
    next(error)
  }
})

authRouter.get('/salla/callback', authLimiter, async (request, response, next) => {
  try {
    const query = callbackQuerySchema.parse(request.query)
    const state = consumeOauthState(query.state)
    const oauthTokens = await exchangeAuthorizationCode(query.code)
    const userInfo = await fetchMerchantUserInfo(oauthTokens.access_token)

    const merchant = await ensureMerchantRecord({
      sallaMerchantId: userInfo.merchant.id,
      storeName: userInfo.merchant.name,
    })

    await storeMerchantOauthTokens({
      sallaMerchantId: userInfo.merchant.id,
      accessToken: oauthTokens.access_token,
      refreshToken: oauthTokens.refresh_token,
      expiresAt: oauthTokens.expires ?? null,
      storeName: userInfo.merchant.name,
    })

    const session = createDashboardSession({
      merchantUuid: merchant.id,
      merchantId: userInfo.merchant.id,
      userId: userInfo.id ?? null,
      storeName: userInfo.merchant.name,
    })

    const handoff = createDashboardAuthHandoff(session)
    const redirectUrl = new URL(`${state.redirectTo}/auth/callback`)
    redirectUrl.searchParams.set('handoff', handoff)

    response.redirect(302, redirectUrl.toString())
  } catch (error) {
    next(error)
  }
})

authRouter.post('/verify', authLimiter, async (request, response, next) => {
  try {
    const body = verifyRequestSchema.parse(request.body)
    const session = consumeDashboardAuthHandoff(body.handoff)

    setDashboardSessionCookie(response, session)
    response.status(200).json({
      ok: true,
      data: session,
    })
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', authLimiter, requireDashboardSession, (request: DashboardAuthenticatedRequest, response) => {
  if (!request.dashboardSession) {
    throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
  }

  response.status(200).json({
    ok: true,
    data: request.dashboardSession,
  })
})

authRouter.post('/logout', authLimiter, (_request, response) => {
  clearDashboardSessionCookie(response)

  response.status(200).json({
    ok: true,
  })
})
