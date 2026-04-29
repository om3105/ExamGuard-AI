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
    Proxy execution requests securely to Judge0 CE (free public instance).
    No API key required — uses https://ce.judge0.com directly.
    """
    JUDGE0_URL = os.getenv("JUDGE0_API_URL", "https://ce.judge0.com")

    headers = {
        "Content-Type": "application/json"
    }

    submit_payload = {
        "source_code": payload.source_code,
        "language_id": payload.language_id,
        "stdin": payload.stdin,
        "expected_output": payload.expected_output,
        "base64_encoded": False
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
            for _ in range(15):  # Max 15 seconds
                await asyncio.sleep(1)
                result_res = await client.get(
                    f"{JUDGE0_URL}/submissions/{token}?base64_encoded=false&fields=stdout,stderr,status,compile_output,time,memory",
                    headers=headers
                )
                result_res.raise_for_status()
                result_data = result_res.json()

                status_id = result_data.get("status", {}).get("id")

                if status_id >= 3:  # Execution finished
                    raw_stdout = result_data.get("stdout")
                    actual_output = raw_stdout.strip() if raw_stdout else ""
                    
                    raw_stderr = result_data.get("stderr")
                    stderr = raw_stderr.strip() if raw_stderr else ""
                    
                    raw_compile = result_data.get("compile_output")
                    compile_output = raw_compile.strip() if raw_compile else ""

                    expected_output = payload.expected_output.strip()

                    # Compare outputs ourselves — Judge0 status 3 = Accepted, 4 = Wrong Answer
                    # Both mean the code compiled and ran. We do our own comparison.
                    is_passed = False
                    if status_id in (3, 4):
                        # Normalize: strip whitespace, compare case-sensitively
                        if actual_output == expected_output:
                            is_passed = True
                    # Fallback for empty expected output (e.g. run without tests)
                    elif status_id == 3 and expected_output == "":
                        is_passed = True

                    return {
                        "input": payload.stdin,
                        "expected": expected_output,
                        "actual": actual_output,
                        "passed": is_passed,
                        "status": result_data.get("status", {}).get("description", "Unknown Error"),
                        "error": stderr or compile_output or None
                    }

            raise HTTPException(status_code=408, detail="Code execution timed out")

        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Judge0 API Error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Execution Error: {str(e)}")

