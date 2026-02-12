import { useState } from 'react'
import Topbar from '../../components/layout/Topbar'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Icon } from '../../components/ui/Icon'
import { Stat, StatGrid } from '../../components/ui/Stat'

const MOCK_SESSIONS = [
  { id: 'ses-1', user: 'Super Admin', role: 'superadmin', ip: '10.0.0.1', device: 'Chrome 122 / macOS', location: 'Paris, FR', started: '2026-02-11T08:30:00Z', lastActive: '2026-02-11T09:45:00Z', status: 'active' },
  { id: 'ses-2', user: 'Dr. Remi Francois', role: 'clinician', ip: '192.168.1.42', device: 'Firefox 133 / Windows', location: 'Bordeaux, FR', started: '2026-02-11T09:15:00Z', lastActive: '2026-02-11T09:42:00Z', status: 'active' },
  { id: 'ses-3', user: 'Pierre Dupont', role: 'family', ip: '82.65.12.190', device: 'Safari 19 / iOS', location: 'Lyon, FR', started: '2026-02-11T07:00:00Z', lastActive: '2026-02-11T09:38:00Z', status: 'active' },
  { id: 'ses-4', user: 'Dr. Sophie Martin', role: 'clinician', ip: '172.16.0.55', device: 'Chrome 122 / macOS', location: 'Montpellier, FR', started: '2026-02-10T14:20:00Z', lastActive: '2026-02-10T17:30:00Z', status: 'expired' },
  { id: 'ses-5', user: 'Jean Administrateur', role: 'admin', ip: '192.168.1.100', device: 'Edge 122 / Windows', location: 'Paris, FR', started: '2026-02-09T11:00:00Z', lastActive: '2026-02-09T15:45:00Z', status: 'expired' },
]

const MOCK_LOGINS = [
  { id: 'log-1', user: 'Super Admin', event: 'login_success', ip: '10.0.0.1', time: '2026-02-11T08:30:00Z', method: 'Password + MFA' },
  { id: 'log-2', user: 'Dr. Remi Francois', event: 'login_success', ip: '192.168.1.42', time: '2026-02-11T09:15:00Z', method: 'SSO (Azure AD)' },
  { id: 'log-3', user: 'Pierre Dupont', event: 'login_success', ip: '82.65.12.190', time: '2026-02-11T07:00:00Z', method: 'Password' },
  { id: 'log-4', user: 'test@hack.com', event: 'login_failed', ip: '45.33.32.156', time: '2026-02-10T17:05:00Z', method: 'Password (3 attempts)' },
  { id: 'log-5', user: 'test@hack.com', event: 'account_locked', ip: '45.33.32.156', time: '2026-02-10T17:05:30Z', method: 'Auto-lockout' },
  { id: 'log-6', user: 'Dr. Sophie Martin', event: 'login_success', ip: '172.16.0.55', time: '2026-02-10T14:20:00Z', method: 'Password + MFA' },
  { id: 'log-7', user: 'Jean Administrateur', event: 'login_success', ip: '192.168.1.100', time: '2026-02-09T11:00:00Z', method: 'Password' },
  { id: 'log-8', user: 'Dr. Remi Francois', event: 'logout', ip: '192.168.1.42', time: '2026-02-09T18:30:00Z', method: 'Manual' },
]

const LOGIN_EVENT_VARIANTS = { login_success: 'success', login_failed: 'danger', account_locked: 'danger', logout: 'default' }

const SECURITY_CHECKS = [
  { name: 'MFA Enforcement', score: 14, max: 15, status: 'good', detail: '5/6 users have MFA enabled' },
  { name: 'Password Policy', score: 12, max: 15, status: 'good', detail: 'Min 12 chars, rotation every 90d' },
  { name: 'Session Security', score: 13, max: 15, status: 'good', detail: '4h timeout, single device enforced' },
  { name: 'Network Security', score: 10, max: 15, status: 'warning', detail: 'IP allowlist not configured for 2 orgs' },
  { name: 'Encryption', score: 15, max: 20, status: 'warning', detail: 'TLS 1.3 in-transit, AES-256 at-rest, cert expires in 45d' },
  { name: 'Vulnerability Mgmt', score: 14, max: 20, status: 'good', detail: '0 critical CVEs, last scan: 2h ago' },
]

const MFA_STATUS = [
  { user: 'Super Admin', role: 'superadmin', mfa: true, method: 'TOTP (Authenticator)', lastVerified: '2026-02-11' },
  { user: 'Dr. Remi Francois', role: 'clinician', mfa: true, method: 'SSO (Azure AD)', lastVerified: '2026-02-11' },
  { user: 'Dr. Sophie Martin', role: 'clinician', mfa: true, method: 'TOTP (Authenticator)', lastVerified: '2026-02-10' },
  { user: 'Pierre Dupont', role: 'family', mfa: false, method: '—', lastVerified: '—' },
  { user: 'Marie-Claire Petit', role: 'family', mfa: false, method: '—', lastVerified: '—' },
  { user: 'Jean Administrateur', role: 'admin', mfa: true, method: 'TOTP (Authenticator)', lastVerified: '2026-02-09' },
]

export default function SecurityPage() {
  const [tab, setTab] = useState('sessions')
  const totalScore = SECURITY_CHECKS.reduce((s, c) => s + c.score, 0)
  const maxScore = SECURITY_CHECKS.reduce((s, c) => s + c.max, 0)
  const scorePercent = Math.round((totalScore / maxScore) * 100)
  const activeSessions = MOCK_SESSIONS.filter(s => s.status === 'active').length
  const failedLogins = MOCK_LOGINS.filter(l => l.event === 'login_failed').length
  const mfaEnabled = MFA_STATUS.filter(m => m.mfa).length

  return (
    <>
      <Topbar title="Security Center" subtitle="Session management, authentication monitoring, and security posture" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Security Score" value={`${scorePercent}/100`} />
          <Stat label="Active Sessions" value={activeSessions} />
          <Stat label="Failed Logins (7d)" value={failedLogins} />
          <Stat label="MFA Enabled" value={`${mfaEnabled}/${MFA_STATUS.length}`} />
        </StatGrid>

        {/* Security Score Breakdown */}
        <Card>
          <CardHeader title="Security Posture Score" subtitle="Overall platform security assessment across 6 categories" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {SECURITY_CHECKS.map(check => (
              <div key={check.name} className={`rounded-lg border p-4 ${check.status === 'good' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{check.name}</span>
                  <span className={`text-xs font-medium ${check.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {check.score}/{check.max}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${check.status === 'good' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${(check.score / check.max) * 100}%` }} />
                </div>
                <div className="text-[10px] text-slate-500">{check.detail}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { key: 'sessions', label: 'Active Sessions' },
            { key: 'logins', label: 'Login History' },
            { key: 'mfa', label: 'MFA Status' },
          ].map(t => (
            <Button key={t.key} size="sm" variant={tab === t.key ? 'primary' : 'ghost'} onClick={() => setTab(t.key)}>
              {t.label}
            </Button>
          ))}
        </div>

        {/* Sessions Tab */}
        {tab === 'sessions' && (
          <Card>
            <CardHeader title="Active Sessions" subtitle="All currently active user sessions across the platform" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">User</th>
                    <th className="text-left py-2.5 px-4">Device</th>
                    <th className="text-left py-2.5 px-4">IP / Location</th>
                    <th className="text-left py-2.5 px-4">Started</th>
                    <th className="text-left py-2.5 px-4">Last Active</th>
                    <th className="text-left py-2.5 px-4">Status</th>
                    <th className="text-right py-2.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SESSIONS.map(ses => (
                    <tr key={ses.id} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="text-xs text-slate-300">{ses.user}</div>
                        <div className="text-[10px] text-slate-600">{ses.role}</div>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-400">{ses.device}</td>
                      <td className="py-2.5 px-4">
                        <div className="text-xs text-slate-400">{ses.ip}</div>
                        <div className="text-[10px] text-slate-600">{ses.location}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <code className="text-[10px] text-slate-500 font-mono">{new Date(ses.started).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</code>
                      </td>
                      <td className="py-2.5 px-4">
                        <code className="text-[10px] text-slate-500 font-mono">{new Date(ses.lastActive).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</code>
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge variant={ses.status === 'active' ? 'success' : 'default'}>{ses.status}</Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {ses.status === 'active' && (
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Force Logout</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Login History Tab */}
        {tab === 'logins' && (
          <Card>
            <CardHeader title="Login History" subtitle="Authentication events — successful logins, failures, and lockouts" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Time</th>
                    <th className="text-left py-2.5 px-4">User</th>
                    <th className="text-left py-2.5 px-4">Event</th>
                    <th className="text-left py-2.5 px-4">Method</th>
                    <th className="text-left py-2.5 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_LOGINS.map(log => (
                    <tr key={log.id} className={`border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors ${log.event === 'login_failed' || log.event === 'account_locked' ? 'bg-red-500/5' : ''}`}>
                      <td className="py-2.5 px-4">
                        <code className="text-[10px] text-slate-500 font-mono">{new Date(log.time).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</code>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-300">{log.user}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={LOGIN_EVENT_VARIANTS[log.event]}>{log.event.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-400">{log.method}</td>
                      <td className="py-2.5 px-4">
                        <code className="text-[10px] text-slate-600 font-mono">{log.ip}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* MFA Status Tab */}
        {tab === 'mfa' && (
          <Card>
            <CardHeader title="Multi-Factor Authentication" subtitle="MFA enrollment status and enforcement per user" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">User</th>
                    <th className="text-left py-2.5 px-4">Role</th>
                    <th className="text-left py-2.5 px-4">MFA Enabled</th>
                    <th className="text-left py-2.5 px-4">Method</th>
                    <th className="text-left py-2.5 px-4">Last Verified</th>
                    <th className="text-right py-2.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MFA_STATUS.map(m => (
                    <tr key={m.user} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4 text-xs text-slate-300">{m.user}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{m.role}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={m.mfa ? 'success' : 'danger'}>{m.mfa ? 'Enabled' : 'Disabled'}</Badge>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-400">{m.method}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{m.lastVerified}</td>
                      <td className="py-2.5 px-4 text-right">
                        {!m.mfa && <Button variant="ghost" size="sm" className="text-amber-400">Enforce MFA</Button>}
                        {m.mfa && <Button variant="ghost" size="sm">Reset</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {MFA_STATUS.some(m => !m.mfa) && (
              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <div className="text-xs text-amber-300/80">
                  <strong>Recommendation:</strong> {MFA_STATUS.filter(m => !m.mfa).length} user(s) do not have MFA enabled. Consider enforcing MFA for all roles to meet HIPAA Security Rule requirements.
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  )
}
