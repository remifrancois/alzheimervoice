import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider, AuthProvider } from '@azh/shared-ui'
import './index.css'
import App from './App.jsx'

// ─── SaaS mode: real API + Cognito authentication ─────────────────────
// Requires VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID env vars.
// All data comes from the API gateway (api.alzheimervoice.org).

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider idleTimeoutMs={15 * 60 * 1000}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
