# Guía Rápida - Innovaciones Logistica

## Inicio Rápido Local

### Requisitos
- Node.js 20 LTS
- PostgreSQL 15 (o acceso a RDS)
- Git
- Docker (opcional)

### Setup Inicial

```bash
# Clonar repositorio
git clone https://github.com/carlosandres555/InnovacionesLogistica.git
cd InnovacionesLogistica

# Backend
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npx prisma generate
npx prisma db push
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Variables de Entorno

**Backend (.env)**
```
DATABASE_URL="postgresql://user:pass@host/db"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

**Frontend (.env)**
```
VITE_API_URL="http://localhost:3000/api"
```

### URLs Locales
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health check: http://localhost:3000/api/health

### Comando Git Flow

```bash
# Desarrollo local
git checkout develop
npm run dev

# Cuando termines una feature
git add .
git commit -m "Tu mensaje"
git push origin develop

# Cuando lista para deploy
git checkout master
git merge develop
git push origin master  # Esto triggerea deploy automático
```

## Estructura del Proyecto

```
InnovacionesLogistica/
├── backend/
│   ├── src/
│   │   ├── server.js          # Servidor Express
│   │   ├── middleware/        # Auth, validación
│   │   ├── routes/            # Endpoints API
│   │   └── services/          # Lógica de negocio
│   ├── prisma/
│   │   └── schema.prisma      # Modelo de datos
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/             # Páginas
│   │   ├── components/        # Componentes
│   │   ├── store/             # Estado (Zustand)
│   │   └── services/          # API calls
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── API.md                 # Documentación API
│   ├── DEPLOYMENT.md          # Guía deployment
│   ├── ARCHITECTURE.md        # Arquitectura
│   └── QUICKSTART.md          # Esta guía
└── .github/workflows/         # CI/CD
```

## Desarrollo Local

### Backend Development
```bash
cd backend
npm run dev                  # Inicia con nodemon
npm run db:migrate          # Crea migraciones
npx prisma studio          # Visualiza DB
npm test                    # Ejecuta tests
```

### Frontend Development
```bash
cd frontend
npm run dev                 # Inicia dev server
npm run build              # Build producción
npm run preview            # Preview producción
npm run lint               # Linter
```

## Debugging

### Ver logs del API
```bash
# Terminal donde corre npm run dev
# O en EC2:
pm2 logs innovaciones-api
```

### Console del navegador
F12 → Console (para errores frontend)

### Network tab
F12 → Network (para ver requests API)

## Común Issues

### Error: "Can't reach database"
- Verificar DATABASE_URL es correcta
- Verificar firewall/VPC permite conexión

### Error: "API not responding"
- Verificar backend está corriendo (npm run dev)
- Verificar CORS está habilitado
- Verificar VITE_API_URL es correcta en frontend

### Error: "Module not found"
```bash
rm -rf node_modules
npm install
```

## Próximos Pasos

1. Crear rama feature: `git checkout -b feature/nombre`
2. Desarrollar localmente
3. Testear bien
4. Commit + push a `develop`
5. Cuando esté listo, merge a `master`
6. Deploy automático se ejecuta

---

Para más detalles, ver [API.md](./API.md) y [DEPLOYMENT.md](./DEPLOYMENT.md)
