// Test deploy - 2026-02-08
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ShipmentsPage from './pages/ShipmentsPage'
import ShipmentDetailPage from './pages/ShipmentDetailPage'
import MapPage from './pages/MapPage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

const queryClient = new QueryClient()

function App() {
  const { isAuthenticated } = useAuthStore()

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
            path="/shipments"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <ShipmentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <ShipmentDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout>
                  <MapPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
