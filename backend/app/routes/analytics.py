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
from app.utils.datetime_utils import ensure_utc_isoformat

router = APIRouter()

@router.get("/overview")
async def get_dashboard_overview(current_admin: AdminUser = Depends(get_current_admin)) -> Dict:
    """Get dashboard overview statistics"""
    total_exams = await Exam.count()
    all_users = await User.find_all().to_list()
    total_students = len([u for u in all_users if u.deleted_at is None])
    total_submissions = await ExamSubmission.count()
    
    # Use targeted queries instead of loading all submissions into memory
    high_risk_submissions = await ExamSubmission.find({"risk_level": "HIGH"}).count()
    
    # MongoDB aggregation for average anomaly score
    # Use the Motor collection directly to avoid Beanie cursor compatibility issues
    collection = ExamSubmission.get_pymongo_collection()
    pipeline = [
        {"$match": {"anomaly_score": {"$ne": None}}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$anomaly_score"}}}
    ]
    agg_result = await collection.aggregate(pipeline).to_list(length=1)
    avg_anomaly_score = round(agg_result[0]["avg_score"], 1) if agg_result else 0
    
    # Get recent submissions with student names (only 10 — bounded)
    recent_submissions = await ExamSubmission.find_all().sort("-submitted_at").limit(10).to_list()

    # Batch-fetch user names instead of N+1 queries
    user_ids = list(set(sub.user_id for sub in recent_submissions))
    users = await User.find({"_id": {"$in": [ObjectId(uid) for uid in user_ids if len(uid) == 24]}}).to_list()
    user_map = {str(u.id): u.username for u in users}

    submissions_data = []
    for sub in recent_submissions:
        d = {
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
        ensure_utc_isoformat(d, ["submitted_at"])
        submissions_data.append(d)

    return {
        "total_exams": total_exams,
        "total_students": total_students,
        "total_submissions": total_submissions,
        "high_risk_submissions": high_risk_submissions,
        "avg_anomaly_score": avg_anomaly_score,
        "recent_submissions": submissions_data
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
    # Build lookup maps: by submission_id AND by user_id (fallback)
    behavior_by_submission = {log.submission_id: log for log in behavior_logs if log.submission_id}
    behavior_by_user = {log.user_id: log for log in behavior_logs}
    
    result_list = []
    for sub in submissions:
        sub_id = str(sub.id)
        # Try submission_id first, then fall back to user_id
        behavior = behavior_by_submission.get(sub_id) or behavior_by_user.get(sub.user_id)
        d = {
            "id": sub_id,
            "user_id": sub.user_id,
            "submitted_at": sub.submitted_at,
            "status": sub.status,
            "score": sub.score,
            "mcq_score": sub.mcq_score,
            "coding_score": sub.coding_score,
            "answers": sub.answers,
            "anomaly_score": sub.anomaly_score,
            "risk_level": sub.risk_level,
            "risk_factors": sub.risk_factors if hasattr(sub, 'risk_factors') else [],
            "risk_explanation": sub.risk_explanation if hasattr(sub, 'risk_explanation') else None,
            "behavior": {
                "keystroke_count": behavior.keystroke_count,
                "avg_typing_speed": behavior.avg_typing_speed,
                "backspace_ratio": behavior.backspace_ratio,
                "paste_count": behavior.paste_count,
                "pasted_chars": behavior.pasted_chars,
                "tab_switch_count": behavior.tab_switch_count,
                "mouse_click_count": behavior.mouse_click_count,
            } if behavior else None
        }
        ensure_utc_isoformat(d, ["submitted_at"])
        result_list.append(d)
    
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
    
    history = []
    for sub in submissions:
        d = {
            "exam_title": sub.exam_title,
            "submitted_at": sub.submitted_at,
            "score": sub.score,
            "status": sub.status
        }
        ensure_utc_isoformat(d, ["submitted_at"])
        history.append(d)

    return {
        "student_id": student_id,
        "username": student.username,
        "total_exams_attempted": len(submissions),
        "submissions": history
    }
