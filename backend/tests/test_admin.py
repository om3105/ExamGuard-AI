import pytest
from httpx import AsyncClient
from app.models.all_models import User
from app.models.admin_models import AdminUser
from app.models.course_models import Course, CourseEnrollment

@pytest.mark.asyncio
async def test_admin_register_success(client: AsyncClient, admin_token, test_admin):
    # Admin registration requires an existing admin token
    response = await client.post(
        "/admin/api/auth/register",
        json={
            "username": "newadmin",
            "email": "newadmin@example.com",
            "password": "strongpassword123",
            "full_name": "New Admin",
            "role": "admin"
        },
        headers=admin_token
    )
    assert response.status_code == 201
    
    # Verify in DB
    admin_in_db = await AdminUser.find_one(AdminUser.username == "newadmin")
    assert admin_in_db is not None
    assert admin_in_db.email == "newadmin@example.com"

@pytest.mark.asyncio
async def test_admin_register_unauthorized(client: AsyncClient):
    # Trying to register admin without token should fail
    response = await client.post(
        "/admin/api/auth/register",
        json={
            "username": "hacker",
            "email": "hacker@example.com",
            "password": "password",
            "full_name": "Hacker",
            "role": "admin"
        }
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_admin_login(client: AsyncClient, test_admin):
    response = await client.post(
        "/admin/api/auth/login",
        json={
            "username": test_admin.username,
            "password": "admin123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

@pytest.mark.asyncio
async def test_create_and_delete_student(client: AsyncClient, admin_token):
    # Create student
    create_resp = await client.post(
        "/admin/api/students/",
        json={
            "username": "tempstudent",
            "email": "temp@example.com",
            "password": "temppassword"
        },
        headers=admin_token
    )
    assert create_resp.status_code == 200
    student_id = create_resp.json()["id"]
    
    # Delete student
    delete_resp = await client.delete(f"/admin/api/students/{student_id}", headers=admin_token)
    assert delete_resp.status_code == 200
    
    # Verify deletion
    user_in_db = await User.get(student_id)
    assert user_in_db is None

@pytest.mark.asyncio
async def test_course_enrollment_flow(client: AsyncClient, admin_token, user_token, test_user):
    # 1. Admin creates course
    course_payload = {
        "title": "Intro to Python",
        "description": "Learn python basics",
        "instructor": "Admin",
        "modules": []
    }
    course_resp = await client.post("/admin/api/courses/", json=course_payload, headers=admin_token)
    assert course_resp.status_code == 201
    course_id = str(course_resp.json().get("_id") or course_resp.json().get("id"))
    
    # 2. Student requests enrollment
    enroll_resp = await client.post(f"/courses/{course_id}/request-enrollment", headers=user_token)
    assert enroll_resp.status_code == 201
    
    # 3. Admin views pending requests
    pending_resp = await client.get("/admin/api/enrollments?status_filter=pending", headers=admin_token)
    assert pending_resp.status_code == 200
    pending_list = pending_resp.json()
    assert len(pending_list) >= 1
    
    request_id = str(pending_list[0].get("_id") or pending_list[0].get("id"))
    
    # 4. Admin approves request
    approve_resp = await client.post(f"/admin/api/enrollments/{request_id}/approve", headers=admin_token)
    assert approve_resp.status_code == 200
    
    # 5. Verify student can access course
    student_course_resp = await client.get(f"/courses/{course_id}", headers=user_token)
    assert student_course_resp.status_code == 200
    assert student_course_resp.json()["enrollment_status"] == "APPROVED"
