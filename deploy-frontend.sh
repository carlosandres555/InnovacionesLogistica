#!/bin/bash

# Innovaciones Logistica - Frontend Deployment Script
# Usage: ./deploy-frontend.sh

set -e

AWS_REGION="us-east-1"
S3_BUCKET="innovaciones-logistica-frontend"
CLOUDFRONT_DIST_ID="E36ILM4E1Z89AZ"

echo "🚀 Starting frontend deployment..."
echo "S3 Bucket: $S3_BUCKET"
echo "CloudFront Distribution: $CLOUDFRONT_DIST_ID"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ Error: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed, dist folder not found"
    exit 1
fi

echo "✅ Build completed"
echo ""

# Upload to S3
echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://$S3_BUCKET \
    --delete \
    --region $AWS_REGION \
    --cache-control "max-age=3600,public" \
    --exclude ".map"

echo "✅ Upload to S3 completed"
echo ""

# Invalidate CloudFront
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DIST_ID \
    --paths "/*" \
    --region $AWS_REGION

echo "✅ CloudFront invalidation completed"
echo ""
echo "🎉 Frontend deployment completed successfully!"
echo "URL: https://innovacioneslogistica.com (or http://52.201.18.118)"
