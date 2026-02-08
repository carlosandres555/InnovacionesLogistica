#!/bin/bash

# ============================================
# FRONTEND DEPLOY SCRIPT
# ============================================
# Este script builda y deploya el frontend a S3
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
  API_URL=$STAGING_API_URL
  FRONTEND_URL=$STAGING_FRONTEND_URL
  S3_BUCKET=$STAGING_S3_BUCKET
  CLOUDFRONT_ID=$STAGING_CLOUDFRONT_ID
  log_warning "Deployando a STAGING"
else
  API_URL=$PROD_API_URL
  FRONTEND_URL=$PROD_FRONTEND_URL
  S3_BUCKET=$PROD_S3_BUCKET
  CLOUDFRONT_ID=$PROD_CLOUDFRONT_ID
  log_info "Deployando a PRODUCCIÓN"
fi

# Paso 1: Validación de herramientas
log_info "Validando herramientas requeridas..."

if ! command -v node &> /dev/null; then
  log_error "Node.js no está instalado"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  log_error "NPM no está instalado"
  exit 1
fi

if ! command -v aws &> /dev/null; then
  log_warning "AWS CLI no está instalado. Instalando..."
  npm install -g aws-cli
fi

log_success "Herramientas disponibles"

# Paso 2: Verificar que no hay cambios sin commit
log_info "Verificando estado del repositorio..."
if ! git diff-index --quiet HEAD --; then
  log_error "Hay cambios sin commit. Por favor commit primero:"
  git status
  exit 1
fi

log_success "Repositorio limpio"

# Paso 3: Actualizar código
log_info "Actualizando código desde GitHub..."
git fetch $GIT_REMOTE
git pull $GIT_REMOTE $GIT_BRANCH
log_success "Código actualizado"

# Paso 4: Instalar dependencias
log_info "Instalando dependencias..."
npm install
log_success "Dependencias instaladas"

# Paso 5: Limpiar build anterior
log_info "Limpiando builds anteriores..."
rm -rf dist build .next out
log_success "Directorio limpio"

# Paso 6: Build con URLs de PRODUCCIÓN (IMPORTANTE)
log_info "Buildando con URLs de $DEPLOY_ENV..."
echo ""
echo "API_URL: $API_URL"
echo "FRONTEND_URL: $FRONTEND_URL"
echo ""

# FUERZA las URLs de producción - no importa lo que esté en .env local
export VITE_API_URL="$API_URL"
export VITE_FRONTEND_URL="$FRONTEND_URL"

$VITE_BUILD_COMMAND

if [ ! -d "$BUILD_DIR" ]; then
  log_error "Build falló. No se encontró directorio $BUILD_DIR"
  exit 1
fi

log_success "Build completado en $BUILD_DIR"

# Paso 7: Verificar archivos estáticos
log_info "Verificando archivos generados..."
FILE_COUNT=$(find $BUILD_DIR -type f | wc -l)
if [ "$FILE_COUNT" -eq 0 ]; then
  log_error "No se generaron archivos. Build incompleto"
  exit 1
fi

log_success "Encontrados $FILE_COUNT archivos"

# Paso 8: Configurar AWS CLI
log_info "Configurando AWS..."
export AWS_DEFAULT_REGION=$PROD_AWS_REGION
export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

# Verificar conexión a AWS
if ! aws s3 ls s3://$S3_BUCKET &>/dev/null; then
  log_error "No se pudo acceder al bucket S3: $S3_BUCKET"
  log_error "Verifica tus credenciales de AWS"
  exit 1
fi

log_success "Conectado a AWS"

# Paso 9: Crear backup en S3
log_info "Creando backup en S3..."
if aws s3 ls s3://$S3_BUCKET &>/dev/null; then
  aws s3 sync s3://$S3_BUCKET s3://$S3_BUCKET/backups/$BACKUP_NAME \
    --region $PROD_AWS_REGION || log_warning "Backup creado (posiblemente vacío)"
  log_success "Backup creado: $BACKUP_NAME"
else
  log_warning "Bucket no existe aún. Saltando backup."
fi

# Paso 10: Subir archivos a S3
log_info "Subiendo archivos a S3..."
aws s3 sync $BUILD_DIR/ s3://$S3_BUCKET \
  --region $PROD_AWS_REGION \
  --delete \
  --cache-control "public, max-age=3600" \
  --exclude "*.html" \
  --exclude "*.js" \
  --exclude "*.css"

# Subir HTML con cache mínimo (para que siempre traiga el último)
aws s3 sync $BUILD_DIR/ s3://$S3_BUCKET \
  --region $PROD_AWS_REGION \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate"

log_success "Archivos subidos a S3"

# Paso 11: Invalidar CloudFront (si está habilitado)
if [ "$INVALIDATE_CLOUDFRONT" = true ] && [ ! -z "$CLOUDFRONT_ID" ]; then
  log_info "Invalidando distribución CloudFront..."
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_ID \
    --paths "/*" \
    --region $PROD_AWS_REGION \
    --query 'Invalidation.Id' \
    --output text > /tmp/cf_invalidation.txt

  INVALIDATION_ID=$(cat /tmp/cf_invalidation.txt)
  log_success "Invalidación creada: $INVALIDATION_ID"

  # Esperar a que termine
  log_info "Esperando a que termine la invalidación..."
  aws cloudfront wait invalidation-completed \
    --distribution-id $CLOUDFRONT_ID \
    --id $INVALIDATION_ID \
    --region $PROD_AWS_REGION || log_warning "No se pudo esperar (timeout)"

  log_success "CloudFront invalidado"
fi

# Paso 12: Resumen del deploy
log_info "Verificando deploy..."
FRONTEND_LIVE=$(curl -s "$FRONTEND_URL" | grep -o "<html" || echo "error")
if [ "$FRONTEND_LIVE" = "<html" ]; then
  log_success "Frontend accesible en $FRONTEND_URL"
else
  log_warning "Frontend talvez no esté totalmente disponible aún. CloudFront puede tomar unos minutos"
fi

# Paso 13: Notificación final
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOY EXITOSO${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo "Ambiente: $DEPLOY_ENV"
echo "S3 Bucket: $S3_BUCKET"
echo "Archivos: $FILE_COUNT"
echo "URL: $FRONTEND_URL"
echo "API: $API_URL"
echo "Timestamp: $TIMESTAMP"
echo ""
echo "Archivos subidos:"
aws s3 ls s3://$S3_BUCKET --recursive --human-readable --summarize | tail -2
echo ""
echo "Para revertir al backup anterior:"
echo "  aws s3 sync s3://$S3_BUCKET/backups/$BACKUP_NAME s3://$S3_BUCKET --region $PROD_AWS_REGION --delete"
echo ""
