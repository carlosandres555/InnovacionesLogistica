import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { contractorsApi } from '../services/contractorsApi'
import Button from './Button'
import Input from './Input'
import Card from './Card'

export default function ContractorsManagement() {
  const [contractors, setContractors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingContractor, setEditingContractor] = useState(null)
  const [expandedContractor, setExpandedContractor] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: ''
  })

  const [vehicleData, setVehicleData] = useState({
    plate: '',
    model: '',
    capacity: ''
  })

  const [showVehicleForm, setShowVehicleForm] = useState(null)
  const [deletingVehicle, setDeletingVehicle] = useState(null)
  const [loadingVehicles, setLoadingVehicles] = useState({})

  useEffect(() => {
    loadContractors()
  }, [])

  const loadContractors = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await contractorsApi.getAllContractors()
      setContractors(data)
    } catch (err) {
      setError('Error al cargar contratistas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadContractorVehicles = async (contractorId) => {
    try {
      setLoadingVehicles(prev => ({ ...prev, [contractorId]: true }))
      setError(null)
      const data = await contractorsApi.getContractorWithVehicles(contractorId)
      // Actualizar el contractor en la lista con los vehículos cargados
      setContractors(prev =>
        prev.map(c =>
          c.id === contractorId
            ? { ...c, vehicles: data.vehicles }
            : c
        )
      )
    } catch (err) {
      setError('Error al cargar vehículos')
      console.error(err)
    } finally {
      setLoadingVehicles(prev => ({ ...prev, [contractorId]: false }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitContractor = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      setError('Nombre y email son requeridos')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (editingContractor) {
        await contractorsApi.updateContractor(editingContractor.id, {
          name: formData.name,
          description: formData.description,
          phone: formData.phone
        })
      } else {
        await contractorsApi.createContractor(
          formData.name,
          formData.description,
          formData.email,
          formData.phone
        )
      }

      await loadContractors()
      setFormData({ name: '', description: '', email: '', phone: '' })
      setEditingContractor(null)
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar contratista')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddVehicle = async (e, contractorId) => {
    e.preventDefault()

    if (!vehicleData.plate) {
      setError('Placa es requerida')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await contractorsApi.addVehicle(
        contractorId,
        vehicleData.plate,
        vehicleData.model,
        vehicleData.capacity ? parseFloat(vehicleData.capacity) : 0
      )

      await loadContractors()
      setVehicleData({ plate: '', model: '', capacity: '' })
      setShowVehicleForm(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agregar vehículo')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteVehicle = async (vehicleId) => {
    setDeletingVehicle(vehicleId)

    try {
      await contractorsApi.deleteVehicle(vehicleId)
      await loadContractors()
    } catch (err) {
      setError('Error al eliminar vehículo')
    } finally {
      setDeletingVehicle(null)
    }
  }

  const handleEditContractor = (contractor) => {
    setEditingContractor(contractor)
    setFormData({
      name: contractor.name,
      description: contractor.description || '',
      email: contractor.email,
      phone: contractor.phone || ''
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Empresas y Carros</h2>
        <Button onClick={() => {
          setEditingContractor(null)
          setFormData({ name: '', description: '', email: '', phone: '' })
          setShowForm(!showForm)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form para crear/editar contratista */}
      {showForm && (
        <Card className="animate-slide-in-left">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {editingContractor ? 'Editar Empresa' : 'Nueva Empresa'}
          </h3>
          <form onSubmit={handleSubmitContractor} className="space-y-4">
            <Input
              name="name"
              placeholder="Nombre de la empresa"
              value={formData.name}
              onChange={handleInputChange}
              disabled={submitting}
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={submitting || editingContractor}
            />
            <Input
              name="phone"
              placeholder="Teléfono (opcional)"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={submitting}
            />
            <textarea
              name="description"
              placeholder="Descripción (opcional)"
              value={formData.description}
              onChange={handleInputChange}
              disabled={submitting}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} loading={submitting}>
                {editingContractor ? 'Actualizar' : 'Crear'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditingContractor(null)
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de contratistas */}
      {loading ? (
        <div className="text-center py-8">
          <Loader className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-600 mt-2">Cargando...</p>
        </div>
      ) : contractors.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">No hay empresas cargadas</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {contractors.map(contractor => (
            <Card key={contractor.id} className="animate-fade-in-up">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {
                  const isExpanding = expandedContractor !== contractor.id
                  setExpandedContractor(isExpanding ? contractor.id : null)
                  // Cargar vehículos cuando se expande
                  if (isExpanding && !contractor.vehicles) {
                    loadContractorVehicles(contractor.id)
                  }
                }}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{contractor.name}</h3>
                  <p className="text-sm text-gray-600">{contractor.description || 'Sin descripción'}</p>
                  <p className="text-xs text-gray-500 mt-1">Email: {contractor.email}</p>
                  <p className="text-xs text-gray-500">Vehículos: {contractor._count?.vehicles || 0}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditContractor(contractor)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5 text-blue-600" />
                  </button>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedContractor === contractor.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Vehículos expandidos */}
              {expandedContractor === contractor.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <h4 className="font-semibold text-slate-900">Vehículos ({contractor.vehicles?.length || 0})</h4>

                  {loadingVehicles[contractor.id] ? (
                    <div className="text-center py-4">
                      <Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600 mt-2">Cargando vehículos...</p>
                    </div>
                  ) : showVehicleForm === contractor.id ? (
                    <form onSubmit={(e) => handleAddVehicle(e, contractor.id)} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      <Input
                        name="plate"
                        placeholder="Placa"
                        value={vehicleData.plate}
                        onChange={handleVehicleInputChange}
                        disabled={submitting}
                      />
                      <Input
                        name="model"
                        placeholder="Modelo (opcional)"
                        value={vehicleData.model}
                        onChange={handleVehicleInputChange}
                        disabled={submitting}
                      />
                      <Input
                        name="capacity"
                        type="number"
                        placeholder="Capacidad (opcional)"
                        value={vehicleData.capacity}
                        onChange={handleVehicleInputChange}
                        disabled={submitting}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" disabled={submitting} loading={submitting} className="flex-1">
                          Agregar
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setShowVehicleForm(null)
                            setVehicleData({ plate: '', model: '', capacity: '' })
                          }}
                          disabled={submitting}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowVehicleForm(contractor.id)
                        setVehicleData({ plate: '', model: '', capacity: '' })
                      }}
                      variant="secondary"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Vehículo
                    </Button>
                  )}

                  {contractor.vehicles && contractor.vehicles.length > 0 ? (
                    <div className="space-y-2">
                      {contractor.vehicles.map(vehicle => (
                        <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{vehicle.plate}</p>
                            <p className="text-xs text-gray-600">{vehicle.model || 'Sin modelo'}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            disabled={deletingVehicle === vehicle.id}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">Sin vehículos</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
