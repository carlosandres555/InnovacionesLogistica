# Guía de Contribución - Innovaciones Logistica

## Workflow de Desarrollo

### 1. Ramas (Branching)

```
master          → Producción (deploy automático)
  ↓
develop         → Desarrollo (merge de features)
  ↓
feature/*       → Nuevas features
bugfix/*        → Bugfixes
```

### 2. Crear Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo

# Ejemplos:
git checkout -b feature/add-shipment-tracking
git checkout -b feature/improve-map-performance
git checkout -b bugfix/login-error
```

### 3. Desarrollo Local

```bash
# Backend
cd backend
npm run dev

# Frontend (otra terminal)
cd frontend
npm run dev

# Abre http://localhost:5173
```

### 4. Commit Messages

```
Format: <tipo>(<scope>): <subject>

Tipos:
- feat: Nueva feature
- fix: Bugfix
- docs: Cambios en docs
- style: Cambios de estilo (sin afectar código)
- refactor: Refactorización
- perf: Mejoras de performance
- test: Agregar tests

Scope: backend, frontend, docs, etc

Ejemplos:
feat(backend): add shipment tracking endpoint
fix(frontend): login button not responsive
docs(api): update auth endpoints
refactor(backend): optimize database queries
```

### 5. Before Committing

```bash
# Backend
cd backend
npm run lint
npm test

# Frontend
cd frontend
npm run lint
npm test
```

### 6. Push a Feature Branch

```bash
git add .
git commit -m "feat(backend): add shipment tracking"
git push origin feature/nombre-descriptivo
```

### 7. Pull Request

1. Ve a GitHub
2. Click en "New Pull Request"
3. Base: `develop`, Compare: `tu-rama`
4. Llena el template:

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Nueva feature
- [ ] Bugfix
- [ ] Breaking change
- [ ] Cambio en docs

## Testing
- [ ] Tests unitarios agregados
- [ ] Tests E2E agregados
- [ ] Coverage > 70%

## Checklist
- [ ] Código sigue style guide
- [ ] Cambios documentados
- [ ] No hay warnings
- [ ] Tests pasan
```

5. Click "Create Pull Request"

### 8. Review & Merge

- [ ] Espera review (si es código)
- [ ] Responde comentarios
- [ ] Update PR si hay cambios
- [ ] Merge cuando esté listo

```bash
git checkout develop
git pull origin develop
git merge feature/nombre
git push origin develop
```

### 9. Deploy a Producción

```bash
git checkout master
git merge develop
git push origin master

# GitHub Actions automáticamente:
# 1. Ejecuta tests
# 2. Deploy backend a EC2
# 3. Deploy frontend a S3
```

---

## Code Style

### Backend (JavaScript/Node.js)

```javascript
// ✅ Good
const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  return user
}

// ❌ Bad
const getuser = async (id) => {
  let user = prisma.user.findUnique({ where: { id: id } })
  return user
}
```

### Frontend (React/JSX)

```jsx
// ✅ Good
export default function ShipmentCard({ shipment, onSelect }) {
  return (
    <div className="card" onClick={() => onSelect(shipment.id)}>
      <h3>{shipment.trackingNumber}</h3>
      <p>{shipment.destAddress}</p>
    </div>
  )
}

// ❌ Bad
export default function shipmentcard({ s, o }) {
  return (
    <div style={{padding: '10px'}} onClick={() => o(s.id)}>
      <h3>{s.trackingNumber}</h3>
    </div>
  )
}
```

---

## Commit Frequency

**Buena práctica:**
- Commit cada funcionalidad lógica completa
- NO después de cada pequeño cambio
- NO todo al final en un mega-commit

```
❌ Bad:
"fixed stuff"
"more fixes"
"final changes"

✅ Good:
"feat(backend): add shipment creation endpoint"
"feat(frontend): create shipment form component"
"test(backend): add shipment creation tests"
```

---

## Performance & Security

### Antes de Mergear

**Backend:**
- [ ] No hay console.log() dejados
- [ ] No hay secrets/passwords en código
- [ ] SQL queries optimizadas (índices)
- [ ] Error handling en place
- [ ] Rate limiting en endpoints públicos

**Frontend:**
- [ ] No hay console.log() dejados
- [ ] Lazy loading para componentes grandes
- [ ] Images optimizadas
- [ ] No hay secrets en frontend code
- [ ] CSRF tokens si es necesario

---

## Questions?

- Abre un **Issue** en GitHub
- Contacta a: logis.innovaciones@gmail.com

---

¡Gracias por contribuir! 🚀
