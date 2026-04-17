import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing        from './pages/Landing'
import Dashboard      from './pages/Dashboard'
import Endpoints      from './pages/Endpoints'
import EndpointDetail from './pages/EndpointDetail'
import Layout         from './components/Layout'

function ProtectedRoute({ children }) {
  const { loading, keycloak } = useAuth()
  if (loading) return null
  if (!keycloak.authenticated) {
    keycloak.login({ redirectUri: window.location.href })
    return null
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppRoutes() {
  const { loading, keycloak } = useAuth()

  // Wait for Keycloak init before rendering routes
  if (loading) return null

  return (
    <Routes>
      {/* Landing: redirect to dashboard if already authenticated */}
      <Route
        path="/"
        element={keycloak.authenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
      />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/endpoints"     element={<Endpoints />} />
        <Route path="/endpoints/:id" element={<EndpointDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
