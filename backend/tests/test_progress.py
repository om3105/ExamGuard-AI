"""Tests for the admin progress monitoring APIs."""
import pytest
from httpx import AsyncClient
from app.models.all_models import Exam, ExamAssignment, ExamSubmission
from app.models.course_models import Course, CourseProgress, CourseEnrollment
from datetime import datetime, timezone, timedelta


@pytest.mark.asyncio
async def test_progress_overview(client: AsyncClient, admin_token):
    """GET /admin/api/progress/overview returns summary metrics."""
    response = await client.get("/admin/api/progress/overview", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert "total_students" in data
    assert "total_courses" in data
    assert "avg_course_completion" in data
    assert "avg_quiz_score" in data
    assert "avg_coding_score" in data


@pytest.mark.asyncio
async def test_progress_students(client: AsyncClient, admin_token, test_user):
    """GET /admin/api/progress/students returns student progress rows."""
    response = await client.get("/admin/api/progress/students", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1  # at least the test_user

    student_row = next((s for s in data if s["username"] == test_user.username), None)
    assert student_row is not None
    assert "course_progress_pct" in student_row
    assert "quiz_avg" in student_row
    assert "coding_avg" in student_row
    assert "exams_attempted" in student_row
    assert "alerts" in student_row


@pytest.mark.asyncio
async def test_progress_student_detail(client: AsyncClient, admin_token, test_user):
    """GET /admin/api/progress/student/{id} returns full detail."""
    response = await client.get(f"/admin/api/progress/student/{test_user.id}", headers=admin_token)
    assert response.status_code == 200
    data = response.json()
    assert "student" in data
    assert data["student"]["username"] == test_user.username
    assert "course_progress" in data
    assert "quiz_results" in data
    assert "coding_results" in data
    assert "exam_history" in data
    assert "integrity_warnings" in data


@pytest.mark.asyncio
async def test_progress_student_detail_not_found(client: AsyncClient, admin_token):
    """GET /admin/api/progress/student/{bad_id} returns 404."""
    response = await client.get("/admin/api/progress/student/000000000000000000000000", headers=admin_token)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_progress_overview_unauthorized(client: AsyncClient):
    """Progress endpoints require admin authentication."""
    response = await client.get("/admin/api/progress/overview")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_progress_with_course_data(client: AsyncClient, admin_token, test_user):
    """Test progress with actual course progress data populated."""
    # Create a course
    course = Course(title="Test Course", description="Test", instructor_id="admin", modules=[])
    await course.insert()

    # Create progress record
    progress = CourseProgress(
        user_id=str(test_user.id),
        course_id=str(course.id),
        completed_lessons=["lesson1", "lesson2"],
        quiz_scores={"quiz1": 85},
        coding_scores={"prob1": 100},
        progress_percentage=40.0,
    )
    await progress.insert()

    # Check overview reflects the data
    response = await client.get("/admin/api/progress/overview", headers=admin_token)
    data = response.json()
    assert data["avg_course_completion"] > 0
    assert data["avg_quiz_score"] > 0

    # Check student detail
    detail_resp = await client.get(f"/admin/api/progress/student/{test_user.id}", headers=admin_token)
    detail = detail_resp.json()
    assert len(detail["course_progress"]) == 1
    assert detail["course_progress"][0]["progress_percentage"] == 40.0
    assert len(detail["quiz_results"]) >= 1
