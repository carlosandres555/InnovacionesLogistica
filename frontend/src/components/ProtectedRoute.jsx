import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Mapeo de rutas a módulos de permisos
const routeToModule = {
  '/dashboard': 'dashboard',
  '/trafico': 'trafico',
  '/historico-rutero': 'historicoRutero',
  '/carga-informacion': 'cargaInformacion'
}

function getFirstActiveModule(user) {
  if (!user?.permissions?.modules) return '/dashboard'

  const modules = user.permissions.modules
  const moduleRoutes = {
    'dashboard': '/dashboard',
    'trafico': '/trafico',
    'historicoRutero': '/historico-rutero',
    'cargaInformacion': '/carga-informacion'
  }

  for (const module of modules) {
    if (moduleRoutes[module]) {
      return moduleRoutes[module]
    }
  }

  return '/dashboard'
}

export default function ProtectedRoute({ isAuthenticated, children, requiredRole = null }) {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={getFirstActiveModule(user)} replace />
  }

  // Verificar permisos de módulo
  const requiredModule = routeToModule[location.pathname]
  if (requiredModule && !user?.permissions?.modules?.includes(requiredModule)) {
    return <Navigate to={getFirstActiveModule(user)} replace />
  }

  return children
}
