export function Button({ children, variant = 'default', size = 'md', onClick, disabled, className = '' }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    default: 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-slate-600',
    primary: 'bg-violet-600 text-white hover:bg-violet-500 border border-violet-500',
    ghost:   'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
    danger:  'bg-red-600/10 text-red-400 border border-red-500/30 hover:bg-red-600/20',
  }

  const sizes = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
