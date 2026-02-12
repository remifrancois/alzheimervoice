import { Routes, Route, Outlet } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { AdminGuard, SuperAdminGuard, useAuth } from '@azh/shared-ui'

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

function App() {
  return (
    <Routes>
      <Route element={<AuthLoadingGuard><AppLayout /></AuthLoadingGuard>}>
        {/* Admin routes — superadmin + admin */}
        <Route path="/" element={<AdminGuard><UsersAdminPage /></AdminGuard>} />
        <Route path="/users" element={<AdminGuard><UsersAdminPage /></AdminGuard>} />
        <Route path="/logs" element={<AdminGuard><LogsPage /></AdminGuard>} />
        <Route path="/incidents" element={<AdminGuard><IncidentsPage /></AdminGuard>} />
        <Route path="/compliance" element={<AdminGuard><CompliancePage /></AdminGuard>} />
        <Route path="/gdpr" element={<AdminGuard><GdprPage /></AdminGuard>} />

        {/* Superadmin-only routes */}
        <Route path="/subscriptions" element={<SuperAdminGuard><SubscriptionsPage /></SuperAdminGuard>} />
        <Route path="/api-keys" element={<SuperAdminGuard><ApiKeysPage /></SuperAdminGuard>} />
        <Route path="/monitoring" element={<SuperAdminGuard><MonitoringPage /></SuperAdminGuard>} />
        <Route path="/organizations" element={<SuperAdminGuard><OrganizationsPage /></SuperAdminGuard>} />
        <Route path="/audit" element={<SuperAdminGuard><AuditPage /></SuperAdminGuard>} />
        <Route path="/security" element={<SuperAdminGuard><SecurityPage /></SuperAdminGuard>} />
        <Route path="/billing" element={<SuperAdminGuard><BillingPage /></SuperAdminGuard>} />
        <Route path="/clinical" element={<SuperAdminGuard><ClinicalPage /></SuperAdminGuard>} />

        {/* Shared routes — all roles */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
