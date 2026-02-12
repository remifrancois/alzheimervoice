import { Routes, Route, Outlet } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { PatientDataGuard, useAuth } from '@azh/shared-ui'

// Clinical pages
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ChangelogPage from './pages/ChangelogPage'
import PrivacyPage from './pages/PrivacyPage'

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

function App() {
  return (
    <Routes>
      <Route element={<AuthLoadingGuard><AppLayout /></AuthLoadingGuard>}>
        {/* Patient data routes — family + clinician */}
        <Route path="/" element={<PatientDataGuard><DashboardPage /></PatientDataGuard>} />
        <Route path="/patients" element={<PatientDataGuard><PatientsPage /></PatientDataGuard>} />
        <Route path="/analysis" element={<PatientDataGuard><AnalysisPage /></PatientDataGuard>} />
        <Route path="/reports" element={<PatientDataGuard><ReportsPage /></PatientDataGuard>} />

        {/* Shared routes — all roles */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>
    </Routes>
  )
}

export default App
