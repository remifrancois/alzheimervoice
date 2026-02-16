import { NavLink } from 'react-router-dom'
import { Icon, useT, useAuth, ROLES } from '@azh/shared-ui'

const PATIENT_NAV = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'grid',     path: '/' },
  { id: 'patients',  label: 'My Family',        icon: 'users',    path: '/patients' },
  { id: 'memories',  label: 'Memories',          icon: 'brain',    path: '/memories' },
  { id: 'calls',     label: 'Calls',             icon: 'phone',    path: '/calls' },
  { id: 'analysis',  labelKey: 'nav.analysis',  icon: 'activity', path: '/analysis' },
  { id: 'reports',   labelKey: 'nav.reports',    icon: 'file',     path: '/reports' },
]

const SETTINGS_NAV = [
  { id: 'settings',  labelKey: 'nav.settings',  icon: 'settings', path: '/settings' },
]

const ADMIN_NAV = [
  { id: 'admin', labelKey: 'nav.engineAdmin', icon: 'monitor', path: '/admin' },
]

export default function Sidebar() {
  const { t } = useT()
  const { canAccessAdmin, currentUser, mode } = useAuth()
  const isAdmin = canAccessAdmin()

  return (
    <aside className="fixed left-0 top-[26px] bottom-0 w-[var(--sidebar-width)] bg-slate-950 border-r border-slate-800 flex flex-col z-20">
      {/* Logo */}
      <div className="h-[var(--topbar-height)] flex items-center gap-3 px-5 border-b border-slate-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          A
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">AlzheimerVoice</div>
          <div className="text-[10px] text-slate-500 leading-tight">CVF Engine V5</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Family Section */}
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">
          Family
        </div>
        {PATIENT_NAV.map(item => (
          <SidebarLink key={item.id} item={item} t={t} />
        ))}

        {/* Settings */}
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2 mt-6">
          {t('nav.system')}
        </div>
        {SETTINGS_NAV.map(item => (
          <SidebarLink key={item.id} item={item} t={t} />
        ))}

        {/* Admin — hidden in family demo mode */}
        {isAdmin && mode !== 'demo' && (
          <>
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2 mt-6">
              {t('nav.admin')}
            </div>
            {ADMIN_NAV.map(item => (
              <SidebarLink key={item.id} item={item} t={t} />
            ))}
          </>
        )}
      </nav>

      {/* Demo Role Switcher */}
      {currentUser && mode === 'demo' && (
        <div className="px-4 py-3 border-t border-slate-800/50">
          <RoleSwitcher />
        </div>
      )}

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

function SidebarLink({ item, t }) {
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
      <span>{item.label || t(item.labelKey)}</span>
    </NavLink>
  )
}

function RoleSwitcher() {
  const { currentUser, allUsers, switchUser, loading } = useAuth()

  // Show family users for the demo interface
  const patientUsers = allUsers.filter(u => u.role === 'family')

  return (
    <div>
      <div className="text-[10px] text-slate-600 mb-1.5">Switch Family Member</div>
      <select
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-50"
        value={currentUser?.id}
        onChange={e => switchUser(e.target.value)}
        disabled={loading}
      >
        {patientUsers.map(u => (
          <option key={u.id} value={u.id}>
            {u.avatar} — {u.name}
          </option>
        ))}
      </select>
      <div className="text-[9px] text-slate-700 mt-1 italic">Demo only — not available in production</div>
    </div>
  )
}
