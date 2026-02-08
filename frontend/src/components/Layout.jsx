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
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white overflow-y-auto md:relative md:block`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Innovaciones</h1>
          <p className="text-sm text-blue-200">Logística</p>
        </div>

        <nav className="mt-8">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center px-6 py-3 text-gray-100 hover:bg-blue-800 transition"
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-gray-100 hover:text-white transition"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Salir
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white shadow md:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
            </div>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block bg-white shadow">
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
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
