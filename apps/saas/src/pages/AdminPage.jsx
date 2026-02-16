import { useState, useEffect, useRef } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader, Stat, StatGrid, Badge, Icon, api, useT } from '@azh/shared-ui'

const REFRESH_INTERVAL = 10_000

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatMs(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

function durationColor(ms) {
  if (ms < 2000) return 'text-emerald-400'
  if (ms < 5000) return 'text-amber-400'
  return 'text-red-400'
}

function durationBg(ms) {
  if (ms < 2000) return 'bg-emerald-500/10'
  if (ms < 5000) return 'bg-amber-500/10'
  return 'bg-red-500/10'
}

function ProgressBar({ value, max, color = 'violet', label, sublabel }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const colors = {
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  }
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">{sublabel || `${value} / ${max}`}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colors[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { t } = useT()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  function fetchMetrics() {
    api.getEngineMetrics()
      .then(d => { setData(d); setError(null) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMetrics()
    intervalRef.current = setInterval(fetchMetrics, REFRESH_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [])

  if (loading) {
    return (
      <>
        <Topbar title={t('admin.title')} subtitle={t('admin.subtitle')} />
        <div className="p-6 text-slate-500">{t('admin.loading')}</div>
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <Topbar title={t('admin.title')} subtitle={t('admin.subtitle')} />
        <div className="p-6">
          <Card>
            <div className="text-center py-8">
              <Icon name="monitor" size={32} className="text-slate-600 mx-auto mb-3" />
              <div className="text-sm text-slate-400">{t('admin.errorLoading')}</div>
              {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
            </div>
          </Card>
        </div>
      </>
    )
  }

  const sessionSuccessRate = data.sessions_processed > 0
    ? ((data.sessions_processed - data.sessions_failed) / data.sessions_processed * 100).toFixed(1)
    : 100
  const audioSuccessRate = data.audio_extractions + data.audio_failures > 0
    ? (data.audio_extractions / (data.audio_extractions + data.audio_failures) * 100).toFixed(1)
    : 100
  const avgSessionsPerPatient = data.patients_total > 0
    ? (data.sessions_total / data.patients_total).toFixed(1)
    : 0

  return (
    <>
      <Topbar title={t('admin.title')} subtitle={t('admin.subtitle')} />

      <div className="p-6 space-y-6">
        {/* a) Engine Status Bar */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">{t('admin.engineOnline')}</span>
          <span className="text-xs text-slate-600 ml-auto">{t('admin.autoRefresh')}</span>
        </div>

        <StatGrid cols={3}>
          <Stat label={t('admin.uptime')} value={formatUptime(data.uptime_seconds)} />
          <Stat label={t('admin.patientsTotal')} value={data.patients_total} unit={`/ ${data.patients_max}`} />
          <Stat label={t('admin.sessionsProcessed')} value={data.sessions_processed} />
        </StatGrid>
        <StatGrid cols={3}>
          <Stat label={t('admin.baselinesEstablished')} value={data.baselines_established} />
          <Stat label={t('admin.audioRate')} value={`${(data.audio_rate * 100).toFixed(0)}%`} />
          <Stat label={t('admin.failedSessions')} value={data.sessions_failed} />
        </StatGrid>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* b) Alert Distribution */}
          <Card>
            <CardHeader title={t('admin.alertDistribution')} subtitle={t('admin.alertDistributionDesc')} />
            <div className="space-y-3">
              {[
                { key: 'green', label: t('admin.alertGreen'), color: 'bg-emerald-500', count: data.patients_by_alert.green },
                { key: 'yellow', label: t('admin.alertYellow'), color: 'bg-amber-400', count: data.patients_by_alert.yellow },
                { key: 'orange', label: t('admin.alertOrange'), color: 'bg-orange-500', count: data.patients_by_alert.orange },
                { key: 'red', label: t('admin.alertRed'), color: 'bg-red-500', count: data.patients_by_alert.red },
              ].map(a => (
                <div key={a.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${a.color}`} />
                      <span className="text-slate-300">{a.label}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{a.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${a.color}`}
                      style={{ width: data.patients_total > 0 ? `${(a.count / data.patients_total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* c) Processing Performance */}
          <Card>
            <CardHeader title={t('admin.processingPerf')} subtitle={t('admin.processingPerfDesc')} />
            <div className="space-y-4">
              {[
                { label: t('admin.avgTextExtraction'), value: data.avg_text_extraction_ms },
                { label: t('admin.avgAudioExtraction'), value: data.avg_audio_extraction_ms },
                { label: t('admin.avgAnalysis'), value: data.avg_analysis_ms },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{p.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${durationColor(p.value)}`}>{formatMs(p.value)}</span>
                    <div className={`w-16 h-1.5 rounded-full overflow-hidden bg-slate-800`}>
                      <div className={`h-full rounded-full ${p.value < 2000 ? 'bg-emerald-500' : p.value < 5000 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min((p.value / 10000) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* d) Pipeline Health */}
          <Card>
            <CardHeader title={t('admin.pipelineHealth')} subtitle={t('admin.pipelineHealthDesc')} />
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{t('admin.sessionSuccessRate')}</span>
                  <span className={`font-semibold ${Number(sessionSuccessRate) >= 95 ? 'text-emerald-400' : Number(sessionSuccessRate) >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                    {sessionSuccessRate}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sessionSuccessRate}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{t('admin.audioPipelineSuccess')}</span>
                  <span className={`font-semibold ${Number(audioSuccessRate) >= 95 ? 'text-emerald-400' : Number(audioSuccessRate) >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                    {audioSuccessRate}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${audioSuccessRate}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-100">{data.weekly_analyses}</div>
                  <div className="text-[10px] text-slate-500">{t('admin.weeklyAnalyses')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-100">{data.micro_tasks_processed}</div>
                  <div className="text-[10px] text-slate-500">{t('admin.microTasks')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-100">{data.audio_sessions}</div>
                  <div className="text-[10px] text-slate-500">{t('admin.audioSessions')}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* f) Capacity Gauges */}
          <Card>
            <CardHeader title={t('admin.capacityGauges')} subtitle={t('admin.capacityGaugesDesc')} />
            <div className="space-y-4">
              <ProgressBar
                label={t('admin.patientCapacity')}
                value={data.patients_total}
                max={data.patients_max}
                color={data.patients_total / data.patients_max > 0.8 ? 'red' : 'violet'}
              />
              <ProgressBar
                label={t('admin.avgSessionsPerPatient')}
                value={Number(avgSessionsPerPatient)}
                max={50}
                color="blue"
                sublabel={`${avgSessionsPerPatient} avg`}
              />
              <div>
                <div className="text-xs text-slate-300 mb-1.5">{t('admin.baselineStatus')}</div>
                <div className="flex gap-1.5">
                  {[
                    { label: t('admin.established'), count: data.baselines_established, color: 'bg-emerald-500' },
                    { label: t('admin.calibrating'), count: data.baselines_calibrating, color: 'bg-amber-500' },
                    { label: t('admin.noBaseline'), count: data.patients_total - data.baselines_established - data.baselines_calibrating, color: 'bg-slate-700' },
                  ].map(b => {
                    const pct = data.patients_total > 0 ? (b.count / data.patients_total) * 100 : 0
                    return (
                      <div key={b.label} className="flex-1">
                        <div className={`h-2 rounded-full ${b.color}`} style={{ width: '100%', opacity: pct > 0 ? 1 : 0.2 }} />
                        <div className="text-[10px] text-slate-500 mt-1">{b.label} ({b.count})</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* e) Recent Activity */}
        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardHeader title={t('admin.recentActivity')} subtitle={t('admin.recentActivityDesc')} />
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="text-left font-medium px-6 py-2.5">{t('admin.colTimestamp')}</th>
                  <th className="text-left font-medium px-4 py-2.5">{t('admin.colType')}</th>
                  <th className="text-left font-medium px-4 py-2.5">{t('admin.colDuration')}</th>
                  <th className="text-left font-medium px-4 py-2.5">{t('admin.colPatient')}</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_activity.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-600 py-8">{t('admin.noActivity')}</td>
                  </tr>
                )}
                {[...data.recent_activity].reverse().map((event, i) => (
                  <tr key={i} className={`border-b border-slate-800/50 ${durationBg(event.duration_ms)}`}>
                    <td className="px-6 py-2 text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={event.type === 'session' ? 'brand' : event.type === 'audio' ? 'success' : event.type === 'weekly' ? 'warning' : 'danger'}>
                        {event.type}
                      </Badge>
                    </td>
                    <td className={`px-4 py-2 font-medium ${durationColor(event.duration_ms)}`}>
                      {formatMs(event.duration_ms)}
                    </td>
                    <td className="px-4 py-2 text-slate-500 font-mono">
                      {event.patient_hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
