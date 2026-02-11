import { useState } from 'react'
import Topbar from '../../components/layout/Topbar'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Stat, StatGrid } from '../../components/ui/Stat'

const MOCK_KEYS = [
  { id: 'key_1', name: 'Production CVF Engine', prefix: 'sk-prod-...8f3a', created: '2025-10-15', lastUsed: '2026-02-11T09:30:00Z', status: 'active', calls: 12450, scope: 'cvf.extract, cvf.analyze, weekly.report' },
  { id: 'key_2', name: 'Staging Environment', prefix: 'sk-stg-...2b7c', created: '2026-01-05', lastUsed: '2026-02-10T14:00:00Z', status: 'active', calls: 3200, scope: 'cvf.extract, cvf.analyze' },
  { id: 'key_3', name: 'Development / Testing', prefix: 'sk-dev-...9e1d', created: '2026-02-01', lastUsed: '2026-02-11T08:00:00Z', status: 'active', calls: 890, scope: '*' },
  { id: 'key_4', name: 'Old Integration Key', prefix: 'sk-old-...4a2f', created: '2025-08-20', lastUsed: '2025-12-15T10:00:00Z', status: 'revoked', calls: 5600, scope: 'cvf.extract' },
]

export default function ApiKeysPage() {
  const [showCreate, setShowCreate] = useState(false)
  const totalCalls = MOCK_KEYS.filter(k => k.status === 'active').reduce((s, k) => s + k.calls, 0)

  return (
    <>
      <Topbar title="API Keys" subtitle="Manage API access credentials" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Active Keys" value={MOCK_KEYS.filter(k => k.status === 'active').length} />
          <Stat label="Revoked Keys" value={MOCK_KEYS.filter(k => k.status === 'revoked').length} />
          <Stat label="Total API Calls" value={totalCalls.toLocaleString()} />
          <Stat label="Avg Calls/Day" value={Math.round(totalCalls / 30)} />
        </StatGrid>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardHeader title="API Keys" subtitle="Keys for CVF Engine and analysis endpoints" />
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              Create Key
            </Button>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                  <th className="text-left py-2.5 px-4">Name</th>
                  <th className="text-left py-2.5 px-4">Key</th>
                  <th className="text-left py-2.5 px-4">Scope</th>
                  <th className="text-left py-2.5 px-4">Status</th>
                  <th className="text-right py-2.5 px-4">Calls</th>
                  <th className="text-left py-2.5 px-4">Last Used</th>
                  <th className="text-right py-2.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_KEYS.map(key => (
                  <tr key={key.id} className="border-t border-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="text-slate-200 text-sm">{key.name}</div>
                      <div className="text-[10px] text-slate-600">Created {key.created}</div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">{key.prefix}</code>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {key.scope.split(', ').map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-500">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={key.status === 'active' ? 'success' : 'danger'}>{key.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 tabular-nums">{key.calls.toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(key.lastUsed).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {key.status === 'active' && (
                          <>
                            <Button variant="ghost" size="sm">Rotate</Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Revoke</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Rate Limits" subtitle="Current API rate limiting configuration" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Feature Extraction', limit: '100 req/min', usage: 42, endpoint: '/api/cvf/extract' },
              { label: 'Weekly Analysis', limit: '10 req/hour', usage: 3, endpoint: '/api/cvf/weekly-report' },
              { label: 'Batch Operations', limit: '5 req/min', usage: 0, endpoint: '/api/cvf/batch' },
            ].map(rl => (
              <div key={rl.label} className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
                <div className="text-sm font-medium text-white">{rl.label}</div>
                <code className="text-[10px] text-slate-600 block mt-0.5">{rl.endpoint}</code>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-lg font-bold text-white tabular-nums">{rl.usage}</span>
                  <span className="text-xs text-slate-500">/ {rl.limit}</span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${Math.min((rl.usage / parseInt(rl.limit)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {showCreate && <CreateKeyModal onClose={() => setShowCreate(false)} />}
      </div>
    </>
  )
}

function CreateKeyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-1">Create API Key</h3>
        <p className="text-xs text-slate-500 mb-4">Generate a new key for API access.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Key Name</label>
            <input
              type="text"
              placeholder="e.g., Production Server"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Scope</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="*">All endpoints (*)</option>
              <option value="cvf">CVF Engine only</option>
              <option value="read">Read-only</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Expiration</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="never">Never</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
              <option value="1y">1 year</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>Generate Key</Button>
        </div>
      </div>
    </div>
  )
}
