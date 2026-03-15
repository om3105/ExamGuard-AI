"""
exam_service.py — Core exam business logic.

Handles the complete exam lifecycle:
- create_exam()     Create a new exam document
- get_all_exams()   List exams assigned to a student (with attempt counts)
- get_exam_by_id()  Get full exam details for taking
- start_session()   Create or reconnect to an IN_PROGRESS submission
- submit_exam()   Grade MCQ answers, calculate scores, trigger anomaly scoring
- get_submission()  Retrieve completed submission details

Attempt control logic:
  1. Check exam start_time has passed
  2. Count COMPLETED/GRADED submissions (not IN_PROGRESS)
  3. Block if count >= max_attempts from ExamAssignment
  4. Reconnect to existing IN_PROGRESS session if one exists
"""
from datetime import datetime, timezone
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.all_models import Exam, ExamCreate, ExamSubmission, ExamAssignment
from app.services.anomaly_service import AnomalyService
from app.utils.datetime_utils import ensure_utc_isoformat
from app.core.logging_config import get_logger
from bson import ObjectId

logger = get_logger("exam")

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
    async def get_all_exams(user_id: str) -> List[dict]:
        """Get all available exams assigned to the user."""
        assignments = await ExamAssignment.find(
            {"assigned_students": user_id}
        ).to_list()
        
        assigned_exam_ids = [a.exam_id for a in assignments]
        
        # If admin hasn't created any assignments, standard behavior: no exams visible.
        if not assigned_exam_ids:
            return []
            
        exams = await Exam.find({"_id": {"$in": [ObjectId(eid) for eid in assigned_exam_ids]}}).to_list()

        # Fetch attempt counts for all exams in a single aggregation instead of one query per exam
        exam_ids_str = [str(exam.id) for exam in exams]
        agg_result = await ExamSubmission.aggregate([
            {"$match": {"user_id": user_id, "exam_id": {"$in": exam_ids_str}, "status": {"$in": ["COMPLETED", "GRADED"]}}},
            {"$group": {"_id": "$exam_id", "count": {"$sum": 1}}}
        ]).to_list()
        attempt_counts = {item["_id"]: item["count"] for item in agg_result}

        # Build lookup map for O(1) assignment access
        assignment_map = {a.exam_id: a for a in assignments}

        results = []
        for exam in exams:
            assignment = assignment_map.get(str(exam.id))
            max_attempts = assignment.max_attempts if assignment else 1
            attempt_count = attempt_counts.get(str(exam.id), 0)

            exam_dict = exam.dict()
            exam_dict["_id"] = str(exam.id)
            exam_dict["max_attempts"] = max_attempts
            exam_dict["attempt_count"] = attempt_count
            exam_dict["is_blocked"] = attempt_count >= max_attempts and max_attempts != 0
            ensure_utc_isoformat(exam_dict)

            results.append(exam_dict)

        return results

    @staticmethod
    async def get_exam_by_id(exam_id: str, user_id: str) -> dict:
        """Get a specific exam by ID, ensuring assignment and attempt limits."""
        # 1. Check if assigned
        assignment = await ExamAssignment.find_one({"exam_id": exam_id, "assigned_students": user_id})
        if not assignment:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Exam not assigned to you")
            
        # 2. Check attempts (only count finished attempts, not IN_PROGRESS)
        attempt_count = await ExamSubmission.find(
            {"user_id": user_id, "exam_id": exam_id, "status": {"$in": ["COMPLETED", "GRADED"]}}
        ).count()
        if attempt_count >= assignment.max_attempts and assignment.max_attempts != 0:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Maximum attempts reached")
            
        exam = await Exam.get(exam_id)
        if not exam:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
        
        exam_dict = exam.dict()
        exam_dict["_id"] = str(exam.id)
        exam_dict["max_attempts"] = assignment.max_attempts
        exam_dict["attempt_count"] = attempt_count
        ensure_utc_isoformat(exam_dict)
        
        return exam_dict

    @staticmethod
    async def start_session(exam_id: str, user_id: str) -> dict:
        """Called when a student hits "Start Test". Creates an IN_PROGRESS submission shell."""
        # 1. Validate exam exists
        exam = await Exam.get(exam_id)
        if not exam:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
            
        # 1.5. Validate start time
        now_utc = datetime.utcnow()  # naive UTC to match MongoDB's naive datetime
        if now_utc < exam.start_time:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Exam has not started yet."
            )
            
        # 2. Block if attempts exceeded
        assignment = await ExamAssignment.find_one({"exam_id": exam_id, "assigned_students": user_id})
        max_attempts = assignment.max_attempts if assignment else 1
        
        # Count only COMPLETED or GRADED attempts as actual tries
        attempt_count = await ExamSubmission.find(
            {"user_id": user_id, "exam_id": exam_id, "status": {"$in": ["COMPLETED", "GRADED"]}}
        ).count()
        
        if attempt_count >= max_attempts and max_attempts != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum attempts reached. You cannot start this exam again."
            )
            
        # 3. Check if there's an already active session for this user
        active = await ExamSubmission.find_one({
            "user_id": user_id, 
            "exam_id": exam_id, 
            "status": "IN_PROGRESS"
        })
        
        if active:
            # Reconnect to active session
            logger.info("Reconnecting user=%s to active session for exam=%s", user_id, exam_id)
            return {"submission_id": str(active.id)}
            
        # 4. Create new IN_PROGRESS shell
        submission = ExamSubmission(
            user_id=user_id,
            exam_id=exam_id,
            exam_title=exam.title,
            answers={},
            attempt_number=attempt_count + 1,
            status="IN_PROGRESS",
            submitted_at=datetime.utcnow()
        )
        await submission.insert()
        logger.info("Exam started: user=%s exam=%s submission=%s attempt=%d", user_id, exam_id, str(submission.id), submission.attempt_number)
        return {"submission_id": str(submission.id)}

    @staticmethod
    async def submit_exam(exam_id: str, submission_data: dict, user_id: str, submission_id: Optional[str] = None) -> dict:
        """Submit exam answers and finalize the IN_PROGRESS session."""
        
        exam = await Exam.get(exam_id)
        if not exam:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

        # Find the active session if ID was provided, else fallback to creating one
        submission = None
        if submission_id:
            submission = await ExamSubmission.get(submission_id)
            if not submission or submission.user_id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid submission session.")
                
            if submission.status == "TERMINATED":
                 raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your session was terminated by an administrator.")
        
        if not submission:
            # Fallback for systems that didn't start the session properly
            assignment = await ExamAssignment.find_one({"exam_id": exam_id, "assigned_students": user_id})
            max_attempts = assignment.max_attempts if assignment else 1
            
            attempt_count = await ExamSubmission.find(
                {"user_id": user_id, "exam_id": exam_id, "status": {"$in": ["COMPLETED", "GRADED"]}}
            ).count()
            
            if attempt_count >= max_attempts and max_attempts != 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maximum attempts reached.")
                
            submission = ExamSubmission(
                user_id=user_id,
                exam_id=exam_id,
                exam_title=exam.title,
                status="IN_PROGRESS",
                attempt_number=attempt_count + 1,
                submitted_at=datetime.utcnow()
            )

        submission.answers = submission_data.get("answers", {})
        
        # Calculate Score
        total_mcq_score = 0
        total_coding_score = 0
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
                            total_mcq_score += question.points
                    
                    elif question.type == 'coding':
                        # Coding results usually populated by an external Judge0 webhook/worker
                        # Default is 0 until graded or if answer contains fully passed cases
                        pass
                            
        submission.mcq_score = total_mcq_score
        submission.coding_score = total_coding_score
        submission.score = total_mcq_score + total_coding_score
        submission.status = "COMPLETED"
        submission.submitted_at = datetime.utcnow()  # Update finish time
        
        await submission.save()

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
