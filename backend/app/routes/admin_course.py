"""
admin_course.py — Admin course CRUD endpoints.

Allows administrators to create, update, and delete courses
with their modules, lessons, quizzes, and coding problems.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.course_models import Course, CourseCreate
from app.models.admin_models import AdminUser
from app.routes.admin_auth import get_current_admin

router = APIRouter()

@router.post("/", response_model=Course, status_code=status.HTTP_201_CREATED)
async def create_course(course_data: CourseCreate, current_admin: AdminUser = Depends(get_current_admin)):
    """Create a new course"""
    course = Course(
        title=course_data.title,
        description=course_data.description,
        thumbnail_url=course_data.thumbnail_url,
        modules=course_data.modules,
        instructor_id=str(current_admin.id),
        enrolled_students=[]
    )
    await course.insert()
    return course

@router.get("/", response_model=List[Course])
async def get_all_courses(current_admin: AdminUser = Depends(get_current_admin)):
    """Get all courses"""
    return await Course.find_all().to_list()

@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get a specific course"""
    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=Course)
async def update_course(course_id: str, course_data: CourseCreate, current_admin: AdminUser = Depends(get_current_admin)):
    """Update a course (preserves enrolled_students and instructor_id)"""
    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    course.title = course_data.title
    course.description = course_data.description
    course.thumbnail_url = course_data.thumbnail_url
    course.modules = course_data.modules
    # Preserve enrolled_students and instructor_id — do NOT overwrite
    
    await course.save()
    return course

@router.delete("/{course_id}")
async def delete_course(course_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Delete a course"""
    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    await course.delete()
    return {"message": "Course deleted successfully"}
