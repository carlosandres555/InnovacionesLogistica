import { BarChart3, Users, Zap, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-400 via-red-300 to-orange-300 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-red-200/70">Bienvenido al sistema de gestión</p>
      </div>

      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/40 to-red-950/40 border border-red-700/30 p-8 sm:p-10 backdrop-blur-sm hover:border-red-600/50 transition-all duration-300">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-red-600/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-gradient-to-tr from-red-700/10 to-transparent rounded-full blur-3xl"></div>

        <div className="relative flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Bienvenido de Nuevo
            </h2>
            <p className="text-red-200/80 text-sm sm:text-base">
              Sistema moderno de gestión de usuarios y autenticación
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usuarios Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/30 to-red-950/30 border border-red-700/30 p-8 hover:border-red-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20 cursor-pointer">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-tl from-red-600/20 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300"></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Users className="w-7 h-7 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-red-400/60 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Usuarios</h3>
            <p className="text-red-200/70 text-sm">Gestiona usuarios y roles del sistema</p>
          </div>
        </div>

        {/* Estadísticas Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/30 to-red-950/30 border border-red-700/30 p-8 hover:border-red-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-tl from-red-600/20 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300"></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-red-400/60 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Estadísticas</h3>
            <p className="text-red-200/70 text-sm">Visualiza datos y análisis en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-red-900/20 to-red-950/20 border border-red-700/30 p-6 backdrop-blur-sm">
          <div className="text-red-400/80 text-sm font-medium mb-2">Estado</div>
          <div className="text-2xl font-bold text-white">Operativo</div>
          <div className="text-xs text-red-200/50 mt-2">Sistema funcionando correctamente</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-red-900/20 to-red-950/20 border border-red-700/30 p-6 backdrop-blur-sm">
          <div className="text-red-400/80 text-sm font-medium mb-2">Versión</div>
          <div className="text-2xl font-bold text-white">1.0.0</div>
          <div className="text-xs text-red-200/50 mt-2">Última versión disponible</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-red-900/20 to-red-950/20 border border-red-700/30 p-6 backdrop-blur-sm">
          <div className="text-red-400/80 text-sm font-medium mb-2">Servidor</div>
          <div className="text-2xl font-bold text-white">En Línea</div>
          <div className="text-xs text-red-200/50 mt-2">Todos los servicios activos</div>
        </div>
      </div>
    </div>
  )
}
