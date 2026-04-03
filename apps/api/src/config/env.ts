import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  APP_URL: z.string().default('http://localhost:5173'),
  DASHBOARD_URL: z.string().default('http://localhost:5173'),
  SALLA_CLIENT_ID: z.string().optional(),
  SALLA_CLIENT_SECRET: z.string().optional(),
  SALLA_WEBHOOK_SECRET: z.string().optional(),
  SALLA_APP_ID: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
  BUNNY_STORAGE_ZONE: z.string().optional(),
  BUNNY_API_KEY: z.string().optional(),
  BUNNY_CDN_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
