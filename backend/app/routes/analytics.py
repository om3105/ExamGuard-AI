"""
analytics.py — Admin analytics dashboard endpoints.

Provides system-wide statistics and drill-down reports:
- Overview: total exams, students, submissions, high-risk count
- Exam results: per-exam submission list with behavioral data
- Student performance: per-student exam history and scores
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List
from bson import ObjectId
from app.models.all_models import Exam, ExamSubmission, User
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser
from app.models.all_models import BehaviorLog

router = APIRouter()

@router.get("/overview")
async def get_dashboard_overview(current_admin: AdminUser = Depends(get_current_admin)) -> Dict:
    """Get dashboard overview statistics"""
    total_exams = await Exam.count()
    total_students = await User.count()
    total_submissions = await ExamSubmission.count()

    # Use a single aggregation to compute high-risk count and avg anomaly score
    # instead of loading the entire collection into memory.
    # $avg ignores null values automatically, so no pre-filtering needed.
    risk_agg = await ExamSubmission.aggregate([
        {"$group": {
            "_id": None,
            "high_risk_count": {"$sum": {"$cond": [{"$eq": ["$risk_level", "HIGH"]}, 1, 0]}},
            "avg_anomaly_score": {"$avg": "$anomaly_score"}
        }}
    ]).to_list()
    high_risk_submissions = risk_agg[0]["high_risk_count"] if risk_agg else 0
    avg_anomaly_score = round(risk_agg[0]["avg_anomaly_score"] or 0, 1) if risk_agg else 0

    # Get recent submissions with student names
    recent_submissions = await ExamSubmission.find_all().sort("-submitted_at").limit(10).to_list()

    # Resolve user IDs to names
    user_ids = list(set(sub.user_id for sub in recent_submissions))
    users = await User.find({"_id": {"$in": [ObjectId(uid) for uid in user_ids if ObjectId.is_valid(uid)]}}).to_list()
    user_map = {str(u.id): u.username for u in users}

    return {
        "total_exams": total_exams,
        "total_students": total_students,
        "total_submissions": total_submissions,
        "high_risk_submissions": high_risk_submissions,
        "avg_anomaly_score": round(avg_anomaly_score, 1),
        "recent_submissions": [
            {
                "id": str(sub.id),
                "exam_title": sub.exam_title,
                "user_id": sub.user_id,
                "student_name": user_map.get(sub.user_id, "Unknown"),
                "submitted_at": sub.submitted_at,
                "status": sub.status,
                "score": sub.score,
                "anomaly_score": sub.anomaly_score,
                "risk_level": sub.risk_level
            }
            for sub in recent_submissions
        ]
    }


@router.get("/exams/{exam_id}/results")
async def get_exam_results(exam_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get all results for a specific exam, including behavioral biometrics."""
    exam = await Exam.get(exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    submissions = await ExamSubmission.find({"exam_id": exam_id}).to_list()
    
    # Fetch all behavior logs for this exam in one query
    behavior_logs = await BehaviorLog.find({"exam_id": exam_id}).to_list()
    behavior_map = {log.submission_id: log for log in behavior_logs}
    
    result_list = []
    for sub in submissions:
        sub_id = str(sub.id)
        behavior = behavior_map.get(sub_id)
        result_list.append({
            "id": sub_id,
            "user_id": sub.user_id,
            "submitted_at": sub.submitted_at,
            "status": sub.status,
            "score": sub.score,
            "anomaly_score": sub.anomaly_score,
            "risk_level": sub.risk_level,
            "behavior": {
                "keystroke_count": behavior.keystroke_count,
                "avg_typing_speed": behavior.avg_typing_speed,
                "backspace_ratio": behavior.backspace_ratio,
                "paste_count": behavior.paste_count,
                "pasted_chars": behavior.pasted_chars,
                "tab_switch_count": behavior.tab_switch_count,
                "mouse_click_count": behavior.mouse_click_count,
            } if behavior else None
        })
    
    return {
        "exam_id": exam_id,
        "exam_title": exam.title,
        "total_submissions": len(submissions),
        "submissions": result_list
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
