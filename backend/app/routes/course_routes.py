from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.course_models import Course, CourseEnrollment
from app.models.all_models import User
from app.core.security import get_current_user
from app.utils.datetime_utils import ensure_utc_isoformat

router = APIRouter()


@router.get("/")
async def list_available_courses(current_user: User = Depends(get_current_user)):
    """List all available courses for students, with enrollment status."""
    user_id = str(current_user.id)
    courses = await Course.find_all().to_list()

    # Fetch all enrollment records for this user in one query
    enrollments = await CourseEnrollment.find({"user_id": user_id}).to_list()
    enrollment_map = {e.course_id: e.status for e in enrollments}

    results = []
    for course in courses:
        course_dict = course.dict()
        course_dict["_id"] = str(course.id)
        course_dict["enrollment_status"] = enrollment_map.get(str(course.id), None)
        ensure_utc_isoformat(course_dict)
        results.append(course_dict)

    return results


@router.get("/{course_id}")
async def get_course_details(course_id: str, current_user: User = Depends(get_current_user)):
    """Get specific course details. Content gated by enrollment status."""
    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    user_id = str(current_user.id)
    enrollment = await CourseEnrollment.find_one({"user_id": user_id, "course_id": course_id})
    enrollment_status = enrollment.status if enrollment else None

    course_dict = course.dict()
    course_dict["_id"] = str(course.id)
    course_dict["enrollment_status"] = enrollment_status
    ensure_utc_isoformat(course_dict)

    # Only show full content if APPROVED
    if enrollment_status != "APPROVED":
        for module in course_dict.get('modules', []):
            for lesson in module.get('lessons', []):
                lesson['video_url'] = None
                lesson['notes_markdown'] = "Enroll to unlock course content."

    return course_dict


@router.post("/{course_id}/request-enrollment", status_code=status.HTTP_201_CREATED)
async def request_enrollment(course_id: str, current_user: User = Depends(get_current_user)):
    """Request enrollment in a course."""
    user_id = str(current_user.id)

    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Check if already has an enrollment record
    existing = await CourseEnrollment.find_one({"user_id": user_id, "course_id": course_id})
    if existing:
        if existing.status == "APPROVED":
            raise HTTPException(status_code=400, detail="Already enrolled")
        if existing.status == "PENDING":
            raise HTTPException(status_code=400, detail="Enrollment request already pending")
        # If REJECTED, allow re-request
        existing.status = "PENDING"
        existing.approved_by = None
        existing.approved_at = None
        await existing.save()
        return {"message": "Enrollment re-requested"}

    enrollment = CourseEnrollment(user_id=user_id, course_id=course_id)
    await enrollment.insert()
    return {"message": "Enrollment requested successfully"}


@router.post("/{course_id}/enroll", status_code=status.HTTP_200_OK)
async def enroll_course(course_id: str, current_user: User = Depends(get_current_user)):
    """Legacy enroll endpoint — now redirects to request-enrollment."""
    return await request_enrollment(course_id, current_user)
