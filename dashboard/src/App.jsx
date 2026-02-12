import { Routes, Route } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { PatientDataGuard, AdminGuard, SuperAdminGuard } from './components/guards/RoleGuard'
import { useAuth } from './lib/auth'

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
import GdprPage from './pages/admin/GdprPage'

// Enterprise admin pages
import OrganizationsPage from './pages/admin/OrganizationsPage'
import AuditPage from './pages/admin/AuditPage'
import SecurityPage from './pages/admin/SecurityPage'
import BillingPage from './pages/admin/BillingPage'
import ClinicalPage from './pages/admin/ClinicalPage'
import IncidentsPage from './pages/admin/IncidentsPage'
import CompliancePage from './pages/admin/CompliancePage'

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
        {/* Patient data routes — only family + clinician */}
        <Route path="/" element={<PatientDataGuard><DashboardPage /></PatientDataGuard>} />
        <Route path="/patients" element={<PatientDataGuard><PatientsPage /></PatientDataGuard>} />
        <Route path="/analysis" element={<PatientDataGuard><AnalysisPage /></PatientDataGuard>} />
        <Route path="/reports" element={<PatientDataGuard><ReportsPage /></PatientDataGuard>} />

        {/* Admin routes — superadmin + admin */}
        <Route path="/admin/users" element={<AdminGuard><UsersAdminPage /></AdminGuard>} />
        <Route path="/admin/logs" element={<AdminGuard><LogsPage /></AdminGuard>} />
        <Route path="/admin/incidents" element={<AdminGuard><IncidentsPage /></AdminGuard>} />
        <Route path="/admin/compliance" element={<AdminGuard><CompliancePage /></AdminGuard>} />

        {/* Superadmin-only routes */}
        <Route path="/admin/subscriptions" element={<SuperAdminGuard><SubscriptionsPage /></SuperAdminGuard>} />
        <Route path="/admin/api-keys" element={<SuperAdminGuard><ApiKeysPage /></SuperAdminGuard>} />
        <Route path="/admin/monitoring" element={<SuperAdminGuard><MonitoringPage /></SuperAdminGuard>} />
        <Route path="/admin/gdpr" element={<AdminGuard><GdprPage /></AdminGuard>} />
        <Route path="/admin/organizations" element={<SuperAdminGuard><OrganizationsPage /></SuperAdminGuard>} />
        <Route path="/admin/audit" element={<SuperAdminGuard><AuditPage /></SuperAdminGuard>} />
        <Route path="/admin/security" element={<SuperAdminGuard><SecurityPage /></SuperAdminGuard>} />
        <Route path="/admin/billing" element={<SuperAdminGuard><BillingPage /></SuperAdminGuard>} />
        <Route path="/admin/clinical" element={<SuperAdminGuard><ClinicalPage /></SuperAdminGuard>} />

        {/* Shared routes — all roles */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>
    </Routes>
  )
}

export default App
