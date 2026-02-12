import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

/**
 * LoginPage — Shared login page for both interface and admin apps.
 *
 * Props:
 *   appName    — "MemoVoice" or "MemoVoice Admin"
 *   appColor   — gradient classes for the logo
 *   logoLetter — "M" or "A"
 *   showRegister — whether to show Register link (false for admin)
 *   onNavigate — ({ to }) => navigate to register/forgot-password
 */
export function LoginPage({ appName = 'MemoVoice', appColor = 'from-violet-500 to-blue-600', logoLetter = 'M', showRegister = true, onNavigate }) {
  const { login, authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // New password challenge state
  const [newPwRequired, setNewPwRequired] = useState(false)
  const [cognitoUser, setCognitoUser] = useState(null)
  const [userAttributes, setUserAttributes] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const { setNewPassword: completeNewPw } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result?.newPasswordRequired) {
        setNewPwRequired(true)
        setCognitoUser(result.cognitoUser)
        setUserAttributes(result.userAttributes)
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleNewPassword(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await completeNewPw(cognitoUser, newPassword, userAttributes)
    } catch (err) {
      setError(err.message || 'Failed to set new password')
    } finally {
      setLoading(false)
    }
  }

  const displayError = error || authError

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${appColor} flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
            {logoLetter}
          </div>
          <h1 className="text-xl font-semibold text-white">{appName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {newPwRequired ? 'Set a new password to continue' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error */}
        {displayError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            {displayError}
          </div>
        )}

        {newPwRequired ? (
          /* New password challenge form */
          <form onSubmit={handleNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="Min. 8 characters"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${appColor} text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Setting password...' : 'Set Password & Sign In'}
            </button>
          </form>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate?.({ to: '/forgot-password' })}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${appColor} text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register link */}
        {showRegister && !newPwRequired && (
          <p className="text-center text-xs text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => onNavigate?.({ to: '/register' })}
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Create one
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
