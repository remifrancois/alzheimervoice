import { useAuth, ROLES } from '../../lib/auth'
import { EmptyState } from '../ui/EmptyState'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'

/**
 * RoleGuard — Renders children only if the current user has one of the allowed roles.
 * Shows an access-denied screen otherwise.
 */
export function RoleGuard({ allow, deny, children }) {
  const { currentUser, hasRole } = useAuth()

  // Deny takes precedence
  if (deny && hasRole(...deny)) {
    return <AccessDenied currentRole={currentUser.role} />
  }

  // If allow is specified, user must have one of the allowed roles
  if (allow && !hasRole(...allow)) {
    return <AccessDenied currentRole={currentUser.role} />
  }

  return children
}

/**
 * PatientDataGuard — Only family and clinician can see patient data.
 * Superadmin and admin are explicitly blocked.
 */
export function PatientDataGuard({ children }) {
  return (
    <RoleGuard allow={['family', 'clinician']} deny={['superadmin', 'admin']}>
      {children}
    </RoleGuard>
  )
}

/**
 * AdminGuard — Only superadmin and admin can access admin panels.
 */
export function AdminGuard({ children }) {
  return (
    <RoleGuard allow={['superadmin', 'admin']}>
      {children}
    </RoleGuard>
  )
}

/**
 * SuperAdminGuard — Only superadmin can access.
 */
export function SuperAdminGuard({ children }) {
  return (
    <RoleGuard allow={['superadmin']}>
      {children}
    </RoleGuard>
  )
}

function AccessDenied({ currentRole }) {
  const role = ROLES[currentRole]
  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto mt-12">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Access Restricted</h3>
          <p className="text-sm text-slate-400 mb-3">
            Your current role does not have permission to view this page.
          </p>
          {role && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${role.bg} border ${role.border}`}>
              <span className={`text-xs font-medium ${role.color}`}>{role.label}</span>
              <span className="text-[10px] text-slate-500">{role.description}</span>
            </div>
          )}
          <p className="text-xs text-slate-600 mt-4 max-w-xs">
            Patient data is protected and only accessible to the patient's family and assigned clinicians. Administrative roles cannot view clinical information.
          </p>
        </div>
      </Card>
    </div>
  )
}
