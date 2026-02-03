from fastapi import APIRouter, HTTPException, status, Depends
from app.models.all_models import Exam, ExamCreate, User
from app.core.security import get_current_user
from app.services.exam_service import ExamService
from typing import List

router = APIRouter()

@router.post("/", response_model=Exam, status_code=status.HTTP_201_CREATED)
async def create_exam(exam_data: ExamCreate):
    """
    Create a new exam with sections (Aptitude, Technical, Coding).
    """
    return await ExamService.create_exam(exam_data)

@router.get("/", response_model=List[Exam])
async def get_all_exams(current_user: User = Depends(get_current_user)):
    """
    Get all available exams.
    """
    return await ExamService.get_all_exams()

@router.get("/{exam_id}", response_model=Exam)
async def get_exam(exam_id: str, current_user: User = Depends(get_current_user)):
    """
    Get a specific exam by ID.
    """
    return await ExamService.get_exam_by_id(exam_id)

@router.post("/{exam_id}/submit", status_code=status.HTTP_201_CREATED)
async def submit_exam(
    exam_id: str,
    submission_data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Submit exam answers and create submission record.
    Request body: {"answers": {section_index: {question_index: answer}}}
    """
    user_id = str(current_user.id)
    return await ExamService.submit_exam(exam_id, submission_data, user_id)

@router.get("/submissions/{submission_id}")
async def get_submission(submission_id: str, current_user: User = Depends(get_current_user)):
    """
    Get submission details for the completion page.
    """
    return await ExamService.get_submission(submission_id, user_id=str(current_user.id))

@router.post("/execute")
async def execute_code(
    payload: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Execute code via Judge0.
    """
    source_code = payload.get("source_code")
    language_id = payload.get("language_id", 63) # Default JavaScript
    stdin = payload.get("stdin", "")
    
    return await ExamService.execute_code(source_code, language_id, stdin)
