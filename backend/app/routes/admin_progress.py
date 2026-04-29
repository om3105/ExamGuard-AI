"""Admin Progress Monitoring — aggregation APIs for student progress across courses, quizzes, coding, and exams."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List
from bson import ObjectId
from datetime import datetime, timezone
from app.utils.datetime_utils import IST

from app.models.all_models import User, Exam, ExamSubmission, ExamAssignment, BehaviorLog
from app.models.course_models import Course, CourseProgress, CourseEnrollment
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser
from app.utils.datetime_utils import ensure_utc_isoformat

router = APIRouter()


@router.get("/overview")
async def progress_overview(current_admin: AdminUser = Depends(get_current_admin)) -> Dict:
    """Summary metrics for the progress dashboard."""
    all_users = await User.find_all().to_list()
    total_students = len([u for u in all_users if u.deleted_at is None])
    total_courses = await Course.count()

    # Course progress aggregation
    all_progress = await CourseProgress.find_all().to_list()
    avg_completion = 0.0
    avg_quiz = 0.0
    avg_coding = 0.0
    quiz_scores_flat = []
    coding_scores_flat = []

    for p in all_progress:
        avg_completion += p.progress_percentage
        quiz_scores_flat.extend(p.quiz_scores.values())
        coding_scores_flat.extend(p.coding_scores.values())

    if all_progress:
        avg_completion = round(avg_completion / len(all_progress), 1)
    if quiz_scores_flat:
        avg_quiz = round(sum(quiz_scores_flat) / len(quiz_scores_flat), 1)
    if coding_scores_flat:
        avg_coding = round(sum(coding_scores_flat) / len(coding_scores_flat), 1)

    # Exam stats
    total_submissions = await ExamSubmission.find({"status": {"$in": ["COMPLETED", "GRADED"]}}).count()

    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "avg_course_completion": avg_completion,
        "avg_quiz_score": avg_quiz,
        "avg_coding_score": avg_coding,
        "total_exam_submissions": total_submissions,
    }


@router.get("/students")
async def progress_students(current_admin: AdminUser = Depends(get_current_admin)):
    """Student progress table — one row per student with aggregated metrics."""
    all_users = await User.find_all().to_list()
    students = [u for u in all_users if u.deleted_at is None]
    all_progress = await CourseProgress.find_all().to_list()
    all_submissions = await ExamSubmission.find_all().to_list()
    all_enrollments = await CourseEnrollment.find({"status": "APPROVED"}).to_list()
    courses = await Course.find_all().to_list()
    course_map = {str(c.id): c.title for c in courses}

    # Build lookup maps
    progress_by_user = {}
    for p in all_progress:
        progress_by_user.setdefault(p.user_id, []).append(p)

    subs_by_user = {}
    for s in all_submissions:
        subs_by_user.setdefault(s.user_id, []).append(s)

    enrolled_by_user = {}
    for e in all_enrollments:
        enrolled_by_user.setdefault(e.user_id, []).append(e.course_id)

    rows = []
    for student in students:
        uid = str(student.id)
        user_progress = progress_by_user.get(uid, [])
        user_subs = subs_by_user.get(uid, [])
        user_courses = enrolled_by_user.get(uid, [])

        # Course progress average
        course_pct = round(sum(p.progress_percentage for p in user_progress) / len(user_progress), 1) if user_progress else 0

        # Quiz average
        quiz_vals = []
        for p in user_progress:
            quiz_vals.extend(p.quiz_scores.values())
        quiz_avg = round(sum(quiz_vals) / len(quiz_vals), 1) if quiz_vals else 0

        # Coding average
        coding_vals = []
        for p in user_progress:
            coding_vals.extend(p.coding_scores.values())
        coding_avg = round(sum(coding_vals) / len(coding_vals), 1) if coding_vals else 0

        # Exam count
        completed_exams = [s for s in user_subs if s.status in ("COMPLETED", "GRADED")]

        # Last activity
        timestamps = [p.updated_at for p in user_progress if p.updated_at]
        timestamps += [s.submitted_at for s in user_subs if s.submitted_at]
        last_activity = max(timestamps) if timestamps else student.created_at

        # Alert flags
        alerts = []
        if quiz_avg > 0 and quiz_avg < 50:
            alerts.append("low_quiz")
        if course_pct > 0 and course_pct < 25:
            alerts.append("low_completion")
        if last_activity:
            days_inactive = (datetime.now(IST) - (last_activity.replace(tzinfo=IST) if last_activity.tzinfo is None else last_activity)).days
            if days_inactive > 7:
                alerts.append("inactive")

        row = {
            "_id": uid,
            "username": student.username,
            "email": student.email,
            "full_name": student.full_name or student.username,
            "college": student.college,
            "enrolled_courses": [course_map.get(cid, cid) for cid in user_courses],
            "course_progress_pct": course_pct,
            "quiz_avg": quiz_avg,
            "coding_avg": coding_avg,
            "exams_attempted": len(completed_exams),
            "last_activity": last_activity,
            "alerts": alerts,
        }
        ensure_utc_isoformat(row, ["last_activity"])
        rows.append(row)

    return rows


@router.get("/student/{student_id}")
async def progress_student_detail(student_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Full per-student progress report."""
    student = await User.get(student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    uid = str(student.id)

    # --- Course Progress ---
    progress_records = await CourseProgress.find({"user_id": uid}).to_list()
    courses = await Course.find_all().to_list()
    course_map = {str(c.id): c for c in courses}

    course_details = []
    for p in progress_records:
        course = course_map.get(p.course_id)
        total_lessons = sum(len(m.lessons) for m in course.modules) if course else 0
        course_details.append({
            "course_id": p.course_id,
            "course_title": course.title if course else "Unknown",
            "completed_lessons": len(p.completed_lessons),
            "total_lessons": total_lessons,
            "progress_percentage": p.progress_percentage,
            "quiz_scores": p.quiz_scores,
            "coding_scores": p.coding_scores,
            "last_activity": p.updated_at,
        })
        ensure_utc_isoformat(course_details[-1], ["last_activity"])

    # --- Quiz detail (resolve quiz names from courses) ---
    quiz_map = {}
    for c in courses:
        for m in c.modules:
            for q in m.quizzes:
                quiz_map[q.id] = {"title": q.title, "course": c.title, "total_questions": len(q.questions)}

    quiz_results = []
    for p in progress_records:
        for qid, score in p.quiz_scores.items():
            info = quiz_map.get(qid, {})
            quiz_results.append({
                "quiz_id": qid,
                "quiz_title": info.get("title", qid),
                "course": info.get("course", "Unknown"),
                "score": score,
                "total_questions": info.get("total_questions", 0),
            })

    # --- Coding detail (resolve problem names) ---
    problem_map = {}
    for c in courses:
        for m in c.modules:
            for prob in m.coding_problems:
                problem_map[prob.id] = {"title": prob.title, "course": c.title}

    coding_results = []
    for p in progress_records:
        for pid, score in p.coding_scores.items():
            info = problem_map.get(pid, {})
            coding_results.append({
                "problem_id": pid,
                "problem_title": info.get("title", pid),
                "course": info.get("course", "Unknown"),
                "score": score,
                "status": "Passed" if score >= 70 else "Failed",
            })

    # --- Exam History ---
    submissions = await ExamSubmission.find({"user_id": uid}).to_list()
    exam_history = []
    for sub in submissions:
        d = {
            "submission_id": str(sub.id),
            "exam_title": sub.exam_title,
            "attempt_number": sub.attempt_number,
            "status": sub.status,
            "score": sub.score,
            "mcq_score": sub.mcq_score,
            "coding_score": sub.coding_score,
            "anomaly_score": sub.anomaly_score,
            "risk_level": sub.risk_level,
            "submitted_at": sub.submitted_at,
        }
        ensure_utc_isoformat(d)
        exam_history.append(d)

    # --- Integrity Warnings ---
    high_risk = [s for s in submissions if s.risk_level == "HIGH"]
    behavior_logs = await BehaviorLog.find({"user_id": uid}).to_list()
    integrity_warnings = []
    for log in behavior_logs:
        if log.tab_switch_count > 3 or log.paste_count > 2:
            integrity_warnings.append({
                "exam_id": log.exam_id,
                "tab_switches": log.tab_switch_count,
                "paste_count": log.paste_count,
                "pasted_chars": log.pasted_chars,
            })

    resp = {
        "student": {
            "_id": uid,
            "username": student.username,
            "email": student.email,
            "full_name": student.full_name or student.username,
            "college": student.college,
            "course": student.course,
            "phone_number": student.phone_number,
            "created_at": student.created_at,
        },
        "course_progress": course_details,
        "quiz_results": quiz_results,
        "coding_results": coding_results,
        "exam_history": exam_history,
        "integrity_warnings": integrity_warnings,
        "high_risk_count": len(high_risk),
    }
    ensure_utc_isoformat(resp["student"], ["created_at"])
    return resp
