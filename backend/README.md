# IFlyChat Backend

FastAPI-based backend for AI legal chat with PostgreSQL and AWS Bedrock integration.

## 🚀 App Runner Deployment

This repo is ready for AWS App Runner deployment:

1. **Build**: Uses included Dockerfile
2. **Port**: 8000  
3. **Health check**: `/health` endpoint included

## 📦 Environment Variables

Set these in App Runner configuration:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-s3-bucket
CORS_ORIGINS=https://your-frontend-url.awsapprunner.com
```

## 🗄️ Database Setup

**IMPORTANT**: Run `init_db.py` as a separate Lambda function before deploying:

1. Create Lambda function with the same environment variables
2. Upload `init_db.py` + `models.py` + `database.py` + dependencies
3. Run once to create tables
4. Then deploy this main app

## 🐳 Container Deployment

```bash
docker build -t iflychat-backend .
docker run -p 8000:8000 iflychat-backend
```

## ⚙️ Local Development

```bash
pip install -r requirements.txt
uvicorn server:app --reload
```

## 🔧 Tech Stack

- FastAPI
- PostgreSQL
- AWS Bedrock (Claude)
- AWS S3
- Session-based authentication
