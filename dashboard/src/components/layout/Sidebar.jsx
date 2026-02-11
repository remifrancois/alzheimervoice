import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { NAV_ITEMS } from '../../lib/constants'

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] bg-slate-950 border-r border-slate-800 flex flex-col z-20">
      {/* Logo */}
      <div className="h-[var(--topbar-height)] flex items-center gap-3 px-5 border-b border-slate-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          M
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">MemoVoice</div>
          <div className="text-[10px] text-slate-500 leading-tight">CVF Engine v0.1</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">
          Main
        </div>
        {NAV_ITEMS.slice(0, 4).map(item => (
          <SidebarLink key={item.id} item={item} />
        ))}

        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mt-6 mb-2">
          Admin
        </div>
        {NAV_ITEMS.slice(4).map(item => (
          <SidebarLink key={item.id} item={item} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3">
          <div className="text-xs font-medium text-violet-300">Hackathon Build</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cerebral Valley x Anthropic</div>
          <div className="text-[10px] text-slate-600 mt-1">Feb 10-16, 2026</div>
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-violet-500/10 text-violet-300 font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`
      }
    >
      <Icon name={item.icon} size={18} />
      <span>{item.label}</span>
    </NavLink>
  )
}
