import pytest
from app.models.all_models import User
from app.core.security import verify_password

@pytest.mark.asyncio
async def test_register_user(client):
    response = await client.post(
        "/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    
    # Verify in DB
    user_in_db = await User.find_one(User.username == "newuser")
    assert user_in_db is not None
    assert verify_password("securepassword123", user_in_db.password_hash)

@pytest.mark.asyncio
async def test_register_duplicate_username(client, test_user):
    response = await client.post(
        "/auth/register",
        json={
            "username": test_user.username,
            "email": "different@example.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 400
    assert "Username already registered" in response.json()["detail"]

@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    response = await client.post(
        "/auth/register",
        json={
            "username": "differentusername",
            "email": test_user.email,
            "password": "securepassword123"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_success(client, test_user):
    response = await client.post(
        "/auth/token",
        data={
            "username": test_user.username,
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_wrong_password(client, test_user):
    response = await client.post(
        "/auth/token",
        data={
            "username": test_user.username,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    response = await client.post(
        "/auth/token",
        data={
            "username": "nobody",
            "password": "password123"
        }
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

@pytest.mark.asyncio
async def test_protected_route_without_token(client):
    # Trying to get exams without a token should fail
    response = await client.get("/exams/")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

@pytest.mark.asyncio
async def test_protected_route_with_token(client, user_token):
    # This might return 200 [] or another response, but shouldn't return 401
    response = await client.get("/exams/", headers=user_token)
    assert response.status_code in [200, 403] 
    # 403 could happen if there's assignment logic, but it means auth succeeded.
