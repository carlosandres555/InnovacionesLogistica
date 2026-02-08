import { BarChart3, Users, Zap, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">Bienvenido al sistema de gestión</p>
      </div>

      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-red-500/30 p-8 sm:p-10 shadow-lg hover:shadow-xl hover:border-red-500/50 transition-all duration-300">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-red-500 to-rose-400 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Bienvenido de Nuevo
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Sistema moderno de gestión de usuarios y autenticación
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usuarios Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-red-500/20 p-8 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 cursor-pointer shadow-lg">
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Users className="w-7 h-7 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-red-400/60 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Usuarios</h3>
            <p className="text-gray-600 text-sm">Gestiona usuarios y roles del sistema</p>
          </div>
        </div>

        {/* Estadísticas Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-red-500/20 p-8 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 shadow-lg">
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-red-400/60 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Estadísticas</h3>
            <p className="text-gray-600 text-sm">Visualiza datos y análisis en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border-2 border-red-500/20 p-6 shadow-lg">
          <div className="text-red-600 text-sm font-medium mb-2">Estado</div>
          <div className="text-2xl font-bold text-gray-900">Operativo</div>
          <div className="text-xs text-gray-500 mt-2">Sistema funcionando correctamente</div>
        </div>

        <div className="rounded-xl bg-white border-2 border-red-500/20 p-6 shadow-lg">
          <div className="text-red-600 text-sm font-medium mb-2">Versión</div>
          <div className="text-2xl font-bold text-gray-900">1.0.0</div>
          <div className="text-xs text-gray-500 mt-2">Última versión disponible</div>
        </div>

        <div className="rounded-xl bg-white border-2 border-red-500/20 p-6 shadow-lg">
          <div className="text-red-600 text-sm font-medium mb-2">Servidor</div>
          <div className="text-2xl font-bold text-gray-900">En Línea</div>
          <div className="text-xs text-gray-500 mt-2">Todos los servicios activos</div>
        </div>
      </div>
    </div>
  )
}
