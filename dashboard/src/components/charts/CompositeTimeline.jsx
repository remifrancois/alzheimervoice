import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, ComposedChart } from 'recharts'
import { Card, CardHeader } from '../ui/Card'

export default function CompositeTimeline({ timeline }) {
  const data = timeline.timeline.map((entry, i) => ({
    index: i + 1,
    date: new Date(entry.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    composite: entry.composite ?? null,
    isBaseline: entry.composite === undefined,
    alert: entry.alert_level || 'green',
  }))

  const baselineEnd = data.findIndex(d => !d.isBaseline)

  return (
    <Card>
      <CardHeader title="Composite Z-Score Timeline" subtitle="Drift from individual baseline across all domains" />
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="compositeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} domain={[-2.5, 0.5]} />
          <Tooltip content={<TimelineTooltip />} />

          <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
          <ReferenceLine y={-0.5} stroke="#eab30840" strokeDasharray="3 3" />
          <ReferenceLine y={-1.0} stroke="#f9731640" strokeDasharray="3 3" />
          <ReferenceLine y={-1.5} stroke="#ef444440" strokeDasharray="3 3" />

          {baselineEnd > 0 && (
            <ReferenceLine x={data[baselineEnd]?.date} stroke="#8b5cf6" strokeDasharray="5 5" strokeOpacity={0.5} />
          )}

          <Area type="monotone" dataKey="composite" stroke="none" fill="url(#compositeGrad)" connectNulls />
          <Line
            type="monotone"
            dataKey="composite"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={({ cx, cy, payload }) => {
              if (payload.composite === null) return null
              const colors = { green: '#10b981', yellow: '#eab308', orange: '#f97316', red: '#ef4444' }
              return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.5} fill={colors[payload.alert] || '#8b5cf6'} stroke="#0f172a" strokeWidth={2} />
            }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
      {/* Zone legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
        {[
          { label: 'Green (> -0.5)', color: 'bg-emerald-400' },
          { label: 'Yellow', color: 'bg-yellow-400' },
          { label: 'Orange', color: 'bg-orange-400' },
          { label: 'Red (< -1.5)', color: 'bg-red-400' },
        ].map(z => (
          <div key={z.label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className={`w-2 h-2 rounded-full ${z.color}`} />
            {z.label}
          </div>
        ))}
      </div>
    </Card>
  )
}

function TimelineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (d.isBaseline) {
    return <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400">{label} — Calibration</div>
  }
  const alertColors = { green: 'text-emerald-400', yellow: 'text-yellow-400', orange: 'text-orange-400', red: 'text-red-400' }
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs space-y-0.5">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-200 font-medium">z = {d.composite?.toFixed(3)}</div>
      <div className={alertColors[d.alert]}>{d.alert?.toUpperCase()}</div>
    </div>
  )
}
