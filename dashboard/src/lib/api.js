const BASE = ''

export async function fetchJSON(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`API error: ${res.status}`)
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
}
