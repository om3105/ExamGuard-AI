from datetime import datetime, timedelta, timezone
from app.utils.datetime_utils import IST
from typing import Optional
import os

from dotenv import load_dotenv
from jose import JWTError, jwt
import bcrypt
from fastapi import HTTPException, status

load_dotenv()

# Admin-specific security configuration
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "admin_secret_key_change_in_production_12345")  # Change in production!
ADMIN_ALGORITHM = os.getenv("ADMIN_ALGORITHM", "HS256")
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ADMIN_TOKEN_EXPIRE_MINUTES", "480"))  # 8 hours for admin

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    return password_hash.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_admin_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token for admin users"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(IST) + expires_delta
    else:
        expire = datetime.now(IST) + timedelta(minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "admin"})
    encoded_jwt = jwt.encode(to_encode, ADMIN_SECRET_KEY, algorithm=ADMIN_ALGORITHM)
    return encoded_jwt

def verify_admin_token(token: str) -> dict:
    """Verify and decode admin JWT token"""
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=[ADMIN_ALGORITHM])
        if payload.get("type") != "admin":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
