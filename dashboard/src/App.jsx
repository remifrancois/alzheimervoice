import { useState, useEffect } from 'react'
import PatientHeader from './components/PatientHeader'
import CompositeTimeline from './components/CompositeTimeline'
import DomainChart from './components/DomainChart'
import WeeklyReport from './components/WeeklyReport'
import SessionDetail from './components/SessionDetail'

const API = ''  // Proxied via Vite

function App() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/patients`)
      .then(r => r.json())
      .then(data => {
        setPatients(data)
        if (data.length > 0) {
          setSelectedPatient(data[0])
          return loadTimeline(data[0].patient_id)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function loadTimeline(patientId) {
    const res = await fetch(`${API}/api/cvf/timeline/${patientId}`)
    const data = await res.json()
    setTimeline(data)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading MemoVoice...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400 text-lg">
          Error: {error}
          <div className="text-sm text-slate-500 mt-2">
            Make sure the server is running: <code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedPatient || !timeline) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">
          No patient data found. Run: <code className="bg-slate-800 px-2 py-1 rounded">npm run demo:data</code>
        </div>
      </div>
    )
  }

  const monitoringSessions = timeline.timeline.filter(s => s.composite !== undefined)
  const latestSession = monitoringSessions[monitoringSessions.length - 1]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">MemoVoice</h1>
              <p className="text-xs text-slate-500">Cognitive Voice Fingerprint</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 italic">
            "La voix se souvient de ce que l'esprit oublie."
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Patient header + alert */}
        <PatientHeader patient={selectedPatient} timeline={timeline} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CompositeTimeline timeline={timeline} />
          </div>
          <div>
            <DomainChart session={latestSession} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyReport patientId={selectedPatient.patient_id} />
          <SessionDetail sessions={monitoringSessions} />
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-600">
          MemoVoice CVF Engine v0.1.0 — Cerebral Valley x Anthropic Hackathon 2026
        </div>
      </footer>
    </div>
  )
}

export default App
