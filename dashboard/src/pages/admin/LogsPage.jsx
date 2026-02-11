import { useState } from 'react'
import Topbar from '../../components/layout/Topbar'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Stat, StatGrid } from '../../components/ui/Stat'

const LOG_LEVELS = { info: 'default', warn: 'warning', error: 'danger', debug: 'brand' }

const MOCK_LOGS = [
  { id: 1, ts: '2026-02-11T09:32:15Z', level: 'info', source: 'cvf-engine', message: 'Feature extraction completed for session s-042', user: 'system', duration: '2.3s' },
  { id: 2, ts: '2026-02-11T09:31:50Z', level: 'info', source: 'api', message: 'POST /api/cvf/extract — 200 OK', user: 'Dr. Remi Francois', duration: '2.4s' },
  { id: 3, ts: '2026-02-11T09:30:00Z', level: 'warn', source: 'drift-detector', message: 'Patient p-marie: composite z-score at -0.82 (YELLOW threshold)', user: 'system', duration: null },
  { id: 4, ts: '2026-02-11T09:15:22Z', level: 'info', source: 'auth', message: 'User login: remi@memovoice.ai (clinician)', user: 'Dr. Remi Francois', duration: null },
  { id: 5, ts: '2026-02-11T08:45:10Z', level: 'error', source: 'claude-api', message: 'Rate limit exceeded — retrying in 30s (attempt 1/3)', user: 'system', duration: null },
  { id: 6, ts: '2026-02-11T08:45:42Z', level: 'info', source: 'claude-api', message: 'Retry successful — weekly analysis generated for week 8', user: 'system', duration: '8.1s' },
  { id: 7, ts: '2026-02-11T08:30:00Z', level: 'info', source: 'auth', message: 'User login: admin@memovoice.ai (superadmin)', user: 'Super Admin', duration: null },
  { id: 8, ts: '2026-02-11T08:00:05Z', level: 'info', source: 'scheduler', message: 'Daily baseline recalculation started for 4 patients', user: 'system', duration: '12.7s' },
  { id: 9, ts: '2026-02-10T23:59:59Z', level: 'info', source: 'scheduler', message: 'Nightly log rotation completed — 2.3MB archived', user: 'system', duration: '0.4s' },
  { id: 10, ts: '2026-02-10T18:20:30Z', level: 'warn', source: 'storage', message: 'Disk usage at 78% — consider cleanup of old session data', user: 'system', duration: null },
  { id: 11, ts: '2026-02-10T16:45:00Z', level: 'debug', source: 'cvf-engine', message: 'Confounder adjustment applied: illness (0.5x weight) for session s-041', user: 'system', duration: null },
  { id: 12, ts: '2026-02-10T14:20:00Z', level: 'info', source: 'auth', message: 'User login: sophie@memovoice.ai (clinician)', user: 'Dr. Sophie Martin', duration: null },
]

export default function LogsPage() {
  const [levelFilter, setLevelFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const sources = [...new Set(MOCK_LOGS.map(l => l.source))]
  const filtered = MOCK_LOGS
    .filter(l => levelFilter === 'all' || l.level === levelFilter)
    .filter(l => sourceFilter === 'all' || l.source === sourceFilter)

  const errorCount = MOCK_LOGS.filter(l => l.level === 'error').length
  const warnCount = MOCK_LOGS.filter(l => l.level === 'warn').length

  return (
    <>
      <Topbar title="System Logs" subtitle="Real-time platform activity and events" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Total Logs (24h)" value={MOCK_LOGS.length} />
          <Stat label="Errors" value={errorCount} />
          <Stat label="Warnings" value={warnCount} />
          <Stat label="Avg Response Time" value="3.2s" />
        </StatGrid>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <div className="flex gap-1">
                {['all', 'info', 'warn', 'error', 'debug'].map(lvl => (
                  <Button key={lvl} size="sm" variant={levelFilter === lvl ? 'primary' : 'ghost'} onClick={() => setLevelFilter(lvl)}>
                    {lvl === 'all' ? 'All Levels' : lvl.toUpperCase()}
                  </Button>
                ))}
              </div>
              <select
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
              >
                <option value="all">All Sources</option>
                {sources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Button variant="ghost" size="sm">Export Logs</Button>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-slate-800/50 text-[10px] text-slate-500 font-medium font-sans">
                  <th className="text-left py-2 px-3 w-40">Timestamp</th>
                  <th className="text-left py-2 px-3 w-16">Level</th>
                  <th className="text-left py-2 px-3 w-24">Source</th>
                  <th className="text-left py-2 px-3">Message</th>
                  <th className="text-left py-2 px-3 w-32">User</th>
                  <th className="text-right py-2 px-3 w-16">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-2 px-3 text-slate-500 tabular-nums">
                      {new Date(log.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <span className="text-slate-700 ml-1">
                        {new Date(log.ts).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant={LOG_LEVELS[log.level]}>{log.level}</Badge>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-slate-500">{log.source}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{log.message}</td>
                    <td className="py-2 px-3 text-slate-500 font-sans text-[10px]">{log.user}</td>
                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">{log.duration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600">
            <span>Showing {filtered.length} of {MOCK_LOGS.length} entries</span>
            <span>Auto-refresh: 30s</span>
          </div>
        </Card>
      </div>
    </>
  )
}
