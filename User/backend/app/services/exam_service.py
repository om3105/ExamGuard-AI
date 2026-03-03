from datetime import datetime, timezone
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.all_models import Exam, ExamCreate, ExamSubmission
from app.services.anomaly_service import AnomalyService

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
        
        # Calculate Score
        total_score = 0
        user_answers = submission.answers
        
        for section_idx, section in enumerate(exam.sections):
            for question_idx, question in enumerate(section.questions):
                # Check if user answered this question
                s_idx_str = str(section_idx)
                q_idx_str = str(question_idx)
                
                if s_idx_str in user_answers and q_idx_str in user_answers[s_idx_str]:
                    user_answer = user_answers[s_idx_str][q_idx_str]
                    
                    if question.type == 'mcq':
                        # Check correctness
                        is_correct = False
                        
                        # Method 1: correct_option_index
                        if question.correct_option_index is not None:
                            if int(user_answer) == question.correct_option_index:
                                is_correct = True
                        # Method 2: is_correct flag in options
                        elif question.options:
                            try:
                                selected_opt_idx = int(user_answer)
                                if 0 <= selected_opt_idx < len(question.options):
                                    if question.options[selected_opt_idx].is_correct:
                                        is_correct = True
                            except (ValueError, IndexError):
                                pass
                                
                        if is_correct:
                            total_score += question.points
                            
        submission.score = total_score
        submission.status = "COMPLETED"
        
        await submission.insert()

        # Run anomaly detection (non-blocking — errors logged silently)
        try:
            await AnomalyService.score_submission(str(submission.id))
        except Exception as e:
            print(f"[AnomalyService] Scoring failed for {submission.id}: {e}")
        
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
