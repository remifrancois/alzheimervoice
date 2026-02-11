export function Stat({ label, value, unit, trend, className = '' }) {
  return (
    <div className={`bg-slate-800/50 rounded-lg px-4 py-3 ${className}`}>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold text-slate-100">{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
        {trend && (
          <span className={`text-xs font-medium ml-auto ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  )
}

export function StatGrid({ children, cols = 4 }) {
  const grid = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }
  return (
    <div className={`grid ${grid[cols] || grid[4]} gap-3`}>
      {children}
    </div>
  )
}
