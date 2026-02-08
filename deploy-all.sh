#!/bin/bash

# ============================================
# MASTER DEPLOY SCRIPT
# ============================================
# Deploya backend y frontend juntos
# Uso: ./deploy-all.sh [staging|prod]
# Ejemplo: ./deploy-all.sh prod
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
DEPLOY_ENV=${1:-prod}
if [ "$DEPLOY_ENV" != "staging" ] && [ "$DEPLOY_ENV" != "prod" ]; then
  log_error "Uso: ./deploy-all.sh [staging|prod]"
  exit 1
fi

# Banner
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  INNOVACIONES LOGÍSTICA - DEPLOY COMPLETO     ║${NC}"
echo -e "${BLUE}║  Ambiente: $([ "$DEPLOY_ENV" = "prod" ] && echo "PRODUCCIÓN" || echo "STAGING")                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Confirmación
if [ "$DEPLOY_ENV" = "prod" ]; then
  log_warning "⚠️  ADVERTENCIA: Estás a punto de deployar a PRODUCCIÓN"
  log_warning "Esto afectará a todos los usuarios"
  echo ""
  read -p "¿Estás seguro? Escribe 'prod' para continuar: " CONFIRM
  if [ "$CONFIRM" != "prod" ]; then
    log_error "Abortado por usuario"
    exit 1
  fi
  echo ""
fi

# Verificar que los scripts existen
if [ ! -f "backend/deploy.sh" ]; then
  log_error "No encontrado: backend/deploy.sh"
  exit 1
fi

if [ ! -f "frontend/deploy.sh" ]; then
  log_error "No encontrado: frontend/deploy.sh"
  exit 1
fi

TOTAL_START=$(date +%s)

# ============= DEPLOY BACKEND =============
log_info "="
log_info "INICIANDO DEPLOY DEL BACKEND"
log_info "="
echo ""

BACKEND_START=$(date +%s)

cd backend
if ! ./deploy.sh $DEPLOY_ENV; then
  log_error "Backend deploy falló"
  exit 1
fi

BACKEND_END=$(date +%s)
BACKEND_TIME=$((BACKEND_END - BACKEND_START))
log_success "Backend deploy completado en $((BACKEND_TIME / 60))m $((BACKEND_TIME % 60))s"

# ============= ESPERAR A QUE BACKEND ESTÉ LISTO =============
cd ..
log_info "="
log_info "ESPERANDO A QUE EL BACKEND ESTÉ LISTO"
log_info "="

# Obtener URL del backend según ambiente
if [ "$DEPLOY_ENV" = "prod" ]; then
  BACKEND_URL="http://52.201.18.118:3000/api/health"
else
  BACKEND_URL="http://ec2-staging.example.com:3000/api/health"
fi

RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s "$BACKEND_URL" | grep -q "ok"; then
    log_success "Backend está respondiendo"
    break
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo -ne "\rIntentando... $RETRY_COUNT/$MAX_RETRIES"
    sleep 2
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  log_warning "Backend no respondió después de $(($MAX_RETRIES * 2)) segundos"
  log_warning "El frontend puede estar esperando disponibilidad"
fi

echo ""

# ============= DEPLOY FRONTEND =============
log_info "="
log_info "INICIANDO DEPLOY DEL FRONTEND"
log_info "="
echo ""

FRONTEND_START=$(date +%s)

cd frontend
if ! ./deploy.sh $DEPLOY_ENV; then
  log_error "Frontend deploy falló"
  exit 1
fi

FRONTEND_END=$(date +%s)
FRONTEND_TIME=$((FRONTEND_END - FRONTEND_START))
log_success "Frontend deploy completado en $((FRONTEND_TIME / 60))m $((FRONTEND_TIME % 60))s"

# ============= RESUMEN FINAL =============
TOTAL_END=$(date +%s)
TOTAL_TIME=$((TOTAL_END - TOTAL_START))

cd ..

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ DEPLOY COMPLETADO CON ÉXITO                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo "📊 Estadísticas:"
echo "  Backend:  $((BACKEND_TIME / 60))m $((BACKEND_TIME % 60))s"
echo "  Frontend: $((FRONTEND_TIME / 60))m $((FRONTEND_TIME % 60))s"
echo "  Total:    $((TOTAL_TIME / 60))m $((TOTAL_TIME % 60))s"
echo ""
echo "🎯 Ambiente: $([ "$DEPLOY_ENV" = "prod" ] && echo "PRODUCCIÓN" || echo "STAGING")"
echo ""

if [ "$DEPLOY_ENV" = "prod" ]; then
  echo "🔗 Links:"
  echo "  Frontend:  https://innovacioneslogistica.com"
  echo "  API:       https://api.innovacioneslogistica.com/api"
  echo "  Health:    https://api.innovacioneslogistica.com/api/health"
else
  echo "🔗 Links (Staging):"
  echo "  Frontend:  https://staging.innovacioneslogistica.com"
  echo "  API:       https://api-staging.innovacioneslogistica.com/api"
fi

echo ""
echo "⏰ Completado: $(date)"
echo ""
log_success "¡Felicidades! El deploy está listo"
echo ""
