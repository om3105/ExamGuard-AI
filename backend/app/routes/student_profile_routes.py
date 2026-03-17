from fastapi import APIRouter, HTTPException, Depends, status
from app.models.all_models import User, UserResponse, UserUpdate
from app.core.security import get_current_user
import re

router = APIRouter()

# Simple regex for generic email evaluation
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

@router.get("/", response_model=UserResponse)
async def get_student_profile(current_user: User = Depends(get_current_user)):
    """
    Get the authenticated student's profile information.
    """
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        course=current_user.course,
        college=current_user.college,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

@router.put("/update", response_model=UserResponse)
async def update_student_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update the authenticated student's profile information.
    """
    # Validate Email Format
    if update_data.email:
        if not EMAIL_REGEX.match(update_data.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")
            
        # Check if the new email is already in use by another user
        if update_data.email != current_user.email:
            existing_email = await User.find_one({"email": update_data.email})
            if existing_email:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address is already in use")
            
            # Update email if checks pass
            current_user.email = update_data.email

    # Update other fields
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.phone_number is not None:
        current_user.phone_number = update_data.phone_number
    if update_data.course is not None:
        current_user.course = update_data.course
    if update_data.college is not None:
        current_user.college = update_data.college

    # Save changes to the database
    await current_user.save()

    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        course=current_user.course,
        college=current_user.college,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )
