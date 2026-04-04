import { config as loadDotenv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { z } from 'zod'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectory = dirname(currentFilePath)
const workspaceEnvPath = resolve(currentDirectory, '../../../../.env')

loadDotenv({ path: workspaceEnvPath })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  APP_URL: z.string().default('http://localhost:5173'),
  API_URL: z.string().optional(),
  DASHBOARD_URL: z.string().default('http://localhost:5173'),
  SALLA_CLIENT_ID: z.string().optional(),
  SALLA_CLIENT_SECRET: z.string().optional(),
  SALLA_WEBHOOK_SECRET: z.string().optional(),
  SALLA_APP_ID: z.string().optional(),
  SALLA_API_BASE_URL: z.string().default('https://api.salla.dev'),
  SALLA_ADMIN_API_BASE_URL: z.string().default('https://api.salla.dev/admin/v2'),
  SALLA_ACCOUNTS_BASE_URL: z.string().default('https://accounts.salla.sa'),
  SALLA_CALLBACK_URL: z.string().optional(),
  SALLA_OAUTH_SCOPES: z.string().default('offline_access'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
  BUNNY_STORAGE_ZONE: z.string().optional(),
  BUNNY_API_KEY: z.string().optional(),
  BUNNY_CDN_URL: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
