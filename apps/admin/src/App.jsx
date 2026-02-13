import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { AdminGuard, useAuth, LoginPage, ForgotPasswordPage } from '@azh/shared-ui'

// Admin pages
import UsersAdminPage from './pages/UsersAdminPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import ApiKeysPage from './pages/ApiKeysPage'
import LogsPage from './pages/LogsPage'
import MonitoringPage from './pages/MonitoringPage'
import GdprPage from './pages/GdprPage'
import OrganizationsPage from './pages/OrganizationsPage'
import AuditPage from './pages/AuditPage'
import SecurityPage from './pages/SecurityPage'
import BillingPage from './pages/BillingPage'
import ClinicalPage from './pages/ClinicalPage'
import IncidentsPage from './pages/IncidentsPage'
import CompliancePage from './pages/CompliancePage'
import SettingsPage from './pages/SettingsPage'
import DatabaseStatusPage from './pages/DatabaseStatusPage'
import AccountPage from './pages/AccountPage'

function AuthLoadingGuard({ children }) {
  const { loading } = useAuth()
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 animate-pulse">
            A
          </div>
          <div className="text-sm text-slate-400">Authenticating...</div>
        </div>
      </div>
    )
  }
  return children || <Outlet />
}

/** Redirects to /login if not authenticated (Cognito mode only) */
function AuthGate({ children }) {
  const { isAuthenticated, mode } = useAuth()
  if (mode === 'demo') return children
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

/** Redirects to / if already authenticated */
function GuestOnly({ children }) {
  const { isAuthenticated, mode } = useAuth()
  if (mode === 'demo') return <Navigate to="/" replace />
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

function AdminLogin() {
  const navigate = useNavigate()
  return (
    <LoginPage
      appName="MemoVoice Admin"
      appColor="from-red-500 to-orange-600"
      logoLetter="A"
      showRegister={false}
      onNavigate={({ to }) => navigate(to)}
    />
  )
}

function AdminForgotPassword() {
  const navigate = useNavigate()
  return (
    <ForgotPasswordPage
      appName="MemoVoice Admin"
      appColor="from-red-500 to-orange-600"
      logoLetter="A"
      onNavigate={({ to }) => navigate(to)}
    />
  )
}

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLoadingGuard />}>
        <Route path="/login" element={<GuestOnly><AdminLogin /></GuestOnly>} />
        <Route path="/forgot-password" element={<GuestOnly><AdminForgotPassword /></GuestOnly>} />

        {/* Protected routes — no /register for admin (admins are created by other admins) */}
        <Route element={<AuthGate><AppLayout /></AuthGate>}>
          <Route path="/" element={<AdminGuard><UsersAdminPage /></AdminGuard>} />
          <Route path="/users" element={<AdminGuard><UsersAdminPage /></AdminGuard>} />
          <Route path="/organizations" element={<AdminGuard><OrganizationsPage /></AdminGuard>} />
          <Route path="/audit" element={<AdminGuard><AuditPage /></AdminGuard>} />
          <Route path="/security" element={<AdminGuard><SecurityPage /></AdminGuard>} />
          <Route path="/billing" element={<AdminGuard><BillingPage /></AdminGuard>} />
          <Route path="/clinical" element={<AdminGuard><ClinicalPage /></AdminGuard>} />
          <Route path="/incidents" element={<AdminGuard><IncidentsPage /></AdminGuard>} />
          <Route path="/compliance" element={<AdminGuard><CompliancePage /></AdminGuard>} />
          <Route path="/subscriptions" element={<AdminGuard><SubscriptionsPage /></AdminGuard>} />
          <Route path="/api-keys" element={<AdminGuard><ApiKeysPage /></AdminGuard>} />
          <Route path="/logs" element={<AdminGuard><LogsPage /></AdminGuard>} />
          <Route path="/monitoring" element={<AdminGuard><MonitoringPage /></AdminGuard>} />
          <Route path="/database" element={<AdminGuard><DatabaseStatusPage /></AdminGuard>} />
          <Route path="/gdpr" element={<AdminGuard><GdprPage /></AdminGuard>} />
          <Route path="/account" element={<AdminGuard><AccountPage /></AdminGuard>} />
          <Route path="/settings" element={<AdminGuard><SettingsPage /></AdminGuard>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
