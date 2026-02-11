export const ALERT_LEVELS = {
  green:  { label: 'Normal',    color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  yellow: { label: 'Monitor',   color: '#eab308', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'text-yellow-400',  dot: 'bg-yellow-400' },
  orange: { label: 'Attention', color: '#f97316', bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'text-orange-400',  dot: 'bg-orange-400' },
  red:    { label: 'Alert',     color: '#ef4444', bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     dot: 'bg-red-400' },
}

export const DOMAIN_COLORS = {
  lexical:   '#8b5cf6',
  syntactic: '#3b82f6',
  coherence: '#06b6d4',
  fluency:   '#10b981',
  memory:    '#f59e0b',
}

export const DOMAIN_LABELS = {
  lexical:   'Lexical Richness',
  syntactic: 'Syntactic Complexity',
  coherence: 'Semantic Coherence',
  fluency:   'Speech Fluency',
  memory:    'Memory Recall',
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',  icon: 'grid',     path: '/' },
  { id: 'patients',  label: 'Patients',   icon: 'users',    path: '/patients' },
  { id: 'analysis',  label: 'Analysis',   icon: 'activity', path: '/analysis' },
  { id: 'reports',   label: 'Reports',    icon: 'file',     path: '/reports' },
  { id: 'settings',  label: 'Settings',   icon: 'settings', path: '/settings' },
]
