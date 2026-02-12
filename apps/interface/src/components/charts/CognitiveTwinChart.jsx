import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import { Card, CardHeader, Badge, api } from '@azh/shared-ui'

export default function CognitiveTwinChart({ patientId, timeline }) {
  const [twinData, setTwinData] = useState(null)

  useEffect(() => {
    if (patientId) {
      api.getTwin(patientId).then(setTwinData).catch(() => {})
    }
  }, [patientId])

  if (!twinData || !timeline) {
    return (
      <Card>
        <CardHeader title="Cognitive Twin" subtitle="Real vs expected normal aging trajectory" />
        <div className="text-sm text-slate-500 py-4">Twin analysis requires established baseline.</div>
      </Card>
    )
  }

  // Build comparison data
  const monitoring = timeline.timeline.filter(s => s.composite !== undefined)
  const chartData = monitoring.map((entry, i) => ({
    session: i + 1,
    real: entry.composite != null ? Math.round(entry.composite * 1000) / 1000 : null,
    twin: twinData.twin?.twinVector
      ? computeSimpleTwinComposite(twinData.twin.twinVector, i + 1, monitoring.length)
      : null,
  }))

  const divergence = twinData.divergence
  const alertColor = {
    green: 'success',
    yellow: 'warning',
    orange: 'warning',
    red: 'danger',
  }

  return (
    <Card>
      <CardHeader
        title="Cognitive Twin Divergence"
        subtitle="Patient trajectory vs personalized normal aging model"
      />

      {divergence && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Divergence:</span>
            <span className={`text-sm font-mono font-bold ${
              divergence.overall < 1 ? 'text-emerald-400' :
              divergence.overall < 2 ? 'text-yellow-400' :
              divergence.overall < 3 ? 'text-orange-400' : 'text-red-400'
            }`}>
              {divergence.overall.toFixed(2)}
            </span>
          </div>
          <Badge variant={alertColor[divergence.alert_level] || 'default'}>
            {divergence.interpretation}
          </Badge>
        </div>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} domain={[-2.5, 0.5]} />
          <Tooltip content={<TwinTooltip />} />

          <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
          <ReferenceLine y={-0.5} stroke="#eab30820" strokeDasharray="3 3" />
          <ReferenceLine y={-1.0} stroke="#f9731620" strokeDasharray="3 3" />

          {/* Twin trajectory (expected normal aging) */}
          <Line
            type="monotone"
            dataKey="twin"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            connectNulls
            name="Expected (Twin)"
          />

          {/* Real trajectory */}
          <Line
            type="monotone"
            dataKey="real"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#8b5cf6', stroke: '#0f172a', strokeWidth: 2 }}
            connectNulls
            name="Actual"
          />

          <Legend
            wrapperStyle={{ fontSize: 10, color: '#94a3b8' }}
            iconType="line"
          />
        </LineChart>
      </ResponsiveContainer>

      {divergence?.domains && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 mb-2">Domain Divergence</div>
          <div className="flex gap-2">
            {Object.entries(divergence.domains).map(([domain, score]) => (
              <div key={domain} className="flex-1 text-center">
                <div className={`text-xs font-mono font-bold ${
                  score < 1 ? 'text-emerald-400' : score < 2 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {score.toFixed(1)}
                </div>
                <div className="text-[9px] text-slate-600 capitalize">{domain}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function TwinTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs space-y-0.5">
      <div className="text-slate-500">Session {label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-slate-200 font-mono">{p.value?.toFixed(3) ?? '-'}</span>
        </div>
      ))}
    </div>
  )
}

// Simplified twin composite calculation for chart rendering
function computeSimpleTwinComposite(twinVector, session, totalSessions) {
  // Scale the twin values based on session position
  const features = Object.values(twinVector)
  if (features.length === 0) return null
  const vals = features.map(f => f?.expected ?? 0.5)
  // Convert raw twin values to z-score equivalent (centered around 0)
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length
  // The twin drifts very slightly over time (normal aging)
  return Math.round((-(0.5 - mean) - (session / totalSessions) * 0.05) * 1000) / 1000
}
