/**
 * Configuración de permisos por rol
 * Define qué módulos puede acceder cada rol
 */

export const ROLE_PERMISSIONS = {
  ADMIN: {
    modules: ['dashboard', 'trafico', 'historicoRutero', 'cargaInformacion'],
    description: 'Acceso a todas las funcionalidades'
  },
  ANALISTA: {
    modules: ['dashboard', 'trafico', 'historicoRutero', 'cargaInformacion'],
    description: 'Gestión de tráfico e histórico'
  },
  IN_HOUSE: {
    modules: ['dashboard', 'trafico', 'historicoRutero'],
    description: 'Visualización de tráfico e histórico'
  },
  CUSTOMER: {
    modules: ['dashboard'],
    description: 'Acceso básico'
  }
};

/**
 * Obtener permisos de un rol
 * @param {string} role - Nombre del rol (ADMIN, ANALISTA, IN_HOUSE, CUSTOMER)
 * @returns {object} Objeto con módulos del rol
 */
export const getPermissionsByRole = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.CUSTOMER;
};

/**
 * Obtener todos los módulos disponibles
 * @returns {array} Array de módulos únicos
 */
export const getAllModules = () => {
  const modules = new Set();
  Object.values(ROLE_PERMISSIONS).forEach(config => {
    config.modules.forEach(module => modules.add(module));
  });
  return Array.from(modules).sort();
};

/**
 * Verificar si un rol tiene acceso a un módulo
 * @param {string} role - Nombre del rol
 * @param {string} module - Nombre del módulo
 * @returns {boolean} True si tiene acceso
 */
export const hasModuleAccess = (role, module) => {
  const permissions = getPermissionsByRole(role);
  return permissions.modules.includes(module);
};
