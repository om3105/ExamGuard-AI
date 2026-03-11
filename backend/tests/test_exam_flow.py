import pytest
from httpx import AsyncClient
from app.models.all_models import Exam, ExamAssignment, ExamSubmission
from datetime import datetime, timezone, timedelta

@pytest.mark.asyncio
async def test_create_exam_admin(client: AsyncClient, admin_token):
    exam_payload = {
        "title": "Data Structures Final",
        "description": "Comprehensive test on Trees and Graphs.",
        "total_marks": 10,
        "duration_minutes": 60,
        "start_time": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
        "sections": [
            {
                "title": "MCQ",
                "questions": [
                    {
                        "type": "mcq",
                        "text": "What is the time complexity of binary search?",
                        "points": 10,
                        "options": [
                            {"text": "O(n)", "is_correct": False},
                            {"text": "O(log n)", "is_correct": True}
                        ],
                        "correct_option_index": 1
                    }
                ]
            }
        ]
    }
    
    # Use the correct admin endpoint
    response = await client.post("/admin/api/exams/", json=exam_payload, headers=admin_token)
    assert response.status_code == 201
    
    exam_id = response.json().get("_id") or response.json().get("id")
    assert exam_id is not None
    return str(exam_id)

@pytest.mark.asyncio
async def test_assign_exam(client: AsyncClient, admin_token, test_user):
    exam_id = await test_create_exam_admin(client, admin_token)
    
    assign_payload = {
        "assigned_students": [str(test_user.id)],
        "max_attempts": 2
    }
    
    response = await client.post(f"/admin/api/exams/{exam_id}/assign", json=assign_payload, headers=admin_token)
    assert response.status_code == 200
    assert response.json()["message"] == "Exam assigned successfully"

@pytest.mark.asyncio
async def test_get_available_exams(client: AsyncClient, user_token, admin_token, test_user):
    # First assign an exam
    exam_id = await test_create_exam_admin(client, admin_token)
    
    await client.post(f"/admin/api/exams/{exam_id}/assign", json={
        "assigned_students": [str(test_user.id)],
        "max_attempts": 2
    }, headers=admin_token)
    
    response = await client.get("/exams/", headers=user_token)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["attempt_count"] == 0
    assert data[0]["max_attempts"] == 2

@pytest.mark.asyncio
async def test_start_and_submit_exam(client: AsyncClient, user_token, admin_token, test_user):
    # 1. Create & Assign
    exam_id = await test_create_exam_admin(client, admin_token)
    await client.post(f"/admin/api/exams/{exam_id}/assign", json={
        "assigned_students": [str(test_user.id)],
        "max_attempts": 1
    }, headers=admin_token)
    
    # 2. Start
    start_resp = await client.post(f"/exams/{exam_id}/start", headers=user_token)
    assert start_resp.status_code == 201
    submission_id = start_resp.json()["submission_id"]
    
    # 3. Submit
    submit_payload = {
        "answers": {
            "0": {
                "0": "1" # Selected correct option index 1
            }
        }
    }
    submit_resp = await client.post(
        f"/exams/{exam_id}/submit?submission_id={submission_id}", 
        json=submit_payload,
        headers=user_token
    )
    
    assert submit_resp.status_code == 201
    assert submit_resp.json()["submission_id"] == submission_id
    
    # 4. Verify Score
    sub = await ExamSubmission.get(submission_id)
    assert sub.status == "COMPLETED"
    assert sub.score == 10  # 10 points for the MCQ question

@pytest.mark.asyncio
async def test_exceed_attempts_blocked(client: AsyncClient, user_token, admin_token, test_user):
    # Create & Assign with max_attempts = 1
    exam_id = await test_create_exam_admin(client, admin_token)
    await client.post(f"/admin/api/exams/{exam_id}/assign", json={
        "assigned_students": [str(test_user.id)],
        "max_attempts": 1
    }, headers=admin_token)
    
    # 1st attempt
    start_resp1 = await client.post(f"/exams/{exam_id}/start", headers=user_token)
    assert start_resp1.status_code == 201
    sub_id = start_resp1.json()["submission_id"]
    
    # Submit 1st attempt
    await client.post(f"/exams/{exam_id}/submit?submission_id={sub_id}", json={"answers": {}}, headers=user_token)
    
    # 2nd attempt should fail
    start_resp2 = await client.post(f"/exams/{exam_id}/start", headers=user_token)
    assert start_resp2.status_code == 400
    assert "Maximum attempts reached" in start_resp2.json()["detail"]
