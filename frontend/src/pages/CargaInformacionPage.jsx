import { useState } from 'react'
import { FileText } from 'lucide-react'
import SMUploadForm from '../components/SMUploadForm'

export default function CargaInformacionPage() {
  const [uploadedFile, setUploadedFile] = useState(null)

  const handleUploadSuccess = (upload) => {
    setUploadedFile(upload)
    // Aquí puedes recargar la lista de uploads o hacer otra acción
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent mb-2">
          Carga de Información
        </h1>
        <p className="text-gray-600">Importa y gestiona datos del sistema</p>
      </div>

      {/* Módulo de Subir SM */}
      <div className="bg-white rounded-2xl border-2 border-red-500/20 p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Subir SM
            </h2>
            <p className="text-sm text-gray-600">
              Importa archivos Excel con información de cargas
            </p>
          </div>
        </div>

        <SMUploadForm onUploadSuccess={handleUploadSuccess} />

        {uploadedFile && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Último archivo procesado:</strong> {uploadedFile.fileName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Registros: {uploadedFile.totalRecords}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
