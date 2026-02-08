# 🚀 Quick Start - Deploy en 3 minutos

## Para desplegar a PRODUCCIÓN

### Opción A: Desplegar TODO (Recomendado)
```bash
./deploy-all.sh prod
```
✅ Despliega backend + frontend automáticamente

### Opción B: Desplegar solo Backend
```bash
cd backend
./deploy.sh prod
```

### Opción C: Desplegar solo Frontend
```bash
cd frontend
./deploy.sh frontend prod
```

---

## Para DESARROLLO Local (NO afecta deploy)

### 1. Modifica `.env` como siempre
```bash
# backend/.env
VITE_API_URL="http://localhost:3000/api"

# frontend/.env
VITE_API_URL="http://localhost:3000/api"
```

### 2. Corre en tu máquina
```bash
npm run dev
```

### 3. Cuando hagas deploy, se FUERZA a URLs de producción
```bash
./deploy-all.sh prod
# ✓ Las URLs se reemplazan automáticamente
# ✓ No importa lo que tengas en .env local
```

---

## Archivos Clave

| Archivo | Propósito | Modificable? |
|---------|-----------|------------|
| `.env` | Variables locales para desarrollo | ✅ Sí |
| `.deploy` | Configuración de deploy | ✅ Solo staging |
| `deploy.sh` | Script que hace el deploy | ❌ NO |

---

## La Magia ✨

```
Tu máquina (local)    →    Deploy Script    →    Producción
.env: localhost              .deploy: prod URL        ✓ https://prod.com
                         (Fuerza URLs)
                         Ignore .env local
```

**Los scripts SIEMPRE usan URLs de producción, no importa tu `.env` local**

---

## Antes de deployar

```bash
# 1. ¿Cambios committed?
git status

# 2. ¿Estás en main?
git branch

# 3. ¿Todo compilar?
npm run build
```

---

## Si algo falla

```bash
# Ver logs del backend
ssh -i ~/.ssh/innovaciones-key.pem ubuntu@52.201.18.118

# Ver logs del frontend
aws s3 ls s3://innovaciones-logistica-frontend

# Revertir a backup anterior
# Ver DEPLOY.md → Sección "Rollback"
```

---

## ⚡ TL;DR

```bash
# Development local (con localhost)
npm run dev

# Deploy a producción (con URLs de prod, automátic)
./deploy-all.sh prod
```

**¡Listo!**

---

Para más información: Ver [DEPLOY.md](./DEPLOY.md)
