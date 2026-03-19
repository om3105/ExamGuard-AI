"""
monitoring_routes.py — Admin live exam session monitoring.

Provides real-time visibility into active exam sessions:
- GET /live        List all IN_PROGRESS sessions with behavior data + live risk score
- POST /{id}/terminate  Force-terminate a suspicious session

IMPORTANT: BehaviorLog lookup uses user_id + exam_id (NOT submission_id)
because the submission record exists from the start as IN_PROGRESS, but the
BehaviorLog is keyed by user_id + exam_id since that's what the frontend sends.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone
from app.models.all_models import ExamSubmission, BehaviorLog, User
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser
from app.services.anomaly_service import AnomalyService

router = APIRouter()

@router.get("/live")
async def get_live_sessions(current_admin: AdminUser = Depends(get_current_admin)):
    """
    Fetch all actively running exam sessions (IN_PROGRESS).
    Joins ExamSubmission with BehaviorLog using user_id + exam_id for reliable lookup.
    Includes live risk scoring and recent event timeline.
    """
    active_submissions = await ExamSubmission.find({"status": "IN_PROGRESS"}).to_list()
    
    live_data = []
    
    for sub in active_submissions:
        # Get student details
        student = await User.get(sub.user_id)
        student_name = student.username if student else "Unknown Student"
        student_email = student.email if student else ""
        
        # FIX: Look up BehaviorLog by user_id + exam_id (NOT submission_id)
        # The frontend sends behavior data keyed by user_id + exam_id
        log = await BehaviorLog.find_one(
            BehaviorLog.user_id == sub.user_id,
            BehaviorLog.exam_id == sub.exam_id,
        )
        
        # Calculate live risk score if we have behavior data
        risk_data = {"anomaly_score": 0, "risk_level": "LOW", "risk_factors": [], "risk_explanation": "No data yet."}
        if log:
            risk_data = AnomalyService._calculate_score(log)
        
        # Get last 10 events for timeline preview
        recent_events = []
        if log and log.events:
            recent_events = log.events[-10:]
        
        session_info = {
            "submission_id": str(sub.id),
            "exam_id": sub.exam_id,
            "exam_title": sub.exam_title,
            "user_id": sub.user_id,
            "student_name": student_name,
            "student_email": student_email,
            "started_at": sub.submitted_at,
            # Behavior Data
            "keystroke_count": log.keystroke_count if log else 0,
            "tab_switch_count": log.tab_switch_count if log else 0,
            "paste_count": log.paste_count if log else 0,
            "pasted_chars": log.pasted_chars if log else 0,
            "mouse_click_count": log.mouse_click_count if log else 0,
            "last_active": log.recorded_at if log else sub.submitted_at,
            # Live Risk Analysis
            "risk_score": risk_data["anomaly_score"],
            "risk_level": risk_data["risk_level"],
            "risk_factors": risk_data["risk_factors"],
            "risk_explanation": risk_data["risk_explanation"],
            # Recent Events Timeline
            "recent_events": recent_events,
            # Legacy field (kept for backward compat)
            "live_anomaly_warnings": [],
        }
        
        # Populate legacy warnings from risk factors
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
    Sets the submission status to TERMINATED. The frontend exam environment polls
    this and force-quits the user.
    
    NOTE: Risk score is set to 100 because admin-initiated termination implies
    the admin has already reviewed and decided to intervene.
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
    submission.anomaly_score = 100 
    submission.risk_level = "HIGH"
    submission.risk_factors = ["Session terminated by administrator"]
    submission.risk_explanation = "This session was manually terminated by an admin due to suspected integrity violation."
    
    await submission.save()
    
    return {"message": "Session successfully terminated", "submission_id": str(submission.id)}
