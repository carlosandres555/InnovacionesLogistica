import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Edit2, Key, Trash2, AlertCircle } from 'lucide-react'
import { usersApi } from '../services/usersApi'
import UserFormModal from '../components/UserFormModal'
import ResetPasswordModal from '../components/ResetPasswordModal'
import ConfirmDialog from '../components/ConfirmDialog'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPasswordReset, setShowPasswordReset] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.getUsers({ page, limit: 10, search })
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData) => usersApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowUserForm(false)
    }
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData) => usersApi.updateUser(editingUser.id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingUser(null)
      setShowUserForm(false)
    }
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (password) => usersApi.resetPassword(showPasswordReset.id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowPasswordReset(null)
    }
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowDeleteConfirm(null)
    }
  })

  const handleCreateClick = () => {
    setEditingUser(null)
    setShowUserForm(true)
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleFormSubmit = (formData) => {
    if (editingUser) {
      updateUserMutation.mutate(formData)
    } else {
      createUserMutation.mutate(formData)
    }
  }

  const handleResetPassword = (password) => {
    resetPasswordMutation.mutate(password)
  }

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      deleteUserMutation.mutate(showDeleteConfirm.id)
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: 'bg-blue-100 text-blue-800',
      ANALISTA: 'bg-purple-100 text-purple-800',
      IN_HOUSE: 'bg-green-100 text-green-800',
      CUSTOMER: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const isLoading_ = createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-1">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 text-sm">Administra los usuarios del sistema</p>
        </div>
        <Button
          onClick={handleCreateClick}
          size="lg"
          className="w-full sm:w-auto gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Usuario
        </Button>
      </div>

      {/* Search Card */}
      <Card>
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-12 pr-4 py-2.5 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
          />
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-blue-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-blue-700 text-sm">
            {error.message || 'Error al cargar usuarios'}
          </p>
        </div>
      )}

      {/* Table Container */}
      <Card noPadding>
        {/* Table */}
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            <div className="inline-block w-8 h-8 border-3 border-blue-400/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : data?.users?.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            <p>No hay usuarios para mostrar</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-white">
                      Usuario
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300">
                      Teléfono
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300">
                      Rol
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-slate-300">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-right text-xs sm:text-sm font-semibold text-slate-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.users?.map(user => (
                    <tr
                      key={user.id}
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {user.id.substring(0, 8)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                        {user.phone || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            disabled={isLoading_}
                            className="p-2 text-blue-400 hover:bg-blue-600/30 rounded-lg transition disabled:opacity-50"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowPasswordReset(user)}
                            disabled={isLoading_}
                            className="p-2 text-yellow-400 hover:bg-yellow-600/30 rounded-lg transition disabled:opacity-50"
                            title="Restablecer contraseña"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user)}
                            disabled={isLoading_}
                            className="p-2 text-blue-400 hover:bg-blue-600/30 rounded-lg transition disabled:opacity-50"
                            title="Desactivar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3 p-4">
              {data?.users?.map(user => (
                <div
                  key={user.id}
                  className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50/30 hover:bg-blue-50 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {user.id.substring(0, 8)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(user)}
                        disabled={isLoading_}
                        className="p-2 text-blue-400 hover:bg-blue-600/30 rounded-lg transition disabled:opacity-50"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowPasswordReset(user)}
                        disabled={isLoading_}
                        className="p-2 text-yellow-400 hover:bg-yellow-600/30 rounded-lg transition disabled:opacity-50"
                        title="Restablecer contraseña"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user)}
                        disabled={isLoading_}
                        className="p-2 text-blue-400 hover:bg-blue-600/30 rounded-lg transition disabled:opacity-50"
                        title="Desactivar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Email: </span>
                      <span className="text-gray-700">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Teléfono: </span>
                      <span className="text-gray-700">{user.phone || '-'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-blue-50/30">
            <p className="text-xs sm:text-sm text-gray-600">
              Página {data.pagination.page} de {data.pagination.pages} (
              {data.pagination.total} usuarios)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-blue-200 bg-blue-50 hover:bg-red-100 text-blue-700 rounded-lg disabled:opacity-50 transition"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="px-4 py-2 text-sm border border-blue-200 bg-blue-50 hover:bg-red-100 text-blue-700 rounded-lg disabled:opacity-50 transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <UserFormModal
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false)
          setEditingUser(null)
        }}
        onSubmit={handleFormSubmit}
        isLoading={isLoading_}
        initialData={editingUser}
      />

      {showPasswordReset && (
        <ResetPasswordModal
          isOpen={!!showPasswordReset}
          onClose={() => setShowPasswordReset(null)}
          onSubmit={handleResetPassword}
          isLoading={resetPasswordMutation.isPending}
          userName={`${showPasswordReset.firstName} ${showPasswordReset.lastName}`}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          title="Desactivar Usuario"
          message={`¿Estás seguro de que deseas desactivar a ${showDeleteConfirm.firstName} ${showDeleteConfirm.lastName}? El usuario no podrá iniciar sesión.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(null)}
          isLoading={deleteUserMutation.isPending}
          isDangerous={true}
        />
      )}
    </div>
  )
}
