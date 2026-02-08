#!/bin/bash

# Innovaciones Logistica - Manual Deployment Script
# Usage: ./deploy.sh

set -e

EC2_HOST="52.201.18.118"
EC2_USER="ubuntu"
EC2_KEY="/Users/carlosrodriguez/Project/DistribucionCosta/innovaciones-logistica-key.pem"

echo "🚀 Starting deployment to EC2..."
echo "Host: $EC2_HOST"
echo ""

# Copy local .env to EC2
echo "📋 Copying .env to EC2..."
scp -i "$EC2_KEY" -o StrictHostKeyChecking=no backend/.env "$EC2_USER@$EC2_HOST":/opt/innovaciones-logistica/backend/.env
echo "✅ .env copied"
echo ""

# SSH deployment script
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

echo "📦 Pulling latest code..."
cd /opt/innovaciones-logistica
GIT_SSH_COMMAND="ssh -i ~/.ssh/github_key" git pull origin main

echo "📚 Installing backend dependencies..."
cd backend
npm install

echo "🔧 Generating Prisma..."
npx prisma generate

echo "💾 Pushing database migrations..."
npx prisma db push --skip-generate

echo "🔄 Restarting PM2..."
pm2 restart innovaciones-api

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Latest logs:"
pm2 logs innovaciones-api --lines 15

ENDSSH

echo ""
echo "🎉 Backend is now live!"
