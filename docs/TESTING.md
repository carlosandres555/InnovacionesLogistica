# Guía de Testing - Innovaciones Logistica

## Testing Backend

### Unit Tests (Jest)

```bash
cd backend
npm test
npm run test:watch    # Watch mode
```

### Ejemplo de Test

```javascript
// src/__tests__/auth.test.js
import request from 'supertest'
import app from '../server'

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123456',
        firstName: 'Test',
        lastName: 'User'
      })

    expect(res.status).toBe(201)
    expect(res.body.accessToken).toBeDefined()
  })

  it('should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123456'
      })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
  })

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrong'
      })

    expect(res.status).toBe(401)
  })
})
```

## Testing Frontend

### Component Tests (Vitest + React Testing Library)

```bash
cd frontend
npm test
npm run test:ui    # UI mode
```

### Ejemplo de Test

```javascript
// src/__tests__/LoginPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

describe('LoginPage', () => {
  it('should render login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument()
  })

  it('should allow user to login', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/correo/i)
    const passwordInput = screen.getByPlaceholderText(/contraseña/i)
    const button = screen.getByText(/iniciar sesión/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Test123456' } })
    fireEvent.click(button)

    // Assertions...
  })
})
```

## E2E Tests (Playwright)

```bash
cd frontend
npx playwright install
npm run test:e2e
```

### Ejemplo E2E

```javascript
// tests/auth.spec.js
import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('should register and login', async ({ page }) => {
    // Register
    await page.goto('http://localhost:5173/login')
    await page.click('text=Regístrate')

    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'Test123456')
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')

    await page.click('button:has-text("Registrarse")')

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:5173/dashboard')
  })
})
```

## Coverage Reports

```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage
```

### Targets de Coverage
- Statements: > 70%
- Branches: > 60%
- Functions: > 70%
- Lines: > 70%

## Testing de APIs Manuales

### Con cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Get Protected Endpoint
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Con Postman

1. Descarga Postman
2. Importa colección desde `/postman/Innovaciones.postman_collection.json`
3. Configura variables de entorno
4. Ejecuta requests

## CI/CD Testing

Los tests se ejecutan automáticamente en GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
```

## Checklist de Testing

- [ ] Unit tests para funciones críticas
- [ ] Integration tests para APIs
- [ ] E2E tests para flows principales
- [ ] Coverage > 70%
- [ ] Tests pasan antes de merge
- [ ] No hay warnings en linter

---

Para más info, ver [API.md](./API.md)
