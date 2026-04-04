export interface VerifiedMerchantIdentity {
  merchant_uuid: string
  merchant_id: number
  user_id: number | null
  store_name: string | null
  issued_at: string
  exp: string
}

interface VerifyResponse {
  ok: true
  data: VerifiedMerchantIdentity
}

async function parseAuthResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || fallbackMessage)
  }

  return (await response.json()) as VerifyResponse
}

export async function verifyAuthHandoff(handoff: string) {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ handoff }),
  })

  return parseAuthResponse(response, `Auth handoff verification failed with status ${response.status}`)
}

export async function fetchCurrentMerchant() {
  const response = await fetch('/api/auth/me', {
    credentials: 'same-origin',
  })

  if (response.status === 401) {
    return null
  }

  return parseAuthResponse(response, `Merchant lookup failed with status ${response.status}`)
}

export async function logoutCurrentMerchant() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Logout failed with status ${response.status}`)
  }
}
