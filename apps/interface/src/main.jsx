import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider, AuthProvider, api } from '@azh/shared-ui'
import { demoApi, FAMILY_DEMO_USERS } from './data/demo-data.js'
import './index.css'
import App from './App.jsx'

// ─── Demo mode: patch api with hardcoded data ─────────────────────────
// This replaces all api methods with local demo data so the interface
// works standalone without an API server.
Object.assign(api, demoApi)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider
        defaultUserId="f1"
        users={FAMILY_DEMO_USERS}
      >
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
