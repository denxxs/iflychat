# Indifly AI Chat Backend

A FastAPI-based backend for the Indifly AI Chat application providing intelligent legal assistance.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Chat Management**: Create, read, update, and delete chat conversations
- **Message System**: Store and retrieve chat messages with metadata
- **File Upload**: Handle document uploads with S3 integration
- **AI Integration**: Placeholder for OpenAI/Claude integration
- **Database**: PostgreSQL with SQLAlchemy ORM and async support
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Database Schema

### Tables

1. **users**
   - id (String, Primary Key)
   - name (String)
   - email (String, Unique)
   - hashed_password (String)
   - is_active (Boolean)
   - created_at, updated_at (DateTime)

2. **chats**
   - id (String, Primary Key)
   - user_id (Foreign Key to users)
   - title (String)
   - created_at, updated_at (DateTime)

3. **messages**
   - id (String, Primary Key)
   - chat_id (Foreign Key to chats)
   - type (String: 'user' or 'bot')
   - content (Text)
   - file_name, file_url (Optional)
   - metadata (JSON)
   - created_at (DateTime)

4. **files**
   - id (String, Primary Key)
   - user_id (Foreign Key to users)
   - original_name, file_path, file_url (String)
   - file_size (Integer)
   - content_type (String)
   - processed (Boolean)
   - extraction_text (Text)
   - created_at (DateTime)

5. **chat_sessions** (for real-time features)
   - id, user_id, chat_id, session_token
   - is_active, last_activity, created_at

6. **ai_usage** (for monitoring/billing)
   - id, user_id, chat_id, message_id
   - service_type, model_name
   - prompt_tokens, completion_tokens, total_tokens
   - cost_estimate, created_at

## Setup Instructions

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- AWS account (for S3 file storage)
- OpenAI API key (for AI responses)

### 1. Environment Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd iflychat/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\\Scripts\\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database
createdb iflychat

# Update .env file with local database URL
DATABASE_URL=postgresql://username:password@localhost:5432/iflychat
```

#### Option B: AWS RDS
1. Go to AWS Console → RDS
2. Create a new PostgreSQL database
3. Note the endpoint, username, password
4. Update .env file:
```
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/iflychat
```

### 3. Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/iflychat
SECRET_KEY=generate-a-strong-secret-key-here
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name
OPENAI_API_KEY=your-openai-api-key
```

### 4. Database Migration

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 5. AWS S3 Setup

1. Go to AWS Console → S3
2. Create a new bucket (e.g., `iflychat-files`)
3. Set appropriate permissions for file uploads
4. Create IAM user with S3 access
5. Update .env with AWS credentials

### 6. Run the Server

```bash
# Development mode (with auto-reload)
python server.py

# Or using uvicorn directly
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- Main API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /users/me` - Get current user info

### Chats
- `GET /chats` - Get user's chats (with pagination/filtering)
- `POST /chats` - Create new chat
- `GET /chats/{chat_id}` - Get specific chat with messages
- `PUT /chats/{chat_id}` - Update chat title
- `DELETE /chats/{chat_id}` - Delete chat

### Messages
- `POST /messages` - Create new message
- `POST /chat` - Send message and get AI response (main chat endpoint)

### Files
- `POST /files/upload` - Upload file to S3

### System
- `GET /health` - Health check
- `GET /` - API status

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
isort .
```

### Type Checking
```bash
mypy .
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use proper secret management
2. **Database**: Use managed PostgreSQL (AWS RDS, etc.)
3. **File Storage**: Configure S3 with proper IAM roles
4. **Load Balancer**: Use ALB or similar
5. **Monitoring**: Add logging and monitoring
6. **Security**: Enable HTTPS, configure CORS properly
7. **Scaling**: Use container orchestration (ECS, EKS)

## Next Steps

1. **AI Integration**: Implement OpenAI/Claude API integration
2. **File Processing**: Add document text extraction and AI analysis
3. **Real-time Chat**: Add WebSocket support for real-time messaging
4. **Caching**: Add Redis for session management and caching
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Monitoring**: Add comprehensive logging and metrics
7. **Testing**: Add comprehensive test coverage

## Architecture Notes

This backend is designed to be:
- **Scalable**: Async/await patterns, proper database indexing
- **Secure**: JWT authentication, input validation, SQL injection protection
- **Maintainable**: Clean separation of concerns, type hints, documentation
- **Production-ready**: Proper error handling, logging, health checks

The database schema supports the frontend requirements while being extensible for future features like file analysis, AI usage tracking, and real-time capabilities.
