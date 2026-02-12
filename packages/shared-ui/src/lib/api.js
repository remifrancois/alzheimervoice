let _tokenGetter = null

/**
 * Set a function that returns the current JWT token.
 * Called by AuthProvider to wire up token injection.
 */
export function setTokenGetter(fn) {
  _tokenGetter = fn
}

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : ''

export async function fetchJSON(path, options = {}) {
  const headers = { ...options.headers }

  // Inject JWT token if available
  const token = _tokenGetter?.()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    if (res.status === 404) return null
    if (res.status === 401) {
      console.warn('[api] 401 Unauthorized — token may be expired')
    }
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  login: (userId) => fetchJSON('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }),

  getPatients: () => fetchJSON('/api/patients'),
  getPatient: (id) => fetchJSON(`/api/patients/${id}`),
  getTimeline: (id) => fetchJSON(`/api/cvf/timeline/${id}`),
  getMemories: (id) => fetchJSON(`/api/memories/${id}`),
  getWeeklyReport: (id, week) => fetchJSON(`/api/cvf/weekly-report/${id}/${week}`),
  getHealth: () => fetchJSON('/health'),

  // V2 — 6-Layer Deep Analysis
  getDeepAnalysis: (id, week) => fetchJSON(`/api/v2/deep-analysis/${id}/${week}`),
  getDeepAnalyses: (id) => fetchJSON(`/api/v2/deep-analysis/${id}`),
  runDeepAnalysis: (id, weekNumber) => fetchJSON(`/api/v2/deep-analysis/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekNumber }),
  }),
  getDifferential: (id) => fetchJSON(`/api/v2/differential/${id}`),
  getSemanticMap: (id) => fetchJSON(`/api/v2/semantic-map/${id}`),
  getTwin: (id, week) => fetchJSON(`/api/v2/twin/${id}${week ? `?week=${week}` : ''}`),
  getCohortMatch: (id) => fetchJSON(`/api/v2/cohort-match/${id}`),
  getLibraryStatus: () => fetchJSON('/api/v2/library/status'),
  getCostEstimate: (id) => fetchJSON(`/api/v2/cost-estimate/${id}`),
  generateCohort: () => fetchJSON('/api/v2/cohort/generate', { method: 'POST' }),

  // GDPR endpoints
  gdprExport: (patientId) => fetchJSON(`/api/gdpr/export/${patientId}`),
  gdprErase: (patientId) => fetchJSON(`/api/gdpr/erase/${patientId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmPatientId: patientId }),
  }),
  gdprEraseAll: () => fetchJSON('/api/gdpr/erase-all', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: 'DELETE_ALL_DATA' }),
  }),

  // Admin
  getAuditLogs: (limit, offset) => fetchJSON(`/api/admin/audit-logs?limit=${limit || 100}&offset=${offset || 0}`),
}
