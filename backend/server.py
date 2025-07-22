from fastapi import FastAPI, HTTPException, status, UploadFile, File, Cookie, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import os
import logging
from typing import List, Optional
import uuid
from datetime import datetime
import json

# Local imports
from database import create_tables, test_connection, initialize_connection_pool
from models import User, Chat, Message, File as FileModel, AIUsage
from schemas import (
    UserCreate, UserLogin, UserResponse, LoginResponse,
    ChatCreate, ChatResponse, ChatListResponse, ChatUpdate,
    MessageCreate, MessageResponse, ChatMessageRequest, ChatMessageResponse,
    FileUploadResponse, HealthCheck, APIResponse
)
from auth import authenticate_user, get_password_hash, create_session, get_user_from_session, delete_session
from bedrock_service import bedrock_service
from s3_service import s3_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app_config = {
    "title": "Indifly Legal Chat API",
    "description": "AI-powered legal assistant backend",
    "version": "1.0.0"
}

if os.getenv("APP_ENV") == "production":
    app_config["docs_url"] = None
    app_config["redoc_url"] = None

app = FastAPI(**app_config)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple session-based auth dependency
async def get_current_user(session_id: Optional[str] = Cookie(None)) -> User:
    """Get current user from session cookie"""
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No session found"
        )
    
    user_id = get_user_from_session(session_id)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session"
        )
    
    user = await User.get_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting IFlyChat backend (No JWT)...")
    
    try:
        initialize_connection_pool()
        connection_ok = await test_connection()
        if not connection_ok:
            logger.error("❌ Database connection failed during startup")
            raise RuntimeError("Database connection failed")
        
        create_tables()
        logger.info("✅ Database initialized successfully")
        logger.info("✅ IFlyChat backend startup complete")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

# Health check
@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    return HealthCheck(
        status="healthy",
        database="connected",
        s3="available", 
        ai_service="bedrock",
        timestamp=datetime.utcnow()
    )

# Root endpoint
@app.get("/", response_model=APIResponse)
async def root():
    """Root endpoint"""
    return APIResponse(
        success=True,
        message="IFlyChat API is running (No JWT)",
        data={"version": "1.0.0", "auth": "session-based"}
    )

# Authentication endpoints (session-based)
@app.post("/auth/register", response_model=APIResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    existing_user = await User.get_by_email(user_data.email)
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user = await User.create(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    return APIResponse(
        success=True,
        message="User registered successfully",
        data={"user_id": new_user.id}
    )

@app.post("/auth/login", response_model=LoginResponse)
async def login_user(user_credentials: UserLogin, response: Response):
    """Authenticate user and create session"""
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create session
    session_id = create_session(user)
    
    # Set session cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24 * 7  # 7 days
    )
    
    return LoginResponse(
        success=True,
        message="Login successful",
        user=UserResponse.model_validate(user.to_dict())
    )

@app.post("/auth/logout", response_model=APIResponse)
async def logout_user(response: Response, session_id: Optional[str] = Cookie(None)):
    """Logout user and clear session"""
    if session_id:
        delete_session(session_id)
    
    response.delete_cookie("session_id")
    
    return APIResponse(
        success=True,
        message="Logout successful",
        data={}
    )

# User endpoints
@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse.model_validate(current_user.to_dict())

# Chat endpoints
@app.get("/chats", response_model=ChatListResponse)
async def get_user_chats(
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """Get user's chats with pagination"""
    try:
        chats = await Chat.get_by_user(current_user.id, limit, offset)
        chat_responses = [ChatResponse.model_validate(chat.to_dict()) for chat in chats]
        
        return ChatListResponse(
            chats=chat_responses,
            total=len(chat_responses),
            limit=limit,
            offset=offset
        )
    except Exception as e:
        logger.error(f"Error fetching chats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch chats"
        )

@app.post("/chats", response_model=ChatResponse)
async def create_chat(
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new chat"""
    try:
        new_chat = await Chat.create(
            user_id=current_user.id,
            title=chat_data.title or "New Chat"
        )
        
        if not new_chat:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create chat"
            )
        
        return ChatResponse.model_validate(new_chat.to_dict())
    except Exception as e:
        logger.error(f"Error creating chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat"
        )

@app.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific chat"""
    chat = await Chat.get_by_id(chat_id)
    
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    return ChatResponse.model_validate(chat.to_dict())

@app.delete("/chats/{chat_id}", response_model=APIResponse)
async def delete_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a chat"""
    chat = await Chat.get_by_id(chat_id)
    
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    success = await chat.delete()
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chat"
        )
    
    return APIResponse(
        success=True,
        message="Chat deleted successfully",
        data={"chat_id": chat_id}
    )

# Message endpoints
@app.get("/chats/{chat_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    limit: int = 100,
    offset: int = 0
):
    """Get messages for a chat"""
    chat = await Chat.get_by_id(chat_id)
    
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    messages = await Message.get_by_chat(chat_id, limit, offset)
    return [MessageResponse.model_validate(msg.to_dict()) for msg in messages]

@app.post("/chats/{chat_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    chat_id: str,
    message_data: ChatMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a message and get AI response"""
    chat = await Chat.get_by_id(chat_id)
    
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    try:
        # Create user message
        user_message = await Message.create(
            chat_id=chat_id,
            type="user",
            content=message_data.content,
            file_name=message_data.file_name,
            file_url=message_data.file_url,
            metadata=message_data.metadata or {}
        )
        
        if not user_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user message"
            )
        
        # Get context for AI - exclude the current user message to avoid duplication
        recent_messages = await Message.get_by_chat(chat_id, limit=10)
        context_messages = []
        for msg in recent_messages[-9:]:  # Last 9 messages (excluding the one we just created)
            context_messages.append({
                "role": "user" if msg.type == "user" else "assistant",
                "content": msg.content
            })
        
        # Add file content if available
        file_content = ""
        if message_data.file_name and message_data.file_url:
            logger.info(f"🔍 Looking for file content: {message_data.file_name} at {message_data.file_url}")
            try:
                files = await FileModel.get_by_user(current_user.id, limit=100)
                logger.info(f"📁 Found {len(files)} files for user")
                for file_record in files:
                    logger.info(f"📄 Checking file: {file_record.original_name} - URL: {file_record.file_url} - Has text: {bool(file_record.extraction_text)}")
                    if file_record.file_url == message_data.file_url and file_record.extraction_text:
                        file_content = f"\n\nFile content from {file_record.original_name}:\n{file_record.extraction_text}"
                        logger.info(f"✅ Found matching file content: {len(file_content)} characters")
                        break
                else:
                    logger.warning(f"❌ No matching file found with extracted text for URL: {message_data.file_url}")
            except Exception as e:
                logger.warning(f"Could not get file content: {e}")
        
        # Generate AI response
        full_user_content = message_data.content + file_content
        logger.info(f"📝 Sending to AI - User content length: {len(message_data.content)}, File content length: {len(file_content)}, Total: {len(full_user_content)}")
        ai_response = await bedrock_service.generate_chat_response(
            user_message=full_user_content,
            context_messages=context_messages,
            user_id=current_user.id
        )
        
        # Create AI message
        ai_message = await Message.create(
            chat_id=chat_id,
            type="bot",
            content=ai_response["content"],
            metadata={
                "model": ai_response.get("model", "unknown"),
                "tokens_used": ai_response.get("tokens_used", 0),
                "processing_time": ai_response.get("processing_time", 0)
            }
        )
        
        # Record AI usage
        try:
            if ai_message and ai_response.get("usage"):
                usage = ai_response["usage"]
                await AIUsage.create(
                    user_id=current_user.id,
                    chat_id=chat_id,
                    message_id=ai_message.id,
                    service_type="bedrock",
                    model_name=ai_response.get("model", "unknown"),
                    prompt_tokens=usage.get("prompt_tokens", 0),
                    completion_tokens=usage.get("completion_tokens", 0),
                    total_tokens=usage.get("total_tokens", 0),
                    cost_estimate=0.0  # Calculate based on model pricing if needed
                )
        except Exception as e:
            logger.warning(f"Failed to record AI usage: {e}")
        
        # Auto-generate chat name if this is the first user message
        chat_name = None
        try:
            message_count = len(recent_messages)
            if message_count <= 1:  # First message (user message just created)
                logger.info(f"🏷️ Generating chat name for first message...")
                name_response = await bedrock_service.generate_chat_name(
                    message=message_data.content,
                    file_content=file_content if file_content else None,
                    file_names=[message_data.file_name] if message_data.file_name else None
                )
                
                if name_response.get("suggested_name"):
                    chat_name = name_response["suggested_name"]
                    # Update chat title
                    await chat.update_title(chat_name)
                    logger.info(f"✅ Generated chat name: {chat_name}")
        except Exception as e:
            logger.warning(f"Failed to generate chat name: {e}")
        
        return ChatMessageResponse(
            user_message=MessageResponse.model_validate(user_message.to_dict()),
            ai_response=MessageResponse.model_validate(ai_message.to_dict()) if ai_message else None,
            chat_name=chat_name,
            processing_time=ai_response.get("processing_time", 0)
        )
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )

@app.post("/chats/{chat_id}/messages/stream")
async def send_message_stream(
    chat_id: str,
    message_data: ChatMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a message and get AI response with streaming"""
    chat = await Chat.get_by_id(chat_id)
    
    if not chat or chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    try:
        # Create user message
        user_message = await Message.create(
            chat_id=chat_id,
            type="user",
            content=message_data.content,
            file_name=message_data.file_name,
            file_url=message_data.file_url,
            metadata=message_data.metadata or {}
        )
        
        if not user_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user message"
            )
        
        # Get context for AI
        recent_messages = await Message.get_by_chat(chat_id, limit=10)
        context_messages = []
        for msg in recent_messages[-9:]:  # Last 9 messages (excluding the one we just created)
            context_messages.append({
                "role": "user" if msg.type == "user" else "assistant",
                "content": msg.content
            })
        
        # Add file content if available
        file_content = ""
        if message_data.file_name and message_data.file_url:
            try:
                files = await FileModel.get_by_user(current_user.id, limit=100)
                for file_record in files:
                    if file_record.file_url == message_data.file_url and file_record.extraction_text:
                        file_content = f"\n\nFile content from {file_record.original_name}:\n{file_record.extraction_text}"
                        break
            except Exception as e:
                logger.warning(f"Could not get file content: {e}")
        
        full_user_content = message_data.content + file_content
        
        async def generate_response():
            try:
                # Send initial user message data
                yield f"data: {json.dumps({'type': 'user_message', 'message': user_message.to_dict()})}\n\n"
                
                # Create AI message placeholder
                ai_message = await Message.create(
                    chat_id=chat_id,
                    type="bot",
                    content="",  # Will be updated as we stream
                    metadata={}
                )
                
                if ai_message:
                    yield f"data: {json.dumps({'type': 'ai_message_start', 'message_id': ai_message.id})}\n\n"
                
                # Stream AI response
                full_response = ""
                async for chunk in bedrock_service.generate_chat_response_stream(
                    user_message=full_user_content,
                    context_messages=context_messages,
                    user_id=current_user.id
                ):
                    full_response += chunk
                    yield f"data: {json.dumps({'type': 'content_delta', 'content': chunk})}\n\n"
                
                # Update the AI message with full content
                if ai_message and full_response:
                    await ai_message.update_content(full_response)
                    yield f"data: {json.dumps({'type': 'ai_message_complete', 'message': ai_message.to_dict()})}\n\n"
                
                # Auto-generate chat name if this is the first user message
                message_count = len(recent_messages)
                if message_count <= 1:
                    try:
                        name_response = await bedrock_service.generate_chat_name(
                            message=message_data.content,
                            file_content=file_content if file_content else None,
                            file_names=[message_data.file_name] if message_data.file_name else None
                        )
                        
                        if name_response.get("suggested_name"):
                            chat_name = name_response["suggested_name"]
                            await chat.update_title(chat_name)
                            yield f"data: {json.dumps({'type': 'chat_name', 'name': chat_name})}\n\n"
                    except Exception as e:
                        logger.warning(f"Failed to generate chat name: {e}")
                
                yield f"data: {json.dumps({'type': 'stream_complete'})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in streaming response: {e}")
                yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing streaming message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )

# File upload
@app.post("/files/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a file to S3, extract text, and create database record"""
    try:
        allowed_types = ['.pdf', '.doc', '.docx', '.txt']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file_extension} not supported. Allowed types: {', '.join(allowed_types)}"
            )
        
        file_content = await file.read()
        
        # Upload to S3
        s3_result = await s3_service.upload_file(
            file_content=file_content,
            file_name=file.filename,
            user_id=current_user.id,
            content_type=file.content_type
        )
        
        # Extract text content
        extracted_text, extraction_success = await s3_service.extract_text_from_file(
            file_content=file_content,
            file_name=file.filename,
            content_type=file.content_type or "application/octet-stream"
        )
        
        # Create database record
        file_record = await FileModel.create(
            user_id=current_user.id,
            original_name=s3_result['original_name'],
            file_path=s3_result['file_key'],
            file_url=s3_result['file_url'],
            file_size=s3_result['file_size'],
            content_type=s3_result['content_type'],
            processed=extraction_success,
            extraction_text=extracted_text if extraction_success else None
        )
        
        if not file_record:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create file record"
            )
        
        return FileUploadResponse.model_validate(file_record.to_dict())
        
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )

@app.get("/files", response_model=List[FileUploadResponse])
async def get_user_files(
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """Get user's files"""
    try:
        files = await FileModel.get_by_user(current_user.id, limit, offset)
        return [FileUploadResponse.model_validate(file.to_dict()) for file in files]
    except Exception as e:
        logger.error(f"Error fetching files: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch files"
        )

# Main entry point
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", 8000))
    host = os.getenv("API_HOST", "0.0.0.0")
    
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
