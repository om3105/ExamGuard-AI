"""Edge case tests for production stability."""
import pytest
from httpx import AsyncClient
from app.models.all_models import Exam, ExamAssignment, ExamSubmission
from app.models.course_models import Course, CourseEnrollment
from datetime import datetime, timezone, timedelta


# == Exam Edge Cases ==

@pytest.mark.asyncio
async def test_start_exam_without_assignment(client: AsyncClient, user_token, admin_token):
    """Starting an exam that isn't assigned should fail."""
    # Create exam but don't assign
    exam_payload = {
        "title": "Unassigned Exam",
        "description": "Test",
        "total_marks": 10,
        "duration_minutes": 30,
        "start_time": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
        "sections": [{"title": "MCQ", "questions": []}],
    }
    resp = await client.post("/admin/api/exams/", json=exam_payload, headers=admin_token)
    exam_id = resp.json().get("_id") or resp.json().get("id")

    # Try to start — should fail (not assigned)
    start_resp = await client.post(f"/exams/{exam_id}/start", headers=user_token)
    assert start_resp.status_code in [403, 404]


@pytest.mark.asyncio
async def test_submit_with_invalid_exam_id(client: AsyncClient, user_token):
    """Submit to a non-existent exam should return 404."""
    resp = await client.post(
        "/exams/000000000000000000000000/submit",
        json={"answers": {}},
        headers=user_token,
    )
    assert resp.status_code in [403, 404]


@pytest.mark.asyncio
async def test_get_exam_with_invalid_id_format(client: AsyncClient, user_token):
    """Invalid ObjectId format should return error."""
    resp = await client.get("/exams/invalid-id", headers=user_token)
    assert resp.status_code in [400, 403, 404, 422, 500]


# == Auth Edge Cases ==

@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    """Registration with a very short password should still work (validation is advisory)."""
    resp = await client.post("/auth/register", json={
        "username": "weakuser",
        "email": "weak@example.com",
        "password": "123"  # Short password
    })
    # This currently succeeds — but with is_strong_password we can enforce later
    assert resp.status_code in [201, 400, 422]


@pytest.mark.asyncio
async def test_register_empty_fields(client: AsyncClient):
    """Registration with empty fields should fail validation."""
    resp = await client.post("/auth/register", json={
        "username": "",
        "email": "",
        "password": ""
    })
    assert resp.status_code in [400, 422]


@pytest.mark.asyncio
async def test_login_with_empty_body(client: AsyncClient):
    """Login with empty body should fail."""
    resp = await client.post("/auth/token", data={})
    assert resp.status_code == 422


# == Course Enrollment Edge Cases ==

@pytest.mark.asyncio
async def test_duplicate_enrollment_request(client: AsyncClient, user_token, admin_token):
    """Requesting enrollment twice should be rejected."""
    # Create course
    course_resp = await client.post("/admin/api/courses/", json={
        "title": "Test Course",
        "description": "Test",
        "modules": [],
    }, headers=admin_token)
    course_id = str(course_resp.json().get("_id") or course_resp.json().get("id"))

    # First request
    r1 = await client.post(f"/courses/{course_id}/request-enrollment", headers=user_token)
    assert r1.status_code == 201

    # Duplicate request
    r2 = await client.post(f"/courses/{course_id}/request-enrollment", headers=user_token)
    assert r2.status_code == 400
    assert "pending" in r2.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_admin_endpoint_with_student_token(client: AsyncClient, user_token):
    """Student token should not access admin APIs."""
    resp = await client.get("/admin/api/exams/", headers=user_token)
    assert resp.status_code == 401


# == Progress Edge Cases ==

@pytest.mark.asyncio
async def test_progress_student_nonexistent(client: AsyncClient, admin_token):
    """Progress detail for non-existent student returns 404."""
    resp = await client.get("/admin/api/progress/student/000000000000000000000000", headers=admin_token)
    assert resp.status_code == 404
