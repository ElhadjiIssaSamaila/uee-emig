import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('uee_admin_token'))
  const [admin, setAdmin] = useState(null)

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('uee_admin_token', res.data.access_token)
    setToken(res.data.access_token)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('uee_admin_token')
    setToken(null)
    setAdmin(null)
  }, [])

  const value = { token, admin, setAdmin, login, logout, isAuthenticated: Boolean(token) }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>')
  return ctx
}
