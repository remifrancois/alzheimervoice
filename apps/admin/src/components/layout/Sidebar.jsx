import { NavLink } from 'react-router-dom'
import { Icon } from '@azh/shared-ui'
import { useT } from '@azh/shared-ui'
import { useAuth, ROLES, DEMO_USERS } from '@azh/shared-ui'

const ADMIN_NAV = [
  { id: 'admin-users',      labelKey: 'nav.userMgmt',      icon: 'users',       path: '/users' },
  { id: 'admin-orgs',       labelKey: 'nav.organizations', icon: 'building',    path: '/organizations' },
  { id: 'admin-audit',      labelKey: 'nav.audit',         icon: 'clipboard',   path: '/audit' },
  { id: 'admin-security',   labelKey: 'nav.security',      icon: 'shield',      path: '/security' },
  { id: 'admin-billing',    labelKey: 'nav.billing',       icon: 'dollar',      path: '/billing' },
  { id: 'admin-clinical',   labelKey: 'nav.clinicalGov',   icon: 'stethoscope', path: '/clinical' },
  { id: 'admin-incidents',  labelKey: 'nav.incidents',     icon: 'siren',       path: '/incidents' },
  { id: 'admin-compliance', labelKey: 'nav.compliance',    icon: 'gavel',       path: '/compliance' },
  { id: 'admin-subs',       labelKey: 'nav.subscriptions', icon: 'creditCard',  path: '/subscriptions' },
  { id: 'admin-api',        labelKey: 'nav.apiKeys',       icon: 'key',         path: '/api-keys' },
  { id: 'admin-logs',       labelKey: 'nav.logs',          icon: 'log',         path: '/logs' },
  { id: 'admin-monitor',    labelKey: 'nav.monitoring',    icon: 'monitor',     path: '/monitoring' },
]

const SETTINGS_NAV = [
  { id: 'settings',  labelKey: 'nav.settings',  icon: 'settings', path: '/settings' },
]

export default function Sidebar() {
  const { t } = useT()
  const { currentUser } = useAuth()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] bg-slate-950 border-r border-slate-800 flex flex-col z-20">
      {/* Security Banner */}
      <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 flex items-center gap-2">
        <Icon name="lock" size={14} className="text-red-400 shrink-0" />
        <div>
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Restricted Access</div>
          <div className="text-[9px] text-red-400/60">rk2.alzheimervoice.com</div>
        </div>
      </div>

      {/* Logo */}
      <div className="h-[var(--topbar-height)] flex items-center gap-3 px-5 border-b border-slate-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          A
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{t('sidebar.brand')} Admin</div>
          <div className="text-[10px] text-slate-500 leading-tight">{t('sidebar.version')}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Admin Section */}
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">
          {t('nav.administration')}
        </div>
        {ADMIN_NAV.map(item => (
          <SidebarLink key={item.id} item={item} t={t} />
        ))}

        {/* Settings */}
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2 mt-6">
          {t('nav.system')}
        </div>
        {SETTINGS_NAV.map(item => (
          <SidebarLink key={item.id} item={item} t={t} />
        ))}
      </nav>

      {/* Current Role Indicator */}
      {currentUser && (
        <div className="px-4 py-3 border-t border-slate-800/50">
          <RoleSwitcher />
        </div>
      )}

      {/* Bottom section */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
          <div className="text-xs font-medium text-red-300">Admin Panel</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Network-restricted access only</div>
          <div className="text-[10px] text-slate-600 mt-1">Port 5174</div>
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
      <span>{t(item.labelKey)}</span>
    </NavLink>
  )
}

function RoleSwitcher() {
  const { currentUser, allUsers, switchUser, loading } = useAuth()

  // Only show admin and superadmin users
  const adminUsers = allUsers.filter(u => u.role === 'admin' || u.role === 'superadmin')

  return (
    <div>
      <div className="text-[10px] text-slate-600 mb-1.5">Demo: Switch Role</div>
      <select
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-50"
        value={currentUser.id}
        onChange={e => switchUser(e.target.value)}
        disabled={loading}
      >
        {adminUsers.map(u => (
          <option key={u.id} value={u.id}>
            {u.avatar} — {u.name} ({u.role})
          </option>
        ))}
      </select>
    </div>
  )
}
