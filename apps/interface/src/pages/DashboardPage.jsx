import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader, Stat, StatGrid, AlertBadge, EmptyState, api, ALERT_LEVELS, useT } from '@azh/shared-ui'
import CompositeTimeline from '../components/charts/CompositeTimeline'
import DomainChart from '../components/charts/DomainChart'
import WeeklyReport from '../components/charts/WeeklyReport'
import SessionList from '../components/charts/SessionList'
import DifferentialDiagnosis from '../components/charts/DifferentialDiagnosis'
import CognitiveTwinChart from '../components/charts/CognitiveTwinChart'
import CohortMatching from '../components/charts/CohortMatching'

export default function DashboardPage() {
  const { t, lang } = useT()
  const [patients, setPatients] = useState([])
  const [selected, setSelected] = useState(null)
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPatients().then(data => {
      const valid = data.filter(p => p.first_name)
      setPatients(valid)
      if (valid.length > 0) {
        setSelected(valid[0])
        api.getTimeline(valid[0].patient_id).then(setTimeline)
      }
    }).finally(() => setLoading(false))
  }, [])

  function switchPatient(patient) {
    if (patient.patient_id === selected?.patient_id) return
    setSelected(patient)
    setTimeline(null)
    api.getTimeline(patient.patient_id).then(setTimeline)
  }

  if (loading) {
    return (
      <>
        <Topbar title={t('dashboard.title')} subtitle={t('dashboard.loading')} />
        <div className="p-6 text-slate-500">{t('dashboard.loadingData')}</div>
      </>
    )
  }

  if (!selected) {
    return (
      <>
        <Topbar title={t('dashboard.title')} />
        <div className="p-6">
          <EmptyState
            title={t('dashboard.noData')}
            description={t('dashboard.noDataDesc')}
          />
        </div>
      </>
    )
  }

  const monitoring = timeline ? timeline.timeline.filter(s => s.composite !== undefined) : []
  const latest = monitoring[monitoring.length - 1]
  const alertConfig = ALERT_LEVELS[selected.alert_level] || ALERT_LEVELS.green

  let trend = null
  if (monitoring.length >= 6) {
    const recent = monitoring.slice(-3).reduce((s, e) => s + e.composite, 0) / 3
    const prior = monitoring.slice(-6, -3).reduce((s, e) => s + e.composite, 0) / 3
    trend = ((recent - prior) / Math.abs(prior || 1) * 100).toFixed(0)
  }

  const dateFmt = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: '2-digit' })

  return (
    <>
      <Topbar title={t('dashboard.title')} subtitle={t('dashboard.monitoring', { name: selected.first_name })} />

      <div className="p-6 space-y-6">
        {/* Patient switcher */}
        {patients.length > 1 && (
          <div className="flex items-center gap-1.5">
            {patients.map(p => {
              const active = p.patient_id === selected.patient_id
              const ac = ALERT_LEVELS[p.alert_level] || ALERT_LEVELS.green
              return (
                <button
                  key={p.patient_id}
                  onClick={() => switchPatient(p)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ac.dot} ${active && p.alert_level === 'red' ? 'animate-pulse' : ''}`} />
                  {p.first_name}
                </button>
              )
            })}
          </div>
        )}

        {/* Loading state when switching patients */}
        {!timeline && (
          <div className="text-sm text-slate-500 py-12 text-center">{t('dashboard.loadingData')}</div>
        )}

        {timeline && <>
        {/* Patient banner */}
        <div className={`rounded-xl border ${alertConfig.border} ${alertConfig.bg} p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {selected.first_name?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{selected.first_name}{selected.last_name ? ` ${selected.last_name}` : ''}{selected.age ? `, ${selected.age}` : ''}</h2>
                  <AlertBadge level={selected.alert_level} pulse />
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
                  <span>{selected.language === 'fr' ? t('dashboard.francophone') : t('dashboard.english')}</span>
                  <span className="text-slate-600">&middot;</span>
                  <span>{timeline.sessions_count} {t('dashboard.sessions')}</span>
                  <span className="text-slate-600">&middot;</span>
                  <span>{timeline.baseline_established ? t('dashboard.monitoringActive') : t('dashboard.calibrating')}</span>
                </div>
              </div>
            </div>
          </div>

          <StatGrid cols={4} className="mt-5">
            <Stat label={t('dashboard.compositeScore')} value={latest?.composite?.toFixed(2) || '-'} unit="z" trend={trend ? parseInt(trend) : null} />
            <Stat label={t('dashboard.sessionsLabel')} value={timeline.sessions_count} unit={t('dashboard.total')} />
            <Stat label={t('dashboard.baseline')} value={selected.baseline_sessions} unit={t('dashboard.sessions')} />
            <Stat label={t('dashboard.lastSession')} value={latest ? dateFmt.format(new Date(latest.timestamp)) : '-'} />
          </StatGrid>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <CompositeTimeline timeline={timeline} />
          </div>
          <DomainChart session={latest} />
        </div>

        {/* V2 — Deep Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DifferentialDiagnosis patientId={selected.patient_id} />
          <CognitiveTwinChart patientId={selected.patient_id} timeline={timeline} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <CohortMatching patientId={selected.patient_id} />
          <WeeklyReport patientId={selected.patient_id} />
        </div>

        {/* Sessions */}
        <SessionList sessions={monitoring} />
        </>}
      </div>
    </>
  )
}
