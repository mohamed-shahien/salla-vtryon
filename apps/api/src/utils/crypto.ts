import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { env } from '../config/env.js'
import { AppError } from './app-error.js'

const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

function getDerivedEncryptionKey() {
  if (!env.ENCRYPTION_KEY?.trim()) {
    throw new AppError(
      'ENCRYPTION_KEY is required for encrypted Salla token storage.',
      500,
      'CONFIGURATION_ERROR',
    )
  }

  return createHash('sha256').update(env.ENCRYPTION_KEY.trim(), 'utf8').digest()
}

export function encryptText(value: string) {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, getDerivedEncryptionKey(), iv)

  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`
}

export function decryptText(value: string) {
  const [ivPart, authTagPart, cipherTextPart] = value.split('.')

  if (!ivPart || !authTagPart || !cipherTextPart) {
    throw new AppError('Stored encrypted value is malformed.', 500, 'DECRYPTION_ERROR')
  }

  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    getDerivedEncryptionKey(),
    Buffer.from(ivPart, 'base64url'),
  )

  decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherTextPart, 'base64url')),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}
