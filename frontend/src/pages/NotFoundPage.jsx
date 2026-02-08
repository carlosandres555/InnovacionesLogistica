import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
          404
        </h1>
        <p className="text-lg sm:text-2xl text-gray-700 mb-6 sm:mb-8">
          Página no encontrada
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  )
}
