import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '@azh/shared-ui'
import { Button } from '@azh/shared-ui'
import { Badge } from '@azh/shared-ui'
import { Icon } from '@azh/shared-ui'
import { Stat, StatGrid } from '@azh/shared-ui'

const SEVERITY_VARIANTS = { info: 'default', warning: 'warning', critical: 'danger', success: 'success' }

const MOCK_AUDIT = [
  { id: 'aud-01', timestamp: '2026-02-11T09:42:18Z', actor: 'Dr. Remi Francois', actorRole: 'clinician', action: 'patient.data.view', resource: 'Patient: Marie Dubois', ip: '192.168.1.42', severity: 'info', category: 'PHI Access' },
  { id: 'aud-02', timestamp: '2026-02-11T09:38:05Z', actor: 'Super Admin', actorRole: 'superadmin', action: 'admin.user.create', resource: 'User: Dr. Ahmed Benali', ip: '10.0.0.1', severity: 'warning', category: 'Admin' },
  { id: 'aud-03', timestamp: '2026-02-11T09:30:12Z', actor: 'Pierre Dupont', actorRole: 'family', action: 'patient.report.view', resource: 'Report: Week 8 — Marie Dubois', ip: '82.65.12.190', severity: 'info', category: 'PHI Access' },
  { id: 'aud-04', timestamp: '2026-02-11T09:15:00Z', actor: 'System', actorRole: 'system', action: 'cvf.analysis.complete', resource: 'Session #156 — Marie Dubois', ip: '127.0.0.1', severity: 'success', category: 'System' },
  { id: 'aud-05', timestamp: '2026-02-11T08:55:33Z', actor: 'Super Admin', actorRole: 'superadmin', action: 'admin.user.suspend', resource: 'User: Dr. Ahmed Benali', ip: '10.0.0.1', severity: 'critical', category: 'Admin' },
  { id: 'aud-06', timestamp: '2026-02-11T08:30:00Z', actor: 'Super Admin', actorRole: 'superadmin', action: 'auth.login.success', resource: 'Session started', ip: '10.0.0.1', severity: 'info', category: 'Auth' },
  { id: 'aud-07', timestamp: '2026-02-10T23:00:00Z', actor: 'System', actorRole: 'system', action: 'backup.daily.complete', resource: 'Backup: 2026-02-10 (234 MB)', ip: '127.0.0.1', severity: 'success', category: 'System' },
  { id: 'aud-08', timestamp: '2026-02-10T18:12:44Z', actor: 'Dr. Sophie Martin', actorRole: 'clinician', action: 'patient.data.view', resource: 'Patient: Jean Moreau', ip: '172.16.0.55', severity: 'info', category: 'PHI Access' },
  { id: 'aud-09', timestamp: '2026-02-10T17:05:00Z', actor: 'Unknown', actorRole: 'unknown', action: 'auth.login.failed', resource: 'Email: test@hack.com (3 attempts)', ip: '45.33.32.156', severity: 'critical', category: 'Auth' },
  { id: 'aud-10', timestamp: '2026-02-10T16:30:22Z', actor: 'Jean Administrateur', actorRole: 'admin', action: 'admin.settings.update', resource: 'Alert threshold changed: -1.2 → -1.5', ip: '192.168.1.100', severity: 'warning', category: 'Admin' },
  { id: 'aud-11', timestamp: '2026-02-10T14:20:00Z', actor: 'Dr. Sophie Martin', actorRole: 'clinician', action: 'auth.login.success', resource: 'Session started', ip: '172.16.0.55', severity: 'info', category: 'Auth' },
  { id: 'aud-12', timestamp: '2026-02-10T12:00:00Z', actor: 'System', actorRole: 'system', action: 'gdpr.consent.expiry_warning', resource: 'Helen Chambers — consent v2.0 outdated', ip: '127.0.0.1', severity: 'warning', category: 'Compliance' },
  { id: 'aud-13', timestamp: '2026-02-10T09:00:00Z', actor: 'System', actorRole: 'system', action: 'cvf.alert.red', resource: 'RED alert: Marie Dubois — composite z-score -1.8', ip: '127.0.0.1', severity: 'critical', category: 'Clinical' },
  { id: 'aud-14', timestamp: '2026-02-09T22:00:00Z', actor: 'System', actorRole: 'system', action: 'backup.daily.complete', resource: 'Backup: 2026-02-09 (231 MB)', ip: '127.0.0.1', severity: 'success', category: 'System' },
  { id: 'aud-15', timestamp: '2026-02-09T11:00:00Z', actor: 'Jean Administrateur', actorRole: 'admin', action: 'auth.login.success', resource: 'Session started', ip: '192.168.1.100', severity: 'info', category: 'Auth' },
]

const CATEGORIES = ['All', 'PHI Access', 'Admin', 'Auth', 'System', 'Clinical', 'Compliance']

export default function AuditPage() {
  const [catFilter, setCatFilter] = useState('All')
  const [sevFilter, setSevFilter] = useState('all')

  const filtered = MOCK_AUDIT
    .filter(e => catFilter === 'All' || e.category === catFilter)
    .filter(e => sevFilter === 'all' || e.severity === sevFilter)

  const phiCount = MOCK_AUDIT.filter(e => e.category === 'PHI Access').length
  const criticalCount = MOCK_AUDIT.filter(e => e.severity === 'critical').length
  const todayCount = MOCK_AUDIT.filter(e => e.timestamp.startsWith('2026-02-11')).length

  return (
    <>
      <Topbar title="Audit Trail" subtitle="Immutable log of all platform activity — HIPAA & GDPR compliant" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Total Entries" value={MOCK_AUDIT.length} />
          <Stat label="Today" value={todayCount} />
          <Stat label="PHI Access Events" value={phiCount} />
          <Stat label="Critical Events" value={criticalCount} />
        </StatGrid>

        {/* Hash Chain Verification */}
        <Card>
          <CardHeader title="Log Integrity" subtitle="Cryptographic hash chain ensures audit logs cannot be tampered with" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Chain Verified</span>
              </div>
              <div className="text-[10px] text-slate-500">Last verified: 2026-02-11T09:45:00Z</div>
              <code className="text-[10px] text-slate-600 font-mono block mt-1 truncate">SHA-256: a3f8c2...7d91e4</code>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-800/20 p-4">
              <div className="text-xs text-slate-400 mb-1">Retention Policy</div>
              <div className="text-sm font-medium text-white">7 years (PHI)</div>
              <div className="text-[10px] text-slate-500 mt-1">3 years (Auth) — 1 year (System)</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-800/20 p-4">
              <div className="text-xs text-slate-400 mb-1">Storage</div>
              <div className="text-sm font-medium text-white">42,891 entries</div>
              <div className="text-[10px] text-slate-500 mt-1">12.4 MB — append-only log</div>
            </div>
          </div>
        </Card>

        {/* Filters & Export */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <Button key={c} size="sm" variant={catFilter === c ? 'primary' : 'ghost'} onClick={() => setCatFilter(c)}>
                  {c}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none" value={sevFilter} onChange={e => setSevFilter(e.target.value)}>
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
              <Button variant="default" size="sm"><Icon name="download" size={14} /> Export CSV</Button>
              <Button variant="default" size="sm">Export JSON</Button>
            </div>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                  <th className="text-left py-2.5 px-4">Timestamp</th>
                  <th className="text-left py-2.5 px-4">Actor</th>
                  <th className="text-left py-2.5 px-4">Action</th>
                  <th className="text-left py-2.5 px-4">Resource</th>
                  <th className="text-left py-2.5 px-4">IP</th>
                  <th className="text-left py-2.5 px-4">Category</th>
                  <th className="text-left py-2.5 px-4">Severity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id} className={`border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors ${entry.severity === 'critical' ? 'bg-red-500/5' : ''}`}>
                    <td className="py-2.5 px-4">
                      <code className="text-[10px] text-slate-500 font-mono">{new Date(entry.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</code>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="text-xs text-slate-300">{entry.actor}</div>
                      <div className="text-[10px] text-slate-600">{entry.actorRole}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <code className="text-[10px] text-violet-400 font-mono">{entry.action}</code>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-400 max-w-[200px] truncate">{entry.resource}</td>
                    <td className="py-2.5 px-4">
                      <code className="text-[10px] text-slate-600 font-mono">{entry.ip}</code>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-500">{entry.category}</td>
                    <td className="py-2.5 px-4"><Badge variant={SEVERITY_VARIANTS[entry.severity]}>{entry.severity}</Badge></td>
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
