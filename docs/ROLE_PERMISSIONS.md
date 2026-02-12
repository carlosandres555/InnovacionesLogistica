# Configuración de Permisos por Rol

## 📋 Overview

El sistema de permisos está basado en **roles**, no en permisos individuales por usuario. Cada rol tiene un conjunto fijo de módulos permitidos.

## 🔐 Roles y Módulos

### ADMIN
Administrador del sistema con acceso completo.
- **Módulos:** dashboard, trafico, historicoRutero, cargaInformacion
- **Descripción:** Acceso a todas las funcionalidades

### ANALISTA
Analista de logística para gestión de tráfico.
- **Módulos:** dashboard, trafico, historicoRutero, cargaInformacion
- **Descripción:** Gestión de tráfico e histórico

### IN_HOUSE
Personal interno de la compañía de logística.
- **Módulos:** dashboard, trafico, historicoRutero
- **Descripción:** Visualización de tráfico e histórico

### CUSTOMER
Cliente final (rol por defecto).
- **Módulos:** dashboard
- **Descripción:** Acceso básico

## 📦 Módulos Disponibles

| Módulo | Descripción | Rutas |
|--------|-------------|-------|
| `dashboard` | Panel de control principal | `/dashboard` |
| `trafico` | Monitoreo de entregas del día (editable) | `/trafico` |
| `historicoRutero` | Consulta de entregas pasadas (solo lectura) | `/historico-rutero` |
| `cargaInformacion` | Carga de archivos Excel | `/carga-informacion` |

## 🔄 Cómo Funciona

### 1. En el Backend
```javascript
// backend/src/config/rolePermissions.js
export const ROLE_PERMISSIONS = {
  ADMIN: { modules: ['dashboard', 'trafico', 'historicoRutero', 'cargaInformacion'] },
  ANALISTA: { modules: ['dashboard', 'trafico', 'historicoRutero', 'cargaInformacion'] },
  IN_HOUSE: { modules: ['dashboard', 'trafico', 'historicoRutero'] },
  CUSTOMER: { modules: ['dashboard'] }
}
```

### 2. En el Login
Cuando un usuario inicia sesión, la API devuelve:
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "ANALISTA",
    "permissions": {
      "modules": ["dashboard", "trafico", "historicoRutero", "cargaInformacion"]
    }
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### 3. En el Frontend
El usuario ve solo los módulos a los que tiene acceso:
```javascript
// En Layout.jsx
const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  ...(user?.permissions?.modules?.includes('trafico')
    ? [{ href: '/trafico', label: 'Tráfico', icon: Zap }]
    : []),
  ...(user?.permissions?.modules?.includes('trafico')
    ? [{ href: '/historico-rutero', label: 'Histórico Rutero', icon: History }]
    : []),
  // ... más módulos
]
```

## 🛠️ Para Cambiar Permisos

### Opción 1: Cambiar el Rol del Usuario
Edita el usuario desde la página **Gestión de Usuarios** y cambía su rol. Los permisos se actualizan automáticamente en el próximo login.

### Opción 2: Modificar la Configuración de Roles
Edita `backend/src/config/rolePermissions.js` y reinicia el servidor:
```javascript
export const ROLE_PERMISSIONS = {
  ADMIN: { modules: ['dashboard', 'trafico', 'historicoRutero', 'cargaInformacion'] },
  // ... cambiar módulos aquí
}
```

## ✅ Verificación

Para verificar que los permisos están correctamente asignados:

### Backend
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Verifica que la respuesta incluya:
# "permissions": { "modules": [...] }
```

### Frontend
1. Inicia sesión con un usuario
2. Abre la consola: `F12` → `Console`
3. Ejecuta: `useAuthStore.getState().user.permissions`
4. Debería mostrar los módulos del rol

## 📝 Notas Importantes

- Los permisos se asignan automáticamente basados en el rol
- Un usuario no puede tener permisos distintos a los de su rol
- Los cambios de rol se aplican en el próximo login
- El token JWT no incluye permisos (solo rol), estos se calculan en base al rol

## 🔗 Archivos Relacionados

- `backend/src/config/rolePermissions.js` - Configuración centralizada
- `backend/src/routes/auth.js` - Endpoints de login/register/refresh
- `frontend/src/store/authStore.js` - Estado de autenticación
- `frontend/src/components/Layout.jsx` - Menú condicional por módulo
