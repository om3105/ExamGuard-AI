"""
auth_routes.py — Student authentication endpoints.

Provides:
  - Registration with email verification
  - OAuth2 token-based login (blocked if not verified)
  - Email verification
  - Forgot / reset password
  - Google OAuth login + callback

Passwords are hashed with bcrypt. Tokens are JWT (HS256).
"""
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr

from app.models.all_models import User, UserCreate, UserResponse, Token
from app.core.security import (
    get_password_hash, verify_password, create_access_token, is_strong_password
)
from app.core.logging_config import get_logger
from app.services.email_service import send_verification_email, send_reset_password_email
from pymongo.errors import DuplicateKeyError

import httpx

logger = get_logger("auth")
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "")

# ──────────────────────────────────────────────
# Pydantic schemas for new endpoints
# ──────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ──────────────────────────────────────────────
# REGISTER — with email verification
# ──────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    # Check for existing username
    existing_username = await User.find_one(User.username == user.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check for existing email
    user_exists = await User.find_one(User.email == user.email)
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate password strength
    if not is_strong_password(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )

    # Generate verification token (URL-safe, 64 chars)
    verification_token = secrets.token_urlsafe(48)

    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        is_verified=False,
        verification_token=verification_token,
        verification_token_expiry=datetime.now(timezone.utc) + timedelta(hours=24),
    )

    try:
        await new_user.insert()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or Email already exists"
        )

    logger.info("New user registered: %s (%s)", new_user.username, new_user.email)

    # Send verification email (non-blocking — errors logged silently)
    try:
        await send_verification_email(new_user.email, verification_token)
    except Exception as e:
        logger.error("Failed to send verification email to %s: %s", new_user.email, str(e))

    return {
        "message": "Registration successful! Please check your email to verify your account.",
        "email": new_user.email,
    }


# ──────────────────────────────────────────────
# LOGIN — blocked if not verified
# ──────────────────────────────────────────────

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.username == form_data.username)

    # Block soft-deleted users
    if user and user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact your administrator.",
        )

    # Block Google-only users from manual login (prevents bcrypt crash on empty hash)
    if user and user.auth_provider == "google" and not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google login. Please sign in with Google.",
        )

    # Validate credentials
    if not user or not user.password_hash or not verify_password(form_data.password, user.password_hash):
        logger.warning("Failed login attempt for username: %s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Auto-verify existing users who pre-date the email verification feature
    # (they have no verification_token → they were created before this feature)
    if user.auth_provider == "local" and not user.is_verified:
        if user.verification_token is None:
            # Old user — auto-verify
            user.is_verified = True
            await user.save()
            logger.info("Auto-verified pre-existing user: %s", user.username)
        else:
            # New user who hasn't clicked the verification link yet
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="EMAIL_NOT_VERIFIED",
            )

    logger.info("Successful login: %s", user.username)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# ──────────────────────────────────────────────
# VERIFY EMAIL
# ──────────────────────────────────────────────

@router.get("/verify-email")
async def verify_email(token: str = Query(...)):
    user = await User.find_one(User.verification_token == token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link."
        )

    # Check expiry
    if user.verification_token_expiry and user.verification_token_expiry < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link has expired. Please register again."
        )

    # Already verified
    if user.is_verified:
        return {"message": "Email already verified. You can log in."}

    # Verify the user
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expiry = None
    await user.save()

    logger.info("Email verified for user: %s", user.username)
    return {"message": "Email verified successfully! You can now log in."}


# ──────────────────────────────────────────────
# RESEND VERIFICATION EMAIL
# ──────────────────────────────────────────────

@router.post("/resend-verification")
async def resend_verification(body: ForgotPasswordRequest):
    user = await User.find_one(User.email == body.email)

    if not user:
        # Don't reveal whether email exists
        return {"message": "If an account exists with this email, a verification link has been sent."}

    if user.is_verified:
        return {"message": "This email is already verified. You can log in."}

    # Generate new token
    token = secrets.token_urlsafe(48)
    user.verification_token = token
    user.verification_token_expiry = datetime.now(timezone.utc) + timedelta(hours=24)
    await user.save()

    try:
        await send_verification_email(user.email, token)
    except Exception as e:
        logger.error("Failed to resend verification email: %s", str(e))

    return {"message": "If an account exists with this email, a verification link has been sent."}


# ──────────────────────────────────────────────
# FORGOT PASSWORD
# ──────────────────────────────────────────────

@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    user = await User.find_one(User.email == body.email)

    # Always return the same message (prevent user enumeration)
    safe_message = "If an account exists with this email, a password reset link has been sent."

    if not user:
        return {"message": safe_message}

    if user.auth_provider == "google":
        return {"message": "This account uses Google login. Please sign in with Google."}

    # Generate reset token
    token = secrets.token_urlsafe(48)
    user.reset_token = token
    user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=30)
    await user.save()

    try:
        await send_reset_password_email(user.email, token)
    except Exception as e:
        logger.error("Failed to send reset email to %s: %s", user.email, str(e))

    logger.info("Password reset requested for: %s", user.email)
    return {"message": safe_message}


# ──────────────────────────────────────────────
# RESET PASSWORD
# ──────────────────────────────────────────────

@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    user = await User.find_one(User.reset_token == body.token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link."
        )

    # Check expiry
    if user.reset_token_expiry and user.reset_token_expiry < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link has expired. Please request a new one."
        )

    # Validate new password
    if not is_strong_password(body.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )

    # Update password
    user.password_hash = get_password_hash(body.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    await user.save()

    logger.info("Password reset for user: %s", user.username)
    return {"message": "Password reset successfully! You can now log in with your new password."}


# ──────────────────────────────────────────────
# GOOGLE OAUTH — Login
# ──────────────────────────────────────────────

@router.get("/google/login")
async def google_login():
    """Redirect user to Google's OAuth consent screen."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth is not configured.")

    redirect_uri = GOOGLE_REDIRECT_URI or f"{FRONTEND_URL}/auth/google/callback"
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    return {"auth_url": google_auth_url}


@router.get("/google/callback")
async def google_callback(code: str = Query(...)):
    """Handle Google OAuth redirect — exchange code for user info, create/login user."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="Google OAuth is not configured.")

    redirect_uri = GOOGLE_REDIRECT_URI or f"{FRONTEND_URL}/auth/google/callback"

    # 1. Exchange authorization code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    if token_response.status_code != 200:
        logger.error("Google token exchange failed: %s", token_response.text)
        raise HTTPException(status_code=400, detail="Failed to authenticate with Google.")

    token_data = token_response.json()
    access_token_google = token_data.get("access_token")

    # 2. Fetch user info from Google
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token_google}"},
        )

    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch Google user info.")

    google_user = userinfo_response.json()
    google_email = google_user.get("email")
    google_name = google_user.get("name", "")
    google_id = google_user.get("id")

    if not google_email:
        raise HTTPException(status_code=400, detail="Google account has no email associated.")

    # 3. Find or create user
    user = await User.find_one(User.email == google_email)

    if user:
        # Existing user — update Google ID if not set
        if not user.google_id:
            user.google_id = google_id
            user.auth_provider = "google"
        if not user.is_verified:
            user.is_verified = True  # Google-verified emails are trusted
        await user.save()
    else:
        # Create new user with Google account
        # Generate unique username from email
        base_username = google_email.split("@")[0]
        username = base_username
        counter = 1
        while await User.find_one(User.username == username):
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=google_email,
            password_hash="",  # No password for Google users
            full_name=google_name,
            is_verified=True,
            auth_provider="google",
            google_id=google_id,
        )
        await user.insert()
        logger.info("New Google user created: %s (%s)", user.username, user.email)

    # 4. Generate JWT and redirect to frontend
    jwt_token = create_access_token(data={"sub": user.username})
    redirect_url = f"{FRONTEND_URL}/auth/google/callback?token={jwt_token}&username={user.username}"
    return RedirectResponse(url=redirect_url)
