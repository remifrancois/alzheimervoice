import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

const DOMAIN_COLORS = {
  lexical: '#8b5cf6',
  syntactic: '#3b82f6',
  coherence: '#06b6d4',
  fluency: '#10b981',
  memory: '#f59e0b'
}

export default function DomainChart({ session }) {
  if (!session?.domain_scores) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Domain Breakdown</h3>
        <div className="text-slate-500 text-sm">No data available</div>
      </div>
    )
  }

  const data = Object.entries(session.domain_scores).map(([domain, score]) => ({
    domain: domain.charAt(0).toUpperCase() + domain.slice(1),
    key: domain,
    score: parseFloat(score.toFixed(2)),
    color: DOMAIN_COLORS[domain]
  }))

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-1">Domain Breakdown</h3>
      <p className="text-xs text-slate-500 mb-4">Latest session z-scores by domain</p>

      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            domain={[-3, 1]}
          />
          <YAxis
            type="category"
            dataKey="domain"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            width={80}
          />
          <Tooltip content={<DomainTooltip />} />
          <ReferenceLine x={0} stroke="#475569" />
          <ReferenceLine x={-0.5} stroke="#eab308" strokeDasharray="3 3" strokeOpacity={0.3} />
          <ReferenceLine x={-1.0} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.3} />
          <ReferenceLine x={-1.5} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.3} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {data.map(d => (
          <div key={d.key} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.domain}
          </div>
        ))}
      </div>
    </div>
  )
}

function DomainTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  const severity = data.score >= -0.5 ? 'Normal' : data.score >= -1.0 ? 'Notable' : data.score >= -1.5 ? 'Significant' : 'Critical'
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
      <div className="font-semibold text-slate-200">{data.domain}</div>
      <div className="text-slate-400">Z-score: {data.score}</div>
      <div className={`${data.score >= -0.5 ? 'text-emerald-400' : data.score >= -1.0 ? 'text-yellow-400' : data.score >= -1.5 ? 'text-orange-400' : 'text-red-400'}`}>
        {severity}
      </div>
    </div>
  )
}
