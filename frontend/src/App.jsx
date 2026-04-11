import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Register   from './pages/Register'
import Dashboard  from './pages/Dashboard'
import Endpoints  from './pages/Endpoints'
import EndpointDetail from './pages/EndpointDetail'
import Layout     from './components/Layout'

function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/endpoints"         element={<Endpoints />} />
            <Route path="/endpoints/:id"     element={<EndpointDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
