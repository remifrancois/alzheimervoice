import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { PatientDataGuard, AdminGuard, SuperAdminGuard } from './components/guards/RoleGuard'

// Patient / Clinical pages
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ChangelogPage from './pages/ChangelogPage'
import PrivacyPage from './pages/PrivacyPage'

// Admin pages
import UsersAdminPage from './pages/admin/UsersAdminPage'
import SubscriptionsPage from './pages/admin/SubscriptionsPage'
import ApiKeysPage from './pages/admin/ApiKeysPage'
import LogsPage from './pages/admin/LogsPage'
import MonitoringPage from './pages/admin/MonitoringPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Patient data routes — only family + clinician */}
        <Route path="/" element={<PatientDataGuard><DashboardPage /></PatientDataGuard>} />
        <Route path="/patients" element={<PatientDataGuard><PatientsPage /></PatientDataGuard>} />
        <Route path="/analysis" element={<PatientDataGuard><AnalysisPage /></PatientDataGuard>} />
        <Route path="/reports" element={<PatientDataGuard><ReportsPage /></PatientDataGuard>} />

        {/* Admin routes — superadmin + admin */}
        <Route path="/admin/users" element={<AdminGuard><UsersAdminPage /></AdminGuard>} />
        <Route path="/admin/logs" element={<AdminGuard><LogsPage /></AdminGuard>} />

        {/* Superadmin-only routes */}
        <Route path="/admin/subscriptions" element={<SuperAdminGuard><SubscriptionsPage /></SuperAdminGuard>} />
        <Route path="/admin/api-keys" element={<SuperAdminGuard><ApiKeysPage /></SuperAdminGuard>} />
        <Route path="/admin/monitoring" element={<SuperAdminGuard><MonitoringPage /></SuperAdminGuard>} />

        {/* Shared routes — all roles */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>
    </Routes>
  )
}

export default App
