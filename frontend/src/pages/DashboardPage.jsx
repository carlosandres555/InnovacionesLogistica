import { BarChart3, Users } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Bienvenido</h2>
            <p className="text-sm sm:text-base text-gray-600">Sistema de gestión de usuarios y autenticación</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Usuarios</h3>
              <p className="text-sm text-gray-600">Gestionar usuarios del sistema</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Estadísticas</h3>
              <p className="text-sm text-gray-600">Próximamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
