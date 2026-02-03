from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
# Import shared models from session
from app.db.session import User, ExamSubmission
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser

router = APIRouter()

@router.get("/")
async def list_all_students(current_admin: AdminUser = Depends(get_current_admin)):
    """Get all registered students"""
    students = await User.find_all().to_list()
    return [
        {
            "id": str(student.id),
            "username": student.username,
            "email": student.email,
            "created_at": student.created_at
        }
        for student in students
    ]

@router.get("/{student_id}")
async def get_student_details(student_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get specific student details"""
    student = await User.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return {
        "id": str(student.id),
        "username": student.username,
        "email": student.email,
        "created_at": student.created_at
    }

@router.get("/{student_id}/submissions")
async def get_student_submissions(student_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get all exam submissions for a specific student"""
    submissions = await ExamSubmission.find({"user_id": student_id}).to_list()
    return submissions

@router.delete("/{student_id}")
async def delete_student(student_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Delete a student account"""
    student = await User.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Also delete all their submissions
    await ExamSubmission.find({"user_id": student_id}).delete()
    await student.delete()
    
    return {"message": f"Student {student_id} and their submissions deleted successfully"}
