export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-800 ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
