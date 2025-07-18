# IFlyChat - AI-Powered Legal Assistant

A modern legal chat application with AI-powered document analysis, built with React frontend and FastAPI backend.

## Features

- 🤖 **AI-Powered Chat**: Integrated with AWS Bedrock (Claude models) for intelligent legal assistance
- 📁 **Document Processing**: Upload and analyze PDF, DOC, DOCX, and TXT files
- 🎯 **Smart Chat Naming**: Automatically generate meaningful chat titles based on content and files
- 👤 **User Authentication**: JWT-based secure authentication system
- 💾 **Cloud Storage**: S3 integration for secure file storage and processing
- 🔍 **Text Extraction**: Automatic text extraction from uploaded documents
- 📊 **Session Management**: Prevents empty chat creation and tracks AI usage
- ☁️ **Serverless Ready**: Lambda deployment configuration for scalable hosting

## Tech Stack

### Frontend
- React 19.0.0
- Tailwind CSS
- Radix UI components
- CRACO build system

### Backend
- FastAPI (Python 3.9+)
- PostgreSQL with SQLAlchemy ORM
- AWS Bedrock for AI responses
- AWS S3 for file storage
- JWT authentication
- Alembic for database migrations

### Cloud Services
- AWS Lambda (serverless deployment)
- AWS RDS (PostgreSQL)
- AWS S3 (file storage)
- AWS Bedrock (AI models)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL database
- AWS account with Bedrock and S3 access

### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
Frontend will run on http://localhost:3000

### Backend Setup

1. **Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your configurations:
# - Database URL
# - JWT secret key
# - AWS credentials
# - Bedrock model settings
```

3. **Database Setup**:
```bash
# Create database
createdb iflychat

# Run migrations
alembic upgrade head
```

4. **Start the server**:
```bash
python server.py
```
Backend will run on http://localhost:8000

## Database Schema

The application uses 6 main tables:

- **users**: User accounts and authentication
- **chats**: Chat sessions with metadata
- **messages**: Individual chat messages
- **files**: Uploaded file records and metadata
- **chat_sessions**: Active chat session management
- **ai_usage**: AI model usage tracking

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /users/me` - Get current user profile

### Chat Management
- `GET /chats` - List user's chats
- `POST /chats` - Create new chat
- `GET /chats/{chat_id}` - Get chat details
- `DELETE /chats/{chat_id}` - Delete chat
- `POST /chats/{chat_id}/messages` - Send message (AI-powered)

### File Operations
- `POST /files/upload` - Upload file with text extraction
- `GET /files` - List user's files
- `GET /files/{file_id}` - Get file details
- `DELETE /files/{file_id}` - Delete file

### Smart Features
- `POST /chats/generate-name` - Generate smart chat name
- `POST /chat-sessions` - Create managed chat session
- `GET /chat-sessions/active` - Get active sessions

## AWS Configuration

### Required AWS Services

1. **S3 Bucket**: For file storage
   - Create bucket with appropriate permissions
   - Configure CORS for frontend uploads

2. **RDS PostgreSQL**: For database
   - Create PostgreSQL instance
   - Note connection details for .env

3. **Bedrock**: For AI responses
   - Enable Claude models in your region
   - Ensure IAM permissions for Bedrock access

4. **IAM Role** (for Lambda deployment):
   - S3 read/write permissions
   - Bedrock invoke permissions
   - RDS connect permissions
   - VPC access (if RDS in private subnet)

### Environment Variables

Key environment variables to configure:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
SECRET_KEY=your-super-secret-jwt-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Bedrock
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

## Lambda Deployment

### Option 1: PowerShell (Windows)
```powershell
cd backend
.\deploy_lambda.ps1
```

### Option 2: Bash (Linux/Mac)
```bash
cd backend
chmod +x deploy_lambda.sh
./deploy_lambda.sh
```

### Manual Deployment Steps

1. **Create Lambda Function**:
   - Runtime: Python 3.9+
   - Handler: `lambda_handler.lambda_handler`
   - Upload deployment/iflychat-backend.zip

2. **Configure Environment Variables**:
   - Copy all variables from .env to Lambda environment

3. **Set up API Gateway**:
   - Create REST API
   - Configure proxy integration with Lambda
   - Enable CORS for frontend

4. **VPC Configuration** (if RDS in private subnet):
   - Add Lambda to same VPC as RDS
   - Configure security groups

## Development

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Quality
```bash
# Format code
black .
isort .

# Type checking
mypy .

# Linting
flake8 .
```

## Project Structure

```
iflychat/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── public/             # Static assets
├── backend/                 # FastAPI application
│   ├── server.py           # Main FastAPI app
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication logic
│   ├── database.py         # Database configuration
│   ├── bedrock_service.py  # AWS Bedrock integration
│   ├── s3_service.py       # AWS S3 integration
│   ├── lambda_handler.py   # Lambda entry point
│   └── alembic/            # Database migrations
└── tests/                  # Test files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
