import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider, AuthProvider } from '@azh/shared-ui'
import './index.css'
import App from './App.jsx'

const isDemoMode = !import.meta.env.VITE_COGNITO_USER_POOL_ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider
        defaultUserId={isDemoMode ? 'u2' : undefined}
        cognitoConfig={isDemoMode ? undefined : {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
          clientId: import.meta.env.VITE_COGNITO_INTERFACE_CLIENT_ID,
        }}
      >
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
