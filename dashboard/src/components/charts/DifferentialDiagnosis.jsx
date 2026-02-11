import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { api } from '../../lib/api'

const CONDITION_COLORS = {
  alzheimer: '#ef4444',
  depression: '#a855f7',
  parkinsons: '#3b82f6',
  normal_aging: '#10b981',
  medication: '#f59e0b',
  grief: '#6366f1',
}

const CONDITION_LABELS = {
  alzheimer: "Alzheimer's",
  depression: 'Depression',
  parkinsons: "Parkinson's",
  normal_aging: 'Normal Aging',
  medication: 'Medication',
  grief: 'Grief/Distress',
}

export default function DifferentialDiagnosis({ patientId }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (patientId) {
      api.getDifferential(patientId).then(setData).catch(() => {})
    }
  }, [patientId])

  if (!data?.probabilities) {
    return (
      <Card>
        <CardHeader title="Differential Diagnosis" subtitle="Probability distribution across 6 conditions" />
        <div className="text-sm text-slate-500 py-4">No differential data available. Baseline required.</div>
      </Card>
    )
  }

  const chartData = Object.entries(data.probabilities)
    .map(([key, value]) => ({
      condition: CONDITION_LABELS[key] || key,
      key,
      probability: Math.round(value * 100),
    }))
    .sort((a, b) => b.probability - a.probability)

  const primary = data.primary_hypothesis

  return (
    <Card>
      <CardHeader
        title="Differential Diagnosis"
        subtitle="Linguistic pattern matching across 6 conditions"
      />

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500">Primary hypothesis:</span>
        <Badge variant={primary === 'normal_aging' ? 'success' : primary === 'alzheimer' ? 'danger' : 'warning'}>
          {CONDITION_LABELS[primary] || primary}
        </Badge>
        <span className="text-xs text-slate-500 ml-auto">
          Confidence: {Math.round(data.confidence * 100)}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 80, bottom: 0 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
          <YAxis type="category" dataKey="condition" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
          <Tooltip content={<DiffTooltip />} />
          <Bar dataKey="probability" radius={[0, 4, 4, 0]} barSize={16}>
            {chartData.map(entry => (
              <Cell key={entry.key} fill={CONDITION_COLORS[entry.key] || '#64748b'} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {data.reasoning_hints?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
          {data.reasoning_hints.map((hint, i) => (
            <p key={i} className="text-[10px] text-slate-500">{hint}</p>
          ))}
        </div>
      )}
    </Card>
  )
}

function DiffTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
      <div className="text-slate-200 font-medium">{d.condition}</div>
      <div className="text-slate-400">{d.probability}% probability</div>
    </div>
  )
}
