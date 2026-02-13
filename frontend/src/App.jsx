// Test deploy - 2026-02-08
import { useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { setupAxiosInterceptors } from './services/axiosInterceptor'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import TraficoPage from './pages/TraficoPage'
import HistoricoRuteroPage from './pages/HistoricoRuteroPage'
import CargaInformacionPage from './pages/CargaInformacionPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

const queryClient = new QueryClient()

function App() {
  const { isAuthenticated, initializeAuth, refreshPermissions, user } = useAuthStore()
  const pollIntervalRef = useRef(null)

  // Función para obtener el primer módulo activo del usuario
  const getFirstActiveModule = () => {
    if (!user?.permissions?.modules) return '/dashboard'

    const modules = user.permissions.modules
    const moduleRoutes = {
      'dashboard': '/dashboard',
      'trafico': '/trafico',
      'historicoRutero': '/historico-rutero',
      'cargaInformacion': '/carga-informacion'
    }

    // Retornar el primer módulo activo
    for (const module of modules) {
      if (moduleRoutes[module]) {
        return moduleRoutes[module]
      }
    }

    return '/dashboard' // Fallback si no hay módulos activos
  }

  useEffect(() => {
    initializeAuth()
    setupAxiosInterceptors(() => useAuthStore.getState())
  }, [])

  // Polling para refrescar permisos cada 2 minutos
  useEffect(() => {
    if (!isAuthenticated) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      return
    }

    // Refrescar permisos inmediatamente
    refreshPermissions()

    // Luego cada 2 minutos
    pollIntervalRef.current = setInterval(() => {
      refreshPermissions()
    }, 2 * 60 * 1000) // 2 minutos

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [isAuthenticated, refreshPermissions])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/trafico"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <TraficoPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/historico-rutero"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <HistoricoRuteroPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/carga-informacion"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <CargaInformacionPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="ADMIN">
                <Layout>
                  <AdminPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="/" element={<Navigate to={isAuthenticated ? getFirstActiveModule() : '/login'} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
