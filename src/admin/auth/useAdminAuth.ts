import { useContext } from 'react'
import { AdminAuthContext } from './AuthContext'

export function useAdminAuth() {
  const auth = useContext(AdminAuthContext)
  if (!auth) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return auth
}
