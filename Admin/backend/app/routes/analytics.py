from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List
# Import shared models from session
from app.db.session import Exam, ExamSubmission, User
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser

router = APIRouter()

@router.get("/overview")
async def get_dashboard_overview(current_admin: AdminUser = Depends(get_current_admin)) -> Dict:
    """Get dashboard overview statistics"""
    total_exams = await Exam.count()
    total_students = await User.count()
    total_submissions = await ExamSubmission.count()
    
    # Get recent submissions
    recent_submissions = await ExamSubmission.find_all().sort("-submitted_at").limit(5).to_list()
    
    return {
        "total_exams": total_exams,
        "total_students": total_students,
        "total_submissions": total_submissions,
        "recent_submissions": [
            {
                "id": str(sub.id),
                "exam_title": sub.exam_title,
                "user_id": sub.user_id,
                "submitted_at": sub.submitted_at,
                "status": sub.status,
                "score": sub.score
            }
            for sub in recent_submissions
        ]
    }

@router.get("/exams/{exam_id}/results")
async def get_exam_results(exam_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get all results for a specific exam"""
    exam = await Exam.get(exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    submissions = await ExamSubmission.find({"exam_id": exam_id}).to_list()
    
    return {
        "exam_id": exam_id,
        "exam_title": exam.title,
        "total_submissions": len(submissions),
        "submissions": [
            {
                "id": str(sub.id),
                "user_id": sub.user_id,
                "submitted_at": sub.submitted_at,
                "status": sub.status,
                "score": sub.score
            }
            for sub in submissions
        ]
    }

@router.get("/students/{student_id}/performance")
async def get_student_performance(student_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get performance analytics for a specific student"""
    student = await User.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    submissions = await ExamSubmission.find({"user_id": student_id}).to_list()
    
    return {
        "student_id": student_id,
        "username": student.username,
        "total_exams_attempted": len(submissions),
        "submissions": [
            {
                "exam_title": sub.exam_title,
                "submitted_at": sub.submitted_at,
                "score": sub.score,
                "status": sub.status
            }
            for sub in submissions
        ]
    }
