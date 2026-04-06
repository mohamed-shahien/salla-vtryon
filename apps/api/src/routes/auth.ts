import { Router } from 'express'
import { z } from 'zod'

import { authLimiter } from '../middleware/rate-limit.js'
import {
  requireDashboardSession,
  type DashboardAuthenticatedRequest,
} from '../middleware/require-dashboard-session.js'
import { authService } from '../services/auth.service.js'
import * as emailService from '../services/email.service.js'
import {
  clearDashboardSessionCookie,
  consumeDashboardAuthHandoff,
  consumeOauthState,
  createDashboardAuthHandoff,
  createDashboardSession,
  createOauthState,
  setDashboardSessionCookie,
  type DashboardSessionPayload,
} from '../services/dashboard-session.service.js'
import {
  ensureMerchantRecord,
  getDashboardMerchantProfile,
  storeMerchantOauthTokens,
} from '../services/merchant.service.js'
import {
  buildSallaAuthorizationUrl,
  exchangeAuthorizationCode,
  fetchMerchantUserInfo,
  fetchMerchantUserInfoForMerchant,
} from '../services/salla-api.service.js'
import { AppError } from '../utils/app-error.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const setPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100),
})

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
})

const verifyRequestSchema = z.object({
  handoff: z.string().min(1, 'handoff is required'),
})

const callbackQuerySchema = z.object({
  code: z.string().min(1, 'code is required'),
  state: z.string().min(1, 'state is required'),
})

export const authRouter = Router()

async function buildDashboardIdentity(session: DashboardSessionPayload) {
  const profile = await getDashboardMerchantProfile(session.merchant_uuid, session.local_user_id)

  let sallaProfile: Awaited<ReturnType<typeof fetchMerchantUserInfoForMerchant>> | null = null

  try {
    sallaProfile = await fetchMerchantUserInfoForMerchant(session.merchant_id)
  } catch (error) {
    console.warn(
      '[api] failed to fetch live Salla profile for dashboard identity snapshot',
      error,
    )
  }

  return {
    ...session,
    user: {
      id: session.local_user_id,
      email: profile.user?.email,
      full_name: profile.user?.full_name,
    },
    merchant: profile.merchant,
    credits: profile.credits,
    salla_profile: sallaProfile,
  }
}

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

    // Ensure local user exists and is linked
    const user = await authService.ensureMerchantUserLink({
      merchantId: merchant.id,
      email: userInfo.email ?? '', // Salla user email
      name: userInfo.name ?? merchant.store_name ?? 'Merchant',
    })

    const session = createDashboardSession({
      merchantUuid: merchant.id,
      merchantId: userInfo.merchant.id,
      userId: userInfo.id ?? null,
      localUserId: user.id,
      storeName: merchant.store_name ?? 'Store',
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
      data: await buildDashboardIdentity(session),
    })
  } catch (error) {
    next(error)
  }
})

authRouter.get(
  '/me',
  authLimiter,
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response) => {
    if (!request.dashboardSession) {
      throw new AppError('Dashboard session context is missing.', 401, 'DASHBOARD_AUTH_REQUIRED')
    }

    response.status(200).json({
      ok: true,
      data: await buildDashboardIdentity(request.dashboardSession),
    })
  },
)

authRouter.post('/logout', authLimiter, (_request, response) => {
  clearDashboardSessionCookie(response)

  response.status(200).json({
    ok: true,
  })
})

/**
 * Local Login
 */
authRouter.post('/login', authLimiter, async (request, response, next) => {
  try {
    const { email, password } = loginSchema.parse(request.body)
    const { user, merchant } = await authService.login(email, password)

    const session = createDashboardSession({
      merchantUuid: merchant.id,
      merchantId: merchant.salla_merchant_id,
      userId: null, // This is a local login, so we don't have a Salla user ID in context
      localUserId: user.id,
      storeName: merchant.store_name,
    })

    setDashboardSessionCookie(response, session)

    response.status(200).json({
      ok: true,
      data: await buildDashboardIdentity(session),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Forgot Password
 */
authRouter.post('/forgot-password', authLimiter, async (request, response, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(request.body)
    await authService.forgotPassword(email)

    response.status(200).json({
      ok: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Set Initial Password (from welcome email)
 */
authRouter.post('/set-password', authLimiter, async (request, response, next) => {
  try {
    const { token, password } = setPasswordSchema.parse(request.body)
    const user = await authService.setPassword(token, password)
    await emailService.sendPasswordChangedNotification(user.email)

    response.status(200).json({
      ok: true,
      message: 'Password set successfully. You can now log in.',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Reset Password
 */
authRouter.post('/reset-password', authLimiter, async (request, response, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(request.body)
    await authService.resetPassword(token, password)

    response.status(200).json({
      ok: true,
      message: 'Password reset successfully. You can now log in.',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Update Profile
 */
authRouter.patch(
  '/profile',
  authLimiter,
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      const { full_name } = updateProfileSchema.parse(request.body)
      const user = await authService.updateProfile(request.dashboardSession!.local_user_id!, {
        full_name,
      })

      response.status(200).json({
        ok: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * Change Password
 */
authRouter.post(
  '/change-password',
  authLimiter,
  requireDashboardSession,
  async (request: DashboardAuthenticatedRequest, response, next) => {
    try {
      const { current_password, new_password } = changePasswordSchema.parse(request.body)
      await authService.changePassword(
        request.dashboardSession!.local_user_id!,
        current_password,
        new_password,
      )

      response.status(200).json({
        ok: true,
        message: 'Password updated successfully.',
      })
    } catch (error) {
      next(error)
    }
  },
)
