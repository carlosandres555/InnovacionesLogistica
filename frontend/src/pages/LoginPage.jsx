import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { AlertCircle, Zap } from 'lucide-react'

export default function LoginPage() {
  const [isLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  })

  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          formData.phone
        )
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-600/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-700/10 to-transparent rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="relative group">
          {/* Gradient Border Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

          {/* Main Card */}
          <div className="relative bg-slate-900 rounded-2xl p-8 sm:p-10 backdrop-blur-xl border border-red-700/30">
            {/* Logo Section */}
            <div className="flex items-center justify-center mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                Innovaciones
              </h1>
            </div>

            <p className="text-center text-red-200/70 text-sm sm:text-base mb-8">
              Plataforma de Distribución Logística
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-700/50 rounded-lg flex gap-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Nombres"
                      value={formData.firstName}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 text-sm bg-slate-800/50 border border-red-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-white placeholder-red-300/50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Apellidos"
                      value={formData.lastName}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 text-sm bg-slate-800/50 border border-red-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-white placeholder-red-300/50"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Teléfono (opcional)"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm bg-slate-800/50 border border-red-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-white placeholder-red-300/50"
                    />
                  </div>
                </>
              )}

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm bg-slate-800/50 border border-red-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-white placeholder-red-300/50"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm bg-slate-800/50 border border-red-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-white placeholder-red-300/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-xl hover:shadow-red-900/50 group"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Iniciar sesión
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-red-700/20">
              <p className="text-center text-red-300/60 text-xs sm:text-sm">
                © 2026 Innovaciones Logística. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
