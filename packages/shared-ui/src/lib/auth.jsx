import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { api, setTokenGetter } from './api.js'
import {
  initCognitoClient,
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirmSignUp,
  forgotPassword as cognitoForgotPassword,
  confirmForgotPassword as cognitoConfirmForgotPassword,
  signOut as cognitoSignOut,
  getCurrentSession,
  completeNewPassword as cognitoCompleteNewPassword,
} from './cognito.js'

/**
 * Role-Based Access Control (RBAC)
 *
 * ROLES:
 *   admin     — Platform + organization management. CANNOT access patient clinical data.
 *   clinician — Clinical access scoped to assigned patients.
 *   family    — Access ONLY to their own family member's data.
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
    description: 'Platform & organization management — no patient data access',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
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

// Demo users for development — must match data/users.json
export const DEMO_USERS = [
  { id: 'remifran', name: 'Remi Francois', email: 'remifran@memovoice.ai', role: 'superadmin', avatar: 'RF' },
  { id: 'u2', name: 'Dr. Remi Francois', email: 'remi@memovoice.ai', role: 'clinician', avatar: 'RF' },
  { id: 'u3', name: 'Dr. Sophie Martin', email: 'sophie@memovoice.ai', role: 'clinician', avatar: 'SM' },
  { id: 'u4', name: 'Pierre Dupont', email: 'pierre@famille.fr', role: 'family', avatar: 'PD', patientId: '8613281f-dbd2-481c-9e01-05edd7fc188c' },
  { id: 'u5', name: 'Marie-Claire Petit', email: 'mc@famille.fr', role: 'family', avatar: 'MP', patientId: '6e2a3de1-1040-4a22-be15-30d6f40738b0' },
  { id: 'u6', name: 'Jean-Luc Bernard', email: 'jlbernard@famille.fr', role: 'family', avatar: 'JB', patientId: '85a94b4f-71e1-4a44-99b8-1c1017ab114c' },
  { id: 'u7', name: 'Sarah Johnson', email: 'sarah@family.com', role: 'family', avatar: 'SJ', patientId: '42395508-8cc9-48ac-9835-f9092898f230' },
  { id: 'u8', name: 'Jean Administrateur', email: 'jean@memovoice.ai', role: 'admin', avatar: 'JA' },
]

const AuthContext = createContext(null)

/**
 * AuthProvider — Dual-mode authentication context.
 *
 * Cognito mode: set cognitoConfig.userPoolId + cognitoConfig.clientId
 * Demo mode:    set defaultUserId (or leave cognitoConfig empty)
 */
export function AuthProvider({
  children,
  cognitoConfig: cognitoConfigProp,
  defaultUserId = null,
  users,
}) {
  const cognitoConfig = cognitoConfigProp || {
    userPoolId: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_COGNITO_USER_POOL_ID : undefined,
    clientId: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_COGNITO_CLIENT_ID : undefined,
  }
  const mode = cognitoConfig?.userPoolId ? 'cognito' : 'demo'

  const [currentUser, setCurrentUser] = useState(null)
  const [allUsers] = useState(users || DEMO_USERS)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const tokenRef = useRef(null)
  const cognitoInitRef = useRef(false)

  // Init Cognito SDK once
  useEffect(() => {
    if (mode === 'cognito' && !cognitoInitRef.current && cognitoConfig.userPoolId && cognitoConfig.clientId) {
      initCognitoClient(cognitoConfig)
      cognitoInitRef.current = true
    }
  }, [mode, cognitoConfig])

  // Keep tokenRef in sync
  useEffect(() => {
    tokenRef.current = token
    setTokenGetter(() => tokenRef.current)
  }, [token])

  // ── Auto-logout on session expiry (401 from API) ──
  useEffect(() => {
    function handleExpired() {
      if (mode === 'cognito') {
        cognitoSignOut()
        setToken(null)
        setCurrentUser(null)
        tokenRef.current = null
      }
    }
    window.addEventListener('azh:auth-expired', handleExpired)
    return () => window.removeEventListener('azh:auth-expired', handleExpired)
  }, [mode])

  // ── Demo mode login ──
  const demoLogin = useCallback(async (userId) => {
    try {
      const result = await api.login(userId)
      // Set tokenRef synchronously so child effects can use it immediately
      tokenRef.current = result.token
      setTokenGetter(() => tokenRef.current)
      setToken(result.token)
      setCurrentUser(result.user)
      setAuthError(null)
      return result.user
    } catch (err) {
      console.error('[auth] Login failed:', err)
      const localUser = (users || DEMO_USERS).find(u => u.id === userId)
      if (localUser) {
        setToken(null)
        tokenRef.current = null
        setCurrentUser(localUser)
        return localUser
      }
      throw err
    }
  }, [users])

  // ── Restore session on mount ──
  useEffect(() => {
    if (mode !== 'cognito') {
      if (defaultUserId) {
        demoLogin(defaultUserId).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
      return
    }

    // Cognito: try to restore session from localStorage
    getCurrentSession().then(async (session) => {
      if (session) {
        setToken(session.idToken)
        tokenRef.current = session.idToken
        setTokenGetter(() => tokenRef.current)
        try {
          const { user } = await api.getMe()
          setCurrentUser(user)
        } catch {
          cognitoSignOut()
        }
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──
  const login = useCallback(async (emailOrUserId, password) => {
    setAuthError(null)
    if (mode === 'demo') return demoLogin(emailOrUserId)

    try {
      const result = await cognitoSignIn(emailOrUserId, password)

      if (result.newPasswordRequired) {
        return { newPasswordRequired: true, cognitoUser: result.user, userAttributes: result.userAttributes }
      }

      setToken(result.idToken)
      tokenRef.current = result.idToken
      setTokenGetter(() => tokenRef.current)
      const { user } = await api.getMe()
      setCurrentUser(user)
      return user
    } catch (err) {
      setAuthError(err.message || 'Login failed')
      throw err
    }
  }, [mode, demoLogin])

  // ── Complete new password challenge ──
  const setNewPassword = useCallback(async (cognitoUser, newPassword, userAttributes) => {
    try {
      const result = await cognitoCompleteNewPassword(cognitoUser, newPassword, userAttributes)
      setToken(result.idToken)
      tokenRef.current = result.idToken
      setTokenGetter(() => tokenRef.current)
      const { user } = await api.getMe()
      setCurrentUser(user)
      return user
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [])

  // ── Register ──
  const register = useCallback(async (email, password, name) => {
    setAuthError(null)
    try {
      return await cognitoSignUp(email, password, name)
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [])

  // ── Confirm registration ──
  const confirmRegistration = useCallback(async (email, code) => {
    try {
      await cognitoConfirmSignUp(email, code)
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [])

  // ── Forgot password ──
  const resetPassword = useCallback(async (email) => {
    setAuthError(null)
    try {
      await cognitoForgotPassword(email)
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [])

  // ── Confirm forgot password ──
  const confirmResetPassword = useCallback(async (email, code, newPassword) => {
    try {
      await cognitoConfirmForgotPassword(email, code, newPassword)
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [])

  // ── Logout ──
  const logout = useCallback(() => {
    if (mode === 'cognito') cognitoSignOut()
    setToken(null)
    setCurrentUser(null)
    tokenRef.current = null
  }, [mode])

  // ── Switch user (demo mode only) ──
  const switchUser = useCallback(async (userId) => {
    if (mode !== 'demo') return
    setLoading(true)
    try { await demoLogin(userId) } finally { setLoading(false) }
  }, [demoLogin, mode])

  // ── Permission helpers (unchanged) ──
  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false
    const role = ROLES[currentUser.role]
    return role ? role.permissions.includes(permission) : false
  }, [currentUser])

  const hasRole = useCallback((...roles) => {
    if (!currentUser) return false
    return roles.includes(currentUser.role)
  }, [currentUser])

  const canAccessPatientData = useCallback(() => hasRole('family', 'clinician'), [hasRole])
  const canAccessAdmin = useCallback(() => hasRole('superadmin', 'admin'), [hasRole])

  const isAuthenticated = !!currentUser

  return (
    <AuthContext.Provider value={{
      currentUser, allUsers, loading, token, authError, isAuthenticated, mode,
      login, logout, register, confirmRegistration,
      resetPassword, confirmResetPassword, setNewPassword, switchUser,
      hasPermission, hasRole, canAccessPatientData, canAccessAdmin,
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
