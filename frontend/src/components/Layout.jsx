import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Home, Users } from 'lucide-react'
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
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    ...(user?.role === 'ADMIN'
      ? [{ href: '/users', label: 'Usuarios', icon: Users }]
      : [])
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Fixed on mobile, relative on desktop */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white overflow-y-auto lg:relative lg:block transition-all duration-300`}
      >
        <div className="p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold">Innovaciones</h1>
          <p className="text-xs sm:text-sm text-blue-200">Logística</p>
        </div>

        <nav className="mt-6 sm:mt-8">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center px-4 sm:px-6 py-3 text-gray-100 hover:bg-blue-800 transition text-sm sm:text-base"
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-gray-100 hover:text-white transition text-sm sm:text-base"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile/Tablet header */}
        <div className="lg:hidden bg-white shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition lg:hidden"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="text-xs sm:text-sm text-gray-600 text-center flex-1">
              <span className="block sm:inline">{user?.firstName}</span>
              <span className="hidden sm:inline sm:ml-2">{user?.lastName}</span>
            </div>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block bg-white shadow">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {user?.company?.name || 'Mi Cuenta'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition"
                title="Salir"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
