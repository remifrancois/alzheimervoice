import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader, Stat, StatGrid, AlertBadge, EmptyState, Icon, api, ALERT_LEVELS, useT } from '@azh/shared-ui'
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
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPatients().then(data => {
      const valid = data.filter(p => p.first_name)
      setPatients(valid)
      if (valid.length > 0) {
        setSelected(valid[0])
        api.getTimeline(valid[0].patient_id).then(setTimeline)
        api.getPatientSummary(valid[0].patient_id).then(setSummary)
      }
    }).finally(() => setLoading(false))
  }, [])

  function switchPatient(patient) {
    if (patient.patient_id === selected?.patient_id) return
    setSelected(patient)
    setTimeline(null)
    setSummary(null)
    api.getTimeline(patient.patient_id).then(setTimeline)
    api.getPatientSummary(patient.patient_id).then(setSummary)
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

        {/* Patient Situation Summary */}
        {summary && <PatientSummaryCard summary={summary} patient={selected} t={t} />}

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

const PRIORITY_STYLES = {
  urgent:      { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'alert-circle', label: 'summary.urgent' },
  recommended: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: 'alert-triangle', label: 'summary.recommended' },
  suggested:   { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'brain', label: 'summary.suggested' },
  routine:     { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', icon: 'clock', label: 'summary.routine' },
}

const STATUS_STYLES = {
  stable:    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'check-circle' },
  monitor:   { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'activity' },
  attention: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: 'alert-triangle' },
  critical:  { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'alert-circle' },
}

function PatientSummaryCard({ summary, patient, t }) {
  const [expandedDoc, setExpandedDoc] = useState(false)
  const statusStyle = STATUS_STYLES[summary.status] || STATUS_STYLES.stable

  return (
    <div className="space-y-4">
      {/* Headline card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${statusStyle.bg} ${statusStyle.border} border flex items-center justify-center shrink-0`}>
            <Icon name={statusStyle.icon} size={20} className={statusStyle.text} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-white">{t('summary.situation')}</h3>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.border} border ${statusStyle.text}`}>
                {t(`summary.status_${summary.status}`)}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{summary.headline}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Key Observations */}
        <Card>
          <CardHeader title={t('summary.observations')} subtitle={t('summary.observationsDesc')} />
          <ul className="space-y-2 mt-3">
            {summary.keyObservations.map((obs, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${statusStyle.text.replace('text-', 'bg-')}`} />
                {obs}
              </li>
            ))}
          </ul>

          {/* Trend */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon name="activity" size={12} className="text-violet-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">{t('summary.trend')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{summary.trendSummary}</p>
          </div>

          {/* Risk */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon name="shield" size={12} className={statusStyle.text} />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${statusStyle.text}`}>{t('summary.riskAssessment')}</span>
            </div>
            <p className="text-xs text-slate-400">{summary.riskLevel}</p>
          </div>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader title={t('summary.nextSteps')} subtitle={t('summary.nextStepsDesc')} />
          <div className="space-y-2 mt-3">
            {summary.nextSteps.map((step, i) => {
              const ps = PRIORITY_STYLES[step.priority] || PRIORITY_STYLES.routine
              return (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${ps.bg} border ${ps.border}`}>
                  <Icon name={ps.icon} size={14} className={`${ps.text} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${ps.text}`}>
                      {t(ps.label)}
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{step.text}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Doctor's note */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => setExpandedDoc(!expandedDoc)}
              className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors w-full"
            >
              <Icon name="stethoscope" size={12} />
              {t('summary.doctorNote')}
              <Icon name="chevronDown" size={10} className={`ml-auto transition-transform ${expandedDoc ? 'rotate-180' : ''}`} />
            </button>
            {expandedDoc && (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed italic bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                {summary.doctorNote}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
