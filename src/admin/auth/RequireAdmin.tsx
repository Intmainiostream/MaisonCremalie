import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'
import LoadingScreen from '../components/LoadingScreen'

// Like the 'auth' middleware on a route group: guests are sent to the login page.
function RequireAdmin({ children }: { children: ReactNode }) {
  const { admin, checking } = useAdminAuth()
  if (checking) return <LoadingScreen />
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}

export default RequireAdmin
