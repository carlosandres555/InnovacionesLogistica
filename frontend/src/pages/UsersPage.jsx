import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Edit2, Key, Trash2, AlertCircle } from 'lucide-react'
import { usersApi } from '../services/usersApi'
import UserFormModal from '../components/UserFormModal'
import ResetPasswordModal from '../components/ResetPasswordModal'
import ConfirmDialog from '../components/ConfirmDialog'

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
      ADMIN: 'bg-red-100 text-red-800',
      ANALISTA: 'bg-blue-100 text-blue-800',
      IN_HOUSE: 'bg-green-100 text-green-800',
      CUSTOMER: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const isLoading_ = createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button
          onClick={handleCreateClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" />
          Crear Usuario
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 m-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">
              {error.message || 'Error al cargar usuarios'}
            </p>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Cargando usuarios...
          </div>
        ) : data?.users?.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No hay usuarios para mostrar
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Usuario
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Teléfono
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Rol
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users?.map(user => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
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
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                        {user.phone || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowPasswordReset(user)}
                            disabled={isLoading_}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded transition disabled:opacity-50"
                            title="Restablecer contraseña"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user)}
                            disabled={isLoading_}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
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
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
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
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowPasswordReset(user)}
                        disabled={isLoading_}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded transition disabled:opacity-50"
                        title="Restablecer contraseña"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user)}
                        disabled={isLoading_}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                        title="Desactivar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600">Email: </span>
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Teléfono: </span>
                      <span className="text-gray-900">{user.phone || '-'}</span>
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
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
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
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Página {data.pagination.page} de {data.pagination.pages} (
              {data.pagination.total} usuarios)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

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
