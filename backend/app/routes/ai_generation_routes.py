"""
ai_generation_routes.py — Admin API endpoints for AI-powered test generation.

Endpoints:
  POST /admin/api/ai/generate-test   Parse prompt + build draft exam
  POST /admin/api/ai/save-generated-test   Persist generated exam to MongoDB
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.routes.admin_auth import get_current_admin
from app.models.admin_models import AdminUser
from app.models.all_models import Exam, Section, MCQQuestion, CodingQuestion, MCQOption, TestCase
from app.services.ai_test_generation.schemas import GenerateTestRequest, SaveGeneratedTestRequest
from app.services.ai_test_generation.exam_generator import generate_exam
from app.services.ai_test_generation.prompt_parser import parse_prompt
from datetime import datetime
from app.utils.datetime_utils import IST
import logging

logger = logging.getLogger("ai_generation")

router = APIRouter()


@router.post("/generate-test")
async def generate_test(request: GenerateTestRequest, current_admin: AdminUser = Depends(get_current_admin)):
    """Generate a draft exam from a prompt and/or explicit configuration.
    
    Returns a fully structured exam JSON that the admin can preview,
    edit, and then save via /save-generated-test.
    """
    try:
        # Also return the parsed prompt so the UI can show what was understood
        parsed = parse_prompt(request.prompt) if request.prompt else None
        
        exam = generate_exam(request)
        
        return {
            "success": True,
            "parsed_prompt": parsed.dict() if parsed else None,
            "exam": exam.dict(),
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error("Exam generation failed: %s", str(e), exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Exam generation failed. Please try again.")


@router.post("/save-generated-test")
async def save_generated_test(request: SaveGeneratedTestRequest, current_admin: AdminUser = Depends(get_current_admin)):
    """Persist a generated (and optionally edited) exam to MongoDB.
    
    The exam data must conform to the existing Exam model schema.
    """
    try:
        exam_data = request.exam
        
        # Build sections compatible with the Exam Document model
        sections = []
        for section_data in exam_data.sections:
            questions = []
            for q in section_data.questions:
                if q.get("type") == "mcq":
                    questions.append(MCQQuestion(
                        id=q.get("id"),
                        text=q["text"],
                        type="mcq",
                        options=[MCQOption(text=o["text"], is_correct=o.get("is_correct", False)) for o in q.get("options", [])],
                        correct_option_index=q.get("correct_option_index", 0),
                        points=q.get("points", 1),
                    ))
                elif q.get("type") == "coding":
                    questions.append(CodingQuestion(
                        id=q.get("id"),
                        text=q["text"],
                        type="coding",
                        problem_statement=q.get("problem_statement", q["text"]),
                        constraints=q.get("constraints", ""),
                        test_cases=[TestCase(input=tc["input"], output=tc["output"], is_hidden=tc.get("is_hidden", False)) for tc in q.get("test_cases", [])],
                        points=q.get("points", 10),
                    ))
            
            sections.append(Section(
                title=section_data.title,
                description=section_data.description,
                questions=questions,
            ))
        
        exam = Exam(
            title=exam_data.title,
            description=exam_data.description,
            sections=sections,
            total_marks=exam_data.total_marks,
            duration_minutes=exam_data.duration_minutes,
            start_time=request.start_time,
        )
        await exam.insert()
        
        logger.info("Saved AI-generated exam: id=%s, title=%s, admin=%s", str(exam.id), exam.title, current_admin.username)
        
        return {
            "success": True,
            "exam_id": str(exam.id),
            "message": f"Exam '{exam.title}' saved successfully.",
        }
    except Exception as e:
        logger.error("Failed to save generated exam: %s", str(e), exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save exam. Please try again.")
