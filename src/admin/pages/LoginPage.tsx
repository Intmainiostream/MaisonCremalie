import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import Mascot from '../../components/illustrations/Mascot'
import { ApiError } from '../../lib/api'
import { useAdminAuth } from '../auth/useAdminAuth'
import Field from '../components/Field'
import LoadingScreen from '../components/LoadingScreen'
import PasswordInput from '../components/PasswordInput'
import { errorMessage } from '../errors'

function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 401) {
    return "That email and password don't match. Please check them and try again."
  }
  return errorMessage(err)
}

function LoginPage() {
  const { admin, checking, login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (checking) return <LoadingScreen />
  // Already logged in (or just logged in): straight to the dashboard
  if (admin) return <Navigate to="/admin/products" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(loginErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <Mascot className="login-mascot" />
        <p className="login-brand">Maison Crémalie</p>
        <h1 className="login-title">Welcome back, chef!</h1>
        <p className="login-lead">Log in to manage your sweets.</p>

        {error && (
          <p className="admin-alert admin-alert--error" role="alert">
            {error}
          </p>
        )}

        <Field id="login-email" label="Email">
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field id="login-password" label="Password">
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <button type="submit" className="admin-btn admin-btn--primary admin-btn--block" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
