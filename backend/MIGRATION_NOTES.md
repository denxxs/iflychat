# IFlyChat Backend Migration to psycopg2

## 🔄 Migration Complete!

The IFlyChat backend has been successfully migrated from SQLAlchemy to **pure psycopg2**. This change provides:

### ✅ Benefits
- **Simpler Dependencies**: No more SQLAlchemy, Alembic, or asyncpg
- **Direct SQL Control**: Raw SQL queries with full PostgreSQL features
- **Better Performance**: Reduced ORM overhead
- **Easier Debugging**: Clear SQL queries and direct database operations
- **Lambda Compatibility**: Smaller deployment packages

### 🚨 Breaking Changes

1. **No More Alembic Migrations**
   - Old: `alembic upgrade head`
   - New: `python init_db.py`

2. **Database Connection**
   - Old: SQLAlchemy sessions and AsyncSession
   - New: psycopg2 connection pool with async wrappers

3. **Model Operations**
   - Old: SQLAlchemy ORM syntax
   - New: Model methods with direct SQL queries

### 📁 Updated Files

#### Core Database Layer
- **`database.py`**: Complete rewrite with psycopg2 connection pool
- **`models.py`**: Plain Python classes with database methods
- **`auth.py`**: Removed SQLAlchemy dependencies
- **`server.py`**: Complete rewrite of all endpoints

#### New Files
- **`init_db.py`**: Database initialization script (replaces Alembic)
- **`server_old.py`**: Backup of SQLAlchemy version

#### Updated Files
- **`requirements.txt`**: Removed SQLAlchemy and Alembic
- **`lambda_handler.py`**: Updated comments
- **`deploy_lambda.ps1`**: Updated deployment instructions

### 🚀 Quick Start (Updated)

#### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection details
```

#### 3. Initialize Database
```bash
# Instead of Alembic migrations:
python init_db.py
```

#### 4. Start Server
```bash
python server.py
```

### 🔧 Database Operations

#### Connection Management
```python
# Old SQLAlchemy way:
async def get_user(db: AsyncSession, user_id: str):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalar_one_or_none()

# New psycopg2 way:
user = await User.get_by_id(user_id)
```

#### Creating Records
```python
# Old SQLAlchemy way:
new_user = User(name="John", email="john@example.com")
db.add(new_user)
await db.commit()

# New psycopg2 way:
user = await User.create(name="John", email="john@example.com")
```

#### Querying Data
```python
# Old SQLAlchemy way:
result = await db.execute(
    select(Chat).filter(Chat.user_id == user_id).order_by(desc(Chat.updated_at))
)
chats = result.scalars().all()

# New psycopg2 way:
chats = await Chat.get_by_user(user_id)
```

### 📋 Model Methods Available

Each model now has standard methods:

#### User Model
```python
await User.create(name, email, hashed_password)
await User.get_by_id(user_id)
await User.get_by_email(email)
await user.update(**kwargs)
await user.delete()
```

#### Chat Model
```python
await Chat.create(user_id, title)
await Chat.get_by_id(chat_id)
await Chat.get_by_user(user_id, limit, offset)
await chat.update(**kwargs)
await chat.delete()
await chat.get_messages(limit, offset)
```

#### Message Model
```python
await Message.create(chat_id, type, content, file_name, file_url, metadata)
await Message.get_by_id(message_id)
await Message.get_by_chat(chat_id, limit, offset)
await message.update(**kwargs)
await message.delete()
```

#### File Model
```python
await File.create(user_id, original_name, file_path, file_url, file_size, content_type, processed, extraction_text)
await File.get_by_id(file_id)
await File.get_by_user(user_id, limit, offset)
await file.update(**kwargs)
await file.delete()
```

### 🛠️ Database Schema

The database schema remains the same. Tables are created with raw SQL in `database.py`:

- **users**: User accounts
- **chats**: Chat sessions  
- **messages**: Chat messages
- **files**: File uploads
- **chat_sessions**: Session management
- **ai_usage**: AI usage tracking

### 🚀 Deployment Changes

#### Lambda Deployment
```bash
# Updated deployment script includes init_db.py
.\deploy_lambda.ps1
```

#### Database Setup
1. Create PostgreSQL database
2. Run `python init_db.py` (not Alembic)
3. Deploy Lambda function

### 🔍 Troubleshooting

#### Common Issues

1. **Connection Pool Errors**
   - Check DATABASE_URL environment variable
   - Ensure PostgreSQL is running
   - Verify connection parameters

2. **Import Errors**
   - Run `pip install -r requirements.txt`
   - Make sure psycopg2-binary is installed

3. **Database Errors**
   - Run `python init_db.py` to create tables
   - Check PostgreSQL permissions

#### Performance
- Connection pooling handles concurrent requests
- Async wrappers provide non-blocking database operations
- Raw SQL queries are optimized for performance

### 📚 API Endpoints (Unchanged)

All API endpoints remain the same. The migration is transparent to frontend applications:

- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /users/me` - Get current user
- `GET /chats` - List chats
- `POST /chats` - Create chat
- `POST /chats/{id}/messages` - Send message
- `POST /files/upload` - Upload file
- And all other endpoints...

### 🎉 Migration Benefits Realized

- ✅ **Simpler codebase**: No ORM complexity
- ✅ **Better performance**: Direct SQL execution  
- ✅ **Easier debugging**: Clear error messages
- ✅ **Smaller deployments**: Fewer dependencies
- ✅ **Full SQL power**: Use any PostgreSQL feature

The migration maintains all existing functionality while providing a cleaner, more maintainable codebase.
