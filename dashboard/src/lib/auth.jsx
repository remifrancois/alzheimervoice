import { createContext, useContext, useState, useCallback } from 'react'

/**
 * Role-Based Access Control (RBAC)
 *
 * ROLES:
 *   superadmin — Full platform management. Users, subscriptions, API, logs, monitoring.
 *                CANNOT access patient clinical data.
 *   admin      — Organization management. User invites, basic settings.
 *                CANNOT access patient clinical data.
 *   clinician  — Clinical access scoped to assigned patients. Can view analysis/reports.
 *   family     — Access ONLY to their own family member's data. Dashboard, timeline, reports.
 *
 * PRINCIPLE: Patient data is NEVER visible to superadmin or admin roles.
 *            Only the patient's family and assigned clinicians can see clinical data.
 */

export const ROLES = {
  superadmin: {
    label: 'Super Admin',
    description: 'Platform management — no patient data access',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    permissions: [
      'admin.users', 'admin.users.create', 'admin.users.delete',
      'admin.subscriptions', 'admin.subscriptions.manage',
      'admin.api', 'admin.api.keys', 'admin.api.rotate',
      'admin.logs', 'admin.logs.export',
      'admin.monitoring', 'admin.monitoring.alerts',
      'admin.settings',
      'admin.audit', 'admin.audit.export',
      'admin.billing', 'admin.billing.manage',
      'admin.clinical', 'admin.clinical.manage',
      'admin.security', 'admin.security.manage',
      'admin.incidents', 'admin.incidents.manage',
      'admin.compliance', 'admin.compliance.manage',
      'admin.organizations', 'admin.organizations.manage',
    ],
  },
  admin: {
    label: 'Admin',
    description: 'Organization admin — no patient data access',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    permissions: [
      'admin.users', 'admin.users.create',
      'admin.settings',
      'admin.logs',
      'admin.incidents',
      'admin.compliance',
    ],
  },
  clinician: {
    label: 'Clinician',
    description: 'Clinical access to assigned patients',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    permissions: [
      'patient.view', 'patient.analysis', 'patient.reports',
      'patient.timeline',
    ],
  },
  family: {
    label: 'Family',
    description: 'Access to own family member only',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    permissions: [
      'patient.view', 'patient.timeline', 'patient.reports.family',
      'patient.memories',
    ],
  },
}

// Demo users for the hackathon
const DEMO_USERS = [
  { id: 'u1', name: 'Super Admin', email: 'admin@memovoice.ai', role: 'superadmin', avatar: 'SA' },
  { id: 'u2', name: 'Dr. Remi Francois', email: 'remi@memovoice.ai', role: 'clinician', avatar: 'RF' },
  { id: 'u3', name: 'Dr. Sophie Martin', email: 'sophie@memovoice.ai', role: 'clinician', avatar: 'SM' },
  { id: 'u4', name: 'Pierre Dupont', email: 'pierre@famille.fr', role: 'family', avatar: 'PD', patientId: null },
  { id: 'u5', name: 'Marie-Claire Petit', email: 'mc@famille.fr', role: 'family', avatar: 'MP', patientId: null },
  { id: 'u6', name: 'Jean Administrateur', email: 'jean@memovoice.ai', role: 'admin', avatar: 'JA' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]) // Default: superadmin for demo
  const [allUsers] = useState(DEMO_USERS)

  const switchUser = useCallback((userId) => {
    const user = allUsers.find(u => u.id === userId)
    if (user) setCurrentUser(user)
  }, [allUsers])

  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false
    const role = ROLES[currentUser.role]
    if (!role) return false
    return role.permissions.includes(permission)
  }, [currentUser])

  const hasRole = useCallback((...roles) => {
    if (!currentUser) return false
    return roles.includes(currentUser.role)
  }, [currentUser])

  const canAccessPatientData = useCallback(() => {
    return hasRole('family', 'clinician')
  }, [hasRole])

  const canAccessAdmin = useCallback(() => {
    return hasRole('superadmin', 'admin')
  }, [hasRole])

  return (
    <AuthContext.Provider value={{
      currentUser,
      allUsers,
      switchUser,
      hasPermission,
      hasRole,
      canAccessPatientData,
      canAccessAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
