# IFlyChat Backend Lambda Deployment Script (PowerShell)
# This script helps prepare the backend for AWS Lambda deployment

Write-Host "🚀 Preparing IFlyChat backend for Lambda deployment..." -ForegroundColor Green

# Create deployment directory
New-Item -ItemType Directory -Force -Path "deployment"
Set-Location -Path "deployment"

# Copy source files
Write-Host "📁 Copying source files..." -ForegroundColor Blue
Copy-Item "../server.py" -Destination "."
Copy-Item "../lambda_handler.py" -Destination "."
Copy-Item "../database.py" -Destination "."
Copy-Item "../models.py" -Destination "."
Copy-Item "../schemas.py" -Destination "."
Copy-Item "../auth.py" -Destination "."
Copy-Item "../bedrock_service.py" -Destination "."
Copy-Item "../s3_service.py" -Destination "."
Copy-Item "../init_db.py" -Destination "."
Copy-Item "../.env" -Destination "." -ErrorAction SilentlyContinue

# Install dependencies in deployment directory
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pip install -r ../requirements.txt --target .

# Create deployment package (requires 7-Zip or PowerShell 5.0+)
Write-Host "📦 Creating deployment package..." -ForegroundColor Blue
if (Get-Command "7z" -ErrorAction SilentlyContinue) {
    7z a -tzip iflychat-backend.zip . -x!"*.pyc" -x!"*__pycache__*" -x!"*.git*"
} elseif ($PSVersionTable.PSVersion.Major -ge 5) {
    Compress-Archive -Path "." -DestinationPath "iflychat-backend.zip" -Force
} else {
    Write-Host "⚠️ Please install 7-Zip or use PowerShell 5.0+ to create the zip file" -ForegroundColor Yellow
}

Write-Host "✅ Deployment package created: deployment/iflychat-backend.zip" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 IMPORTANT: Database changes for psycopg2-only version:" -ForegroundColor Yellow
Write-Host "- No more Alembic migrations or SQLAlchemy"
Write-Host "- Use init_db.py to initialize database tables"
Write-Host "- Pure PostgreSQL with psycopg2 connections"
Write-Host ""
Write-Host "Next steps for Lambda deployment:" -ForegroundColor Cyan
Write-Host "1. Create Lambda function in AWS Console"
Write-Host "2. Upload iflychat-backend.zip"
Write-Host "3. Set handler to: lambda_handler.lambda_handler"
Write-Host "4. Set environment variables from .env file"
Write-Host "5. Configure API Gateway if needed"
Write-Host "6. Set up RDS PostgreSQL database"
Write-Host "7. Run 'python init_db.py' locally to create tables"
Write-Host "8. Configure VPC if RDS is in private subnet"

Set-Location -Path ".."
