import { useState, useEffect } from 'react'
import Topbar from '../../components/layout/Topbar'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { Stat, StatGrid } from '../../components/ui/Stat'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function GdprPage() {
  const { hasRole } = useAuth()
  const [patients, setPatients] = useState([])

  useEffect(() => {
    api.getPatients().then(p => setPatients(p || [])).catch(() => {})
  }, [])

  return (
    <>
      <Topbar title="GDPR & Data Management" subtitle="Data rights, export, and erasure — EU Regulation 2016/679" />

      <div className="p-6 space-y-6">
        {/* GDPR Overview */}
        <StatGrid cols={4}>
          <Stat label="Patients with Data" value={patients.length} />
          <Stat label="Data Retention" value="Active" />
          <Stat label="Encryption" value="AES-256" />
          <Stat label="Last Audit" value="Feb 2026" />
        </StatGrid>

        {/* GDPR Rights Reference */}
        <Card>
          <CardHeader title="GDPR Compliance Status" subtitle="European Union General Data Protection Regulation" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { article: 'Art. 15', title: 'Right of Access', desc: 'Data subjects can request all personal data held', status: 'compliant' },
              { article: 'Art. 17', title: 'Right to Erasure', desc: 'Complete deletion of all personal data on request', status: 'compliant' },
              { article: 'Art. 20', title: 'Data Portability', desc: 'Export data in machine-readable JSON format', status: 'compliant' },
              { article: 'Art. 25', title: 'Privacy by Design', desc: 'Data isolation, role-based access, minimal collection', status: 'compliant' },
            ].map(r => (
              <div key={r.article} className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-[10px] text-violet-400 font-mono">{r.article}</code>
                  <Badge variant="success">{r.status}</Badge>
                </div>
                <div className="text-sm font-medium text-white">{r.title}</div>
                <div className="text-[10px] text-slate-500 mt-1">{r.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Per-Patient Data Management */}
        <Card>
          <CardHeader title="Patient Data Management" subtitle="Export or erase individual patient records (Art. 15, 17, 20)" />
          {patients.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-slate-500">No patient records found</div>
              <div className="text-[10px] text-slate-600 mt-1">Patient data will appear here when created</div>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Patient</th>
                    <th className="text-left py-2.5 px-4">ID</th>
                    <th className="text-left py-2.5 px-4">Created</th>
                    <th className="text-right py-2.5 px-4">Sessions</th>
                    <th className="text-right py-2.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <PatientDataRow key={p.patient_id} patient={p} onDelete={() => setPatients(prev => prev.filter(x => x.patient_id !== p.patient_id))} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
              <p className="text-xs text-red-300/60">Irreversible actions. Data cannot be recovered after deletion.</p>
            </div>
          </div>

          {/* Erase Individual Patient */}
          <DangerAction
            title="Erase Patient Data"
            description="Permanently delete all data for a specific patient: profile, sessions, CVF baselines, weekly reports, and memory profiles. This fulfills GDPR Art. 17 (Right to Erasure)."
            article="Art. 17"
            patients={patients}
            onComplete={(patientId) => setPatients(prev => prev.filter(p => p.patient_id !== patientId))}
          />

          {/* Erase All Platform Data — Superadmin Only */}
          {hasRole('superadmin') && (
            <EraseAllAction onComplete={() => setPatients([])} />
          )}
        </div>

        {/* Data Processing Log */}
        <Card>
          <CardHeader title="Data Processing Activities" subtitle="Record of processing operations (Art. 30)" />
          <div className="space-y-2">
            {[
              { activity: 'Voice feature extraction', basis: 'Legitimate interest (healthcare)', data: 'Session transcripts → 25-dim CVF vectors', retention: 'Duration of monitoring' },
              { activity: 'Cognitive drift analysis', basis: 'Legitimate interest (healthcare)', data: 'CVF vectors → z-score deltas', retention: 'Duration of monitoring' },
              { activity: 'Weekly clinical reporting', basis: 'Legitimate interest (healthcare)', data: 'Aggregated CVF data → narrative reports', retention: 'Duration of monitoring' },
              { activity: 'Memory recall testing', basis: 'Explicit consent', data: 'Family-submitted memories → recall scores', retention: 'Until erasure request' },
            ].map(a => (
              <div key={a.activity} className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/20 border border-slate-800/50">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-300 font-medium">{a.activity}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{a.data}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-violet-400">{a.basis}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{a.retention}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

function PatientDataRow({ patient, onDelete }) {
  const [exporting, setExporting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [erasing, setErasing] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await api.gdprExport(patient.patient_id)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gdpr-export-${patient.first_name}-${patient.patient_id.slice(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed: ' + err.message)
    }
    setExporting(false)
  }

  const handleErase = async () => {
    setErasing(true)
    try {
      await api.gdprErase(patient.patient_id)
      onDelete()
    } catch (err) {
      alert('Erasure failed: ' + err.message)
    }
    setErasing(false)
    setShowConfirm(false)
  }

  return (
    <>
      <tr className="border-t border-slate-800/50">
        <td className="py-3 px-4 text-slate-200">{patient.first_name}</td>
        <td className="py-3 px-4">
          <code className="text-[10px] text-slate-500 font-mono">{patient.patient_id.slice(0, 12)}...</code>
        </td>
        <td className="py-3 px-4 text-xs text-slate-500">
          {new Date(patient.created_at).toLocaleDateString('fr-FR')}
        </td>
        <td className="py-3 px-4 text-right text-slate-400 tabular-nums">
          {patient.baseline_sessions || 0}
        </td>
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export JSON'}
            </Button>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setShowConfirm(true)}>
              Erase
            </Button>
          </div>
        </td>
      </tr>
      {showConfirm && (
        <tr>
          <td colSpan={5} className="px-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-400 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="text-xs text-red-300 flex-1">
                Permanently erase all data for <strong>{patient.first_name}</strong>? This cannot be undone.
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <button
                onClick={handleErase}
                disabled={erasing}
                className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {erasing ? 'Erasing...' : 'Confirm Erasure'}
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function DangerAction({ title, description, article, patients, onComplete }) {
  const [selectedPatient, setSelectedPatient] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [erasing, setErasing] = useState(false)
  const [result, setResult] = useState(null)

  const selectedName = patients.find(p => p.patient_id === selectedPatient)?.first_name || ''
  const canConfirm = confirmText === selectedName && selectedPatient

  const handleErase = async () => {
    if (!canConfirm) return
    setErasing(true)
    try {
      const res = await api.gdprErase(selectedPatient)
      setResult(res)
      onComplete(selectedPatient)
      setSelectedPatient('')
      setConfirmText('')
    } catch (err) {
      alert('Erasure failed: ' + err.message)
    }
    setErasing(false)
  }

  return (
    <div className="bg-slate-900/80 rounded-lg border border-red-500/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <code className="text-[10px] text-red-400 font-mono">{article}</code>
          </div>
          <p className="text-xs text-slate-400">{description}</p>

          {patients.length > 0 && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Select patient to erase</label>
                <select
                  className="w-full max-w-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  value={selectedPatient}
                  onChange={e => { setSelectedPatient(e.target.value); setConfirmText(''); setResult(null); }}
                >
                  <option value="">Choose a patient...</option>
                  {patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>{p.first_name} ({p.patient_id.slice(0, 8)})</option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">
                    Type <strong className="text-red-400">{selectedName}</strong> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder={selectedName}
                    className="w-full max-w-xs bg-slate-800 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="text-xs text-emerald-400 font-medium">Erasure complete</div>
              <div className="text-[10px] text-emerald-300/60 mt-1">
                Deleted: {result.details.sessions} sessions, {result.details.cvfFiles} CVF files, {result.details.memories} memory profile
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleErase}
          disabled={!canConfirm || erasing}
          className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 mt-1"
        >
          {erasing ? 'Erasing...' : 'Erase Patient Data'}
        </button>
      </div>
    </div>
  )
}

function EraseAllAction({ onComplete }) {
  const [confirmText, setConfirmText] = useState('')
  const [erasing, setErasing] = useState(false)
  const [result, setResult] = useState(null)
  const CONFIRM_PHRASE = 'DELETE ALL DATA'

  const handleEraseAll = async () => {
    if (confirmText !== CONFIRM_PHRASE) return
    setErasing(true)
    try {
      const res = await api.gdprEraseAll()
      setResult(res)
      onComplete()
      setConfirmText('')
    } catch (err) {
      alert('Full erasure failed: ' + err.message)
    }
    setErasing(false)
  }

  return (
    <div className="bg-slate-900/80 rounded-lg border border-red-500/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-red-400">Erase All Platform Data</h3>
            <Badge variant="danger">SUPERADMIN ONLY</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Permanently delete ALL data from the platform: every patient profile, session transcript, CVF baseline, weekly report, and memory profile. This is the nuclear option for complete platform reset.
          </p>

          <div className="mt-4">
            <label className="text-[10px] text-slate-500 block mb-1">
              Type <strong className="text-red-400">{CONFIRM_PHRASE}</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="w-full max-w-xs bg-slate-800 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          {result && (
            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="text-xs text-emerald-400 font-medium">Full platform erasure complete</div>
              <div className="text-[10px] text-emerald-300/60 mt-1">{result.filesDeleted} files deleted</div>
            </div>
          )}
        </div>

        <button
          onClick={handleEraseAll}
          disabled={confirmText !== CONFIRM_PHRASE || erasing}
          className="px-4 py-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-medium hover:bg-red-600/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 mt-1"
        >
          {erasing ? 'Erasing everything...' : 'Erase All Data'}
        </button>
      </div>
    </div>
  )
}
