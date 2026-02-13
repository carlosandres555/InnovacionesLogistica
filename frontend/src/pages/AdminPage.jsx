import { useState, useEffect } from 'react'
import { Settings, Plus, Trash2, AlertCircle, Loader, ChevronDown, ChevronUp, Shield, Save } from 'lucide-react'
import { deliveryStatusApi } from '../services/deliveryStatusApi'
import { rolesApi } from '../services/rolesApi'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import ContractorsManagement from '../components/ContractorsManagement'

// Módulos disponibles
const ALL_MODULES = [
  { value: 'dashboard', label: '📊 Dashboard', icon: '📊' },
  { value: 'trafico', label: '🚗 Tráfico', icon: '🚗' },
  { value: 'historicoRutero', label: '📜 Histórico Rutero', icon: '📜' },
  { value: 'cargaInformacion', label: '📤 Carga de Información', icon: '📤' }
]

const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-800 border-red-300',
  ANALISTA: 'bg-blue-100 text-blue-800 border-blue-300',
  IN_HOUSE: 'bg-green-100 text-green-800 border-green-300',
  CUSTOMER: 'bg-gray-100 text-gray-800 border-gray-300'
}

export default function AdminPage() {
  // Estados para Delivery Status
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [expandedStatus, setExpandedStatus] = useState(null)
  const [reasonsLoading, setReasonsLoading] = useState({})
  const [statusReasons, setStatusReasons] = useState({})
  const [showReasonForm, setShowReasonForm] = useState(null)
  const [reasonFormSubmitting, setReasonFormSubmitting] = useState(false)
  const [deletingReason, setDeletingReason] = useState(null)

  // Estados para Roles y Permisos
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [editingRole, setEditingRole] = useState(null)
  const [editingModules, setEditingModules] = useState([])
  const [savingRole, setSavingRole] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: 'gray',
  })

  const [reasonFormData, setReasonFormData] = useState({
    nombre: '',
    descripcion: '',
  })

  const colorOptions = [
    { value: 'green', label: '🟢 Verde (Exitosa)', bg: 'bg-green-100', text: 'text-green-900' },
    { value: 'orange', label: '🟠 Naranja (Parcial)', bg: 'bg-orange-100', text: 'text-orange-900' },
    { value: 'red', label: '🔴 Rojo (No Exitosa)', bg: 'bg-red-100', text: 'text-red-900' },
    { value: 'blue', label: '🔵 Azul', bg: 'bg-blue-100', text: 'text-blue-900' },
    { value: 'yellow', label: '🟡 Amarillo', bg: 'bg-yellow-100', text: 'text-yellow-900' },
    { value: 'gray', label: '⚫ Gris', bg: 'bg-gray-100', text: 'text-gray-900' },
  ]

  useEffect(() => {
    loadStatuses()
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setRolesLoading(true)
      const data = await rolesApi.getAllRoles()
      setRoles(data)
    } catch (err) {
      console.error('Error cargando roles:', err)
      setError('Error al cargar roles')
    } finally {
      setRolesLoading(false)
    }
  }

  const loadStatuses = async () => {
    try {
      setLoading(true)
      const data = await deliveryStatusApi.getDeliveryStatuses()
      setStatuses(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar estados de entrega')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await deliveryStatusApi.createDeliveryStatus(
        formData.nombre,
        formData.descripcion,
        formData.color
      )

      setSuccessMessage(`Estado "${formData.nombre}" creado exitosamente`)
      setFormData({ nombre: '', descripcion: '', color: 'gray' })
      setShowForm(false)

      // Recargar estados
      await loadStatuses()

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Error al crear estado de entrega')
      }
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const getColorBg = (color) => {
    const option = colorOptions.find(opt => opt.value === color)
    return option ? option.bg : 'bg-gray-100'
  }

  const loadReasonsByStatus = async (statusId) => {
    try {
      setReasonsLoading(prev => ({ ...prev, [statusId]: true }))
      const reasons = await deliveryStatusApi.getReasonsByStatus(statusId)
      setStatusReasons(prev => ({
        ...prev,
        [statusId]: reasons,
      }))
    } catch (err) {
      console.error('Error cargando motivos:', err)
    } finally {
      setReasonsLoading(prev => ({ ...prev, [statusId]: false }))
    }
  }

  const handleReasonInputChange = (e) => {
    const { name, value } = e.target
    setReasonFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddReason = async (e, statusId) => {
    e.preventDefault()

    if (!reasonFormData.nombre.trim()) {
      setError('El nombre del motivo es requerido')
      return
    }

    setReasonFormSubmitting(true)
    setError(null)

    try {
      await deliveryStatusApi.createDeliveryStatusReason(
        statusId,
        reasonFormData.nombre,
        reasonFormData.descripcion
      )

      setSuccessMessage(`Motivo "${reasonFormData.nombre}" creado exitosamente`)
      setReasonFormData({ nombre: '', descripcion: '' })
      setShowReasonForm(null)

      // Reload reasons
      await loadReasonsByStatus(statusId)

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Error al crear motivo de entrega')
      }
      console.error(err)
    } finally {
      setReasonFormSubmitting(false)
    }
  }

  const handleDeleteReason = async (reasonId, statusId, reasonName) => {
    if (!window.confirm(`¿Eliminar motivo "${reasonName}"?`)) {
      return
    }

    setDeletingReason(reasonId)
    setError(null)

    try {
      await deliveryStatusApi.deleteDeliveryStatusReason(reasonId)

      setSuccessMessage(`Motivo "${reasonName}" eliminado exitosamente`)

      // Reload reasons
      await loadReasonsByStatus(statusId)

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar motivo')
      console.error(err)
    } finally {
      setDeletingReason(null)
    }
  }

  // Handlers para Roles
  const handleEditRole = (role) => {
    setEditingRole(role.role)
    setEditingModules([...role.modules])
  }

  const handleToggleModule = (module) => {
    setEditingModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    )
  }

  const handleSaveRole = async () => {
    if (!editingRole) return

    setSavingRole(true)
    setError(null)

    try {
      const role = roles.find(r => r.role === editingRole)
      await rolesApi.updateRoleModules(editingRole, editingModules, role?.description)

      setSuccessMessage(`Rol ${editingRole} actualizado exitosamente`)
      setEditingRole(null)
      setEditingModules([])

      // Reload roles
      await loadRoles()

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar rol')
      console.error(err)
    } finally {
      setSavingRole(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingRole(null)
    setEditingModules([])
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
          Administración
        </h1>
        <p className="text-gray-600">Gestiona los estados de entrega y permisos</p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Sección: Estados Actuales */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Estados de Entrega</h2>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="md"
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Estado
          </Button>
        </div>

        {/* Formulario de creación */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4 border border-gray-200 animate-slide-in-left">
            <Input
              label="Nombre del Estado"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="ej: ENTREGADO, EN TRÁNSITO, etc."
              disabled={submitting}
              required
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del estado (opcional)"
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Color
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white"
                disabled={submitting}
              >
                {colorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                loading={submitting}
                variant="success"
              >
                <Plus className="w-4 h-4" />
                {!submitting && 'Crear Estado'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="secondary"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Lista de estados */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600 mt-2">Cargando estados...</p>
          </div>
        ) : statuses.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay estados creados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {statuses.map(status => (
              <div
                key={status.id}
                className={`rounded-lg border-2 border-opacity-50 ${getColorBg(status.color)}`}
              >
                {/* Status Header */}
                <button
                  onClick={() => {
                    const isExpanding = expandedStatus !== status.id
                    setExpandedStatus(isExpanding ? status.id : null)
                    if (isExpanding && !statusReasons[status.id]) {
                      loadReasonsByStatus(status.id)
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-black/5 rounded-t-lg transition-colors"
                >
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {status.nombre}
                    </h3>
                    {status.descripcion && (
                      <p className="text-sm text-gray-700 mt-1">
                        {status.descripcion}
                      </p>
                    )}
                    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-2 ${getColorBg(status.color)}`}>
                      Color: {status.color}
                    </span>
                  </div>
                  {expandedStatus === status.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {/* Status Details - Reasons */}
                {expandedStatus === status.id && (
                  <div className="border-t border-opacity-50 p-4 bg-black/2">
                    {/* Reasons List */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Motivos Asociados
                      </h4>

                      {reasonsLoading[status.id] ? (
                        <div className="text-center py-4">
                          <Loader className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                        </div>
                      ) : statusReasons[status.id]?.length === 0 ? (
                        <p className="text-sm text-gray-600 italic">
                          No hay motivos asociados
                        </p>
                      ) : (
                        <div className="space-y-2 mb-3">
                          {statusReasons[status.id]?.map(reason => (
                            <div
                              key={reason.id}
                              className="bg-white rounded p-3 text-sm flex items-start justify-between group hover:bg-red-50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{reason.nombre}</p>
                                {reason.descripcion && (
                                  <p className="text-xs text-gray-600">{reason.descripcion}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteReason(reason.id, status.id, reason.nombre)}
                                disabled={deletingReason === reason.id}
                                className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                title="Eliminar motivo"
                              >
                                {deletingReason === reason.id ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Reason Form */}
                    {showReasonForm === status.id ? (
                      <form
                        onSubmit={(e) => handleAddReason(e, status.id)}
                        className="bg-white rounded-lg p-3 space-y-3 border border-gray-200"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-gray-900 mb-1">
                            Nombre del Motivo *
                          </label>
                          <input
                            type="text"
                            name="nombre"
                            value={reasonFormData.nombre}
                            onChange={handleReasonInputChange}
                            placeholder="ej: Producto dañado"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={reasonFormSubmitting}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-900 mb-1">
                            Descripción
                          </label>
                          <textarea
                            name="descripcion"
                            value={reasonFormData.descripcion}
                            onChange={handleReasonInputChange}
                            placeholder="Descripción (opcional)"
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={reasonFormSubmitting}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={reasonFormSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-1 px-3 rounded text-sm transition-colors flex items-center justify-center gap-1"
                          >
                            {reasonFormSubmitting ? (
                              <>
                                <Loader className="w-3 h-3 animate-spin" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                Crear Motivo
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReasonForm(null)
                              setReasonFormData({ nombre: '', descripcion: '' })
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-1 px-3 rounded text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowReasonForm(status.id)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Motivo
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Los estados creados aparecerán automáticamente en el selector de Tráfico</li>
          <li>• No se pueden eliminar estados una vez creados (para mantener historial)</li>
          <li>• El color solo es para referencia visual</li>
          <li>• Los usuarios con permiso pueden asignar estados a entregas en Tráfico</li>
        </ul>
      </div>

      {/* SECCIÓN: Configuración de Roles y Permisos */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Roles y Permisos</h2>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Los permisos se asignan automáticamente según el rol del usuario. Edita los módulos de cada rol:
        </p>

        {/* Grid de Roles Editable */}
        {rolesLoading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600 mt-2">Cargando roles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(role => (
              <div
                key={role.role}
                className={`rounded-lg border-2 p-4 space-y-3 ${ROLE_COLORS[role.role]}`}
              >
                {/* Rol Header */}
                <div>
                  <h3 className="text-lg font-bold">{role.role}</h3>
                  <p className="text-xs opacity-90 mt-1">{role.description}</p>
                </div>

                {/* Edit Mode */}
                {editingRole === role.role ? (
                  <div className="space-y-3 border-t border-current border-opacity-20 pt-3">
                    <p className="text-xs font-semibold opacity-75">Módulos disponibles:</p>
                    <div className="space-y-2">
                      {ALL_MODULES.map(module => (
                        <label key={module.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingModules.includes(module.value)}
                            onChange={() => handleToggleModule(module.value)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm">{module.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveRole}
                        disabled={savingRole}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 rounded text-sm transition-colors"
                      >
                        {savingRole ? (
                          <>
                            <Loader className="w-3 h-3 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
                            Guardar
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={savingRole}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-400 text-gray-900 font-semibold py-2 px-3 rounded text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3 border-t border-current border-opacity-20 pt-3">
                    <p className="text-xs font-semibold opacity-75">Módulos ({role.modules.length}):</p>
                    <ul className="space-y-1">
                      {role.modules.map(module => {
                        const m = ALL_MODULES.find(x => x.value === module)
                        return (
                          <li key={module} className="flex items-center gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                            <span>{m?.label || module}</span>
                          </li>
                        )
                      })}
                    </ul>

                    <button
                      onClick={() => handleEditRole(role)}
                      className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm border border-current border-opacity-50 rounded py-1 px-2 hover:bg-white hover:bg-opacity-30 transition-colors"
                    >
                      ✏️ Editar Módulos
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Información importante */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Cómo cambiar permisos a un usuario:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li><strong>1. Ir a Gestión de Usuarios</strong></li>
            <li><strong>2. Editar el usuario</strong></li>
            <li><strong>3. Cambiar su Rol</strong> (ADMIN, ANALISTA, IN_HOUSE, CUSTOMER)</li>
            <li><strong>4. El usuario obtiene automáticamente los módulos del nuevo rol</strong> en el próximo login</li>
          </ol>
        </div>
      </Card>

      {/* Gestión de Empresas y Carros */}
      <ContractorsManagement />
    </div>
  )
}
