from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.utils.datetime_utils import IST
from app.models.course_models import CourseEnrollment, Course
from app.models.all_models import User
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser

router = APIRouter()


class StudentCourseRequest(BaseModel):
    user_id: str


@router.get("/enrollments")
async def get_enrollment_requests(status_filter: Optional[str] = None, current_admin: AdminUser = Depends(get_current_admin)):
    """Get all enrollment requests, optionally filtered by status."""
    query = {}
    if status_filter:
        query["status"] = status_filter.upper()

    enrollments = await CourseEnrollment.find(query).sort("-requested_at").to_list()

    # Batch-fetch all users and courses in 2 queries instead of N+1
    user_ids = list(set(e.user_id for e in enrollments))
    course_ids = list(set(e.course_id for e in enrollments))

    users = await User.find({"_id": {"$in": [ObjectId(uid) for uid in user_ids if len(uid) == 24]}}).to_list()
    courses = await Course.find({"_id": {"$in": [ObjectId(cid) for cid in course_ids if len(cid) == 24]}}).to_list()

    user_map = {str(u.id): u for u in users}
    course_map = {str(c.id): c for c in courses}

    results = []
    for enroll in enrollments:
        student = user_map.get(enroll.user_id)
        course = course_map.get(enroll.course_id)
        
        student_name = "Unknown User"
        if student:
            student_name = student.username
            if getattr(student, "deleted_at", None) is not None:
                student_name += " (Deleted)"
                
        course_title = course.title if course else "Unknown Course"
        
        results.append({
            "id": str(enroll.id),
            "user_id": enroll.user_id,
            "course_id": enroll.course_id,
            "student_name": student_name,
            "course_title": course_title,
            "status": enroll.status,
            "requested_at": enroll.requested_at,
            "approved_by": enroll.approved_by,
            "approved_at": enroll.approved_at
        })
    return results


@router.post("/enrollments/{enrollment_id}/approve")
async def approve_enrollment(enrollment_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Approve an enrollment request."""
    enrollment = await CourseEnrollment.get(enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment request not found")

    enrollment.status = "APPROVED"
    enrollment.approved_by = str(current_admin.id)
    enrollment.approved_at = datetime.now(IST)
    await enrollment.save()

    # Add student to course's enrolled_students list
    course = await Course.get(enrollment.course_id)
    if course and enrollment.user_id not in course.enrolled_students:
        course.enrolled_students.append(enrollment.user_id)
        await course.save()

    return {"message": "Enrollment approved"}


@router.post("/enrollments/{enrollment_id}/reject")
async def reject_enrollment(enrollment_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Reject an enrollment request."""
    enrollment = await CourseEnrollment.get(enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment request not found")

    enrollment.status = "REJECTED"
    enrollment.approved_by = str(current_admin.id)
    enrollment.approved_at = datetime.now(IST)
    await enrollment.save()

    return {"message": "Enrollment rejected"}


@router.post("/courses/{course_id}/add-student")
async def add_student_to_course(course_id: str, data: StudentCourseRequest, current_admin: AdminUser = Depends(get_current_admin)):
    """Manually enroll a student in a course (admin action)."""
    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    student = await User.get(data.user_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    # Check if enrollment record already exists
    existing = await CourseEnrollment.find_one({"user_id": data.user_id, "course_id": course_id})
    if existing:
        existing.status = "APPROVED"
        existing.approved_by = str(current_admin.id)
        existing.approved_at = datetime.now(IST)
        await existing.save()
    else:
        enrollment = CourseEnrollment(
            user_id=data.user_id,
            course_id=course_id,
            status="APPROVED",
            approved_by=str(current_admin.id),
            approved_at=datetime.now(IST)
        )
        await enrollment.insert()

    # Add to enrolled_students
    if data.user_id not in course.enrolled_students:
        course.enrolled_students.append(data.user_id)
        await course.save()

    return {"message": f"Student added to course"}


@router.delete("/courses/{course_id}/remove-student")
async def remove_student_from_course(course_id: str, data: StudentCourseRequest, current_admin: AdminUser = Depends(get_current_admin)):
    """Remove a student from a course."""
    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Remove from enrolled_students
    if data.user_id in course.enrolled_students:
        course.enrolled_students.remove(data.user_id)
        await course.save()

    # Update enrollment record
    enrollment = await CourseEnrollment.find_one({"user_id": data.user_id, "course_id": course_id})
    if enrollment:
        await enrollment.delete()

    return {"message": "Student removed from course"}
