import { createClient } from '@supabase/supabase-js'
import Replicate from 'replicate'

import { env } from './env.js'

export const supabase =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
    : null

export const replicate = env.REPLICATE_API_TOKEN?.trim()
  ? new Replicate({ auth: env.REPLICATE_API_TOKEN.trim() })
  : null

if (replicate) {
  const token = env.REPLICATE_API_TOKEN?.trim() || ''
  console.log(`[replicate] Client initialized. Token prefix=${token.slice(0, 4)}... length=${token.length}`)
} else {
  console.warn('[replicate] Client NOT initialized. REPLICATE_API_TOKEN is missing.')
}
