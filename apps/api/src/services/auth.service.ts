import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { supabase } from '../config/clients.js'
import * as emailService from './email.service.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'

export class AuthService {
  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  }

  /**
   * Compare a password with its hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Ensure a merchant user exists and is linked to the merchant
   */
  async ensureMerchantUserLink({
    merchantId,
    email,
    name,
  }: {
    merchantId: string
    email: string
    name: string
  }) {
    if (!supabase) throw new AppError('Database client not initialized', 500)

    // 1. Check if user already exists
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (userError && userError.code !== 'PGRST116') {
      throw userError
    }

    // 2. If user doesn't exist, create them
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          name,
          role: 'merchant',
        })
        .select()
        .single()

      if (createError) throw createError
      user = newUser

      // 3. Create a "set password" token and send welcome email
      const token = await this.createToken(user.id, 'set_password')
      const setPasswordUrl = `${env.DASHBOARD_URL}/auth/set-password?token=${token}`
      await emailService.sendWelcomeEmail(email, setPasswordUrl)
    }

    // 4. Ensure merchant linkage exists
    const { data: link, error: linkError } = await supabase
      .from('merchant_users')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('user_id', user.id)
      .single()

    if (linkError && linkError.code !== 'PGRST116') {
      throw linkError
    }

    if (!link) {
      const { error: createLinkError } = await supabase
        .from('merchant_users')
        .insert({
          merchant_id: merchantId,
          user_id: user!.id,
          role: 'owner',
        })

      if (createLinkError) throw createLinkError
    }

    return user!
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    if (!supabase) throw new AppError('Database client not initialized', 500)

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user || !user.password_hash) {
      throw new AppError('Invalid email or password', 401)
    }

    const isValid = await this.comparePassword(password, user.password_hash)
    if (!isValid) {
      throw new AppError('Invalid email or password', 401)
    }

    // Get the first merchant this user is associated with
    const { data: link, error: linkError } = await supabase
      .from('merchant_users')
      .select('*, merchants(*)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (linkError || !link || !link.merchants) {
      throw new AppError('User not associated with any store', 403)
    }

    await this.logEvent(user.id, link.merchant_id, 'login_success')

    return { user, merchant: link.merchants }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    if (!supabase) throw new AppError('Database client not initialized', 500)

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      // Don't leak if user exists or not
      return
    }

    const token = await this.createToken(user.id, 'reset_password')
    const resetUrl = `${env.DASHBOARD_URL}/auth/reset-password?token=${token}`
    await emailService.sendPasswordResetEmail(user.email, resetUrl)
    await this.logEvent(user.id, null, 'password_reset_requested')
  }

  /**
   * Set initial password
   */
  async setPassword(token: string, password: string) {
    const user = await this.useToken(token, 'set_password')
    const passwordHash = await this.hashPassword(password)

    const { error: updateError } = await supabase!
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', user.id)

    if (updateError) throw updateError
    await this.logEvent(user.id, null, 'password_set_success')
    return user
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string) {
    const user = await this.useToken(token, 'reset_password')
    const passwordHash = await this.hashPassword(password)

    const { error: updateError } = await supabase!
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', user.id)

    if (updateError) throw updateError
    await this.logEvent(user.id, null, 'password_reset_success')
    await emailService.sendPasswordChangedNotification(user.email)
  }

  /**
   * Internal: Create a secure token
   */
  private async createToken(userId: string, type: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours

    const { error } = await supabase!
      .from('auth_tokens')
      .insert({
        user_id: userId,
        token,
        type,
        expires_at: expiresAt.toISOString(),
      })

    if (error) throw error
    return token
  }

  /**
   * Internal: Validate and consume a token
   */
  private async useToken(token: string, type: string) {
    if (!supabase) throw new AppError('Database client not initialized', 500)

    const { data: tokenData, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('*, users(*)')
      .eq('token', token)
      .eq('type', type)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenData || !tokenData.users) {
      throw new AppError('Invalid or expired token', 400)
    }

    const { error: updateError } = await supabase
      .from('auth_tokens')
      .update({ is_used: true })
      .eq('id', tokenData.id)

    if (updateError) throw updateError

    return tokenData.users
  }

  /**
   * Internal: Log an audit event
   */
  private async logEvent(userId: string, merchantId: string | null, action: string, metadata: any = {}) {
    if (!supabase) return

    await supabase.from('audit_events').insert({
      user_id: userId,
      merchant_id: merchantId,
      action,
      metadata,
    })
  }
}

export const authService = new AuthService()
