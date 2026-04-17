import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import keycloak from '../keycloak'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get('/users/me')
      setUser(res.data)
    } catch {
      setUser({
        fullName: keycloak.tokenParsed?.name
               || keycloak.tokenParsed?.preferred_username
               || 'User',
        email: keycloak.tokenParsed?.email,
        plan:  'FREE',
      })
    }
  }, [])

  useEffect(() => {
    // Keycloak is already initialized in main.jsx — just read the current state.
    if (keycloak.authenticated) {
      api.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`
      loadProfile().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    // Silently refresh the access token 30 s before it expires
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30)
        .then(refreshed => {
          if (refreshed) {
            api.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`
          }
        })
        .catch(() => keycloak.login())
    }
  }, [loadProfile])

  function logout() {
    keycloak.logout({ redirectUri: window.location.origin })
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, keycloak }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
