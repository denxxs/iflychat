from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MessageType(str, Enum):
    USER = "user"
    BOT = "bot"

# User Schemas
class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None

# Auth Schemas (Session-based, no JWT)
class LoginResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse

# Message Schemas
class MessageBase(BaseModel):
    type: MessageType
    content: str = Field(..., min_length=1)
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageCreate(MessageBase):
    chat_id: str

class MessageResponse(MessageBase):
    id: str
    chat_id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Chat Schemas
class ChatBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)

class ChatCreate(ChatBase):
    pass

class ChatUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)

class ChatResponse(ChatBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class ChatListResponse(BaseModel):
    chats: List[ChatResponse]
    total: int
    limit: int
    offset: int
    
    model_config = ConfigDict(from_attributes=True)

# File Schemas
class FileBase(BaseModel):
    original_name: str
    content_type: str

class FileUploadResponse(FileBase):
    id: str
    file_url: str
    file_size: int
    processed: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class FileResponse(FileUploadResponse):
    user_id: str
    file_path: str
    extraction_text: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# AI Chat Schemas
class ChatMessageRequest(BaseModel):
    content: str = Field(..., min_length=1)
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatMessageResponse(BaseModel):
    user_message: MessageResponse
    ai_response: Optional[MessageResponse] = None
    chat_name: Optional[str] = None
    processing_time: float = 0.0

# Chat Naming Schemas
class ChatNameRequest(BaseModel):
    message: str = Field(..., min_length=1)
    file_ids: Optional[List[str]] = []
    file_content_summary: Optional[str] = None

class ChatNameResponse(BaseModel):
    suggested_name: str
    reasoning: Optional[str] = None

# Chat Session Management
class ChatSessionCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    initial_message: Optional[str] = None
    file_ids: Optional[List[str]] = []

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    user_id: str
    has_content: bool = False  # True if chat has messages
    last_activity: datetime
    file_count: int = 0
    message_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# AI Usage Schemas
class AIUsageCreate(BaseModel):
    service_type: str
    model_name: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    cost_estimate: float = 0.0

class AIUsageResponse(AIUsageCreate):
    id: str
    user_id: str
    chat_id: Optional[str] = None
    message_id: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Status and Health Schemas
class HealthCheck(BaseModel):
    status: str
    database: str
    s3: str
    ai_service: str
    timestamp: datetime

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

# Search and Filter Schemas
class ChatFilter(BaseModel):
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    search: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class MessageFilter(BaseModel):
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)
    message_type: Optional[MessageType] = None
    search: Optional[str] = None
