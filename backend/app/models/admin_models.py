from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone
from app.utils.datetime_utils import IST
from typing import Optional

class AdminUser(Document):
    """Admin user model with authentication and role management"""
    username: str = Field(..., unique=True)
    email: EmailStr = Field(..., unique=True)
    password_hash: str
    full_name: str
    role: str = "admin"  # admin, super_admin
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(IST))
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "admin_users"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=IST).isoformat()
        }

class AdminCreate(BaseModel):
    """Schema for creating admin users"""
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "admin"

class AdminLogin(BaseModel):
    """Schema for admin login"""
    username: str
    password: str

class AdminResponse(BaseModel):
    """Schema for admin user response"""
    id: str
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

class AdminToken(BaseModel):
    """Schema for admin JWT token"""
    access_token: str
    token_type: str
    admin: AdminResponse
