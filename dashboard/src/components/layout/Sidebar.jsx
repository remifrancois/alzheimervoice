import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { useT } from '../../lib/i18n'
import { useAuth, ROLES } from '../../lib/auth'

const PATIENT_NAV = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'grid',     path: '/' },
  { id: 'patients',  labelKey: 'nav.patients',  icon: 'users',    path: '/patients' },
  { id: 'analysis',  labelKey: 'nav.analysis',  icon: 'activity', path: '/analysis' },
  { id: 'reports',   labelKey: 'nav.reports',    icon: 'file',     path: '/reports' },
]

const ADMIN_NAV = [
  { id: 'admin-users',      labelKey: 'nav.userMgmt',      icon: 'users',       path: '/admin/users',         permission: 'admin.users' },
  { id: 'admin-orgs',       labelKey: 'nav.organizations', icon: 'building',    path: '/admin/organizations', permission: 'admin.organizations' },
  { id: 'admin-audit',      labelKey: 'nav.audit',         icon: 'clipboard',   path: '/admin/audit',         permission: 'admin.audit' },
  { id: 'admin-security',   labelKey: 'nav.security',      icon: 'shield',      path: '/admin/security',      permission: 'admin.security' },
  { id: 'admin-billing',    labelKey: 'nav.billing',       icon: 'dollar',      path: '/admin/billing',       permission: 'admin.billing' },
  { id: 'admin-clinical',   labelKey: 'nav.clinicalGov',   icon: 'stethoscope', path: '/admin/clinical',      permission: 'admin.clinical' },
  { id: 'admin-incidents',  labelKey: 'nav.incidents',     icon: 'siren',       path: '/admin/incidents',     permission: 'admin.incidents' },
  { id: 'admin-compliance', labelKey: 'nav.compliance',    icon: 'gavel',       path: '/admin/compliance',    permission: 'admin.compliance' },
  { id: 'admin-subs',       labelKey: 'nav.subscriptions', icon: 'creditCard',  path: '/admin/subscriptions', permission: 'admin.subscriptions' },
  { id: 'admin-api',        labelKey: 'nav.apiKeys',       icon: 'key',         path: '/admin/api-keys',      permission: 'admin.api' },
  { id: 'admin-logs',       labelKey: 'nav.logs',          icon: 'log',         path: '/admin/logs',          permission: 'admin.logs' },
  { id: 'admin-monitor',    labelKey: 'nav.monitoring',    icon: 'monitor',     path: '/admin/monitoring',    permission: 'admin.monitoring' },
]

const SETTINGS_NAV = [
  { id: 'settings',  labelKey: 'nav.settings',  icon: 'settings', path: '/settings' },
]

export default function Sidebar() {
  const { t } = useT()
  const { currentUser, hasPermission, canAccessPatientData, canAccessAdmin } = useAuth()

  const visibleAdminNav = ADMIN_NAV.filter(item => hasPermission(item.permission))
  const showPatientNav = canAccessPatientData()
  const showAdminNav = canAccessAdmin() && visibleAdminNav.length > 0

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] bg-slate-950 border-r border-slate-800 flex flex-col z-20">
      {/* Logo */}
      <div className="h-[var(--topbar-height)] flex items-center gap-3 px-5 border-b border-slate-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          M
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{t('sidebar.brand')}</div>
          <div className="text-[10px] text-slate-500 leading-tight">{t('sidebar.version')}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Patient / Clinical Section */}
        {showPatientNav && (
          <>
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">
              {t('nav.clinical')}
            </div>
            {PATIENT_NAV.map(item => (
              <SidebarLink key={item.id} item={item} t={t} />
            ))}
          </>
        )}

        {/* Admin Section */}
        {showAdminNav && (
          <>
            <div className={`text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2 ${showPatientNav ? 'mt-6' : ''}`}>
              {t('nav.administration')}
            </div>
            {visibleAdminNav.map(item => (
              <SidebarLink key={item.id} item={item} t={t} />
            ))}
          </>
        )}

        {/* Settings — visible to all */}
        <div className={`text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2 ${(showPatientNav || showAdminNav) ? 'mt-6' : ''}`}>
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
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3">
          <div className="text-xs font-medium text-violet-300">{t('sidebar.hackathon')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{t('sidebar.hackathonOrg')}</div>
          <div className="text-[10px] text-slate-600 mt-1">{t('sidebar.hackathonDate')}</div>
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
  const { currentUser, allUsers, switchUser } = useAuth()

  return (
    <div>
      <div className="text-[10px] text-slate-600 mb-1.5">Demo: Switch Role</div>
      <select
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        value={currentUser.id}
        onChange={e => switchUser(e.target.value)}
      >
        {allUsers.map(u => (
          <option key={u.id} value={u.id}>
            {u.avatar} — {u.name} ({u.role})
          </option>
        ))}
      </select>
    </div>
  )
}
