const ALERT_CONFIG = {
  green:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Normal' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Monitor' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'Attention' },
  red:    { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Alert' }
}

const ALERT_DOT = {
  green: 'bg-emerald-400',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-400',
  red: 'bg-red-400'
}

export default function PatientHeader({ patient, timeline }) {
  const alert = patient.alert_level || 'green'
  const config = ALERT_CONFIG[alert]
  const monitoringSessions = timeline.timeline.filter(s => s.composite !== undefined)
  const latest = monitoringSessions[monitoringSessions.length - 1]

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{patient.first_name}</h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
              <span className={`w-2 h-2 rounded-full ${ALERT_DOT[alert]} ${alert === 'red' ? 'animate-pulse' : ''}`} />
              {config.label}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {patient.language === 'fr' ? 'Francophone' : 'English'} &middot; Since {new Date(patient.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-500">Sessions</div>
          <div className="text-2xl font-bold text-white">{timeline.sessions_count}</div>
          <div className="text-xs text-slate-500">
            {timeline.baseline_established ? 'Monitoring active' : `Calibrating (${patient.baseline_sessions}/14)`}
          </div>
        </div>
      </div>

      {latest && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Composite" value={latest.composite?.toFixed(2)} unit="z" />
          <Stat label="Best Domain" value={bestDomain(latest.domain_scores)} />
          <Stat label="Worst Domain" value={worstDomain(latest.domain_scores)} />
          <Stat label="Last Session" value={new Date(latest.timestamp).toLocaleDateString()} />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, unit }) {
  return (
    <div className="bg-slate-900/50 rounded-lg px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-200">
        {value}{unit ? <span className="text-xs text-slate-500 ml-1">{unit}</span> : null}
      </div>
    </div>
  )
}

function bestDomain(scores) {
  if (!scores) return '-'
  const entries = Object.entries(scores)
  entries.sort((a, b) => b[1] - a[1])
  return `${entries[0][0]} (${entries[0][1] >= 0 ? '+' : ''}${entries[0][1].toFixed(1)})`
}

function worstDomain(scores) {
  if (!scores) return '-'
  const entries = Object.entries(scores)
  entries.sort((a, b) => a[1] - b[1])
  return `${entries[0][0]} (${entries[0][1].toFixed(1)})`
}
