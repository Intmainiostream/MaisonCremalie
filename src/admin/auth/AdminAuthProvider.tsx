import { useEffect, useState, type ReactNode } from 'react'
import { apiGet, apiRequest, UNAUTHORIZED_EVENT } from '../../lib/api'
import { AdminAuthContext, type Admin } from './AuthContext'

function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    // The cookie is httpOnly, so we ask the server who is logged in
    apiGet<{ admin: Admin }>('/api/auth/me')
      .then((res) => active && setAdmin(res.admin))
      .catch(() => active && setAdmin(null))
      .finally(() => active && setChecking(false))

    const onUnauthorized = () => setAdmin(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => {
      active = false
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await apiRequest<{ admin: Admin }>('POST', '/api/auth/login', { email, password })
    setAdmin(res.admin)
  }

  async function logout() {
    await apiRequest('POST', '/api/auth/logout').catch(() => undefined)
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, checking, login, logout }}>{children}</AdminAuthContext.Provider>
  )
}

export default AdminAuthProvider
