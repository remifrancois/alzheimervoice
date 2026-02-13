import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '@azh/shared-ui'
import { Badge } from '@azh/shared-ui'
import { Stat, StatGrid } from '@azh/shared-ui'
import { Button } from '@azh/shared-ui'
import { api } from '@azh/shared-ui'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function timeAgo(dateStr) {
  if (!dateStr || dateStr === 'never') return 'never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DatabaseStatusPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('tables')

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const result = await api.getDatabaseStatus()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading && !data) {
    return (
      <>
        <Topbar title="Database" subtitle="PostgreSQL status and metrics" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <div className="text-sm text-slate-400">Connecting to database...</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error && !data) {
    return (
      <>
        <Topbar title="Database" subtitle="PostgreSQL status and metrics" />
        <div className="p-6">
          <Card>
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-sm text-red-400 font-medium mb-1">Connection Failed</div>
              <div className="text-xs text-slate-500 mb-4">{error}</div>
              <Button size="sm" onClick={loadData}>Retry</Button>
            </div>
          </Card>
        </div>
      </>
    )
  }

  // Offline / file mode
  if (data && !data.connected) {
    return (
      <>
        <Topbar title="Database" subtitle="PostgreSQL status and metrics" />
        <div className="p-6">
          <Card>
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="text-sm text-amber-400 font-medium mb-1">File-Based Storage Mode</div>
              <div className="text-xs text-slate-500 mb-2">{data.message || 'Database not configured.'}</div>
              <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-800/50 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                USE_DATABASE = {data.use_database ? 'true' : 'false'}
              </div>
            </div>
          </Card>
        </div>
      </>
    )
  }

  const tabs = [
    { id: 'tables', label: 'Tables' },
    { id: 'indexes', label: 'Indexes' },
    { id: 'rls', label: 'RLS & Policies' },
    { id: 'migrations', label: 'Migrations' },
    { id: 'enums', label: 'Enums' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <>
      <Topbar title="Database" subtitle="PostgreSQL status and metrics" />

      <div className="p-6 space-y-6">
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sm text-emerald-400 font-medium">Connected</span>
          </div>
          <span className="text-xs text-slate-600">|</span>
          <span className="text-xs text-slate-500">{data.server?.database_name}</span>
          <span className="text-xs text-slate-600">|</span>
          <span className="text-xs text-slate-500">{data.latency_ms}ms latency</span>
          <span className="text-xs text-slate-600">|</span>
          <Badge variant={data.use_database ? 'success' : 'warning'}>
            {data.mode === 'database' ? 'DB Active' : 'File Mode'}
          </Badge>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" onClick={loadData}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Key Metrics */}
        <StatGrid cols={4}>
          <Stat label="Database Size" value={data.size?.total || '—'} />
          <Stat label="Total Tables" value={data.summary?.table_count || 0} />
          <Stat label="Total Rows" value={(data.summary?.total_rows || 0).toLocaleString()} />
          <Stat label="Active Connections" value={data.connections?.active || 0} />
        </StatGrid>

        {/* Server Info */}
        <Card>
          <CardHeader title="Server Information" subtitle="PostgreSQL instance details" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem label="PostgreSQL Version" value={data.server?.pg_version?.split(' on ')[0] || '—'} />
            <InfoItem label="Server Uptime" value={data.server?.server_start_time ? timeAgo(data.server.server_start_time) + ' (started)' : '—'} />
            <InfoItem label="Current Role" value={data.server?.current_role || '—'} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <ConnBox label="Total" value={data.connections?.total} color="text-white" />
            <ConnBox label="Active" value={data.connections?.active} color="text-emerald-400" />
            <ConnBox label="Idle" value={data.connections?.idle} color="text-slate-400" />
            <ConnBox label="Idle in Txn" value={data.connections?.idle_in_transaction} color="text-amber-400" />
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-slate-800 pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-violet-300 border-violet-500 font-medium'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.label}
              {tab.id === 'tables' && <span className="ml-1.5 text-[10px] text-slate-600">{data.tables?.length}</span>}
              {tab.id === 'indexes' && <span className="ml-1.5 text-[10px] text-slate-600">{data.indexes?.length}</span>}
              {tab.id === 'rls' && <span className="ml-1.5 text-[10px] text-slate-600">{data.policies?.length}</span>}
              {tab.id === 'enums' && <span className="ml-1.5 text-[10px] text-slate-600">{data.enums?.length}</span>}
            </button>
          ))}
        </div>

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <Card>
            <CardHeader title="Table Sizes & Row Counts" subtitle="All public schema tables ordered by total size" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Table</th>
                    <th className="text-right py-2.5 px-4">Rows</th>
                    <th className="text-right py-2.5 px-4">Data Size</th>
                    <th className="text-right py-2.5 px-4">Index Size</th>
                    <th className="text-right py-2.5 px-4">Total Size</th>
                    <th className="text-right py-2.5 px-4">Dead Rows</th>
                    <th className="text-left py-2.5 px-4">Last Vacuum</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.tables || []).map(table => {
                    const maxBytes = Math.max(...(data.tables || []).map(t => t.total_size_bytes || 0), 1)
                    const pct = Math.max(((table.total_size_bytes || 0) / maxBytes) * 100, 2)
                    return (
                      <tr key={table.name} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-slate-300 font-mono">{table.name}</code>
                          </div>
                          <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden w-24">
                            <div className="h-full rounded-full bg-violet-500/60" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-300 tabular-nums font-medium">
                          {(table.row_count || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums text-xs">
                          {table.data_size}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums text-xs">
                          {table.index_size}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-300 tabular-nums text-xs font-medium">
                          {table.total_size}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {table.dead_rows > 0 ? (
                            <span className="text-amber-400 text-xs tabular-nums">{table.dead_rows.toLocaleString()}</span>
                          ) : (
                            <span className="text-slate-600 text-xs">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-500">
                          {timeAgo(table.last_autovacuum !== 'never' ? table.last_autovacuum : table.last_vacuum)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-700 bg-slate-800/30">
                    <td className="py-2.5 px-4 text-xs text-slate-400 font-medium">
                      Total ({data.tables?.length} tables)
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-300 tabular-nums font-medium text-xs">
                      {(data.summary?.total_rows || 0).toLocaleString()}
                    </td>
                    <td colSpan={2} />
                    <td className="py-2.5 px-4 text-right text-slate-300 tabular-nums font-medium text-xs">
                      {data.size?.total}
                    </td>
                    <td className="py-2.5 px-4 text-right text-xs">
                      {data.summary?.total_dead_rows > 0 && (
                        <span className="text-amber-400 tabular-nums">{data.summary.total_dead_rows.toLocaleString()}</span>
                      )}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}

        {/* Indexes Tab */}
        {activeTab === 'indexes' && (
          <Card>
            <CardHeader title="Index Statistics" subtitle="Index sizes and scan activity" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Index</th>
                    <th className="text-left py-2.5 px-4">Table</th>
                    <th className="text-right py-2.5 px-4">Size</th>
                    <th className="text-right py-2.5 px-4">Scans</th>
                    <th className="text-right py-2.5 px-4">Tuples Read</th>
                    <th className="text-left py-2.5 px-4">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.indexes || []).map(idx => (
                    <tr key={idx.name} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <code className="text-xs text-slate-300 font-mono">{idx.name}</code>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{idx.table}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums text-xs">{idx.size}</td>
                      <td className="py-2.5 px-4 text-right text-slate-300 tabular-nums text-xs">{(idx.scans || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400 tabular-nums text-xs">{(idx.tuples_read || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={idx.scans > 0 ? 'success' : 'default'}>
                          {idx.scans > 0 ? 'Active' : 'Unused'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(data.indexes || []).filter(i => i.scans === 0).length > 0 && (
              <div className="mt-3 text-[10px] text-slate-600 px-1">
                {(data.indexes || []).filter(i => i.scans === 0).length} unused indexes detected.
                Unused indexes consume storage and slow writes. Consider removing them after verifying they aren't needed for future queries.
              </div>
            )}
          </Card>
        )}

        {/* RLS & Policies Tab */}
        {activeTab === 'rls' && (
          <>
            <Card>
              <CardHeader title="Row-Level Security Status" subtitle="RLS enforcement per table" />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {(data.rls || []).map(r => (
                  <div key={r.table} className={`rounded-lg border p-3 ${
                    r.enabled
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-slate-800 bg-slate-800/20'
                  }`}>
                    <code className="text-[10px] text-slate-300 font-mono block truncate">{r.table}</code>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${r.enabled ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      <span className={`text-[10px] ${r.enabled ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {r.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Security Policies" subtitle="Active RLS policies per table" />
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                      <th className="text-left py-2.5 px-4">Table</th>
                      <th className="text-left py-2.5 px-4">Policy Name</th>
                      <th className="text-left py-2.5 px-4">Command</th>
                      <th className="text-left py-2.5 px-4">Roles</th>
                      <th className="text-left py-2.5 px-4">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.policies || []).map((p, i) => (
                      <tr key={`${p.table}-${p.name}-${i}`} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 px-4">
                          <code className="text-xs text-slate-300 font-mono">{p.table}</code>
                        </td>
                        <td className="py-2.5 px-4">
                          <code className="text-xs text-violet-300 font-mono">{p.name}</code>
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant="default">{p.command}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-400">
                          {Array.isArray(p.roles) ? p.roles.join(', ') : p.roles}
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant={p.permissive === 'PERMISSIVE' ? 'success' : 'warning'}>
                            {p.permissive}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Migrations Tab */}
        {activeTab === 'migrations' && (
          <Card>
            <CardHeader title="Applied Migrations" subtitle="Schema migration history from Supabase" />
            {(data.migrations || []).length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                No migration records found. Migrations may not be tracked in this environment.
              </div>
            ) : (
              <div className="space-y-2">
                {(data.migrations || []).map((m, i) => (
                  <div key={m.version} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/20 border border-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-300 font-mono truncate">{m.name}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">Version: {m.version}</div>
                    </div>
                    <Badge variant="success">Applied</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Enums Tab */}
        {activeTab === 'enums' && (
          <Card>
            <CardHeader title="Custom Enum Types" subtitle="PostgreSQL enum types defined in the public schema" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.enums || []).map(e => (
                <div key={e.name} className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
                  <code className="text-sm text-violet-300 font-mono font-medium">{e.name}</code>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(e.values || []).map(v => (
                      <span key={v} className="text-[10px] bg-slate-800 text-slate-400 rounded px-1.5 py-0.5 font-mono">
                        {v}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-2">{(e.values || []).length} values</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader title="PostgreSQL Configuration" subtitle="Key database settings and limits" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Setting</th>
                    <th className="text-left py-2.5 px-4">Value</th>
                    <th className="text-left py-2.5 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.settings || []).map(s => (
                    <tr key={s.name} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <code className="text-xs text-slate-300 font-mono">{s.name}</code>
                      </td>
                      <td className="py-2.5 px-4 text-sm text-violet-300 tabular-nums font-medium">
                        {s.value}{s.unit ? ` ${s.unit}` : ''}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{s.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-sm text-white font-medium truncate">{value}</div>
    </div>
  )
}

function ConnBox({ label, value, color }) {
  return (
    <div className="rounded-lg border border-slate-800 p-3 bg-slate-800/20 text-center">
      <div className={`text-2xl font-bold tabular-nums ${color}`}>{value ?? '—'}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
