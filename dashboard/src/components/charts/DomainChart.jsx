import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Card, CardHeader } from '../ui/Card'
import { DOMAIN_COLORS, DOMAIN_LABELS } from '../../lib/constants'

export default function DomainChart({ session }) {
  if (!session?.domain_scores) {
    return (
      <Card>
        <CardHeader title="Domain Breakdown" />
        <div className="text-slate-500 text-sm text-center py-8">No data</div>
      </Card>
    )
  }

  const data = Object.entries(session.domain_scores).map(([domain, score]) => ({
    domain: domain.charAt(0).toUpperCase() + domain.slice(1),
    key: domain,
    score: parseFloat(score.toFixed(2)),
    color: DOMAIN_COLORS[domain],
    fullLabel: DOMAIN_LABELS[domain],
  }))

  return (
    <Card>
      <CardHeader title="Domain Breakdown" subtitle="Latest session z-scores" />
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} domain={[-3, 1]} />
          <YAxis type="category" dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} width={78} />
          <Tooltip content={<DomainTooltip />} />
          <ReferenceLine x={0} stroke="#475569" />
          <ReferenceLine x={-0.5} stroke="#eab30830" strokeDasharray="3 3" />
          <ReferenceLine x={-1.0} stroke="#f9731630" strokeDasharray="3 3" />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map(e => <Cell key={e.key} fill={e.color} fillOpacity={0.75} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-800">
        {data.map(d => (
          <div key={d.key} className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.color }} />
            {d.fullLabel}
          </div>
        ))}
      </div>
    </Card>
  )
}

function DomainTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs space-y-0.5">
      <div className="font-medium text-slate-200">{d.fullLabel}</div>
      <div className="text-slate-400">z = {d.score}</div>
    </div>
  )
}
