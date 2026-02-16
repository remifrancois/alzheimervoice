import { useState } from 'react'
import { Card, CardHeader, ALERT_LEVELS, DOMAIN_COLORS, useT } from '@azh/shared-ui'

export default function SessionList({ sessions }) {
  const { t, lang } = useT()
  const [expanded, setExpanded] = useState(null)

  if (!sessions?.length) {
    return (
      <Card>
        <CardHeader title={t('charts.sessionHistory')} />
        <div className="text-slate-500 text-sm text-center py-8">{t('charts.noSessions')}</div>
      </Card>
    )
  }

  const sorted = [...sessions].reverse()
  const dateFmt = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: '2-digit' })

  return (
    <Card padding={false}>
      <div className="p-6 pb-3">
        <CardHeader
          title={t('charts.sessionHistory')}
          subtitle={t('charts.monitoringSessions', { count: sessions.length })}
        />
      </div>
      <div className="max-h-[380px] overflow-y-auto px-3 pb-3">
        {sorted.map((session, i) => {
          const isOpen = expanded === i
          const date = dateFmt.format(new Date(session.timestamp))
          const alert = ALERT_LEVELS[session.alert_level] || ALERT_LEVELS.green
          const confounders = session.confounders ? Object.keys(session.confounders) : []

          return (
            <div key={i}>
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/40 transition-colors text-left group"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${alert.dot}`} />
                <span className="text-[11px] text-slate-500 w-16 shrink-0 tabular-nums">{date}</span>
                <div className="flex-1"><ZBar value={session.composite} /></div>
                <span className={`text-[11px] font-mono w-12 text-right shrink-0 ${alert.text}`}>
                  {session.composite?.toFixed(2)}
                </span>
                {confounders.length > 0 && <span className="text-amber-500/60 text-[10px] shrink-0">!</span>}
                <svg className={`w-3 h-3 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && session.domain_scores && (
                <div className="ml-8 pl-3 border-l border-slate-800 py-1.5 mb-1 space-y-1">
                  {Object.entries(session.domain_scores).map(([domain, score]) => (
                    <div key={domain} className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500 w-14">{domain}</span>
                      <DomainBar domain={domain} value={score} />
                      <span className="text-slate-400 font-mono w-10 text-right tabular-nums">
                        {score >= 0 ? '+' : ''}{score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  {confounders.length > 0 && (
                    <div className="text-[10px] text-amber-500/50 pt-0.5">
                      {confounders.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function ZBar({ value }) {
  if (value == null) return null
  const pct = Math.min(100, Math.abs(value) / 2.5 * 100)
  const color = value >= -0.5 ? 'bg-emerald-500' : value >= -1.0 ? 'bg-yellow-500' : value >= -1.5 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(3, 100 - pct)}%` }} />
    </div>
  )
}

function DomainBar({ domain, value }) {
  const maxZ = 3
  const norm = Math.max(-maxZ, Math.min(maxZ, value))
  const center = 50
  const offset = (norm / maxZ) * 50
  const left = norm < 0 ? center + offset : center
  const width = Math.abs(offset)
  return (
    <div className="flex-1 h-1 bg-slate-800 rounded-full relative">
      <div className="absolute top-0 left-1/2 w-px h-full bg-slate-700" />
      <div
        className="absolute top-0 h-full rounded-full opacity-60"
        style={{ left: `${left}%`, width: `${Math.max(1, width)}%`, backgroundColor: DOMAIN_COLORS[domain] }}
      />
    </div>
  )
}
