import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool
import os
from typing import Optional, Dict, Any, List
from contextlib import contextmanager
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

logger = logging.getLogger(__name__)

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required. Please check your .env file.")

logger.info(f"Using database: {DATABASE_URL.split('@')[1].split('/')[0] if '@' in DATABASE_URL else 'unknown'}")

# Connection pool
connection_pool: Optional[ThreadedConnectionPool] = None
executor = ThreadPoolExecutor(max_workers=10)

def initialize_connection_pool():
    """Initialize the connection pool"""
    global connection_pool
    if connection_pool is None:
        try:
            connection_pool = ThreadedConnectionPool(
                1, 20,  # min and max connections
                DATABASE_URL
            )
            logger.info("✅ Database connection pool initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize connection pool: {e}")
            raise

@contextmanager
def get_db_connection():
    """Get a database connection from the pool"""
    if connection_pool is None:
        initialize_connection_pool()
    
    conn = None
    try:
        conn = connection_pool.getconn()
        conn.autocommit = False
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        if conn:
            connection_pool.putconn(conn)

@contextmanager
def get_db_cursor(connection=None):
    """Get a database cursor, optionally with an existing connection"""
    if connection:
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            yield cursor
        finally:
            cursor.close()
    else:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            try:
                yield cursor
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                cursor.close()

# Async wrapper functions
async def execute_query(query: str, params: tuple = None) -> List[Dict[str, Any]]:
    """Execute a SELECT query asynchronously"""
    def _execute():
        with get_db_cursor() as cursor:
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _execute)

async def execute_query_one(query: str, params: tuple = None) -> Optional[Dict[str, Any]]:
    """Execute a SELECT query and return one result asynchronously"""
    def _execute():
        with get_db_cursor() as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
            return dict(result) if result else None
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _execute)

async def execute_insert(query: str, params: tuple = None) -> Optional[Dict[str, Any]]:
    """Execute an INSERT query and return the inserted row"""
    def _execute():
        with get_db_cursor() as cursor:
            cursor.execute(query + " RETURNING *", params)
            result = cursor.fetchone()
            return dict(result) if result else None
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _execute)

async def execute_update(query: str, params: tuple = None) -> int:
    """Execute an UPDATE query and return the number of affected rows"""
    def _execute():
        with get_db_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.rowcount
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _execute)

async def execute_delete(query: str, params: tuple = None) -> int:
    """Execute a DELETE query and return the number of affected rows"""
    def _execute():
        with get_db_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.rowcount
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _execute)

def create_tables():
    """Create all tables"""
    queries = [
        # Users table
        """
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Chats table
        """
        CREATE TABLE IF NOT EXISTS chats (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(500) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Messages table
        """
        CREATE TABLE IF NOT EXISTS messages (
            id VARCHAR(36) PRIMARY KEY,
            chat_id VARCHAR(36) REFERENCES chats(id) ON DELETE CASCADE,
            type VARCHAR(20) NOT NULL,
            content TEXT NOT NULL,
            file_name VARCHAR(255),
            file_url VARCHAR(500),
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Files table
        """
        CREATE TABLE IF NOT EXISTS files (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
            original_name VARCHAR(500) NOT NULL,
            file_path VARCHAR(1000) NOT NULL,
            file_url VARCHAR(1000) NOT NULL,
            file_size INTEGER NOT NULL,
            content_type VARCHAR(100) NOT NULL,
            processed BOOLEAN DEFAULT FALSE,
            extraction_text TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Chat sessions table
        """
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
            chat_id VARCHAR(36) REFERENCES chats(id) ON DELETE CASCADE,
            session_token VARCHAR(500) UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # AI usage table
        """
        CREATE TABLE IF NOT EXISTS ai_usage (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
            chat_id VARCHAR(36) REFERENCES chats(id) ON DELETE SET NULL,
            message_id VARCHAR(36) REFERENCES messages(id) ON DELETE SET NULL,
            service_type VARCHAR(50) NOT NULL,
            model_name VARCHAR(100) NOT NULL,
            prompt_tokens INTEGER DEFAULT 0,
            completion_tokens INTEGER DEFAULT 0,
            total_tokens INTEGER DEFAULT 0,
            cost_estimate DECIMAL(10,4) DEFAULT 0.0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Create indexes
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)",
        "CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_chat_sessions_token ON chat_sessions(session_token)",
        "CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id)",
        
        # Create updated_at trigger function
        """
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql'
        """,
        
        # Apply updated_at triggers
        """
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        """,
        
        """
        DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
        CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        """,
        
        """
        DROP TRIGGER IF EXISTS update_chat_sessions_last_activity ON chat_sessions;
        CREATE TRIGGER update_chat_sessions_last_activity BEFORE UPDATE ON chat_sessions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        """
    ]
    
    with get_db_connection() as conn:
        with get_db_cursor(conn) as cursor:
            for query in queries:
                try:
                    cursor.execute(query)
                    logger.info(f"✅ Executed: {query[:50]}...")
                except Exception as e:
                    logger.error(f"❌ Failed to execute query: {e}")
                    raise
        conn.commit()
    
    logger.info("✅ All tables created successfully")

async def test_connection():
    """Test database connection"""
    try:
        result = await execute_query_one("SELECT 1 as test")
        if result and result.get('test') == 1:
            logger.info("✅ Database connection successful")
            return True
        else:
            logger.error("❌ Database connection test failed")
            return False
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False

def close_connection_pool():
    """Close the connection pool"""
    global connection_pool
    if connection_pool:
        connection_pool.closeall()
        connection_pool = None
        logger.info("✅ Database connection pool closed")
