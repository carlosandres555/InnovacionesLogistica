# API Documentation - Innovaciones Logistica

## Base URL

```
https://api.tu-dominio.com/api
```

## Authentication

Todos los endpoints protegidos requieren:

```
Authorization: Bearer <ACCESS_TOKEN>
```

Tokens expiran en 15 minutos. Usar `/auth/refresh` para obtener uno nuevo.

---

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+1234567890"
}

Response (201):
{
  "message": "User registered successfully",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "CUSTOMER"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}

Response (200): Same as Register
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response (200):
{
  "accessToken": "eyJhbGc..."
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <TOKEN>

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "company": {
    "id": "uuid",
    "name": "Mi Empresa",
    "logo": "https://..."
  }
}
```

---

### Shipments

#### List Shipments
```http
GET /shipments?status=PENDING&page=1&limit=20
Authorization: Bearer <TOKEN>

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "trackingNumber": "INL-1234567890-ABCDEFG",
      "status": "IN_TRANSIT",
      "originAddress": "123 Main St, City",
      "destAddress": "456 Oak Ave, Other City",
      "description": "Paquete frágil",
      "weight": 5.5,
      "dimensions": "30x20x10cm",
      "value": 150.00,
      "assignedDriver": {
        "id": "uuid",
        "firstName": "Carlos",
        "lastName": "López"
      },
      "vehicle": {
        "id": "uuid",
        "plate": "ABC-1234"
      },
      "createdAt": "2024-02-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### Get Shipment Details
```http
GET /shipments/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "id": "uuid",
  "trackingNumber": "INL-1234567890-ABCDEFG",
  "status": "IN_TRANSIT",
  "originAddress": "123 Main St, City",
  "originLat": 10.123,
  "originLng": -84.456,
  "destAddress": "456 Oak Ave, Other City",
  "destLat": 10.789,
  "destLng": -84.321,
  "description": "Paquete frágil",
  "weight": 5.5,
  "dimensions": "30x20x10cm",
  "value": 150.00,
  "scheduledDate": "2024-02-10T10:00:00Z",
  "assignedDriver": { ... },
  "vehicle": { ... },
  "locations": [
    {
      "id": "uuid",
      "latitude": 10.5,
      "longitude": -84.4,
      "address": "Ruta 1",
      "speed": 60,
      "timestamp": "2024-02-07T11:30:00Z"
    }
  ],
  "createdAt": "2024-02-07T10:00:00Z",
  "updatedAt": "2024-02-07T11:30:00Z"
}
```

#### Create Shipment
```http
POST /shipments
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "companyId": "uuid",
  "originAddress": "123 Main St, City",
  "destAddress": "456 Oak Ave, Other City",
  "description": "Paquete frágil",
  "weight": 5.5,
  "dimensions": "30x20x10cm",
  "value": 150.00,
  "scheduledDate": "2024-02-10T10:00:00Z"
}

Response (201): Shipment object
```

#### Update Shipment
```http
PUT /shipments/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "driverId": "uuid",
  "vehicleId": "uuid",
  "notes": "Envío salió a las 10:30"
}

Response (200): Updated shipment object
```

#### Delete Shipment
```http
DELETE /shipments/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "message": "Shipment deleted successfully"
}
```

---

### Locations (Tracking)

#### Get Location History for Shipment
```http
GET /locations/shipment/:shipmentId?limit=100
Authorization: Bearer <TOKEN>

Response (200):
[
  {
    "id": "uuid",
    "shipmentId": "uuid",
    "vehicleId": "uuid",
    "latitude": 10.5,
    "longitude": -84.4,
    "accuracy": 10,
    "speed": 60,
    "heading": 180,
    "address": "Ruta 1, Costa Rica",
    "timestamp": "2024-02-07T11:30:00Z"
  }
]
```

#### Get Location History for Vehicle
```http
GET /locations/vehicle/:vehicleId?limit=100
Authorization: Bearer <TOKEN>

Response (200): Same as above
```

#### Create Location (GPS Update)
```http
POST /locations
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "shipmentId": "uuid",
  "vehicleId": "uuid",
  "companyId": "uuid",
  "latitude": 10.5,
  "longitude": -84.4,
  "accuracy": 10,
  "speed": 60,
  "heading": 180,
  "address": "Ruta 1"
}

Response (201): Location object
```

---

### File Uploads

#### Generate Presigned URL
```http
POST /uploads/presigned-url
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "fileName": "documento.pdf",
  "fileType": "application/pdf",
  "shipmentId": "uuid",
  "companyId": "uuid"
}

Response (200):
{
  "presignedUrl": "https://s3.amazonaws.com/...",
  "fileId": "uuid",
  "expiresIn": 900
}
```

Usar presignedUrl para hacer PUT directo a S3:
```javascript
// Frontend
const response = await fetch(presignedUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': fileType }
})
```

#### Get File Upload
```http
GET /uploads/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "id": "uuid",
  "fileName": "documento.pdf",
  "fileUrl": "https://s3.amazonaws.com/...",
  "fileSize": 102400,
  "fileType": "application/pdf",
  "uploadedAt": "2024-02-07T10:00:00Z",
  "expiresAt": "2024-02-08T10:00:00Z"
}
```

#### Delete File Upload
```http
DELETE /uploads/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "message": "File deleted successfully"
}
```

---

### Companies

#### Get Company
```http
GET /companies/:id
Authorization: Bearer <TOKEN>

Response (200):
{
  "id": "uuid",
  "name": "Mi Empresa Logística",
  "email": "info@miempresa.com",
  "phone": "+1234567890",
  "website": "https://miempresa.com",
  "address": "123 Business Ave",
  "city": "San José",
  "state": "San José",
  "zipCode": "10101",
  "country": "Costa Rica",
  "description": "Empresa de logística...",
  "owner": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@miempresa.com"
  },
  "_count": {
    "employees": 5,
    "vehicles": 3,
    "shipments": 42
  }
}
```

#### Create Company
```http
POST /companies
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Mi Empresa Logística",
  "email": "info@miempresa.com",
  "phone": "+1234567890",
  "website": "https://miempresa.com",
  "address": "123 Business Ave",
  "city": "San José",
  "state": "San José",
  "zipCode": "10101",
  "country": "Costa Rica",
  "description": "Descripción de empresa"
}

Response (201): Company object
```

#### Update Company
```http
PUT /companies/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Nuevo nombre",
  "email": "newemail@company.com"
}

Response (200): Updated company object
```

---

### Vehicles

#### List Vehicles
```http
GET /vehicles
Authorization: Bearer <TOKEN>

Response (200):
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "plate": "ABC-1234",
    "model": "Hino 300",
    "capacity": 5000,
    "status": "ACTIVE",
    "gpsDevice": "GPS-001",
    "currentDriver": {
      "id": "uuid",
      "firstName": "Carlos",
      "lastName": "López"
    },
    "_count": {
      "shipments": 15
    }
  }
]
```

#### Create Vehicle
```http
POST /vehicles
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "companyId": "uuid",
  "plate": "ABC-1234",
  "model": "Hino 300",
  "capacity": 5000,
  "gpsDevice": "GPS-001"
}

Response (201): Vehicle object
```

#### Update Vehicle
```http
PUT /vehicles/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "status": "MAINTENANCE",
  "driverId": "uuid"
}

Response (200): Updated vehicle object
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('https://api.tu-dominio.com', {
  auth: {
    token: 'JWT_TOKEN'
  }
})
```

### Join Shipment Tracking
```javascript
socket.emit('join-shipment', 'shipment-uuid')

// Escuchar actualizaciones de ubicación
socket.on('location-update', (data) => {
  console.log({
    shipmentId: data.shipmentId,
    latitude: data.latitude,
    longitude: data.longitude,
    speed: data.speed,
    timestamp: data.timestamp
  })
})
```

### Send Location Update
```javascript
socket.emit('location-update', {
  shipmentId: 'uuid',
  latitude: 10.5,
  longitude: -84.4,
  speed: 60,
  address: 'Ruta 1'
})
```

---

## Error Responses

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `409`: Conflict (unique constraint)
- `500`: Internal server error

---

## Rate Limiting

- 100 requests por 15 minutos por IP
- Header de respuesta: `X-RateLimit-Remaining`

---

## Ejemplos con cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Get protected endpoint
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create shipment
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "companyId": "uuid",
    "originAddress": "123 Main St",
    "destAddress": "456 Oak Ave",
    "description": "Paquete",
    "weight": 5.5
  }'
```
