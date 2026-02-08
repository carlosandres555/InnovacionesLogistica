# Innovaciones Logistica - Plataforma de Distribución

Plataforma moderna de distribución logística construida con React, Node.js, PostgreSQL y AWS Free Tier.

## Descripción del Proyecto

Sistema integral para gestión de envíos, rutas, vehículos y tracking en tiempo real para pequeñas empresas logísticas.

**Stack Tecnológico:**
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Prisma
- **Base de Datos:** PostgreSQL en RDS
- **Almacenamiento:** S3 (AWS)
- **Infraestructura:** EC2 + CloudFront + Route 53
- **Mapas:** Leaflet + OpenStreetMap

## Estructura del Proyecto

```
distribucion-costa/
├── frontend/          # Aplicación React
├── backend/           # API Express
├── infrastructure/    # Configuración AWS y deployment
├── docs/              # Documentación
└── .github/           # CI/CD workflows
```

## Requisitos Previos

- Node.js 20+ LTS
- npm o yarn
- Cuenta AWS con free tier activo
- Git

## Instalación Local

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Documentación

- [API Endpoints](./docs/API.md)
- [Guía de Deployment](./docs/DEPLOYMENT.md)
- [Arquitectura](./docs/ARCHITECTURE.md)

## Fases de Implementación

1. ✅ Setup inicial
2. ✅ Base de datos (RDS)
3. ✅ Backend API (Express + Prisma)
4. ✅ Deployment backend (EC2 + PM2)
5. ✅ Frontend React (Vite)
6. ⏳ Deployment frontend (S3)
7. ⏳ Almacenamiento S3
8. ⏳ Características avanzadas (Shipments, Tracking)
9. ⏳ Testing y seguridad
10. ⏳ Documentación y launch

## Costo Estimado

**Primeros 12 meses:** $0.50 - $2/mes (free tier)

## Contribuyentes

- Innovaciones Logistica Team

## Licencia

Propietario - Innovaciones Logistica
