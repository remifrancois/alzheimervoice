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

/**
 * Sanitize a path parameter to prevent injection.
 * Only allows alphanumeric, hyphens, underscores, dots.
 */
function sanitizeParam(val) {
  if (typeof val !== 'string') return String(val)
  return val.replace(/[^a-zA-Z0-9\-_.]/g, '')
}

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
      // Dispatch event so AuthProvider can handle session expiry
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('azh:auth-expired'))
      }
    }
    if (res.status === 429) {
      throw new Error('Too many requests. Please wait and try again.')
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
  getMe: () => fetchJSON('/api/auth/me'),

  getPatients: () => fetchJSON('/api/patients'),
  getPatient: (id) => fetchJSON(`/api/patients/${sanitizeParam(id)}`),
  getTimeline: (id) => fetchJSON(`/api/cvf/timeline/${sanitizeParam(id)}`),
  getMemories: (id) => fetchJSON(`/api/memories/${sanitizeParam(id)}`),
  getWeeklyReport: (id, week) => fetchJSON(`/api/cvf/weekly-report/${sanitizeParam(id)}/${sanitizeParam(week)}`),
  getHealth: () => fetchJSON('/health'),

  // V2 — 6-Layer Deep Analysis
  getDeepAnalysis: (id, week) => fetchJSON(`/api/v2/deep-analysis/${sanitizeParam(id)}/${sanitizeParam(week)}`),
  getDeepAnalyses: (id) => fetchJSON(`/api/v2/deep-analysis/${sanitizeParam(id)}`),
  runDeepAnalysis: (id, weekNumber) => fetchJSON(`/api/v2/deep-analysis/${sanitizeParam(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekNumber: Number(weekNumber) }),
  }),
  getDifferential: (id) => fetchJSON(`/api/v2/differential/${sanitizeParam(id)}`),
  getSemanticMap: (id) => fetchJSON(`/api/v2/semantic-map/${sanitizeParam(id)}`),
  getTwin: (id, week) => fetchJSON(`/api/v2/twin/${sanitizeParam(id)}${week ? `?week=${sanitizeParam(week)}` : ''}`),
  getCohortMatch: (id) => fetchJSON(`/api/v2/cohort-match/${sanitizeParam(id)}`),
  getLibraryStatus: () => fetchJSON('/api/v2/library/status'),
  getCostEstimate: (id) => fetchJSON(`/api/v2/cost-estimate/${sanitizeParam(id)}`),
  generateCohort: () => fetchJSON('/api/v2/cohort/generate', { method: 'POST' }),

  // GDPR endpoints
  gdprExport: (patientId) => fetchJSON(`/api/gdpr/export/${sanitizeParam(patientId)}`),
  gdprErase: (patientId) => fetchJSON(`/api/gdpr/erase/${sanitizeParam(patientId)}`, {
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
  getAuditLogs: (limit, offset) => fetchJSON(`/api/admin/audit-logs?limit=${Number(limit) || 100}&offset=${Number(offset) || 0}`),
  getEngineMetrics: () => fetchJSON('/cvf/v4/metrics'),

  // Admin — Cognito user management
  getCognitoUsers: (token) => fetchJSON(`/api/admin/cognito/users${token ? `?token=${encodeURIComponent(token)}` : ''}`),
  getCognitoUser: (email) => fetchJSON(`/api/admin/cognito/users/${encodeURIComponent(email)}`),
  createCognitoUser: (data) => fetchJSON('/api/admin/cognito/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  updateCognitoUserRole: (email, role) => fetchJSON(`/api/admin/cognito/users/${encodeURIComponent(email)}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  }),
  disableCognitoUser: (email) => fetchJSON(`/api/admin/cognito/users/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  }),
  enableCognitoUser: (email) => fetchJSON(`/api/admin/cognito/users/${encodeURIComponent(email)}/enable`, {
    method: 'POST',
  }),
  updatePatientMapping: (email, patientIds) => fetchJSON(`/api/admin/cognito/users/${encodeURIComponent(email)}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientIds }),
  }),
}
