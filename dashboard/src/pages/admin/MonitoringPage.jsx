import Topbar from '../../components/layout/Topbar'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Stat, StatGrid } from '../../components/ui/Stat'

const SYSTEM_METRICS = {
  uptime: '14d 6h 32m',
  cpuUsage: 23,
  memoryUsage: 61,
  diskUsage: 78,
  apiLatency: '142ms',
  claudeTokensToday: 48200,
  claudeTokensMonth: 1_240_000,
  sessionsToday: 12,
  sessionsWeek: 67,
  patientsMonitored: 44,
  activeAlerts: 2,
  weeklyReportsGenerated: 8,
}

const ENDPOINT_STATS = [
  { path: 'POST /api/cvf/extract', calls24h: 48, avgLatency: '2.1s', errorRate: '0%', status: 'healthy' },
  { path: 'GET /api/cvf/timeline/:id', calls24h: 124, avgLatency: '45ms', errorRate: '0%', status: 'healthy' },
  { path: 'GET /api/cvf/weekly-report/:id/:w', calls24h: 8, avgLatency: '85ms', errorRate: '0%', status: 'healthy' },
  { path: 'POST /api/patients', calls24h: 2, avgLatency: '12ms', errorRate: '0%', status: 'healthy' },
  { path: 'POST /api/claude/analyze', calls24h: 8, avgLatency: '8.2s', errorRate: '12.5%', status: 'degraded' },
]

const ALERT_HISTORY = [
  { id: 1, type: 'clinical', message: 'Patient p-marie: YELLOW alert — composite z-score -0.82', time: '2h ago', severity: 'warning' },
  { id: 2, type: 'system', message: 'Disk usage approaching 80% threshold', time: '18h ago', severity: 'warning' },
  { id: 3, type: 'system', message: 'Claude API rate limit hit — auto-recovered', time: '1d ago', severity: 'danger' },
  { id: 4, type: 'clinical', message: 'Weekly report generated for week 8 — 3 patients analyzed', time: '1d ago', severity: 'success' },
]

export default function MonitoringPage() {
  return (
    <>
      <Topbar title="Monitoring" subtitle="System health, usage metrics, and alerts" />

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <StatGrid cols={4}>
          <Stat label="System Uptime" value={SYSTEM_METRICS.uptime} />
          <Stat label="Sessions Today" value={SYSTEM_METRICS.sessionsToday} />
          <Stat label="Claude Tokens (24h)" value={`${(SYSTEM_METRICS.claudeTokensToday / 1000).toFixed(1)}K`} />
          <Stat label="Active Alerts" value={SYSTEM_METRICS.activeAlerts} />
        </StatGrid>

        {/* System Resources */}
        <Card>
          <CardHeader title="System Resources" subtitle="Server health and resource utilization" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'CPU', value: SYSTEM_METRICS.cpuUsage, color: 'bg-blue-500' },
              { label: 'Memory', value: SYSTEM_METRICS.memoryUsage, color: 'bg-violet-500' },
              { label: 'Disk', value: SYSTEM_METRICS.diskUsage, color: SYSTEM_METRICS.diskUsage > 75 ? 'bg-amber-500' : 'bg-emerald-500' },
              { label: 'API Latency', value: null, display: SYSTEM_METRICS.apiLatency, color: 'bg-emerald-500' },
            ].map(res => (
              <div key={res.label} className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{res.label}</span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {res.value !== null ? `${res.value}%` : res.display}
                  </span>
                </div>
                {res.value !== null && (
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${res.color}`}
                      style={{ width: `${res.value}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Claude API Usage */}
        <Card>
          <CardHeader title="Claude API Usage" subtitle="Token consumption and cost tracking" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
              <div className="text-xs text-slate-400 mb-1">Tokens Today</div>
              <div className="text-2xl font-bold text-white tabular-nums">{(SYSTEM_METRICS.claudeTokensToday).toLocaleString()}</div>
              <div className="text-[10px] text-slate-600 mt-1">~${(SYSTEM_METRICS.claudeTokensToday * 0.000015).toFixed(2)} estimated cost</div>
            </div>
            <div className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
              <div className="text-xs text-slate-400 mb-1">Tokens This Month</div>
              <div className="text-2xl font-bold text-white tabular-nums">{(SYSTEM_METRICS.claudeTokensMonth).toLocaleString()}</div>
              <div className="text-[10px] text-slate-600 mt-1">~${(SYSTEM_METRICS.claudeTokensMonth * 0.000015).toFixed(2)} estimated cost</div>
            </div>
            <div className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
              <div className="text-xs text-slate-400 mb-1">Weekly Reports Generated</div>
              <div className="text-2xl font-bold text-white tabular-nums">{SYSTEM_METRICS.weeklyReportsGenerated}</div>
              <div className="text-[10px] text-slate-600 mt-1">Using Extended Thinking (10K budget)</div>
            </div>
          </div>
        </Card>

        {/* Endpoint Health */}
        <Card>
          <CardHeader title="API Endpoint Health" subtitle="Per-endpoint performance metrics (24h)" />
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                  <th className="text-left py-2.5 px-4">Endpoint</th>
                  <th className="text-right py-2.5 px-4">Calls (24h)</th>
                  <th className="text-right py-2.5 px-4">Avg Latency</th>
                  <th className="text-right py-2.5 px-4">Error Rate</th>
                  <th className="text-left py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINT_STATS.map(ep => (
                  <tr key={ep.path} className="border-t border-slate-800/50">
                    <td className="py-2.5 px-4">
                      <code className="text-xs text-slate-300 font-mono">{ep.path}</code>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums">{ep.calls24h}</td>
                    <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums">{ep.avgLatency}</td>
                    <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums">{ep.errorRate}</td>
                    <td className="py-2.5 px-4">
                      <Badge variant={ep.status === 'healthy' ? 'success' : 'warning'}>{ep.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader title="Recent Alerts" subtitle="System and clinical notifications" />
          <div className="space-y-2">
            {ALERT_HISTORY.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/20 border border-slate-800/50">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  alert.severity === 'danger' ? 'bg-red-400' :
                  alert.severity === 'warning' ? 'bg-amber-400' :
                  'bg-emerald-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-300">{alert.message}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-600">{alert.time}</span>
                    <Badge variant={alert.type === 'clinical' ? 'brand' : 'default'}>{alert.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
