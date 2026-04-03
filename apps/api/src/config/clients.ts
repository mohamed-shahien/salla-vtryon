import { createClient } from '@supabase/supabase-js'
import Replicate from 'replicate'

import { env } from './env.js'

export const supabase =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
    : null

export const replicate = env.REPLICATE_API_TOKEN
  ? new Replicate({ auth: env.REPLICATE_API_TOKEN })
  : null
