import { useState } from 'react'

const ALERT_STYLE = {
  green: 'text-emerald-400',
  yellow: 'text-yellow-400',
  orange: 'text-orange-400',
  red: 'text-red-400'
}

export default function SessionDetail({ sessions }) {
  const [expanded, setExpanded] = useState(null)

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Session History</h3>
        <div className="text-slate-500 text-sm">No monitoring sessions yet</div>
      </div>
    )
  }

  // Show most recent first
  const sorted = [...sessions].reverse()

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        Session History
        <span className="text-xs text-slate-500 font-normal ml-2">({sessions.length} monitoring sessions)</span>
      </h3>

      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {sorted.map((session, i) => {
          const isExpanded = expanded === i
          const date = new Date(session.timestamp).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          })
          const confounders = session.confounders ? Object.keys(session.confounders) : []

          return (
            <div key={i}>
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
              >
                {/* Alert dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  session.alert_level === 'green' ? 'bg-emerald-400' :
                  session.alert_level === 'yellow' ? 'bg-yellow-400' :
                  session.alert_level === 'orange' ? 'bg-orange-400' : 'bg-red-400'
                }`} />

                {/* Date */}
                <span className="text-xs text-slate-400 w-20 flex-shrink-0">{date}</span>

                {/* Composite bar */}
                <div className="flex-1">
                  <CompositeBar value={session.composite} />
                </div>

                {/* Z-score */}
                <span className={`text-xs font-mono w-14 text-right flex-shrink-0 ${ALERT_STYLE[session.alert_level]}`}>
                  {session.composite?.toFixed(2)}
                </span>

                {/* Confounders */}
                {confounders.length > 0 && (
                  <span className="text-xs text-amber-500/70 flex-shrink-0" title={confounders.join(', ')}>
                    !
                  </span>
                )}

                {/* Expand icon */}
                <svg className={`w-3 h-3 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && session.domain_scores && (
                <div className="ml-7 pl-3 border-l border-slate-800 py-2 space-y-1">
                  {Object.entries(session.domain_scores).map(([domain, score]) => (
                    <div key={domain} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 w-16">{domain}</span>
                      <MiniBar value={score} />
                      <span className="text-slate-400 font-mono w-10 text-right">
                        {score >= 0 ? '+' : ''}{score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  {confounders.length > 0 && (
                    <div className="text-xs text-amber-500/60 mt-1">
                      Confounders: {confounders.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CompositeBar({ value }) {
  if (value == null) return null
  // Map z-score to width: 0 at center, negative goes left
  const maxZ = 2.5
  const pct = Math.min(100, Math.abs(value) / maxZ * 100)
  const color = value >= -0.5 ? 'bg-emerald-500' : value >= -1.0 ? 'bg-yellow-500' : value >= -1.5 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${Math.max(2, 100 - pct)}%` }}
      />
    </div>
  )
}

function MiniBar({ value }) {
  const maxZ = 3
  const normalized = Math.max(-maxZ, Math.min(maxZ, value))
  const center = 50
  const offset = (normalized / maxZ) * 50
  const left = normalized < 0 ? center + offset : center
  const width = Math.abs(offset)
  const color = value >= -0.5 ? 'bg-emerald-500/60' : value >= -1.0 ? 'bg-yellow-500/60' : value >= -1.5 ? 'bg-orange-500/60' : 'bg-red-500/60'

  return (
    <div className="flex-1 h-1 bg-slate-800 rounded-full relative">
      <div className="absolute top-0 left-1/2 w-px h-full bg-slate-700" />
      <div
        className={`absolute top-0 h-full rounded-full ${color}`}
        style={{ left: `${left}%`, width: `${Math.max(1, width)}%` }}
      />
    </div>
  )
}
