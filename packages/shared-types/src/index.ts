export const PROJECT_NAME = 'Virtual Try-On for Salla'
export const CURRENT_PHASE = 'Phase 0 - Project Setup & Infrastructure'

export interface HealthcheckResponse {
  ok: true
  phase: string
  service: 'api'
  timestamp: string
}
