# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Innovaciones Logistica** is a comprehensive logistics distribution platform for managing shipments, routes, vehicles, and real-time tracking for small logistics companies.

- **Frontend:** React 18 + Vite + Tailwind CSS + Leaflet maps
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL (RDS)
- **Infrastructure:** AWS (EC2, S3, CloudFront, Route 53, RDS)
- **Real-time:** Socket.io for live tracking

## Common Commands

### Backend (Node.js + Express)

```bash
cd backend

# Development
npm install
npm run dev                 # Start dev server with nodemon (port 3000)
npm run lint              # Fix ESLint issues

# Database
npm run db:migrate        # Run Prisma migrations
npm run db:seed           # Seed database with sample data
npm run db:studio         # Open Prisma Studio GUI

# Testing
npm test                  # Run Jest tests
npm test:watch            # Watch mode for tests
```

### Frontend (React + Vite)

```bash
cd frontend

# Development
npm install
npm run dev               # Start Vite dev server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build locally
npm run lint             # Fix ESLint issues

# Testing
npm test                 # Run Vitest
npm test:ui              # Run tests with Vitest UI
```

### Deployment

```bash
# Deploy backend to EC2
./deploy.sh

# Deploy frontend to S3 + CloudFront
./deploy-frontend.sh
```

## Architecture

### System Design

The platform follows a three-tier architecture:

1. **Frontend (S3 + CloudFront)**: Static React app served via CDN
2. **Backend (EC2 t2.micro)**: Node.js/Express API with PM2 process manager
3. **Database (RDS)**: PostgreSQL with automated backups

See `docs/ARCHITECTURE.md` for detailed diagrams and data flow.

### Key Technologies

- **Authentication**: JWT (15 min expiry) + Refresh Tokens (7 days)
- **Validation**: Zod schemas for input validation
- **Security**: Helmet, CORS, rate limiting (express-rate-limit)
- **Real-time**: Socket.io for location tracking broadcasts
- **File Storage**: AWS S3 with presigned URLs (15 min validity)
- **ORM**: Prisma with PostgreSQL

### Database Schema

Main entities:
- **User**: Roles (ADMIN, ANALISTA, IN_HOUSE, CUSTOMER)
- **Company**: Parent entity for users, vehicles, and shipments
- **Shipment**: Status (PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED, CANCELLED)
- **Vehicle**: Linked to company and current driver
- **Location**: GPS tracking for shipments and vehicles (indexed for performance)
- **FileUpload**: References to S3-stored files

See `backend/prisma/schema.prisma` for full schema.

## Code Organization

### Backend Structure

```
backend/
├── src/
│   ├── server.js           # Express app, Socket.io setup, route registration
│   ├── controllers/        # Business logic for each entity
│   ├── routes/             # Express route definitions (public + protected)
│   ├── middleware/         # Auth, validation, error handling
│   └── validators/         # Zod schema definitions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Sample data for development
└── .env                    # Environment variables (not in repo)
```

### Frontend Structure

```
frontend/
├── src/
│   ├── App.jsx             # Route setup with QueryClient provider
│   ├── pages/              # Route components (DashboardPage, LoginPage, etc.)
│   ├── components/         # Reusable UI components (ProtectedRoute, Layout)
│   ├── services/           # API client functions
│   └── store/              # Zustand state (authStore, etc.)
├── index.css               # Tailwind imports
└── vite.config.js          # Vite build configuration
```

### Key Patterns

**Protected Routes**: `ProtectedRoute` component wraps authenticated pages. Check `frontend/src/components/ProtectedRoute.jsx`.

**API Communication**: Axios-based clients in `frontend/src/services/`. Always include JWT in Authorization header for protected endpoints.

**State Management**: Zustand for auth state in `frontend/src/store/authStore.js`.

**Form Validation**: Backend uses Zod schemas in `backend/src/validators/`. Frontend handles client-side validation before submission.

**WebSocket Rooms**: Drivers join `shipment-${id}` rooms. Location updates broadcast to all subscribers via Socket.io.

## Important Notes

### Environment Variables

Backend requires (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for signing tokens
- `FRONTEND_URL`: CORS origin
- `PORT`: Server port (default 3000)
- `NODE_ENV`: development/production
- AWS credentials for S3 integration

Frontend expects backend at URL from environment or defaults to `http://localhost:3000`.

### Rate Limiting

Backend implements rate limiting on all `/api/` endpoints:
- Default: 100 requests per 15 minutes per IP
- Configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`

### Database Migrations

Always use `npm run db:migrate` to create migrations before pushing schema changes. Prisma generates types automatically.

Running `npm run db:seed` populates test data useful for development.

### Error Handling

Backend has centralized error handler (`src/middleware/errorHandler.js`). Controllers throw or pass errors to `next()`. Frontend catches API errors and displays user-friendly messages.

### Testing

Backend: Jest configuration for unit/integration tests
Frontend: Vitest for component testing and React Testing Library

Run tests before commits to catch regressions.

### File Upload Flow

1. Frontend requests presigned URL: `POST /api/uploads/presigned-url`
2. Backend generates 15-min signed S3 URL
3. Frontend uploads directly to S3
4. Frontend submits reference to backend: `POST /api/uploads/save`
5. Backend stores in `FileUpload` model

### Deployment Notes

- Backend deployed via `./deploy.sh`: pulls code, installs deps, runs migrations, restarts PM2
- Frontend deployed via `./deploy-frontend.sh`: builds and uploads to S3
- Both scripts use hardcoded EC2 host and SSH key (ensure `.pem` file has correct permissions)
- Always test locally (`npm run dev`) before deploying

### Performance Considerations

- Database indexes on `companyId`, `status`, `trackingNumber` for Shipment queries
- Location table heavily indexed (shipmentId, vehicleId, companyId) due to real-time updates
- Presigned URLs reduce backend load for file uploads
- Socket.io rooms segment broadcast traffic by shipment

## Responsive Design Strategy

The frontend uses Tailwind CSS breakpoints for mobile-first responsive design:
- **Mobile (< 640px)**: Single column layouts, card-based tables, stacked buttons
- **Tablet (640px-1024px)**: 2-column grids, optimized spacing
- **Desktop (> 1024px)**: 3-column grids, full tables, side-by-side layouts

### Key Responsive Patterns

1. **Tables**: Convert to cards on mobile using `ResponsiveTable` component (`sm:hidden` for cards, `hidden sm:block` for table)
2. **Modals**: `p-4 sm:p-6` for padding, `flex-col sm:flex-row` for button layouts
3. **Buttons**: Full width on mobile, auto width on desktop
4. **Headings**: Smaller on mobile (`text-2xl sm:text-3xl`)
5. **Spacing**: Reduced on mobile, increased on desktop (`space-y-4 sm:space-y-6`)

### Mobile-Optimized Components

- **Layout.jsx**: Collapsible sidebar on mobile, fixed navigation overlay
- **UsersPage.jsx**: Card view on mobile, table on tablet+
- **ShipmentsPage.jsx**: Card view on mobile, table on tablet+
- **DashboardPage.jsx**: 1 column mobile → 2 column tablet → 3 column desktop
- **MapPage.jsx**: Dynamic height responsive to viewport
- **Modals**: Full-width with padding on mobile, centered with padding on desktop
- **Input fields**: Responsive font sizes (`text-sm` on mobile)

### Testing Responsive Design

Always test at these breakpoints:
```
- 375px (iPhone SE)
- 768px (iPad)
- 1024px (Desktop)
```

## Useful Documentation

- `docs/API.md`: Full API endpoint reference
- `docs/DEPLOYMENT.md`: Detailed AWS deployment instructions
- `docs/ARCHITECTURE.md`: System diagrams, data flows, security details
- `README.md`: Project overview and quick setup guide
