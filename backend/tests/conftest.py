import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from fastapi.testclient import TestClient
import asyncio
from typing import AsyncGenerator
import os

from app.main import app
from app.models.all_models import User, Exam, ExamSubmission, BehaviorLog, ExamAssignment
from app.models.admin_models import AdminUser
from app.models.course_models import Course, CourseProgress, CourseEnrollment
from app.core.security import get_password_hash as get_user_hash, create_access_token as create_user_token
from app.core.admin_security import hash_password as get_admin_hash, create_admin_access_token

# Test database URL
TEST_DB_URL = os.getenv("TEST_MONGODB_URL", "mongodb://localhost:27017")
TEST_DB_NAME = "examguard_test_db"

# Ensure we use an async event loop for tests
@pytest_asyncio.fixture(autouse=True)
async def db_setup():
    """Initialize database connection and Beanie models for each test."""
    client = AsyncIOMotorClient(TEST_DB_URL)
    database = client[TEST_DB_NAME]
    
    await init_beanie(
        database=database,
        document_models=[
            AdminUser, User, Exam, ExamSubmission, 
            BehaviorLog, ExamAssignment, Course, 
            CourseProgress, CourseEnrollment
        ]
    )
    
    # Clear collections before test
    await User.delete_all()
    await AdminUser.delete_all()
    await Exam.delete_all()
    await ExamSubmission.delete_all()
    await ExamAssignment.delete_all()
    await Course.delete_all()
    await CourseEnrollment.delete_all()
    
    yield
    
    # We don't drop the DB between tests here to save time,
    # but we could drop it at the very end of all tests.

from httpx import AsyncClient, ASGITransport

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Provide an async test client pointing to the ASGI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def test_user():
    """Fixture to provide an existing user in the DB."""
    user = User(
        username="teststudent",
        email="student@test.com",
        password_hash=get_user_hash("password123")
    )
    await user.insert()
    return user

@pytest_asyncio.fixture
async def test_admin():
    """Fixture to provide an existing admin in the DB."""
    admin = AdminUser(
        username="testadmin",
        email="admin@test.com",
        password_hash=get_admin_hash("admin123"),
        full_name="Test Admin",
        role="admin"
    )
    await admin.insert()
    return admin

@pytest_asyncio.fixture
async def user_token(test_user):
    """Fixture to provide a valid JWT auth header for a student."""
    token = create_user_token(data={"sub": test_user.username})
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture
async def admin_token(test_admin):
    """Fixture to provide a valid JWT auth header for an admin."""
    token = create_admin_access_token(data={"sub": test_admin.username, "id": str(test_admin.id)})
    return {"Authorization": f"Bearer {token}"}
