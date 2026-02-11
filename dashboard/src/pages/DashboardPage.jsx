import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '../components/ui/Card'
import { Stat, StatGrid } from '../components/ui/Stat'
import { AlertBadge } from '../components/ui/Badge'
import CompositeTimeline from '../components/charts/CompositeTimeline'
import DomainChart from '../components/charts/DomainChart'
import WeeklyReport from '../components/charts/WeeklyReport'
import SessionList from '../components/charts/SessionList'
import { EmptyState } from '../components/ui/EmptyState'
import { api } from '../lib/api'
import { ALERT_LEVELS } from '../lib/constants'
import { useT } from '../lib/i18n'

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

  if (loading) {
    return (
      <>
        <Topbar title={t('dashboard.title')} subtitle={t('dashboard.loading')} />
        <div className="p-6 text-slate-500">{t('dashboard.loadingData')}</div>
      </>
    )
  }

  if (!selected || !timeline) {
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

  const monitoring = timeline.timeline.filter(s => s.composite !== undefined)
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
        {/* Patient banner */}
        <div className={`rounded-xl border ${alertConfig.border} ${alertConfig.bg} p-5`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                {selected.first_name?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{selected.first_name}</h2>
                  <AlertBadge level={selected.alert_level} pulse />
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  {selected.language === 'fr' ? t('dashboard.francophone') : t('dashboard.english')} &middot; {timeline.sessions_count} {t('dashboard.sessions')} &middot; {timeline.baseline_established ? t('dashboard.monitoringActive') : t('dashboard.calibrating')}
                </p>
              </div>
            </div>
          </div>

          <StatGrid cols={4} className="mt-4">
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

        {/* Reports + Sessions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <WeeklyReport patientId={selected.patient_id} />
          <SessionList sessions={monitoring} />
        </div>
      </div>
    </>
  )
}
