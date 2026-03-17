"""
monitoring_routes.py — Admin live exam session monitoring.

Provides real-time visibility into active exam sessions:
- GET /live        List all IN_PROGRESS sessions with behavior data
- POST /{id}/terminate  Force-terminate a suspicious session
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone
# Import models
from app.models.all_models import ExamSubmission, BehaviorLog, User
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser

router = APIRouter()

@router.get("/live")
async def get_live_sessions(current_admin: AdminUser = Depends(get_current_admin)):
    """
    Fetch all actively running exam sessions (IN_PROGRESS).
    Joins the ExamSubmission data with the latest BehaviorLog data for real-time monitoring.
    """
    # 1. Get all IN_PROGRESS submissions
    active_submissions = await ExamSubmission.find({"status": "IN_PROGRESS"}).to_list()
    
    live_data = []
    
    for sub in active_submissions:
        # Get the student details
        student = await User.get(sub.user_id)
        student_name = student.username if student else "Unknown Student"
        student_email = student.email if student else ""
        
        # Get the latest behavior log for this submission
        log = await BehaviorLog.find_one({"submission_id": str(sub.id)})
        
        session_info = {
            "submission_id": str(sub.id),
            "exam_id": sub.exam_id,
            "exam_title": sub.exam_title,
            "user_id": sub.user_id,
            "student_name": student_name,
            "student_email": student_email,
            "started_at": sub.submitted_at, # Note: using submitted_at as start_time when IN_PROGRESS
            # Behavior Data
            "keystroke_count": log.keystroke_count if log else 0,
            "tab_switch_count": log.tab_switch_count if log else 0,
            "paste_count": log.paste_count if log else 0,
            "mouse_click_count": log.mouse_click_count if log else 0,
            "last_active": log.recorded_at if log else sub.submitted_at,
            # We calculate a rough live anomaly threshold based on critical markers
            "live_anomaly_warnings": []
        }
        
        # Simple thresholding for live warnings
        if log:
            if log.tab_switch_count > 3:
                session_info["live_anomaly_warnings"].append("High Tab Switches")
            if log.paste_count > 0:
                session_info["live_anomaly_warnings"].append("Pasting Detected")
                
        live_data.append(session_info)
        
    return live_data

@router.post("/{submission_id}/terminate")
async def terminate_session(submission_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """
    Force a live session to terminate immediately.
    Sets the submission status to TERMINATED. The frontend exam environment should poll
    this and force-quit the user.
    """
    submission = await ExamSubmission.get(submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active exam session not found"
        )
        
    if submission.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot terminate a session in '{submission.status}' state."
        )
        
    submission.status = "TERMINATED"
    # Can also assign a max anomaly score or flag
    submission.anomaly_score = 100 
    submission.risk_level = "HIGH"
    
    await submission.save()
    
    return {"message": "Session successfully terminated", "submission_id": str(submission.id)}
