from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid
import json
from database import (
    execute_query, execute_query_one, execute_insert, 
    execute_update, execute_delete
)

class BaseModel:
    """Base model with common functionality"""
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to dictionary"""
        result = {}
        for key, value in self.__dict__.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, (dict, list)):
                result[key] = value
            else:
                result[key] = value
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        """Create model instance from dictionary"""
        return cls(**data)

class User(BaseModel):
    """User model"""
    
    def __init__(self, id: str = None, name: str = None, email: str = None, 
                 hashed_password: str = None, is_active: bool = True, 
                 created_at: datetime = None, updated_at: datetime = None, **kwargs):
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.email = email
        self.hashed_password = hashed_password
        self.is_active = is_active
        self.created_at = created_at
        self.updated_at = updated_at
        super().__init__(**kwargs)
    
    @classmethod
    async def create(cls, name: str, email: str, hashed_password: str) -> 'User':
        """Create a new user"""
        user_id = str(uuid.uuid4())
        query = """
            INSERT INTO users (id, name, email, hashed_password, is_active)
            VALUES (%s, %s, %s, %s, %s)
        """
        result = await execute_insert(query, (user_id, name, email, hashed_password, True))
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_id(cls, user_id: str) -> Optional['User']:
        """Get user by ID"""
        query = "SELECT * FROM users WHERE id = %s"
        result = await execute_query_one(query, (user_id,))
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_email(cls, email: str) -> Optional['User']:
        """Get user by email"""
        query = "SELECT * FROM users WHERE email = %s"
        result = await execute_query_one(query, (email,))
        return cls.from_dict(result) if result else None
    
    async def update(self, **kwargs) -> bool:
        """Update user fields"""
        if not kwargs:
            return False
        
        set_clauses = []
        values = []
        for key, value in kwargs.items():
            if hasattr(self, key):
                set_clauses.append(f"{key} = %s")
                values.append(value)
                setattr(self, key, value)
        
        if not set_clauses:
            return False
        
        query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(self.id)
        
        rows_affected = await execute_update(query, tuple(values))
        return rows_affected > 0
    
    async def delete(self) -> bool:
        """Delete user"""
        query = "DELETE FROM users WHERE id = %s"
        rows_affected = await execute_delete(query, (self.id,))
        return rows_affected > 0

class Chat(BaseModel):
    """Chat model"""
    
    def __init__(self, id: str = None, user_id: str = None, title: str = None,
                 created_at: datetime = None, updated_at: datetime = None, **kwargs):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.title = title
        self.created_at = created_at
        self.updated_at = updated_at
        super().__init__(**kwargs)
    
    @classmethod
    async def create(cls, user_id: str, title: str) -> 'Chat':
        """Create a new chat"""
        chat_id = str(uuid.uuid4())
        query = """
            INSERT INTO chats (id, user_id, title)
            VALUES (%s, %s, %s)
        """
        result = await execute_insert(query, (chat_id, user_id, title))
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_id(cls, chat_id: str) -> Optional['Chat']:
        """Get chat by ID"""
        query = "SELECT * FROM chats WHERE id = %s"
        result = await execute_query_one(query, (chat_id,))
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_user(cls, user_id: str, limit: int = 50, offset: int = 0) -> List['Chat']:
        """Get chats by user ID"""
        query = """
            SELECT * FROM chats 
            WHERE user_id = %s 
            ORDER BY updated_at DESC 
            LIMIT %s OFFSET %s
        """
        results = await execute_query(query, (user_id, limit, offset))
        return [cls.from_dict(row) for row in results]
    
    async def update(self, **kwargs) -> bool:
        """Update chat fields"""
        if not kwargs:
            return False
        
        set_clauses = []
        values = []
        for key, value in kwargs.items():
            if hasattr(self, key):
                set_clauses.append(f"{key} = %s")
                values.append(value)
                setattr(self, key, value)
        
        if not set_clauses:
            return False
        
        query = f"UPDATE chats SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(self.id)
        
        rows_affected = await execute_update(query, tuple(values))
        return rows_affected > 0
    
    async def update_title(self, title: str) -> bool:
        """Update chat title specifically"""
        return await self.update(title=title)
    
    async def delete(self) -> bool:
        """Delete chat"""
        query = "DELETE FROM chats WHERE id = %s"
        rows_affected = await execute_delete(query, (self.id,))
        return rows_affected > 0
    
    async def get_messages(self, limit: int = 100, offset: int = 0) -> List['Message']:
        """Get messages for this chat"""
        return await Message.get_by_chat(self.id, limit, offset)

class Message(BaseModel):
    """Message model"""
    
    def __init__(self, id: str = None, chat_id: str = None, type: str = None,
                 content: str = None, file_name: str = None, file_url: str = None,
                 metadata: Dict[str, Any] = None, created_at: datetime = None, **kwargs):
        self.id = id or str(uuid.uuid4())
        self.chat_id = chat_id
        self.type = type
        self.content = content
        self.file_name = file_name
        self.file_url = file_url
        self.metadata = metadata or {}
        self.created_at = created_at
        super().__init__(**kwargs)
    
    @classmethod
    async def create(cls, chat_id: str, type: str, content: str, 
                    file_name: str = None, file_url: str = None, 
                    metadata: Dict[str, Any] = None) -> 'Message':
        """Create a new message"""
        message_id = str(uuid.uuid4())
        query = """
            INSERT INTO messages (id, chat_id, type, content, file_name, file_url, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        metadata_json = json.dumps(metadata) if metadata else None
        result = await execute_insert(
            query, 
            (message_id, chat_id, type, content, file_name, file_url, metadata_json)
        )
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_id(cls, message_id: str) -> Optional['Message']:
        """Get message by ID"""
        query = "SELECT * FROM messages WHERE id = %s"
        result = await execute_query_one(query, (message_id,))
        if result:
            # Parse JSON metadata
            if result.get('metadata'):
                result['metadata'] = json.loads(result['metadata'])
            return cls.from_dict(result)
        return None
    
    @classmethod
    async def get_by_chat(cls, chat_id: str, limit: int = 100, offset: int = 0) -> List['Message']:
        """Get messages by chat ID"""
        query = """
            SELECT * FROM messages 
            WHERE chat_id = %s 
            ORDER BY created_at ASC 
            LIMIT %s OFFSET %s
        """
        results = await execute_query(query, (chat_id, limit, offset))
        messages = []
        for row in results:
            # Parse JSON metadata safely
            if row.get('metadata'):
                if isinstance(row['metadata'], str):
                    try:
                        row['metadata'] = json.loads(row['metadata'])
                    except (json.JSONDecodeError, TypeError):
                        row['metadata'] = {}
                elif not isinstance(row['metadata'], dict):
                    row['metadata'] = {}
            else:
                row['metadata'] = {}
            messages.append(cls.from_dict(row))
        return messages
    
    async def update(self, **kwargs) -> bool:
        """Update message fields"""
        if not kwargs:
            return False
        
        set_clauses = []
        values = []
        for key, value in kwargs.items():
            if hasattr(self, key):
                if key == 'metadata':
                    value = json.dumps(value) if value else None
                set_clauses.append(f"{key} = %s")
                values.append(value)
                setattr(self, key, value)
        
        if not set_clauses:
            return False
        
        query = f"UPDATE messages SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(self.id)
        
        rows_affected = await execute_update(query, tuple(values))
        return rows_affected > 0
    
    async def update_content(self, content: str) -> bool:
        """Update message content specifically"""
        return await self.update(content=content)
    
    async def delete(self) -> bool:
        """Delete message"""
        query = "DELETE FROM messages WHERE id = %s"
        rows_affected = await execute_delete(query, (self.id,))
        return rows_affected > 0

class File(BaseModel):
    """File model"""
    
    def __init__(self, id: str = None, user_id: str = None, original_name: str = None,
                 file_path: str = None, file_url: str = None, file_size: int = None,
                 content_type: str = None, processed: bool = False, 
                 extraction_text: str = None, created_at: datetime = None, **kwargs):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.original_name = original_name
        self.file_path = file_path
        self.file_url = file_url
        self.file_size = file_size
        self.content_type = content_type
        self.processed = processed
        self.extraction_text = extraction_text
        self.created_at = created_at
        super().__init__(**kwargs)
    
    @classmethod
    async def create(cls, user_id: str, original_name: str, file_path: str,
                    file_url: str, file_size: int, content_type: str,
                    processed: bool = False, extraction_text: str = None) -> 'File':
        """Create a new file record"""
        file_id = str(uuid.uuid4())
        query = """
            INSERT INTO files (id, user_id, original_name, file_path, file_url, 
                             file_size, content_type, processed, extraction_text)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        result = await execute_insert(
            query, 
            (file_id, user_id, original_name, file_path, file_url, 
             file_size, content_type, processed, extraction_text)
        )
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_id(cls, file_id: str) -> Optional['File']:
        """Get file by ID"""
        query = "SELECT * FROM files WHERE id = %s"
        result = await execute_query_one(query, (file_id,))
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_user(cls, user_id: str, limit: int = 50, offset: int = 0) -> List['File']:
        """Get files by user ID"""
        query = """
            SELECT * FROM files 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT %s OFFSET %s
        """
        results = await execute_query(query, (user_id, limit, offset))
        return [cls.from_dict(row) for row in results]
    
    async def update(self, **kwargs) -> bool:
        """Update file fields"""
        if not kwargs:
            return False
        
        set_clauses = []
        values = []
        for key, value in kwargs.items():
            if hasattr(self, key):
                set_clauses.append(f"{key} = %s")
                values.append(value)
                setattr(self, key, value)
        
        if not set_clauses:
            return False
        
        query = f"UPDATE files SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(self.id)
        
        rows_affected = await execute_update(query, tuple(values))
        return rows_affected > 0
    
    async def delete(self) -> bool:
        """Delete file"""
        query = "DELETE FROM files WHERE id = %s"
        rows_affected = await execute_delete(query, (self.id,))
        return rows_affected > 0

class ChatSession(BaseModel):
    """Chat session model"""
    
    def __init__(self, id: str = None, user_id: str = None, chat_id: str = None,
                 session_token: str = None, is_active: bool = True,
                 last_activity: datetime = None, created_at: datetime = None, **kwargs):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.chat_id = chat_id
        self.session_token = session_token
        self.is_active = is_active
        self.last_activity = last_activity
        self.created_at = created_at
        super().__init__(**kwargs)
    
    @classmethod
    async def create(cls, user_id: str, chat_id: str, session_token: str) -> 'ChatSession':
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        query = """
            INSERT INTO chat_sessions (id, user_id, chat_id, session_token, is_active)
            VALUES (%s, %s, %s, %s, %s)
        """
        result = await execute_insert(query, (session_id, user_id, chat_id, session_token, True))
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_token(cls, session_token: str) -> Optional['ChatSession']:
        """Get session by token"""
        query = "SELECT * FROM chat_sessions WHERE session_token = %s AND is_active = true"
        result = await execute_query_one(query, (session_token,))
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_active_by_user(cls, user_id: str) -> List['ChatSession']:
        """Get active sessions by user"""
        query = """
            SELECT * FROM chat_sessions 
            WHERE user_id = %s AND is_active = true 
            ORDER BY last_activity DESC
        """
        results = await execute_query(query, (user_id,))
        return [cls.from_dict(row) for row in results]
    
    async def update_activity(self) -> bool:
        """Update last activity timestamp"""
        query = "UPDATE chat_sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = %s"
        rows_affected = await execute_update(query, (self.id,))
        return rows_affected > 0
    
    async def deactivate(self) -> bool:
        """Deactivate session"""
        query = "UPDATE chat_sessions SET is_active = false WHERE id = %s"
        rows_affected = await execute_update(query, (self.id,))
        self.is_active = False
        return rows_affected > 0

class AIUsage(BaseModel):
    """AI usage tracking model"""
    
    def __init__(self, id: str = None, user_id: str = None, chat_id: str = None,
                 message_id: str = None, service_type: str = None, model_name: str = None,
                 prompt_tokens: int = 0, completion_tokens: int = 0, total_tokens: int = 0,
                 cost_estimate: float = 0.0, created_at: datetime = None, **kwargs):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.chat_id = chat_id
        self.message_id = message_id
        self.service_type = service_type
        self.model_name = model_name
        self.prompt_tokens = prompt_tokens
        self.completion_tokens = completion_tokens
        self.total_tokens = total_tokens
        self.cost_estimate = cost_estimate
        self.created_at = created_at
        super().__init__(**kwargs)
    
    @classmethod
    async def create(cls, user_id: str, service_type: str, model_name: str,
                    prompt_tokens: int = 0, completion_tokens: int = 0,
                    total_tokens: int = 0, cost_estimate: float = 0.0,
                    chat_id: str = None, message_id: str = None) -> 'AIUsage':
        """Create a new AI usage record"""
        usage_id = str(uuid.uuid4())
        query = """
            INSERT INTO ai_usage (id, user_id, chat_id, message_id, service_type, 
                                model_name, prompt_tokens, completion_tokens, 
                                total_tokens, cost_estimate)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        result = await execute_insert(
            query, 
            (usage_id, user_id, chat_id, message_id, service_type, model_name,
             prompt_tokens, completion_tokens, total_tokens, cost_estimate)
        )
        return cls.from_dict(result) if result else None
    
    @classmethod
    async def get_by_user(cls, user_id: str, limit: int = 100, offset: int = 0) -> List['AIUsage']:
        """Get AI usage by user"""
        query = """
            SELECT * FROM ai_usage 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT %s OFFSET %s
        """
        results = await execute_query(query, (user_id, limit, offset))
        return [cls.from_dict(row) for row in results]
