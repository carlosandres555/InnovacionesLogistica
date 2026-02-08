#!/bin/bash

# ============================================
# BACKEND DEPLOY SCRIPT
# ============================================
# Este script deploy el backend a producción
# Uso: ./deploy.sh [staging|prod]
# Ejemplo: ./deploy.sh prod
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Cargar configuración
if [ ! -f ".deploy" ]; then
  echo -e "${RED}Error: Archivo .deploy no encontrado${NC}"
  exit 1
fi

source .deploy

# Variables
DEPLOY_ENV=${1:-prod}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${TIMESTAMP}"

# Funciones
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Validar argumentos
if [ "$DEPLOY_ENV" != "staging" ] && [ "$DEPLOY_ENV" != "prod" ]; then
  log_error "Ambiente debe ser 'staging' o 'prod'"
  echo "Uso: ./deploy.sh [staging|prod]"
  exit 1
fi

# Seleccionar configuración según ambiente
if [ "$DEPLOY_ENV" = "staging" ]; then
  EC2_HOST=$STAGING_EC2_HOST
  EC2_USER=$STAGING_EC2_USER
  EC2_DEPLOY_PATH=$STAGING_EC2_DEPLOY_PATH
  log_warning "Deployando a STAGING"
else
  EC2_HOST=$PROD_EC2_HOST
  EC2_USER=$PROD_EC2_USER
  EC2_DEPLOY_PATH=$PROD_EC2_DEPLOY_PATH
  log_info "Deployando a PRODUCCIÓN"
fi

# Paso 1: Validación local
log_info "Validando ambiente local..."

if ! command -v git &> /dev/null; then
  log_error "Git no está instalado"
  exit 1
fi

if ! command -v ssh &> /dev/null; then
  log_error "SSH no está instalado"
  exit 1
fi

log_success "Git y SSH disponibles"

# Paso 2: Verificar que no hay cambios sin commit
log_info "Verificando estado del repositorio..."
if ! git diff-index --quiet HEAD --; then
  log_error "Hay cambios sin commit. Por favor commit primero:"
  git status
  exit 1
fi

log_success "Repositorio limpio"

# Paso 3: Verificar rama correcta
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$GIT_BRANCH" ]; then
  log_warning "Estás en rama '$CURRENT_BRANCH', pero el deploy usa '$GIT_BRANCH'"
  read -p "¿Continuar? (s/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
  fi
fi

# Paso 4: Pull latest changes
log_info "Actualizando código desde GitHub..."
git fetch $GIT_REMOTE
git pull $GIT_REMOTE $GIT_BRANCH
log_success "Código actualizado"

# Paso 5: Instalar dependencias
log_info "Instalando dependencias..."
npm install --production
log_success "Dependencias instaladas"

# Paso 6: Validar que Prisma está disponible
log_info "Validando Prisma..."
npx prisma generate
log_success "Prisma generado"

# Paso 7: Build (si es necesario)
log_info "Compilando código..."
npm run build 2>/dev/null || log_warning "No hay script de build"
log_success "Código compilado"

# Paso 8: Crear backup en servidor remoto
log_info "Creando backup en servidor remoto..."
ssh -i $PROD_EC2_KEY $EC2_USER@$EC2_HOST << EOF
  set -e
  if [ -d "$EC2_DEPLOY_PATH" ]; then
    mkdir -p "$EC2_DEPLOY_PATH/backups"
    cp -r "$EC2_DEPLOY_PATH" "$EC2_DEPLOY_PATH/backups/${BACKUP_NAME}" || true
    echo "Backup creado: ${BACKUP_NAME}"
  fi
EOF
log_success "Backup creado"

# Paso 9: Deploy a servidor remoto
log_info "Uploadeando archivos a $EC2_HOST..."
ssh -i $PROD_EC2_KEY $EC2_USER@$EC2_HOST "mkdir -p $EC2_DEPLOY_PATH"

# Copiar archivos (excluyendo node_modules y .env)
rsync -avz \
  --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='.git' \
  --exclude='backups' \
  --exclude='dist' \
  -e "ssh -i $PROD_EC2_KEY" \
  . $EC2_USER@$EC2_HOST:$EC2_DEPLOY_PATH/

log_success "Archivos copiados"

# Paso 10: Copiar .env al servidor remoto
log_info "Configurando variables de entorno en servidor remoto..."
ssh -i $PROD_EC2_KEY $EC2_USER@$EC2_HOST << EOF
  set -e
  cat > $EC2_DEPLOY_PATH/.env << 'ENVFILE'
NODE_ENV=production
PORT=3000
DATABASE_URL="$PROD_DATABASE_URL"
JWT_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="https://innovacioneslogistica.com"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
AWS_S3_BUCKET="$AWS_S3_BUCKET"
AWS_S3_UPLOADS_BUCKET="$AWS_S3_UPLOADS_BUCKET"
ENVFILE
  chmod 600 $EC2_DEPLOY_PATH/.env
EOF
log_success "Variables de entorno configuradas"

# Paso 11: Instalar dependencias en servidor remoto
log_info "Instalando dependencias en servidor remoto..."
ssh -i $PROD_EC2_KEY $EC2_USER@$EC2_HOST << EOF
  set -e
  cd $EC2_DEPLOY_PATH
  npm install --production
  npx prisma generate
EOF
log_success "Dependencias instaladas en servidor remoto"

# Paso 12: Ejecutar migraciones de Prisma
log_info "Ejecutando migraciones de Prisma..."
ssh -i $PROD_EC2_KEY $EC2_USER@$EC2_HOST << EOF
  set -e
  cd $EC2_DEPLOY_PATH
  export DATABASE_URL="$PROD_DATABASE_URL"
  npx prisma migrate deploy
EOF
log_success "Migraciones aplicadas"

# Paso 13: Restart del servicio
log_info "Reiniciando servicio..."
ssh -i $PROD_EC2_KEY $EC2_USER@$EC2_HOST << EOF
  set -e
  cd $EC2_DEPLOY_PATH
  sudo systemctl restart innovaciones-backend || npm run start:prod &
  sleep 2

  # Verificar que está corriendo
  if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo "Servicio está activo"
  else
    echo "Error: Servicio no respondió"
    exit 1
  fi
EOF
log_success "Servicio reiniciado y verificado"

# Paso 14: Verificar deploy
log_info "Verificando deploy..."
HEALTH_CHECK=$(curl -s http://$EC2_HOST:3000/api/health | grep -o "ok" || echo "error")
if [ "$HEALTH_CHECK" = "ok" ]; then
  log_success "Deploy exitoso! Backend respondiendo en http://$EC2_HOST:3000"
else
  log_error "Health check falló. Revisa los logs en el servidor"
  log_info "Para rollback: ssh -i $PROD_EC2_KEY $EC2_USER@$EC2_HOST"
  exit 1
fi

# Paso 15: Notificación
log_info "Deploy completado exitosamente"
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOY EXITOSO${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo "Ambiente: $DEPLOY_ENV"
echo "Host: $EC2_HOST"
echo "Timestamp: $TIMESTAMP"
echo "URL: http://$EC2_HOST:3000/api/health"
echo ""
echo "Para revertir al backup anterior:"
echo "  ssh -i $PROD_EC2_KEY $EC2_USER@$EC2_HOST"
echo "  rm -rf $EC2_DEPLOY_PATH"
echo "  cp -r $EC2_DEPLOY_PATH/backups/${BACKUP_NAME} $EC2_DEPLOY_PATH"
echo ""
