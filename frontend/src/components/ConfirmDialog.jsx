import { AlertCircle } from 'lucide-react'

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isLoading, isDangerous }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            {isDangerous && (
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>

          <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm text-white rounded-lg transition disabled:opacity-50 order-1 sm:order-2 ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
