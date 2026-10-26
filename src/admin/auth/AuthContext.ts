import { createContext } from 'react'

export interface Admin {
  id: number
  email: string
}

export interface AdminAuth {
  admin: Admin | null
  checking: boolean // true until we know whether a session exists
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// Shared login state for every admin page, a bit like Laravel's auth()->user()
export const AdminAuthContext = createContext<AdminAuth | null>(null)
