"""
course_progress_routes.py — Student course progress tracking.

Handles lesson completion, quiz submission/grading, and progress
percentage calculation. Each student has a CourseProgress document
per enrolled course that tracks: completed_lessons[], quiz_scores{},
coding_scores{}, and progress_percentage.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.course_models import Course, CourseProgress
from app.models.all_models import User
from app.core.security import get_current_user
from datetime import datetime
from app.utils.datetime_utils import IST

router = APIRouter()


@router.get("/{course_id}/progress")
async def get_progress(course_id: str, current_user: User = Depends(get_current_user)):
    """Get progress for the current user in a course."""
    user_id = str(current_user.id)
    progress = await CourseProgress.find_one({"user_id": user_id, "course_id": course_id})

    if not progress:
        # Return empty progress
        return {
            "user_id": user_id,
            "course_id": course_id,
            "completed_lessons": [],
            "quiz_scores": {},
            "coding_scores": {},
            "progress_percentage": 0.0
        }

    return {
        "user_id": progress.user_id,
        "course_id": progress.course_id,
        "completed_lessons": progress.completed_lessons,
        "quiz_scores": progress.quiz_scores,
        "coding_scores": progress.coding_scores,
        "progress_percentage": progress.progress_percentage
    }


@router.post("/{course_id}/lessons/{lesson_id}/complete")
async def mark_lesson_complete(course_id: str, lesson_id: str, current_user: User = Depends(get_current_user)):
    """Mark a lesson as completed."""
    user_id = str(current_user.id)

    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Count total lessons
    total_lessons = sum(len(m.lessons) for m in course.modules)

    progress = await CourseProgress.find_one({"user_id": user_id, "course_id": course_id})
    if not progress:
        progress = CourseProgress(
            user_id=user_id,
            course_id=course_id,
            completed_lessons=[],
            quiz_scores={},
            coding_scores={}
        )

    if lesson_id not in progress.completed_lessons:
        progress.completed_lessons.append(lesson_id)

    # Recalculate percentage
    progress.progress_percentage = round((len(progress.completed_lessons) / total_lessons) * 100, 1) if total_lessons > 0 else 0
    progress.updated_at = datetime.now(IST)
    await progress.save()

    return {"message": "Lesson marked complete", "progress_percentage": progress.progress_percentage}


@router.post("/{course_id}/quiz/{quiz_id}/submit")
async def submit_quiz(course_id: str, quiz_id: str, answers: dict, current_user: User = Depends(get_current_user)):
    """Submit quiz answers and get the score.
    Body: {"answers": {0: selected_index, 1: selected_index, ...}}
    """
    user_id = str(current_user.id)

    course = await Course.get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Find the quiz
    quiz = None
    for module in course.modules:
        for q in module.quizzes:
            if q.id == quiz_id:
                quiz = q
                break

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    # Grade
    user_answers = answers.get("answers", {})
    correct = 0
    total = len(quiz.questions)

    for idx, question in enumerate(quiz.questions):
        user_answer = user_answers.get(str(idx))
        if user_answer is not None and int(user_answer) == question.correct_answer_index:
            correct += 1

    score = round((correct / total) * 100) if total > 0 else 0

    # Save progress
    progress = await CourseProgress.find_one({"user_id": user_id, "course_id": course_id})
    if not progress:
        progress = CourseProgress(user_id=user_id, course_id=course_id)

    progress.quiz_scores[quiz_id] = score
    progress.updated_at = datetime.now(IST)
    await progress.save()

    return {
        "quiz_id": quiz_id,
        "score": score,
        "correct": correct,
        "total": total
    }
