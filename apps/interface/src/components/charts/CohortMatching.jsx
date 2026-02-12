import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, PieChart, Pie } from 'recharts'
import { Card, CardHeader, Badge, api } from '@azh/shared-ui'

const OUTCOME_COLORS = {
  normal: '#10b981',
  mci_stable: '#eab308',
  alzheimer: '#ef4444',
  depression: '#a855f7',
  other_dementia: '#6366f1',
}

const OUTCOME_LABELS = {
  normal: 'Normal Aging',
  mci_stable: 'MCI (Stable)',
  alzheimer: "MCI → Alzheimer's",
  depression: 'Depression',
  other_dementia: 'Other Dementia',
}

export default function CohortMatching({ patientId }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (patientId) {
      api.getCohortMatch(patientId).then(setData).catch(() => {})
    }
  }, [patientId])

  if (!data?.outcome_probabilities) {
    return (
      <Card>
        <CardHeader title="Cohort Trajectory Matching" subtitle="Matching against 100 synthetic trajectories" />
        <div className="text-sm text-slate-500 py-4">Requires baseline and monitoring data.</div>
      </Card>
    )
  }

  const pieData = Object.entries(data.outcome_probabilities)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: OUTCOME_LABELS[key] || key,
      key,
      value: Math.round(value * 100),
    }))
    .sort((a, b) => b.value - a.value)

  const primary = data.primary_prediction

  return (
    <Card>
      <CardHeader
        title="Cohort Trajectory Matching"
        subtitle={`Matched against 100 reference trajectories (${data.weeks_analyzed || 0} weeks analyzed)`}
      />

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500">Predicted outcome:</span>
        <Badge variant={primary === 'normal' ? 'success' : primary === 'alzheimer' ? 'danger' : 'warning'}>
          {OUTCOME_LABELS[primary] || primary}
        </Badge>
        <span className="text-xs text-slate-500 ml-auto">
          Match confidence: {Math.round((data.confidence || 0) * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Probability pie chart */}
        <div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
              >
                {pieData.map(entry => (
                  <Cell key={entry.key} fill={OUTCOME_COLORS[entry.key] || '#64748b'} fillOpacity={0.8} />
                ))}
              </Pie>
              <Tooltip content={<CohortTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Outcome probability bars */}
        <div className="space-y-2 pt-2">
          {pieData.map(entry => (
            <div key={entry.key} className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">{entry.name}</span>
                <span className="text-slate-300 font-mono">{entry.value}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${entry.value}%`,
                    backgroundColor: OUTCOME_COLORS[entry.key] || '#64748b',
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closest matches */}
      {data.matches?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 mb-2">Closest Reference Trajectories</div>
          <div className="flex gap-2 flex-wrap">
            {data.matches.slice(0, 5).map(match => (
              <div
                key={match.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 text-[10px]"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: OUTCOME_COLORS[match.diagnosis] || '#64748b' }}
                />
                <span className="text-slate-400 font-mono">{match.id}</span>
                <span className="text-slate-600">({OUTCOME_LABELS[match.diagnosis] || match.diagnosis})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predicted trajectory */}
      {data.predicted_trajectory?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 mb-2">Predicted Next 12 Weeks</div>
          <div className="flex gap-0.5 items-end h-8">
            {data.predicted_trajectory.slice(0, 12).map((pt, i) => {
              const val = pt.predicted_composite ?? 0
              const height = Math.max(2, Math.abs(val) * 20)
              const color = val > -0.5 ? '#10b981' : val > -1.0 ? '#eab308' : val > -1.5 ? '#f97316' : '#ef4444'
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t opacity-50"
                  style={{ height: `${height}px`, backgroundColor: color }}
                  title={`Week +${i + 1}: ${val.toFixed(3)}`}
                />
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}

function CohortTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
      <div className="text-slate-200 font-medium">{d.name}</div>
      <div className="text-slate-400">{d.value}% probability</div>
    </div>
  )
}
