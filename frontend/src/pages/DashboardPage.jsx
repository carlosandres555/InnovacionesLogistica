import { BarChart3, Users, Zap, ArrowRight } from 'lucide-react'
import Card from '../components/Card'

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">Bienvenido al sistema de gestión</p>
      </div>

      {/* Welcome Card */}
      <Card hoverable className="animate-slide-in-left">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-blue-600 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Bienvenido de Nuevo
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Sistema moderno de gestión de usuarios y autenticación
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usuarios Card */}
        <Card hoverable className="group animate-slide-in-left">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-green-600 shadow-lg group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Usuarios</h3>
          <p className="text-gray-600 text-sm">Gestiona usuarios y roles del sistema</p>
        </Card>

        {/* Estadísticas Card */}
        <Card hoverable className="group animate-slide-in-right">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-violet-600 shadow-lg group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Estadísticas</h3>
          <p className="text-gray-600 text-sm">Visualiza datos y análisis en tiempo real</p>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="animate-fade-in-up">
          <div className="text-blue-600 text-sm font-medium mb-2">Estado</div>
          <div className="text-2xl font-bold text-slate-900">Operativo</div>
          <div className="text-xs text-gray-500 mt-2">Sistema funcionando correctamente</div>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="text-green-600 text-sm font-medium mb-2">Versión</div>
          <div className="text-2xl font-bold text-slate-900">1.0.0</div>
          <div className="text-xs text-gray-500 mt-2">Última versión disponible</div>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-violet-600 text-sm font-medium mb-2">Servidor</div>
          <div className="text-2xl font-bold text-slate-900">En Línea</div>
          <div className="text-xs text-gray-500 mt-2">Todos los servicios activos</div>
        </Card>
      </div>
    </div>
  )
}
