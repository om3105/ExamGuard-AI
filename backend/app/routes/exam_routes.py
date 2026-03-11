"""
exam_routes.py — Student-facing exam endpoints.

Handles the student exam lifecycle:
- GET /             List exams assigned to the current student
- GET /{id}         Get exam details (questions, sections)
- POST /{id}/start  Create an IN_PROGRESS submission session
- POST /{id}/submit Submit answers and trigger grading
- POST /execute     Proxy code execution requests to Judge0

The /execute endpoint acts as a secure proxy so the frontend
never needs direct access to the Judge0 API key.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List
import os
import httpx
import asyncio

from app.models.all_models import Exam, ExamCreate, User
from app.core.security import get_current_user
from app.services.exam_service import ExamService

router = APIRouter()

@router.get("/")
async def get_all_exams(current_user: User = Depends(get_current_user)):
    """
    Get all available exams.
    """
    return await ExamService.get_all_exams(str(current_user.id))

@router.get("/{exam_id}")
async def get_exam(exam_id: str, current_user: User = Depends(get_current_user)):
    """
    Get a specific exam by ID.
    """
    return await ExamService.get_exam_by_id(exam_id, str(current_user.id))

@router.post("/{exam_id}/start", status_code=status.HTTP_201_CREATED)
async def start_exam(
    exam_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Called when a user begins an exam to create an active IN_PROGRESS session.
    """
    user_id = str(current_user.id)
    return await ExamService.start_session(exam_id, user_id)

@router.post("/{exam_id}/submit", status_code=status.HTTP_201_CREATED)
async def submit_exam(
    exam_id: str,
    submission_data: dict,
    submission_id: str = None, # Optional query param
    current_user: User = Depends(get_current_user)
):
    """
    Submit exam answers and create submission record.
    Request body: {"answers": {section_index: {question_index: answer}}}
    """
    user_id = str(current_user.id)
    return await ExamService.submit_exam(exam_id, submission_data, user_id, submission_id)

@router.get("/submissions/{submission_id}")
async def get_submission(submission_id: str, current_user: User = Depends(get_current_user)):
    """
    Get submission details for the completion page.
    """
    return await ExamService.get_submission(submission_id, user_id=str(current_user.id))

# --- Judge0 Code Execution Proxy ---
class CodeExecutionRequest(BaseModel):
    source_code: str
    language_id: int
    stdin: str = ""
    expected_output: str = ""

@router.post("/execute")
async def execute_code(
    payload: CodeExecutionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Proxy execution requests securely to Judge0 so the frontend doesn't need the API key.
    """
    JUDGE0_URL = os.getenv("JUDGE0_URL", "https://judge0-ce.p.rapidapi.com")
    RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")
    RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "judge0-ce.p.rapidapi.com")

    headers = {
        "content-type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }

    submit_payload = {
        "source_code": payload.source_code,
        "language_id": payload.language_id,
        "stdin": payload.stdin,
        "expected_output": payload.expected_output
    }

    async with httpx.AsyncClient() as client:
        try:
            # 1. Submit Code
            response = await client.post(
                f"{JUDGE0_URL}/submissions?base64_encoded=false&wait=false",
                json=submit_payload,
                headers=headers
            )
            response.raise_for_status()
            token = response.json().get("token")

            if not token:
                raise HTTPException(status_code=500, detail="Failed to get execution token from Judge0")

            # 2. Poll for Result
            for _ in range(15): # Max 15 seconds
                await asyncio.sleep(1)
                result_res = await client.get(
                    f"{JUDGE0_URL}/submissions/{token}?base64_encoded=false",
                    headers=headers
                )
                result_res.raise_for_status()
                result_data = result_res.json()

                status_id = result_data.get("status", {}).get("id")
                
                if status_id >= 3: # 3 = Accepted, 4 = Wrong Answer, etc. (Finished states)
                    actual_output = (result_data.get("stdout") or "").strip()
                    expected_output = payload.expected_output.strip()
                    
                    # Judge0 usually checks output if expected_output is provided, but we verify here
                    is_passed = (actual_output == expected_output) if expected_output else True

                    return {
                        "input": payload.stdin,
                        "expected": expected_output,
                        "actual": actual_output,
                        "passed": is_passed,
                        "status": result_data.get("status", {}).get("description"),
                        "error": result_data.get("stderr") or result_data.get("compile_output")
                    }

            raise HTTPException(status_code=408, detail="Code execution timed out")

        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Judge0 API Error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Execution Error: {str(e)}")
