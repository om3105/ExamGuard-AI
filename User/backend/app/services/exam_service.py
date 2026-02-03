from datetime import datetime, timezone
from fastapi import HTTPException, status
from typing import List, Optional
import os
from app.models.all_models import Exam, ExamCreate, ExamSubmission

class ExamService:
    @staticmethod
    async def create_exam(exam_data: ExamCreate) -> Exam:
        """Create a new exam."""
        new_exam = Exam(
            title=exam_data.title,
            description=exam_data.description,
            sections=exam_data.sections,
            total_marks=exam_data.total_marks,
            duration_minutes=exam_data.duration_minutes,
            start_time=exam_data.start_time
        )
        await new_exam.insert()
        return new_exam

    @staticmethod
    async def get_all_exams() -> List[Exam]:
        """Get all available exams."""
        return await Exam.find_all().to_list()

    @staticmethod
    async def get_exam_by_id(exam_id: str) -> Exam:
        """Get a specific exam by ID."""
        exam = await Exam.get(exam_id)
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exam not found"
            )
        return exam

    @staticmethod
    async def submit_exam(exam_id: str, submission_data: dict, user_id: str) -> dict:
        """Submit exam answers."""
        # Validate exam exists
        exam = await Exam.get(exam_id)
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exam not found"
            )

        # Check for duplicate submission
        existing_submission = await ExamSubmission.find_one(
            ExamSubmission.user_id == user_id,
            ExamSubmission.exam_id == exam_id
        )
        
        if existing_submission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already submitted this exam"
            )
        
        # Create submission
        submission = ExamSubmission(
            user_id=user_id,
            exam_id=exam_id,
            exam_title=exam.title,
            answers=submission_data.get("answers", {}),
            submitted_at=datetime.now(timezone.utc)
        )
        
        await submission.insert()
        
        return {
            "submission_id": str(submission.id),
            "exam_title": submission.exam_title,
            "submitted_at": submission.submitted_at.isoformat()
        }

    @staticmethod
    async def get_submission(submission_id: str, user_id: Optional[str] = None) -> dict:
        """Get submission details."""
        submission = await ExamSubmission.get(submission_id)
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )

        if user_id and submission.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this submission"
            )
        
        return {
            "submission_id": str(submission.id),
            "exam_title": submission.exam_title,
            "submitted_at": submission.submitted_at.isoformat(),
            "status": submission.status
        }

    @staticmethod
    async def execute_code(source_code: str, language_id: int, stdin: str = "") -> dict:
        """Execute code using Judge0 API."""
        import httpx
        import os
        import base64

        judge0_url = os.getenv("JUDGE0_API_URL", "https://judge0-ce.p.rapidapi.com")
        # Note: If using RapidAPI, headers are needed. If self-hosted, they might differ.
        # For this implementation, we assume a standard Judge0 instance or RapidAPI with key in env.
        
        headers = {
            "Content-Type": "application/json",
        }
        
        api_key = os.getenv("JUDGE0_API_KEY")
        if api_key:
            headers["X-RapidAPI-Key"] = api_key
            headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"

        # Judge0 expects base64 encoded input if specified, but usually plain text works for source_code
        payload = {
            "source_code": source_code,
            "language_id": language_id,
            "stdin": stdin,
            "wait": "true" # specific for synchronous response
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{judge0_url}/submissions",
                    params={"base64_encoded": "false", "wait": "true"},
                    json=payload,
                    headers=headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Judge0 Error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Code execution service unavailable: {str(e)}"
                )
