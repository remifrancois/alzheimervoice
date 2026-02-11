import { Icon } from './Icon'

export function EmptyState({ icon = 'brain', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <Icon name={icon} size={24} className="text-slate-500" />
      </div>
      <h3 className="text-sm font-medium text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
