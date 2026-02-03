from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.admin_models import AdminUser, AdminCreate, AdminLogin, AdminResponse, AdminToken
from app.core.admin_security import hash_password, verify_password, create_admin_access_token, verify_admin_token
from datetime import datetime, timezone

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(admin_data: AdminCreate):
    """Register a new admin user"""
    # Check if admin already exists
    existing_admin = await AdminUser.find_one({"username": admin_data.username})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = await AdminUser.find_one({"email": admin_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new admin user
    admin = AdminUser(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=hash_password(admin_data.password),
        full_name=admin_data.full_name,
        role=admin_data.role
    )
    
    await admin.insert()
    
    return AdminResponse(
        id=str(admin.id),
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        role=admin.role,
        is_active=admin.is_active,
        created_at=admin.created_at,
        last_login=admin.last_login
    )

@router.post("/login", response_model=AdminToken)
async def login_admin(credentials: AdminLogin):
    """Admin login endpoint"""
    # Find admin by username
    admin = await AdminUser.find_one({"username": credentials.username})
    
    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    # Update last login
    admin.last_login = datetime.now(timezone.utc)
    await admin.save()
    
    # Create access token
    access_token = create_admin_access_token(data={"sub": admin.username, "id": str(admin.id)})
    
    return AdminToken(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse(
            id=str(admin.id),
            username=admin.username,
            email=admin.email,
            full_name=admin.full_name,
            role=admin.role,
            is_active=admin.is_active,
            created_at=admin.created_at,
            last_login=admin.last_login
        )
    )

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> AdminUser:
    """Dependency to get current authenticated admin"""
    token = credentials.credentials
    payload = verify_admin_token(token)
    
    admin = await AdminUser.find_one({"username": payload.get("sub")})
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found"
        )
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    return admin

@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(current_admin: AdminUser = Depends(get_current_admin)):
    """Get current admin user information"""
    return AdminResponse(
        id=str(current_admin.id),
        username=current_admin.username,
        email=current_admin.email,
        full_name=current_admin.full_name,
        role=current_admin.role,
        is_active=current_admin.is_active,
        created_at=current_admin.created_at,
        last_login=current_admin.last_login
    )

@router.post("/logout")
async def logout_admin(current_admin: AdminUser = Depends(get_current_admin)):
    """Admin logout endpoint"""
    return {"message": "Logged out successfully"}
