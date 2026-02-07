#!/bin/bash
set -e

echo "======================================"
echo "Installing Innovaciones Logistica API"
echo "======================================"

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Install Git
sudo apt-get install -y git

# Install PostgreSQL client
sudo apt-get install -y postgresql-client

# Create app directory
sudo mkdir -p /opt/innovaciones-logistica
sudo chown -R $USER:$USER /opt/innovaciones-logistica

# Clone repository (assuming you'll provide the git URL)
cd /opt/innovaciones-logistica
git clone YOUR_REPO_URL . || echo "Repository clone skipped"

# Install backend dependencies
cd /opt/innovaciones-logistica/backend
npm install

# Create .env file (needs to be filled with actual values)
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@rds-endpoint:5432/innovaciones_logistica"
JWT_SECRET="change-this-in-production"
JWT_REFRESH_SECRET="change-this-in-production"
NODE_ENV="production"
PORT=3000
FRONTEND_URL="https://your-domain.com"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="innovaciones-logistica-files"
AWS_S3_UPLOADS_BUCKET="innovaciones-logistica-uploads"
EOF

echo "Note: Update .env file with actual values"

# Build frontend
cd /opt/innovaciones-logistica/frontend
npm install
npm run build

# Configure Nginx
sudo cp /opt/innovaciones-logistica/infrastructure/aws/nginx.conf /etc/nginx/sites-available/innovaciones-logistica
sudo ln -sf /etc/nginx/sites-available/innovaciones-logistica /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Start API with PM2
cd /opt/innovaciones-logistica/backend
pm2 start src/server.js --name "innovaciones-api" --instances max --exec-mode cluster
pm2 startup
pm2 save

# Setup Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx

# Note: SSL setup needs to be done manually with certbot
# sudo certbot --nginx -d your-domain.com

echo "======================================"
echo "Installation complete!"
echo "======================================"
echo "Next steps:"
echo "1. Update .env file at /opt/innovaciones-logistica/backend/.env"
echo "2. Setup RDS database and run migrations"
echo "3. Configure SSL with: sudo certbot --nginx -d your-domain.com"
echo "4. Verify API: curl http://localhost/api/health"
