import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { PatientDataGuard, AdminGuard, useAuth, LoginPage, RegisterPage, ForgotPasswordPage } from '@azh/shared-ui'

// Clinical pages
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ChangelogPage from './pages/ChangelogPage'
import PrivacyPage from './pages/PrivacyPage'
import AdminPage from './pages/AdminPage'

function AuthLoadingGuard({ children }) {
  const { loading } = useAuth()
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 animate-pulse">
            M
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

function InterfaceLogin() {
  const navigate = useNavigate()
  return (
    <LoginPage
      appName="MemoVoice"
      appColor="from-violet-500 to-blue-600"
      logoLetter="M"
      showRegister={true}
      onNavigate={({ to }) => navigate(to)}
    />
  )
}

function InterfaceRegister() {
  const navigate = useNavigate()
  return (
    <RegisterPage
      appName="MemoVoice"
      appColor="from-violet-500 to-blue-600"
      logoLetter="M"
      onNavigate={({ to }) => navigate(to)}
    />
  )
}

function InterfaceForgotPassword() {
  const navigate = useNavigate()
  return (
    <ForgotPasswordPage
      appName="MemoVoice"
      appColor="from-violet-500 to-blue-600"
      logoLetter="M"
      onNavigate={({ to }) => navigate(to)}
    />
  )
}

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLoadingGuard />}>
        <Route path="/login" element={<GuestOnly><InterfaceLogin /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><InterfaceRegister /></GuestOnly>} />
        <Route path="/forgot-password" element={<GuestOnly><InterfaceForgotPassword /></GuestOnly>} />

        {/* Protected routes */}
        <Route element={<AuthGate><AppLayout /></AuthGate>}>
          {/* Patient data routes — family + clinician */}
          <Route path="/" element={<PatientDataGuard><DashboardPage /></PatientDataGuard>} />
          <Route path="/patients" element={<PatientDataGuard><PatientsPage /></PatientDataGuard>} />
          <Route path="/analysis" element={<PatientDataGuard><AnalysisPage /></PatientDataGuard>} />
          <Route path="/reports" element={<PatientDataGuard><ReportsPage /></PatientDataGuard>} />

          {/* Admin — admin/superadmin only */}
          <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />

          {/* Shared routes — all roles */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
