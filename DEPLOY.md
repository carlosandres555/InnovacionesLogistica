# 📦 Guía de Deployment - InnovacionesLogistica

## Descripción General

Los scripts de deploy (`deploy.sh`) automatizan el proceso de desplegar el backend y frontend a producción. **Lo importante es que aunque trabajes localmente, al hacer deploy siempre usa las URLs de PRODUCCIÓN**, sin importar lo que tengas configurado en tu `.env` local.

## 🚀 Estructura de Deploy

```
backend/
├── .deploy          ← Configuración (modificable localmente)
├── deploy.sh        ← Script principal
└── .env             ← Variables locales (NO se usa en deploy)

frontend/
├── .deploy          ← Configuración (modificable localmente)
├── deploy.sh        ← Script principal
└── .env             ← Variables locales (NO se usa en deploy)
```

## 📝 Archivos `.deploy`

### Propósito
Son archivos de **configuración modificable** que usas para testing local sin afectar el deploy a producción.

### ¿Por qué no modificar `.env`?
- El `.env` es para desarrollo local
- Los scripts `.deploy` fuerzan URLs de producción al hacer deploy
- Esto evita que accidentalmente depliegues con URLs locales

### Estructura
```bash
# Variables que PUEDES cambiar para testing local
USE_STAGING=false

# Variables de PRODUCCIÓN (NO cambiar para deploy)
PROD_API_URL="https://api.innovacioneslogistica.com/api"
PROD_EC2_HOST="52.201.18.118"

# Variables de STAGING (para testing antes de prod)
STAGING_API_URL="https://api-staging.innovacioneslogistica.com/api"
```

## 🔧 Backend Deploy

### Requisitos Previos
```bash
# 1. Tener SSH key
# La clave debe estar en: /Users/carlosrodriguez/.ssh/innovaciones-key.pem

# 2. Acceso a EC2
# IP: 52.201.18.118
# Usuario: ubuntu
# Puerto: 22

# 3. Tener npm instalado localmente
node --version
npm --version
```

### Modificar configuración para testing local (opcional)
```bash
cd backend
nano .deploy

# Cambiar estas variables si quieres testing local:
# STAGING_EC2_HOST="tu-ec2-staging.com"
# USE_STAGING=true
```

### Hacer Deploy

#### Deploy a PRODUCCIÓN
```bash
cd backend
./deploy.sh prod
```

#### Deploy a STAGING (para testing)
```bash
cd backend
./deploy.sh staging
```

### Qué hace el script

1. ✅ Valida que Git esté limpio (sin cambios sin commit)
2. ✅ Verifica que estés en la rama `main`
3. ✅ Pull latest changes desde GitHub
4. ✅ Instala dependencias con `npm install --production`
5. ✅ Genera Prisma client
6. ✅ **SIEMPRE usa URLs de PRODUCCIÓN** (no importa `.env` local)
7. ✅ Crea backup en servidor
8. ✅ Sube archivos vía SSH/rsync
9. ✅ Ejecuta migraciones de Prisma
10. ✅ Reinicia el servicio
11. ✅ Verifica que está respondiendo

### Output esperado
```
[INFO] Deployando a PRODUCCIÓN
[✓] Git y SSH disponibles
[✓] Repositorio limpio
[✓] Código actualizado
[✓] Dependencias instaladas
[✓] Prisma generado
[✓] Backup creado
[✓] Archivos copiados
...
════════════════════════════════════════
✓ DEPLOY EXITOSO
════════════════════════════════════════
Ambiente: prod
Host: 52.201.18.118
URL: http://52.201.18.118:3000/api/health
```

## 🎨 Frontend Deploy

### Requisitos Previos
```bash
# 1. AWS CLI configurado
aws s3 ls

# 2. Credenciales en .deploy
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY

# 3. Acceso a S3 bucket
# Bucket: innovaciones-logistica-frontend

# 4. Vite instalado
npm run build --help
```

### Modificar configuración para testing local (opcional)
```bash
cd frontend
nano .deploy

# Cambiar estas variables si quieres testing local:
# STAGING_S3_BUCKET="mi-bucket-staging"
# STAGING_API_URL="https://api-staging.innovacioneslogistica.com/api"
# USE_STAGING=true
```

### Hacer Deploy

#### Deploy a PRODUCCIÓN
```bash
cd frontend
./deploy.sh prod
```

#### Deploy a STAGING (para testing)
```bash
cd frontend
./deploy.sh staging
```

### Qué hace el script

1. ✅ Valida que Git esté limpio
2. ✅ Pull latest changes desde GitHub
3. ✅ Instala dependencias
4. ✅ **FUERZA URLs de PRODUCCIÓN** (ignora `.env` local)
   - `VITE_API_URL="https://api.innovacioneslogistica.com/api"`
   - `VITE_FRONTEND_URL="https://innovacioneslogistica.com"`
5. ✅ Build con Vite
6. ✅ Crea backup en S3
7. ✅ Sube archivos a S3 con `aws s3 sync`
8. ✅ Invalida CloudFront (caché)
9. ✅ Verifica que frontend está accesible

### Output esperado
```
[INFO] Deployando a PRODUCCIÓN
[✓] Herramientas disponibles
[✓] Repositorio limpio
[✓] Código actualizado
[✓] Dependencias instaladas
API_URL: https://api.innovacioneslogistica.com/api
FRONTEND_URL: https://innovacioneslogistica.com
[✓] Build completado en dist
[✓] Encontrados 127 archivos
[✓] Conectado a AWS
[✓] Backup creado: backup_20260208_174500
[✓] Archivos subidos a S3
[✓] CloudFront invalidado
════════════════════════════════════════
✓ DEPLOY EXITOSO
════════════════════════════════════════
URL: https://innovacioneslogistica.com
API: https://api.innovacioneslogistica.com/api
```

## 🎯 Flujo de trabajo para desarrollo local

### Trabajar localmente SIN afectar deploy
```bash
# 1. Editar .env para desarrollo local
cd frontend
cat > .env << 'EOF'
# Esto es solo para DEVELOPMENT LOCAL
VITE_API_URL="http://localhost:3000/api"
VITE_FRONTEND_URL="http://localhost:5173"
EOF

# 2. Correr en desarrollo
npm run dev

# 3. Cuando termines, commit cambios
git add .
git commit -m "Cambios en usersModule"

# 4. Deploy (SIEMPRE usa URLs de producción, sin importar .env)
./deploy.sh prod
```

**Importante**: El `.env` local **NO afecta el deploy**. El script siempre fuerza URLs de producción.

## 🔄 Flujo de Deployment Completo

### Opción 1: Backend + Frontend (Recomendado)
```bash
# 1. Deploy backend primero (más crítico)
cd backend
./deploy.sh prod

# 2. Esperar a que esté listo (2-3 minutos)
# 3. Deploy frontend
cd frontend
./deploy.sh prod
```

### Opción 2: Solo actualizaciones de código
```bash
# Si solo cambiaste código del backend
cd backend
git add .
git commit -m "Fix: descripción del cambio"
./deploy.sh prod
```

## 🔐 Configuración de Credenciales

### Backend (SSH Key)
```bash
# La key debe estar en:
~/.ssh/innovaciones-key.pem

# Permisos correctos:
chmod 600 ~/.ssh/innovaciones-key.pem

# Verificar conexión:
ssh -i ~/.ssh/innovaciones-key.pem ubuntu@52.201.18.118 "echo OK"
```

### Frontend (AWS Credentials)
```bash
# Las credenciales están en .deploy:
AWS_ACCESS_KEY_ID="AKIATAIKEQVM62LPJFGZ"
AWS_SECRET_ACCESS_KEY="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"

# Verificar acceso:
aws s3 ls s3://innovaciones-logistica-frontend
```

## ⚠️ Rollback (Revertir)

### Si algo sale mal después del deploy

#### Backend
```bash
# 1. Conectarse al servidor
ssh -i ~/.ssh/innovaciones-key.pem ubuntu@52.201.18.118

# 2. Ver backups disponibles
ls /home/ubuntu/innovaciones-backend/backups

# 3. Revertir
cd /home/ubuntu/innovaciones-backend
rm -rf ./*
cp -r backups/backup_20260208_174500/* .

# 4. Reiniciar
sudo systemctl restart innovaciones-backend
```

#### Frontend
```bash
# 1. Ver backups en S3
aws s3 ls s3://innovaciones-logistica-frontend/backups

# 2. Revertir
aws s3 sync s3://innovaciones-logistica-frontend/backups/backup_20260208_174500 \
  s3://innovaciones-logistica-frontend \
  --delete

# 3. Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id E2XYZABC123 \
  --paths "/*"
```

## 📊 Variables de Configuración

### Backend (.deploy)

| Variable | Descripción | Modificable? |
|----------|-------------|-------------|
| `PROD_EC2_HOST` | IP de producción | ❌ |
| `PROD_EC2_USER` | Usuario SSH | ❌ |
| `PROD_EC2_DEPLOY_PATH` | Ruta de deploy | ❌ |
| `STAGING_EC2_HOST` | IP de staging | ✅ |
| `GIT_BRANCH` | Rama a deployar | ✅ |
| `USE_STAGING` | Para testing local | ✅ |

### Frontend (.deploy)

| Variable | Descripción | Modificable? |
|----------|-------------|-------------|
| `PROD_API_URL` | API producción | ❌ |
| `PROD_S3_BUCKET` | S3 bucket prod | ❌ |
| `STAGING_API_URL` | API staging | ✅ |
| `AWS_ACCESS_KEY_ID` | Credencial AWS | ❌ |
| `INVALIDATE_CLOUDFRONT` | Invalidad caché | ✅ |

## 🐛 Troubleshooting

### Backend

#### Error: "SSH key permission denied"
```bash
chmod 600 ~/.ssh/innovaciones-key.pem
ssh -i ~/.ssh/innovaciones-key.pem ubuntu@52.201.18.118 "echo OK"
```

#### Error: "Hay cambios sin commit"
```bash
# Opción 1: Commit los cambios
git add .
git commit -m "Descripción"

# Opción 2: Descartar cambios
git reset --hard HEAD
```

#### Error: "Health check falló"
```bash
# Ver logs en el servidor
ssh -i ~/.ssh/innovaciones-key.pem ubuntu@52.201.18.118
cd /home/ubuntu/innovaciones-backend
npm run dev
# Ver qué está fallando
```

### Frontend

#### Error: "No se pudo acceder al bucket S3"
```bash
# Verificar credenciales
aws s3 ls s3://innovaciones-logistica-frontend

# Si falla, revisar en .deploy:
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

#### Error: "Build falló"
```bash
# Revisar logs
npm run build

# Limpiar y reintentar
rm -rf node_modules dist
npm install
npm run build
```

## 📝 Checklist antes de Deploy

### Antes de cualquier deploy:
- [ ] ¿Están todos los cambios committed? (`git status`)
- [ ] ¿Estás en rama `main`? (`git branch`)
- [ ] ¿Corriste tests locales? (`npm test`)
- [ ] ¿El código compila? (`npm run build`)
- [ ] ¿Tienes conexión SSH/AWS?
- [ ] ¿Hay backups disponibles?

### Backend específicamente:
- [ ] ¿Ejecutaste migraciones locales? (`npx prisma migrate dev`)
- [ ] ¿Las variables de BD son correctas?
- [ ] ¿El `.env` local está actualizado?

### Frontend específicamente:
- [ ] ¿El build genera archivos? (revisar `dist/`)
- [ ] ¿Las URLs de API son correctas en `.deploy`?
- [ ] ¿Tienes credenciales AWS validas?

## 🔗 Links útiles

- **Backend EC2**: ssh -i ~/.ssh/innovaciones-key.pem ubuntu@52.201.18.118
- **Frontend S3**: https://s3.console.aws.amazon.com/s3/buckets/innovaciones-logistica-frontend
- **CloudFront**: https://console.aws.amazon.com/cloudfront/v3/home
- **RDS Database**: https://console.aws.amazon.com/rds/home

## ❓ Preguntas Frecuentes

### P: ¿Puedo cambiar las URLs en el deploy?
**R**: No. El script siempre fuerza URLs de producción. Si necesitas testing, usa STAGING.

### P: ¿Qué pasa si el deploy falla a mitad?
**R**: El script crea backups automáticos. Puedes revertir manualmente.

### P: ¿Puedo deployar sin git?
**R**: No. El script verifica que todo esté en Git para auditoría.

### P: ¿Cuánto tarda el deploy?
**R**:
- Backend: 5-10 minutos
- Frontend: 2-3 minutos
- Total: 10-15 minutos

### P: ¿Puedo hacer deploy desde Windows/Mac?
**R**: Sí, el script está en bash. Necesitas:
- Git Bash (Windows)
- Terminal nativa (Mac/Linux)

---

**Última actualización**: 2026-02-08
**Versión**: 1.0.0
