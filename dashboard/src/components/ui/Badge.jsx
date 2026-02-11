import { ALERT_LEVELS } from '../../lib/constants'

export function AlertBadge({ level, pulse = false }) {
  const config = ALERT_LEVELS[level] || ALERT_LEVELS.green
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${pulse && level === 'red' ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  )
}

export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    brand:   'bg-violet-500/10 text-violet-300 border-violet-500/30',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    danger:  'bg-red-500/10 text-red-300 border-red-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  )
}
