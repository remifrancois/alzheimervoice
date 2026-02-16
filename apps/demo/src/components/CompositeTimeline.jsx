import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, ComposedChart } from 'recharts'

const ALERT_ZONES = [
  { y1: 0.5, y2: -0.5, fill: '#10b98120', label: 'Green' },
  { y1: -0.5, y2: -1.0, fill: '#eab30820', label: 'Yellow' },
  { y1: -1.0, y2: -1.5, fill: '#f9731620', label: 'Orange' },
  { y1: -1.5, y2: -3.0, fill: '#ef444420', label: 'Red' },
]

export default function CompositeTimeline({ timeline }) {
  const data = timeline.timeline.map((entry, i) => ({
    index: i + 1,
    date: new Date(entry.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    composite: entry.composite ?? null,
    isBaseline: entry.composite === undefined,
    alert: entry.alert_level || 'green'
  }))

  const baselineEnd = data.findIndex(d => !d.isBaseline)

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Composite Z-Score Timeline</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="compositeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            domain={[-2.5, 0.5]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Alert zone reference lines */}
          <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
          <ReferenceLine y={-0.5} stroke="#eab308" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'YELLOW', fill: '#eab30860', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={-1.0} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'ORANGE', fill: '#f9731660', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={-1.5} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'RED', fill: '#ef444460', fontSize: 10, position: 'right' }} />

          {/* Baseline indicator */}
          {baselineEnd > 0 && (
            <ReferenceLine
              x={data[baselineEnd]?.date}
              stroke="#8b5cf6"
              strokeDasharray="5 5"
              strokeOpacity={0.6}
              label={{ value: 'Baseline', fill: '#8b5cf6', fontSize: 10, position: 'top' }}
            />
          )}

          <Area
            type="monotone"
            dataKey="composite"
            stroke="none"
            fill="url(#compositeGradient)"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="composite"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props
              if (payload.composite === null) return null
              const colors = { green: '#10b981', yellow: '#eab308', orange: '#f97316', red: '#ef4444' }
              return <circle cx={cx} cy={cy} r={4} fill={colors[payload.alert] || '#8b5cf6'} stroke="#0f172a" strokeWidth={2} />
            }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  if (data.isBaseline) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <div className="text-slate-400">{label}</div>
        <div className="text-slate-300">Calibration session</div>
      </div>
    )
  }
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
      <div className="text-slate-400">{label}</div>
      <div className="text-slate-200 font-semibold">
        Composite: {data.composite?.toFixed(3)}
      </div>
      <div className={`text-xs ${data.alert === 'green' ? 'text-emerald-400' : data.alert === 'yellow' ? 'text-yellow-400' : data.alert === 'orange' ? 'text-orange-400' : 'text-red-400'}`}>
        Alert: {data.alert?.toUpperCase()}
      </div>
    </div>
  )
}
