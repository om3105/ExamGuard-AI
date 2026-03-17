from datetime import datetime, timedelta
from app.utils.datetime_utils import IST
from typing import Optional
import os

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.logging_config import get_logger

from app.models.all_models import User

load_dotenv()
logger = get_logger("security")

# Security: raise error in production if secret key is not set
_default_key = "your_secret_key_here"
SECRET_KEY = os.getenv("SECRET_KEY", _default_key)
if SECRET_KEY == _default_key and os.getenv("ENVIRONMENT", "development") == "production":
    raise RuntimeError("SECRET_KEY must be set in production! Update .env with a strong random key.")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def is_strong_password(password: str) -> bool:
    """Validate password strength — minimum 8 characters."""
    return len(password) >= 8

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(IST) + expires_delta
    else:
        expire = datetime.now(IST) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Resolve the current user from a JWT access token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await User.find_one(User.username == username)
    if not user:
        raise credentials_exception

    return user
