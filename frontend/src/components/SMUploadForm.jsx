import { useState } from 'react'
import { Upload, AlertCircle, CheckCircle, FileUp } from 'lucide-react'
import { smApi } from '../services/smApi'

export default function SMUploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleFileSelect = (selectedFile) => {
    // Validar que sea un Excel
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError('Solo se permiten archivos Excel (.xlsx o .xls)')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo no debe superar 10MB')
      return
    }

    setFile(selectedFile)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await smApi.uploadSMFile(file)
      setSuccess({
        message: result.message,
        fileName: result.upload.fileName,
        totalRecords: result.upload.totalRecords,
      })
      setFile(null)

      // Llamar callback si existe
      if (onUploadSuccess) {
        onUploadSuccess(result.upload)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al subir el archivo'

      // Si hay detalles de validación, mostrarlos
      if (err.response?.data?.details) {
        setError({
          message: errorMsg,
          details: err.response.data.details,
          totalErrors: err.response?.data?.totalErrors || 0,
        })
      } else {
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Estructura del archivo requerida:</h3>
        <p className="text-xs text-blue-800">
          El archivo Excel debe contener las siguientes columnas: FECHA, RUTA, CIUDAD, CARGAS, NOMBRE_CLIENTE, COD_CLIENTE, SECUENCIA, Alquería, Yogurt, Quesos, Total general, # CARGA, ORDEN DE COMBRA
        </p>
      </div>

      {/* Zona de carga */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed transition-colors p-8 text-center cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />

          <div className="flex flex-col items-center justify-center">
            {file ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm font-semibold text-gray-900">
                  Arrastra el archivo aquí o haz clic
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Archivos Excel (.xlsx, .xls) máximo 10MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          <FileUp className="w-5 h-5" />
          {loading ? 'Procesando...' : 'Subir Archivo'}
        </button>
      </form>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">
                {typeof error === 'string' ? error : error.message}
              </h3>
              {typeof error === 'object' && error.details && (
                <div className="mt-3 text-xs text-red-800 space-y-1">
                  <p className="font-semibold">Primeros errores encontrados:</p>
                  {error.details.slice(0, 3).map((detail, idx) => (
                    <div key={idx} className="ml-4 mb-2">
                      <p className="font-mono">Fila {detail.row}:</p>
                      {detail.errors.map((err, errIdx) => (
                        <p key={errIdx} className="ml-2">- {err}</p>
                      ))}
                    </div>
                  ))}
                  {error.totalErrors > 3 && (
                    <p className="mt-2 font-semibold">
                      +{error.totalErrors - 3} errores más
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-900">
                {success.message}
              </h3>
              <p className="text-xs text-green-800 mt-1">
                <strong>{success.totalRecords}</strong> registros importados de <strong>{success.fileName}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
