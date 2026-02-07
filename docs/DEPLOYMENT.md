# Guía de Deployment - Innovaciones Logistica

## Requisitos Previos

- Cuenta AWS con free tier activo
- Dominio registrado (Namecheap u otro)
- Acceso SSH a tu máquina local
- AWS CLI instalado y configurado

## 1. Preparación Inicial

### 1.1 Crear IAM User

1. Ir a AWS Console → IAM → Users → Create user
2. Nombre: `innovaciones-logistica-deployer`
3. Permisos: Agregar policies:
   - `AmazonEC2FullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `Route53FullAccess`
4. Guardar Access Key ID y Secret Access Key

### 1.2 Comprar Dominio

- Ir a Namecheap u otro registrar
- Comprar dominio (ej: `innovacioneslogistica.com`)
- Costo: ~$10-12/año

## 2. Base de Datos RDS

### Crear RDS PostgreSQL

```bash
# En AWS Console
1. RDS → Create database
2. Engine: PostgreSQL (versión 15)
3. Instance class: db.t2.micro (free tier)
4. Storage: 20 GB (free tier)
5. DB name: innovaciones_logistica
6. Master username: admin
7. Master password: (generar contraseña fuerte)
8. Security group: crear "rds-innovaciones"
   - Inbound: PostgreSQL (5432) desde security group EC2
```

### Conectar desde local (para inicializar)

```bash
# Instalar psql
# macOS:
brew install postgresql

# Linux/Ubuntu:
sudo apt-get install postgresql-client

# Conectar a RDS
psql -h rds-endpoint.region.rds.amazonaws.com \
     -U admin \
     -d innovaciones_logistica
```

### Crear archivo .env para backend

```bash
cd backend
cp .env.example .env

# Editar con valores reales
cat > .env << 'EOF'
DATABASE_URL="postgresql://admin:PASSWORD@rds-endpoint.region.rds.amazonaws.com:5432/innovaciones_logistica"
JWT_SECRET="super-secret-key-$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="refresh-secret-$(openssl rand -hex 32)"
NODE_ENV="production"
PORT=3000
FRONTEND_URL="https://tu-dominio.com"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="tu-access-key"
AWS_SECRET_ACCESS_KEY="tu-secret-key"
AWS_S3_BUCKET="innovaciones-logistica-files"
AWS_S3_UPLOADS_BUCKET="innovaciones-logistica-uploads"
EOF
```

## 3. EC2 Instance (Backend)

### Crear EC2

```bash
# AWS Console
1. EC2 → Launch instance
2. Name: "innovaciones-api"
3. OS: Ubuntu 22.04 LTS (free tier)
4. Instance type: t2.micro (free tier)
5. Key pair: crear "innovaciones-logistica-key"
   - Guardar .pem file en ~/.ssh/
   - chmod 600 ~/.ssh/innovaciones-logistica-key.pem
6. Security group: crear "ec2-innovaciones"
   - SSH (22): Tu IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
7. Storage: 30 GB (gratis con free tier)
8. Launch instance
```

### Configurar EC2

```bash
# Obtener IP pública de tu instancia
# AWS Console → EC2 → Instances → copia "Public IPv4 address"

# SSH en tu instancia
ssh -i ~/.ssh/innovaciones-logistica-key.pem ubuntu@EC2_PUBLIC_IP

# En la instancia, descargar y ejecutar script de setup
curl -fsSL https://raw.githubusercontent.com/tu-repo/main/infrastructure/aws/ec2-user-data.sh | bash

# O manualmente:
cd /tmp
wget https://raw.githubusercontent.com/tu-repo/main/infrastructure/aws/ec2-user-data.sh
bash ec2-user-data.sh
```

### Configurar variables de entorno

```bash
ssh -i ~/.ssh/innovaciones-logistica-key.pem ubuntu@EC2_PUBLIC_IP

# Editar archivo .env
nano /opt/innovaciones-logistica/backend/.env

# Reemplazar valores:
# - DATABASE_URL: conexión a RDS
# - JWT_SECRET y JWT_REFRESH_SECRET: generar valores únicos
# - AWS keys y bucket names

# Guardar y salir (Ctrl+X, Y, Enter)

# Reiniciar API
pm2 restart innovaciones-api
```

## 4. S3 Buckets

### Crear buckets

```bash
# Via AWS CLI
aws s3 mb s3://innovaciones-logistica-files --region us-east-1
aws s3 mb s3://innovaciones-logistica-uploads --region us-east-1

# Or via AWS Console: S3 → Create bucket
```

### Configurar bucket para frontend

```bash
# Habilitar hosting estático
aws s3 website s3://innovaciones-logistica-files/ \
  --index-document index.html \
  --error-document index.html

# Bucket policy para lectura pública (via console o CLI)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::innovaciones-logistica-files/*"
    }
  ]
}
```

### Configurar CORS para uploads

```bash
# Para bucket de uploads, crear archivo cors.json
cat > /tmp/cors.json << 'EOF'
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://tu-dominio.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
EOF

# Aplicar CORS
aws s3api put-bucket-cors \
  --bucket innovaciones-logistica-uploads \
  --cors-configuration file:///tmp/cors.json
```

## 5. CloudFront Distribution

```bash
# AWS Console → CloudFront → Create distribution
1. Origin:
   - Domain: innovaciones-logistica-files.s3.amazonaws.com
   - S3 bucket access: Yes, update bucket policy
2. Default cache behavior:
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Cache policy: CachingOptimized
3. Alternate domain names: tu-dominio.com, www.tu-dominio.com
4. SSL certificate: Request certificate ACM
5. Create distribution

# Copiar Distribution ID
```

## 6. Route 53 DNS

```bash
# AWS Console → Route 53
1. Create hosted zone
   - Domain name: tu-dominio.com
   - Type: Public
2. Copiar nameservers (NS records)
3. Ir a registrador de dominio (Namecheap)
   - Nameservers → Custom DNS
   - Pegar los 4 nameservers de Route 53
4. En Route 53, crear records:

# A record para CloudFront frontend
Type: A
Name: tu-dominio.com
Alias: Yes
Route traffic to: CloudFront distribution (tu-distribution-id)

# A record para API backend
Type: A
Name: api.tu-dominio.com
Alias: No
Value: Public IP de tu EC2

# O CNAME si prefieres
Type: CNAME
Name: api.tu-dominio.com
Value: tu-ec2-ip-publica.compute.amazonaws.com
```

## 7. SSL Certificates

### Frontend (ACM)

```bash
# AWS Console → ACM → Request certificate
1. Domain name: tu-dominio.com
2. Add domain: www.tu-dominio.com
3. Validation method: DNS
4. Crear records CNAME en Route 53 (copiar de ACM)
```

### Backend (Let's Encrypt)

```bash
ssh -i ~/.ssh/innovaciones-logistica-key.pem ubuntu@EC2_PUBLIC_IP

# Instalar certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot certonly --standalone \
  -d tu-dominio.com \
  -d api.tu-dominio.com

# Nginx usa automáticamente el certificado (si está configurado)
sudo certbot renew --dry-run  # Verificar renovación automática
```

## 8. Build y Deploy Frontend

```bash
cd frontend
npm install
npm run build

# Subir a S3
aws s3 sync dist/ s3://innovaciones-logistica-files --delete
```

## 9. Inicializar Base de Datos

```bash
ssh -i ~/.ssh/innovaciones-logistica-key.pem ubuntu@EC2_PUBLIC_IP

cd /opt/innovaciones-logistica/backend
npm run db:migrate
npm run db:seed  # Si existe script de seed
```

## 10. Verificación End-to-End

```bash
# Verificar API
curl https://api.tu-dominio.com/api/health

# Verificar frontend
curl https://tu-dominio.com

# Verificar logs
ssh ubuntu@EC2_PUBLIC_IP "pm2 logs innovaciones-api"

# Ver estado de PM2
ssh ubuntu@EC2_PUBLIC_IP "pm2 status"
```

## 11. CI/CD con GitHub Actions

```bash
# En GitHub, agregar secrets:
1. Settings → Secrets and variables → Actions
2. New repository secret:
   - EC2_HOST: Public IP de tu EC2
   - EC2_USER: ubuntu
   - EC2_KEY: contenido de tu private key (.pem)
   - AWS_ACCESS_KEY_ID: tu access key
   - AWS_SECRET_ACCESS_KEY: tu secret key
   - S3_BUCKET: innovaciones-logistica-files
   - CLOUDFRONT_DIST_ID: tu distribution ID
   - SLACK_WEBHOOK: (opcional) para notificaciones
```

## 12. Monitoreo

### CloudWatch Alarms

```bash
# Via AWS CLI o Console
aws cloudwatch put-metric-alarm \
  --alarm-name "ec2-cpu-high" \
  --alarm-description "Alert when EC2 CPU > 70%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 70 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Billing Alert

```bash
# AWS Console → Billing → Alerts
1. Create budget
2. Set alert when estimated charges > $5
```

## 13. Scaling (Post Free Tier)

Cuando superes free tier (después de 12 meses):

### Opción 1: Mantener AWS
- Upgrade EC2 a t3.small ($10-15/mes)
- Upgrade RDS a db.t3.small ($20-30/mes)
- Total: ~$40-50/mes

### Opción 2: Migrar a Railway
- Backend + DB: $7-15/mes
- Frontend: Vercel (gratis)
- S3: mantener ($2-3/mes)
- Total: ~$12-20/mes

## Troubleshooting

### "Port 3000 not accessible"
```bash
# Verificar security group de EC2
# SSH (22), HTTP (80), HTTPS (443) deben estar abiertos
```

### "Database connection error"
```bash
# Verificar RDS security group permite tráfico desde EC2
# Verificar DATABASE_URL es correcta
```

### "Frontend shows blank page"
```bash
# Verificar .env en vite config
# npm run build local
# Verificar archivos en S3 bucket
```

## Recursos Adicionales

- [AWS Free Tier Limits](https://aws.amazon.com/free/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Let's Encrypt Certbot](https://certbot.eff.org/)
