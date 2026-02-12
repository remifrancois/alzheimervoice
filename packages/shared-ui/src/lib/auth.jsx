import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { api } from './api.js'
import { setTokenGetter } from './api.js'

/**
 * Role-Based Access Control (RBAC)
 *
 * ROLES:
 *   superadmin — Full platform management. CANNOT access patient clinical data.
 *   admin      — Organization management. CANNOT access patient clinical data.
 *   clinician  — Clinical access scoped to assigned patients.
 *   family     — Access ONLY to their own family member's data.
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

// Demo users for development
export const DEMO_USERS = [
  { id: 'u1', name: 'Super Admin', email: 'admin@memovoice.ai', role: 'superadmin', avatar: 'SA' },
  { id: 'u2', name: 'Dr. Remi Francois', email: 'remi@memovoice.ai', role: 'clinician', avatar: 'RF' },
  { id: 'u3', name: 'Dr. Sophie Martin', email: 'sophie@memovoice.ai', role: 'clinician', avatar: 'SM' },
  { id: 'u4', name: 'Pierre Dupont', email: 'pierre@famille.fr', role: 'family', avatar: 'PD', patientId: null },
  { id: 'u5', name: 'Marie-Claire Petit', email: 'mc@famille.fr', role: 'family', avatar: 'MP', patientId: null },
  { id: 'u6', name: 'Jean Administrateur', email: 'jean@memovoice.ai', role: 'admin', avatar: 'JA' },
]

const AuthContext = createContext(null)

/**
 * AuthProvider — Configurable authentication context.
 * @param {string} defaultUserId — Auto-login user ID on mount (null = no auto-login)
 * @param {Array} users — Override demo user list
 */
export function AuthProvider({ children, defaultUserId = null, users }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [allUsers] = useState(users || DEMO_USERS)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(!!defaultUserId)
  const tokenRef = useRef(null)

  // Keep tokenRef in sync and wire up api.js token getter
  useEffect(() => {
    tokenRef.current = token
    setTokenGetter(() => tokenRef.current)
  }, [token])

  // Login function — calls backend /api/auth/login
  const login = useCallback(async (userId) => {
    try {
      const result = await api.login(userId)
      setToken(result.token)
      setCurrentUser(result.user)
      return result.user
    } catch (err) {
      console.error('[auth] Login failed:', err)
      // Fallback to local-only mode if server is down
      const localUser = (users || DEMO_USERS).find(u => u.id === userId)
      if (localUser) {
        setToken(null)
        setCurrentUser(localUser)
        return localUser
      }
      throw err
    }
  }, [users])

  // Switch user — async login with new userId
  const switchUser = useCallback(async (userId) => {
    setLoading(true)
    try {
      await login(userId)
    } finally {
      setLoading(false)
    }
  }, [login])

  // Auto-login on mount if defaultUserId is provided
  useEffect(() => {
    if (defaultUserId) {
      login(defaultUserId).finally(() => setLoading(false))
    }
  }, [login, defaultUserId])

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
      login,
      switchUser,
      hasPermission,
      hasRole,
      canAccessPatientData,
      canAccessAdmin,
      loading,
      token,
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
