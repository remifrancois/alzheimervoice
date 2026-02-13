import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@azh/shared-ui'
import './index.css'
import App from './App.jsx'

const isDemoMode = !import.meta.env.VITE_COGNITO_USER_POOL_ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider
        defaultUserId={isDemoMode ? 'remifran' : undefined}
        cognitoConfig={isDemoMode ? undefined : {
          userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
          clientId: import.meta.env.VITE_COGNITO_ADMIN_CLIENT_ID,
        }}
      >
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
