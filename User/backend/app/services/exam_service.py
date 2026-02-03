from datetime import datetime, timezone
from fastapi import HTTPException, status
from typing import List, Optional
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
