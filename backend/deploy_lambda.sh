#!/bin/bash

# IFlyChat Backend Lambda Deployment Script
# This script helps prepare the backend for AWS Lambda deployment

echo "🚀 Preparing IFlyChat backend for Lambda deployment..."

# Create deployment directory
mkdir -p deployment
cd deployment

# Copy source files
echo "📁 Copying source files..."
cp ../server.py .
cp ../lambda_handler.py .
cp ../database.py .
cp ../models.py .
cp ../schemas.py .
cp ../auth.py .
cp ../bedrock_service.py .
cp ../s3_service.py .
cp ../.env .

# Install dependencies in deployment directory
echo "📦 Installing dependencies..."
pip install -r ../requirements.txt --target .

# Create deployment package
echo "📦 Creating deployment package..."
zip -r iflychat-backend.zip . -x "*.pyc" "*__pycache__*" "*.git*"

echo "✅ Deployment package created: deployment/iflychat-backend.zip"
echo ""
echo "Next steps for Lambda deployment:"
echo "1. Create Lambda function in AWS Console"
echo "2. Upload iflychat-backend.zip"
echo "3. Set handler to: lambda_handler.lambda_handler"
echo "4. Set environment variables from .env file"
echo "5. Configure API Gateway if needed"
echo "6. Set up RDS PostgreSQL database"
echo "7. Configure VPC if RDS is in private subnet"
