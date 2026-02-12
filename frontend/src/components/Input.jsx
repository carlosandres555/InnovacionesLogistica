import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Input({
  label,
  error,
  success,
  required = false,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          className={`
            w-full px-4 py-2.5
            border rounded-lg
            text-base
            transition-all duration-200
            font-sans
            ${error
              ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
              : success
                ? 'border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-100'
                : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
        {success && !error && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1">{error}</p>}
      {success && !error && <p className="text-xs text-green-600 flex items-center gap-1">{success}</p>}
    </div>
  )
}
