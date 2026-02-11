const BASE = ''

export async function fetchJSON(path, options) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    if (res.status === 404) return null
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export const api = {
  getPatients: () => fetchJSON('/api/patients'),
  getPatient: (id) => fetchJSON(`/api/patients/${id}`),
  getTimeline: (id) => fetchJSON(`/api/cvf/timeline/${id}`),
  getMemories: (id) => fetchJSON(`/api/memories/${id}`),
  getWeeklyReport: (id, week) => fetchJSON(`/api/cvf/weekly-report/${id}/${week}`),
  getHealth: () => fetchJSON('/health'),

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
}
