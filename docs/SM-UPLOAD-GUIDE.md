# Guía de Uso - Módulo Subir SM

## Descripción General
El módulo "Subir SM" permite importar archivos Excel con información de cargas diarias. Los datos se validan, se guardan en la base de datos y se pueden visualizar en el módulo de Tráfico.

## Estructura del Archivo Excel

El archivo Excel debe tener las siguientes columnas **exactamente** en este orden:

| Columna | Tipo | Ejemplo | Requerido |
|---------|------|---------|-----------|
| FECHA | String | 11-Feb | ✅ |
| RUTA | String | Q0210 | ✅ |
| CIUDAD | String | Barranquilla | ✅ |
| CARGAS | String | STR672 | ✅ |
| NOMBRE_CLIENTE | String | CENCOSUD JUMBO AMERICANO | ✅ |
| COD_CLIENTE | String | 110501 | ✅ |
| SECUENCIA | String | 36 | ✅ |
| Alquería | Number | 58 | ❌ (default: 0) |
| Yogurt | Number | 26 | ❌ (default: 0) |
| Quesos | Number | 8 | ❌ (default: 0) |
| Total general | Number | 92 | ❌ (default: 0) |
| # CARGA | String | asdsad342342 | ✅ ÚNICO |
| ORDEN DE COMBRA | String | 2 | ❌ (opcional) |

### Notas Importantes:
- ⚠️ **# CARGA debe ser único**: No se puede subir dos veces el mismo número de carga
- ⚠️ **Estructura exacta**: Si faltan columnas o están en otro orden, el archivo será rechazado
- ⚠️ **Números vacíos**: Si un campo numérico está vacío, se tratará como 0
- ⚠️ **Tamaño máximo**: 10MB

## Flujo de Uso

### 1. Acceder al Módulo
1. Inicia sesión en la plataforma
2. Ve a **Carga de Información** → **Subir SM**

### 2. Subir Archivo
1. Arrastra un archivo Excel o haz clic para seleccionar
2. El archivo se valida automáticamente:
   - ✅ Formato Excel válido
   - ✅ Estructura correcta
   - ✅ Campos requeridos no vacíos
   - ✅ # CARGA no duplicado
3. Si hay errores, se muestran los primeros 5 con detalles
4. Si todo es correcto, haz clic en "Subir Archivo"

### 3. Confirmación
- Se muestra un mensaje de éxito con:
  - Nombre del archivo
  - Cantidad de registros importados

### 4. Ver Datos en Tráfico
1. Ve a **Tráfico**
2. Usa los filtros:
   - **Fecha**: ej. "11-Feb"
   - **Ruta**: ej. "Q0210"
   - **Ciudad**: ej. "Barranquilla"
3. Los datos se muestran en tabla (desktop) o tarjetas (mobile)

## Ejemplos de Errores Comunes

### Error: "El archivo no cumple con la estructura requerida"
**Causa**: Faltan columnas o están mal nombradas
**Solución**:
- Verifica que las columnas tengan exactamente estos nombres:
  - `FECHA`, `RUTA`, `CIUDAD`, `CARGAS`, `NOMBRE_CLIENTE`, `COD_CLIENTE`, `SECUENCIA`
  - `Alquería`, `Yogurt`, `Quesos`, `Total general`
  - `# CARGA`, `ORDEN DE COMBRA`
- Verifica que estén en el orden correcto

### Error: "# CARGA ya existe en el sistema"
**Causa**: Ya se subió un archivo con ese número de carga
**Solución**:
- Verifica que no hayas subido este archivo anteriormente
- Si es un archivo nuevo, cambia los números de carga
- Puedes revisar los datos existentes en Tráfico

### Error: "Solo se permiten archivos Excel"
**Causa**: Intentaste subir un archivo que no es Excel
**Solución**:
- Descarga el archivo en formato `.xlsx` o `.xls`
- Verifica que no sea `.csv`, `.txt` u otro formato

### Error: "Archivo no contiene datos"
**Causa**: El Excel está vacío o solo tiene encabezados
**Solución**:
- Verifica que el archivo tenga al menos una fila de datos (después de los encabezados)

## API Endpoints

### Subir archivo SM
```bash
POST /api/sm/upload
Content-Type: multipart/form-data

Parámetro: file (archivo Excel)

Respuesta (201):
{
  "message": "Archivo procesado exitosamente",
  "upload": {
    "id": "string",
    "fileName": "string",
    "status": "completed",
    "totalRecords": 123,
    "createdAt": "timestamp"
  }
}
```

### Obtener lista de uploads
```bash
GET /api/sm/uploads?page=1&limit=10

Respuesta:
{
  "uploads": [...],
  "pagination": { "page": 1, "limit": 10, "total": 50, "pages": 5 }
}
```

### Obtener detalles de un upload
```bash
GET /api/sm/uploads/:uploadId/details?fecha=11-Feb&ruta=Q0210&ciudad=Barranquilla&page=1&limit=20

Respuesta:
{
  "details": [...],
  "pagination": { ... }
}
```

### Obtener datos para módulo Tráfico
```bash
GET /api/sm/trafico?fecha=11-Feb&ruta=Q0210&ciudad=Barranquilla&page=1&limit=50

Respuesta:
{
  "details": [...],
  "pagination": { ... }
}
```

## Próximas Funcionalidades

- [ ] Editar registros individuales
- [ ] Eliminar uploads completos
- [ ] Exportar datos a Excel
- [ ] Historial de uploads
- [ ] Estadísticas y reportes
- [ ] Asignación automática de rutas a conductores

## Troubleshooting

### El archivo se procesa pero no aparece en Tráfico
- Verifica que hayas navegado a la página de **Tráfico**
- Intenta actualizar la página (F5)
- Verifica que no haya filtros aplicados que oculten los datos

### Errores en la validación del Excel
- Los primeros 5 errores se muestran en el formulario
- Abre el archivo Excel y verifica:
  - Que las fechas, rutas y ciudades estén escritas correctamente
  - Que los campos numéricos sean números válidos
  - Que el # CARGA sea único

### El archivo es muy grande y tarda en procesar
- Si el archivo tiene más de 1,000 registros, puede tardar unos segundos
- Si tarda más de 1 minuto, revisa si el archivo tiene errores
- El límite es 10MB
