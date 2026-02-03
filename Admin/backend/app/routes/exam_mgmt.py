from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
# Import shared models from session (which handles the path)
from app.db.session import Exam, ExamSubmission
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser

router = APIRouter()

# Use a simpler ExamCreate schema since we import Exam from session
from pydantic import BaseModel
from typing import Optional, List as PyList
from datetime import datetime

class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    sections: PyList[dict]
    total_marks: int
    duration_minutes: int
    start_time: datetime

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_exam(exam_data: ExamCreate, current_admin: AdminUser = Depends(get_current_admin)):
    """Create a new exam (admin only)"""
    exam = Exam(**exam_data.dict())
    await exam.insert()
    return exam

@router.get("/")
async def list_all_exams(current_admin: AdminUser = Depends(get_current_admin)):
    """Get all exams (admin only)"""
    exams = await Exam.find_all().to_list()
    return exams

@router.get("/{exam_id}")
async def get_exam_details(exam_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get specific exam details (admin only)"""
    exam = await Exam.get(exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    return exam

@router.put("/{exam_id}")
async def update_exam(exam_id: str, exam_data: ExamCreate, current_admin: AdminUser = Depends(get_current_admin)):
    """Update an existing exam (admin only)"""
    exam = await Exam.get(exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # Update exam fields
    exam.title = exam_data.title
    exam.description = exam_data.description
    exam.sections = exam_data.sections
    exam.total_marks = exam_data.total_marks
    exam.duration_minutes = exam_data.duration_minutes
    exam.start_time = exam_data.start_time
    
    await exam.save()
    return exam

@router.delete("/{exam_id}")
async def delete_exam(exam_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Delete an exam (admin only)"""
    exam = await Exam.get(exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    await exam.delete()
    return {"message": f"Exam {exam_id} deleted successfully"}

@router.get("/{exam_id}/submissions")
async def get_exam_submissions(exam_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get all submissions for a specific exam"""
    submissions = await ExamSubmission.find({"exam_id": exam_id}).to_list()
    return submissions
