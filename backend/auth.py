from passlib.context import CryptContext
from models import User
from typing import Optional

# Password hashing only (no JWT)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

async def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = await User.get_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# Simple session storage (in production, use Redis or database)
active_sessions = {}

def create_session(user: User) -> str:
    """Create a simple session"""
    import uuid
    session_id = str(uuid.uuid4())
    active_sessions[session_id] = user.id
    return session_id

def get_user_from_session(session_id: str) -> Optional[str]:
    """Get user ID from session"""
    return active_sessions.get(session_id)

def delete_session(session_id: str):
    """Delete a session"""
    active_sessions.pop(session_id, None)
