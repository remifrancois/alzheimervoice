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

export default function DashboardPage() {
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
        <Topbar title="Dashboard" subtitle="Loading..." />
        <div className="p-6 text-slate-500">Loading patient data...</div>
      </>
    )
  }

  if (!selected || !timeline) {
    return (
      <>
        <Topbar title="Dashboard" />
        <div className="p-6">
          <EmptyState
            title="No patient data"
            description="Generate demo data to see the dashboard in action."
          />
        </div>
      </>
    )
  }

  const monitoring = timeline.timeline.filter(s => s.composite !== undefined)
  const latest = monitoring[monitoring.length - 1]
  const alertConfig = ALERT_LEVELS[selected.alert_level] || ALERT_LEVELS.green

  // Compute trend (last 3 sessions avg vs prior 3)
  let trend = null
  if (monitoring.length >= 6) {
    const recent = monitoring.slice(-3).reduce((s, e) => s + e.composite, 0) / 3
    const prior = monitoring.slice(-6, -3).reduce((s, e) => s + e.composite, 0) / 3
    trend = ((recent - prior) / Math.abs(prior || 1) * 100).toFixed(0)
  }

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Monitoring ${selected.first_name}`} />

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
                  {selected.language === 'fr' ? 'Francophone' : 'English'} &middot; {timeline.sessions_count} sessions &middot; {timeline.baseline_established ? 'Monitoring active' : 'Calibrating'}
                </p>
              </div>
            </div>
          </div>

          <StatGrid cols={4} className="mt-4">
            <Stat label="Composite Score" value={latest?.composite?.toFixed(2) || '-'} unit="z" trend={trend ? parseInt(trend) : null} />
            <Stat label="Sessions" value={timeline.sessions_count} unit="total" />
            <Stat label="Baseline" value={selected.baseline_sessions} unit="sessions" />
            <Stat label="Last Session" value={latest ? new Date(latest.timestamp).toLocaleDateString('fr-FR') : '-'} />
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
