import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'

function normalizeStoragePath(value: string) {
  return value.replace(/^\/+/, '')
}

function getBunnyConfig() {
  if (!env.BUNNY_STORAGE_ZONE || !env.BUNNY_API_KEY || !env.BUNNY_CDN_URL) {
    throw new AppError(
      'Bunny storage configuration is incomplete.',
      500,
      'CONFIGURATION_ERROR',
    )
  }

  return {
    storageZone: env.BUNNY_STORAGE_ZONE,
    apiKey: env.BUNNY_API_KEY,
    cdnUrl: env.BUNNY_CDN_URL.replace(/\/$/, ''),
  }
}

export async function uploadBufferToBunny(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
) {
  const config = getBunnyConfig()
  const normalizedPath = normalizeStoragePath(storagePath)

  const response = await fetch(
    `https://storage.bunnycdn.com/${config.storageZone}/${normalizedPath}`,
    {
      method: 'PUT',
      headers: {
        AccessKey: config.apiKey,
        'Content-Type': contentType,
      },
      body: new Uint8Array(buffer),
    },
  )

  if (!response.ok) {
    throw new AppError(
      `Bunny upload failed with status ${response.status}.`,
      response.status,
      'BUNNY_UPLOAD_FAILED',
    )
  }

  return {
    storagePath: normalizedPath,
    url: `${config.cdnUrl}/${normalizedPath}`,
  }
}
