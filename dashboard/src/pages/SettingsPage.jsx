import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { api } from '../lib/api'

export default function SettingsPage() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    api.getHealth().then(setHealth)
  }, [])

  return (
    <>
      <Topbar title="Settings" subtitle="System configuration and administration" />

      <div className="p-6 space-y-6">
        {/* System Status */}
        <Card>
          <CardHeader title="System Status" subtitle="MemoVoice CVF Engine health" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusItem
              label="API Server"
              value={health ? 'Online' : 'Checking...'}
              status={health ? 'success' : 'warning'}
              detail={health?.version ? `v${health.version}` : ''}
            />
            <StatusItem
              label="Claude API"
              value="Configured"
              status="success"
              detail="claude-opus-4-6"
            />
            <StatusItem
              label="Data Storage"
              value="Local JSON"
              status="success"
              detail="./data/"
            />
          </div>
        </Card>

        {/* CVF Engine Configuration */}
        <Card>
          <CardHeader title="CVF Engine Configuration" subtitle="Feature extraction and analysis parameters" />
          <div className="space-y-4">
            <SettingRow label="Baseline Sessions Required" value="14" description="Minimum sessions to establish individual baseline" />
            <SettingRow label="High Variance Threshold" value="0.30" description="Coefficient of variation threshold for extending calibration" />
            <SettingRow label="Extended Thinking Budget" value="10,000 tokens" description="Claude Opus 4.6 thinking budget for weekly analysis" />
            <SettingRow label="Feature Extraction Model" value="claude-opus-4-6" description="Model used for 25-dimension CVF vector extraction" />
          </div>
        </Card>

        {/* Alert Thresholds */}
        <Card>
          <CardHeader title="Alert Thresholds" subtitle="Composite z-score boundaries" />
          <div className="grid grid-cols-4 gap-3">
            <ThresholdCard level="green" range="> -0.5" label="Normal variation" />
            <ThresholdCard level="yellow" range="-0.5 to -1.0" label="Notable drift" />
            <ThresholdCard level="orange" range="-1.0 to -1.5" label="Significant drift" />
            <ThresholdCard level="red" range="< -1.5" label="Critical drift" />
          </div>
        </Card>

        {/* Domain Weights */}
        <Card>
          <CardHeader title="Domain Weights" subtitle="Relative importance in composite score" />
          <div className="space-y-3">
            {[
              { domain: 'Lexical Richness', weight: 0.25, color: '#8b5cf6' },
              { domain: 'Syntactic Complexity', weight: 0.20, color: '#3b82f6' },
              { domain: 'Semantic Coherence', weight: 0.25, color: '#06b6d4' },
              { domain: 'Speech Fluency', weight: 0.20, color: '#10b981' },
              { domain: 'Memory Recall', weight: 0.10, color: '#f59e0b' },
            ].map(d => (
              <div key={d.domain} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-sm text-slate-300 w-40">{d.domain}</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full opacity-70" style={{ width: `${d.weight * 100 * 2}%`, backgroundColor: d.color }} />
                </div>
                <span className="text-xs text-slate-400 font-mono w-10 text-right">{(d.weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Confounder Weights */}
        <Card>
          <CardHeader title="Confounder Adjustments" subtitle="Weight reduction factors when confounders are present" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Illness', weight: '0.5x', desc: 'Session weight halved' },
              { name: 'Poor Sleep', weight: '0.5x', desc: 'Session weight halved' },
              { name: 'Medication Change', weight: '0.3x', desc: 'Session weight reduced 70%' },
              { name: 'Emotional Distress', weight: 'Domain-specific', desc: 'Per-domain adjustment' },
            ].map(c => (
              <div key={c.name} className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-xs font-medium text-slate-300">{c.name}</div>
                <div className="text-sm font-semibold text-amber-400 mt-1">{c.weight}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{c.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader
            title="User Management"
            subtitle="Admin accounts and permissions"
            action={<Button variant="primary" size="sm"><Icon name="plus" size={14} /> Add User</Button>}
          />
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-slate-500">User</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-slate-500">Role</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-slate-500">Status</th>
                  <th className="text-right py-2.5 px-4 text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                <UserRow name="Dr. Remi Francois" email="remi@memovoice.ai" role="Admin" active />
                <UserRow name="Dr. Sophie Martin" email="sophie@memovoice.ai" role="Clinician" active />
                <UserRow name="Pierre Dupont" email="pierre@family.com" role="Family" active={false} />
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}

function StatusItem({ label, value, status, detail }) {
  const colors = { success: 'text-emerald-400', warning: 'text-yellow-400', error: 'text-red-400' }
  const dots = { success: 'bg-emerald-400', warning: 'bg-yellow-400', error: 'bg-red-400' }
  return (
    <div className="bg-slate-800/30 rounded-lg p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dots[status]}`} />
        <span className={`text-sm font-medium ${colors[status]}`}>{value}</span>
      </div>
      {detail && <div className="text-[10px] text-slate-600 mt-1">{detail}</div>}
    </div>
  )
}

function SettingRow({ label, value, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
      <div>
        <div className="text-sm text-slate-300">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <code className="text-xs bg-slate-800 px-2.5 py-1 rounded text-violet-300">{value}</code>
    </div>
  )
}

function ThresholdCard({ level, range, label }) {
  const colors = { green: 'border-emerald-500/30 bg-emerald-500/5', yellow: 'border-yellow-500/30 bg-yellow-500/5', orange: 'border-orange-500/30 bg-orange-500/5', red: 'border-red-500/30 bg-red-500/5' }
  const textColors = { green: 'text-emerald-400', yellow: 'text-yellow-400', orange: 'text-orange-400', red: 'text-red-400' }
  return (
    <div className={`rounded-lg border p-3 ${colors[level]}`}>
      <div className={`text-sm font-semibold capitalize ${textColors[level]}`}>{level}</div>
      <div className="text-xs text-slate-400 font-mono mt-1">{range}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

function UserRow({ name, email, role, active }) {
  const roleColors = { Admin: 'brand', Clinician: 'success', Family: 'default' }
  return (
    <tr className="border-t border-slate-800/50">
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs text-white font-medium">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-sm text-slate-200">{name}</div>
            <div className="text-xs text-slate-500">{email}</div>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-4"><Badge variant={roleColors[role]}>{role}</Badge></td>
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          <span className="text-xs text-slate-400">{active ? 'Active' : 'Inactive'}</span>
        </div>
      </td>
      <td className="py-2.5 px-4 text-right">
        <Button variant="ghost" size="sm">Edit</Button>
      </td>
    </tr>
  )
}
