# Arquitectura - Innovaciones Logistica

## Diagrama General

```
┌─────────────────────────────────────────────────────────┐
│                     Usuario Final                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   Route 53 (DNS)     │ ← Dominio personalizado
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  CloudFront (CDN)    │ ← Frontend estático
            └──────────┬───────────┘
                       │
        ┏━━━━━━━━━━━━━┻━━━━━━━━━━━━━┓
        ▼                            ▼
┌───────────────┐          ┌─────────────────┐
│  S3 Bucket    │          │  EC2 t2.micro   │ ← Backend API
│  (Frontend)   │          │  Node.js        │
└───────────────┘          └────────┬────────┘
                                    │
                     ┏━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━┓
                     ▼              ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │ RDS Postgres │ │  S3 Bucket   │ │ CloudWatch   │
            │ db.t2.micro  │ │  (Files)     │ │  (Logs)      │
            └──────────────┘ └──────────────┘ └──────────────┘
```

## Componentes

### Frontend (React + Vite)
- **Hosting:** S3 + CloudFront
- **Dominio:** Route 53
- **Certificado SSL:** AWS Certificate Manager (gratuito)
- **Responsabilidades:**
  - UI de login/autenticación
  - Dashboard con métricas
  - Gestión de envíos
  - Visualización de mapas en tiempo real
  - Upload de documentos

### Backend (Node.js + Express)
- **Hosting:** EC2 t2.micro (Ubuntu 22.04)
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt
- **Process Manager:** PM2
- **Responsabilidades:**
  - Autenticación JWT
  - CRUD de entidades
  - Lógica de negocio
  - WebSockets para tracking
  - Presigned URLs para S3

### Base de Datos (PostgreSQL)
- **Hosting:** RDS db.t2.micro
- **Almacenamiento:** 20GB
- **Backups:** Snapshots automáticos diarios
- **Entidades principales:**
  - Users
  - Companies
  - Shipments
  - Locations (tracking)
  - Vehicles

### Almacenamiento (S3)
- **Bucket 1:** Frontend estático (build)
- **Bucket 2:** Uploads de usuarios (documentos, fotos)
- **CORS:** Configurado para requests desde frontend
- **Lifecycle:** Auto-delete de archivos temporales tras 30 días

## Flujo de Datos

### Autenticación
```
Frontend (Login Form)
    ↓
Backend POST /api/auth/login
    ↓
Verificar credenciales en DB
    ↓
Generar JWT + Refresh Token
    ↓
Frontend guarda tokens (localStorage + secure cookie)
    ↓
Próximos requests: Authorization: Bearer <JWT>
```

### Tracking de Envíos
```
Mobile App / Driver Update
    ↓
WebSocket: actualiza ubicación
    ↓
Backend recibe geolocalización
    ↓
Guarda en DB (locations table)
    ↓
Broadcast a WebSocket subscribers
    ↓
Frontend actualiza mapa en tiempo real
```

### Upload de Archivos
```
Frontend: Usuario selecciona archivo
    ↓
Backend: POST /api/uploads/presigned-url
    ↓
AWS: Genera signed URL válido por 15 min
    ↓
Frontend: PUT a URL firmado (S3 directo)
    ↓
Backend: Guarda referencia en DB
```

## Seguridad

### Network
- EC2: Security Group restringido (SSH solo tu IP, HTTP/HTTPS público)
- RDS: Security Group solo desde EC2
- S3: Buckets privados, acceso vía CloudFront/presigned URLs

### Autenticación
- Passwords: bcrypt con 12 rounds
- JWT: 15 min expiración + 7d refresh token
- Rate limiting: 5 intentos login/15min por IP

### Validación
- Input: Zod schema validation
- XSS: Sanitización en frontend
- CSRF: Token en headers (Socket.io + CORS)
- SQL Injection: Previsto por Prisma (parameterized queries)

## Escalabilidad (Post Free Tier)

### Cuando superes limits:
1. **Auto Scaling:** Agregar Load Balancer + Auto Scaling Group
2. **Database:** Upgrade a db.t3.small o usar Aurora serverless
3. **Storage:** Usar CloudFront caching más agresivo
4. **Monitoreo:** ElastiCache para sesiones/caché

### Alternativa: Migrar a Railway/Render
- Frontend: Vercel (gratis)
- Backend+DB: Railway ($7/mes)
- S3: Mantener en AWS ($2-3/mes)

## Monitoreo

### CloudWatch Alarms
- CPU EC2 > 70%
- RDS storage > 18GB (de 20GB)
- Billing > $5
- Error rate > 5%

### Logs
- Backend logs → CloudWatch Logs
- Frontend errors → Browser Console + Sentry (opcional)
- Database slow queries → RDS Performance Insights

## Backup & Disaster Recovery

### RDS
- Snapshots automáticos: diarios por 7 días
- Manual snapshots antes de cambios mayores

### Frontend
- Versionado en Git
- Builds disponibles en S3 histórico

### Documentación
- Todo en Git (código + docs)
- Deployment scripts en `infrastructure/`
