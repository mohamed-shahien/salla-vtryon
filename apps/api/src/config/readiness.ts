import { env } from './env.js'

function isConfigured(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

export function getConfigReadiness() {
  return {
    salla: {
      configured:
        isConfigured(env.SALLA_CLIENT_ID) &&
        isConfigured(env.SALLA_CLIENT_SECRET) &&
        isConfigured(env.SALLA_WEBHOOK_SECRET) &&
        isConfigured(env.SALLA_APP_ID),
    },
    supabase: {
      configured:
        isConfigured(env.SUPABASE_URL) &&
        isConfigured(env.SUPABASE_SERVICE_ROLE_KEY) &&
        isConfigured(env.SUPABASE_ANON_KEY),
    },
    replicate: {
      configured: isConfigured(env.REPLICATE_API_TOKEN),
    },
    bunny: {
      configured:
        isConfigured(env.BUNNY_STORAGE_ZONE) &&
        isConfigured(env.BUNNY_API_KEY) &&
        isConfigured(env.BUNNY_CDN_URL),
    },
    app: {
      configured:
        isConfigured(env.ENCRYPTION_KEY) &&
        isConfigured(env.DASHBOARD_URL) &&
        (isConfigured(env.SALLA_CALLBACK_URL) || isConfigured(env.API_URL)),
    },
  }
}
