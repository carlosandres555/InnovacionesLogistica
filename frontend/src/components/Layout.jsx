import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Home, Users, Zap, Upload, Settings, History } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    ...(user?.permissions?.modules?.includes('dashboard')
      ? [{ href: '/dashboard', label: 'Dashboard', icon: Home, permission: 'dashboard' }]
      : []),
    ...(user?.role === 'ADMIN'
      ? [{ href: '/users', label: 'Usuarios', icon: Users, permission: 'users' }]
      : []),
    ...(user?.permissions?.modules?.includes('trafico')
      ? [{ href: '/trafico', label: 'Tráfico', icon: Zap, permission: 'trafico' }]
      : []),
    ...(user?.permissions?.modules?.includes('historicoRutero')
      ? [{ href: '/historico-rutero', label: 'Histórico Rutero', icon: History, permission: 'historicoRutero' }]
      : []),
    ...(user?.permissions?.modules?.includes('cargaInformacion')
      ? [{ href: '/carga-informacion', label: 'Carga de Información', icon: Upload, permission: 'cargaInformacion' }]
      : []),
    ...(user?.role === 'ADMIN'
      ? [{ href: '/admin', label: 'Administración', icon: Settings, permission: 'admin' }]
      : [])
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Fixed on mobile, relative on desktop */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white overflow-y-auto lg:relative lg:block transition-all duration-300 shadow-xl`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-blue-600">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Innovaciones
            </h1>
          </div>
          <p className="text-xs text-slate-400">Logística Moderna</p>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-2 px-3">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-200 text-sm sm:text-base group"
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700/30 bg-slate-900">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-200 text-sm font-medium group"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile/Tablet header */}
        <div className="lg:hidden bg-slate-900 shadow-lg border-b border-slate-700/30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-300 p-2 hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="text-sm text-slate-300 text-center flex-1 font-medium">
              <span className="block sm:inline">{user?.firstName}</span>
              <span className="hidden sm:inline sm:ml-2 text-slate-400">{user?.lastName}</span>
            </div>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block bg-slate-900 border-b border-slate-700/30 shadow-lg">
          <div className="px-6 py-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {user?.company?.name || 'Panel de Control'}
            </h2>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm font-medium text-slate-300">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors duration-200"
                title="Salir"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
