"""
student_mgmt.py — Admin student management endpoints.

Provides CRUD operations for student accounts:
- List all students with profiles
- Create/delete student accounts
- View student exam submissions
- Toggle student active/inactive status
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List
# Import shared models from session
from app.models.all_models import User, ExamSubmission
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser
from app.utils.datetime_utils import IST
from datetime import datetime

from app.core.security import get_password_hash

router = APIRouter()


class CreateStudentPayload(BaseModel):
    username: str
    email: str
    password: str


@router.post("/")
async def create_student(payload: CreateStudentPayload, current_admin: AdminUser = Depends(get_current_admin)):
    """Admin creates a new student account"""
    existing = await User.find_one({"username": payload.username})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    existing_email = await User.find_one({"email": payload.email})
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    student = User(
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
    )
    await student.insert()

    return {
        "id": str(student.id),
        "username": student.username,
        "email": student.email,
        "full_name": student.full_name,
        "phone_number": student.phone_number,
        "course": student.course,
        "college": student.college,
        "created_at": student.created_at,
        "is_active": student.is_active,
        "message": "Student created successfully"
    }

@router.get("/")
async def list_all_students(current_admin: AdminUser = Depends(get_current_admin)):
    """Get all registered students"""
    students = await User.find({"deleted_at": None}).to_list()
    return [
        {
            "id": str(student.id),
            "username": student.username,
            "email": student.email,
            "full_name": student.full_name,
            "phone_number": student.phone_number,
            "course": student.course,
            "college": student.college,
            "created_at": student.created_at,
            "is_active": student.is_active
        }
        for student in students
    ]

@router.get("/{student_id}")
async def get_student_details(student_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get specific student details"""
    student = await User.get(student_id)
    if not student or student.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return {
        "id": str(student.id),
        "username": student.username,
        "email": student.email,
        "full_name": student.full_name,
        "phone_number": student.phone_number,
        "course": student.course,
        "college": student.college,
        "created_at": student.created_at,
        "is_active": student.is_active
    }

@router.get("/{student_id}/submissions")
async def get_student_submissions(student_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get all exam submissions for a specific student"""
    submissions = await ExamSubmission.find({"user_id": student_id}).to_list()
    return submissions

@router.delete("/{student_id}")
async def delete_student(student_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Soft delete a student account"""
    student = await User.get(student_id)
    if not student or student.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    student.deleted_at = datetime.now(IST)
    student.is_active = False
    await student.save()
    
    return {"message": f"Student {student_id} marked as deleted successfully"}

from pydantic import BaseModel

class StatusUpdate(BaseModel):
    is_active: bool

@router.patch("/{student_id}/status")
async def update_student_status(student_id: str, payload: StatusUpdate, current_admin: AdminUser = Depends(get_current_admin)):
    """Activate or deactivate a student account"""
    student = await User.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    student.is_active = payload.is_active
    await student.save()
    
    return {"message": f"Student {student_id} status updated to {'active' if payload.is_active else 'inactive'}"}
