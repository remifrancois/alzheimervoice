/**
 * @azh/shared-ui — Shared UI components, auth, and API client for AlzheimerVoice
 *
 * Used by apps/interface and apps/admin.
 */

// Components
export { AlertBadge, Badge } from './components/Badge.jsx'
export { Button } from './components/Button.jsx'
export { Card, CardHeader } from './components/Card.jsx'
export { EmptyState } from './components/EmptyState.jsx'
export { Icon } from './components/Icon.jsx'
export { Stat, StatGrid } from './components/Stat.jsx'

// Guards
export { RoleGuard, PatientDataGuard, AdminGuard, SuperAdminGuard } from './guards/RoleGuard.jsx'

// Auth pages
export { LoginPage } from './pages/LoginPage.jsx'
export { RegisterPage } from './pages/RegisterPage.jsx'
export { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx'

// Lib
export { AuthProvider, useAuth, ROLES, DEMO_USERS } from './lib/auth.jsx'
export { api, fetchJSON, setTokenGetter } from './lib/api.js'
export {
  initCognitoClient, signIn, signUp, confirmSignUp,
  forgotPassword, confirmForgotPassword, signOut, globalSignOut,
  getCurrentSession, completeNewPassword,
} from './lib/cognito.js'
export { ALERT_LEVELS, DOMAIN_COLORS, DOMAIN_LABELS, NAV_ITEMS } from './lib/constants.js'
export { I18nProvider, useT, LANGUAGES } from './lib/i18n.jsx'
export { sanitizeText, sanitizeName, sanitizePhone, createRateLimiter } from './lib/security.js'
