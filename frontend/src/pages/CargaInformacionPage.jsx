import { Upload } from 'lucide-react'

export default function CargaInformacionPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent mb-2">
          Carga de Información
        </h1>
        <p className="text-gray-600">Importa y gestiona datos del sistema</p>
      </div>

      {/* Coming Soon */}
      <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-red-500/20 p-12 sm:p-16 shadow-lg">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg mb-6">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
            Próximamente
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            Este módulo está en desarrollo. Pronto podrás importar y gestionar información desde archivos.
          </p>
        </div>
      </div>
    </div>
  )
}
