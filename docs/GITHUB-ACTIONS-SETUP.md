# Configuración de GitHub Actions - Deploy Automático

## Resumen

Cuando hagas **push a master**, GitHub Actions automáticamente:
1. ✅ Ejecuta tests
2. ✅ Construye el código
3. ✅ Deploya backend a EC2
4. ✅ Deploya frontend a S3 + CloudFront

---

## Configuración Inicial (Una sola vez)

### 1. Crear GitHub Secrets

Ve a: **GitHub → Settings → Secrets and variables → Actions**

Click en **"New repository secret"** y agrega estos 6 secrets:

#### **Para Backend (EC2)**

```
Name: EC2_HOST
Value: 52.201.18.118

Name: EC2_USER
Value: ubuntu

Name: EC2_KEY
Value: (contenido completo del archivo .pem)
```

⚠️ Para **EC2_KEY**, abre tu archivo .pem y copia TODO el contenido:

```bash
cat ~/.ssh/innovaciones-logistica-key.pem
```

Copia desde `-----BEGIN` hasta `-----END` (incluye ambos).

#### **Para Frontend (AWS)**

```
Name: AWS_ACCESS_KEY_ID
Value: AKIATAIKEQVM62LPJFGZ

Name: AWS_SECRET_ACCESS_KEY
Value: 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

Name: S3_BUCKET
Value: innovaciones-logistica-frontend

Name: CLOUDFRONT_DIST_ID
Value: E36ILM4E1Z89AZ (tu distribution ID)
```

---

### 2. Verificar Secrets

Después de agregarlos, ve a **Settings → Secrets** y verifica que están todos (aparecerán con *****):

```
✅ AWS_ACCESS_KEY_ID
✅ AWS_SECRET_ACCESS_KEY
✅ CLOUDFRONT_DIST_ID
✅ EC2_HOST
✅ EC2_KEY
✅ EC2_USER
✅ S3_BUCKET
```

---

## Uso Daily

### Workflow Típico

```bash
# 1. Clonar repo (primera vez)
git clone https://github.com/carlosandres555/InnovacionesLogistica.git
cd InnovacionesLogistica

# 2. Crear rama de feature
git checkout develop
git checkout -b feature/nombre-descriptivo

# 3. Desarrollar localmente
npm run dev  # backend + frontend

# 4. Commit y push a develop
git add .
git commit -m "feat(backend): add new endpoint"
git push origin feature/nombre-descriptivo

# 5. Hacer Pull Request a develop en GitHub
# (GUI o CLI: gh pr create)

# 6. Merge a develop (después de review)
git checkout develop
git merge feature/nombre-descriptivo

# 7. Cuando está listo para producción
git checkout master
git merge develop
git push origin master

# ← GitHub Actions automáticamente deploya aquí
```

---

## Qué sucede cuando haces Push a Master

### Backend

```
1. GitHub detecta push a master en /backend
2. Corre workflow: backend-deploy.yml
3. Instala dependencias
4. Ejecuta tests
5. SSH al EC2
6. Git pull (obtiene código nuevodel repo)
7. npm install (instala nuevas dependencias si hay)
8. npx prisma generate (actualiza cliente Prisma)
9. Ejecuta migraciones si hay
10. pm2 restart (reinicia la app)
11. Muestra logs (últimas 20 líneas)
```

**Resultado:** Nuevo código en producción en ~2-3 minutos

### Frontend

```
1. GitHub detecta push a master en /frontend
2. Corre workflow: frontend-deploy.yml
3. Instala dependencias
4. Ejecuta tests
5. npm run build (crea dist/)
6. Sube dist/ a S3 con --delete (limpia archivos viejos)
7. Invalida CloudFront cache (/*)
8. CloudFront sirve nuevo código
```

**Resultado:** Nuevo frontend en S3 + CloudFront en ~2-3 minutos

---

## Monitorear Deploy

### En GitHub

1. Ve a **Actions** en tu repo
2. Verás los workflows ejecutándose
3. Click en el workflow para ver detalles
4. Logs en tiempo real

### Ejemplo de éxito

```
✓ Setup Node.js
✓ Install dependencies
✓ Run tests
✓ Deploy to EC2
✓ Notify Slack on failure (skipped)
```

### Si falla

```
✗ Deploy to EC2
  Error: ssh: connect to host 52.201.18.118 port 22: Connection refused
```

**Soluciones comunes:**
- EC2 no está corriendo → reinicia en AWS Console
- EC2_HOST está mal → verifica IP pública en AWS
- EC2_KEY está incompleto → incluye todo el contenido .pem

---

## Branching Strategy

```
master (producción)      ← GitHub Actions deploya aquí automáticamente
  ↑
  └── Pull Request (review + tests)
develop (desarrollo)     ← Merge de features
  ↑
  ├── feature/tracking   ← Rama de desarrollo
  ├── feature/maps       ← Rama de desarrollo
  └── bugfix/login       ← Rama de desarrollo
```

---

## Rollback (Si algo salió mal)

### Opción 1: Revertir commit

```bash
git log --oneline        # Ver commits
git revert <commit-id>   # Revierte un commit
git push origin master   # Deploya la reversión automáticamente
```

### Opción 2: Forzar revert

```bash
git reset --hard <commit-id>
git push -f origin master
```

⚠️ Fuerza push solo si sabes lo que haces.

---

## Debugging

### Ver logs de GitHub Actions

1. **Actions → tu workflow → click en run**
2. Expande cada step
3. Busca el error

### Ver logs de EC2 después del deploy

```bash
ssh -i ~/.ssh/innovaciones-logistica-key.pem ubuntu@52.201.18.118
pm2 logs innovaciones-api
```

### Ver logs de S3/CloudFront

En AWS Console:
- **CloudFront → Distributions → Error logs**
- **S3 → Access logs**

---

## Secrets Best Practices

✅ **DO:**
- Rotar secrets cada 90 días
- Usar secrets diferentes por ambiente
- Revisar acceso a secrets regularmente
- Mantener .pem files seguros

❌ **DON'T:**
- Commitear secrets al repo
- Compartir secrets por chat/email
- Usar mismos secrets en dev y prod
- Dejar secrets en histórico de git

---

## Tips & Tricks

### Ver todas las actions

```bash
gh action-list  # CLI
# O ve a: GitHub → Actions
```

### Triggear deploy sin cambios

```bash
git commit --allow-empty -m "chore: trigger deploy"
git push origin master
```

### Deshabilitar workflow temporalmente

1. Ve a **Actions → workflow → ⋯ → Disable workflow**
2. Para reenablarlo: Click en "Enable workflow"

---

## Troubleshooting

### "Access Denied" en S3

- Verificar AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY
- Verificar que el IAM user tiene permiso S3FullAccess

### "Cannot SSH to EC2"

- EC2 debe estar running
- Security group debe permitir SSH (puerto 22)
- EC2_KEY debe tener todo el contenido .pem

### "Tests failing in CI"

- Pasar tests localmente primero
- Ver output del workflow en GitHub Actions
- Fix → commit → push

### "Database migration fails"

- Ver logs: `pm2 logs innovaciones-api`
- Verificar DATABASE_URL en .env del EC2
- Puede ser que la DB esté offline

---

## Próximos Pasos

1. ✅ Agregar todos los secrets
2. ✅ Hacer un cambio pequeño en master
3. ✅ Ver que GitHub Actions ejecuta automáticamente
4. ✅ Verificar que los cambios aparecen en producción

---

**¡Listo!** Ahora cada push a `master` desplegará automáticamente 🚀
