"""
mcq_builder.py — Builds MCQ questions from templates.

Handles both aptitude and technical MCQ generation:
- Selects templates from the repository
- applies question IDs for the existing exam model
- formats output to match the Exam Section schema
"""
import random
from bson import ObjectId
from typing import List
from . import template_repository


def build_aptitude_mcqs(difficulty: str, count: int) -> List[dict]:
    """Build aptitude MCQ questions compatible with the Exam model."""
    templates = template_repository.get_aptitude_questions(difficulty, count)
    questions = []
    for t in templates:
        questions.append({
            "id": str(ObjectId()),
            "type": "mcq",
            "text": t["text"],
            "options": [
                {"text": opt, "is_correct": (i == t["correct_option_index"])}
                for i, opt in enumerate(t["options"])
            ],
            "correct_option_index": t["correct_option_index"],
            "points": t.get("points", 1),
            "explanation": t.get("explanation", ""),
        })
    return questions


def build_technical_mcqs(topic: str, difficulty: str, count: int) -> List[dict]:
    """Build technical MCQ questions compatible with the Exam model."""
    templates = template_repository.get_technical_questions(topic, difficulty, count)
    questions = []
    for t in templates:
        questions.append({
            "id": str(ObjectId()),
            "type": "mcq",
            "text": t["text"],
            "options": [
                {"text": opt, "is_correct": (i == t["correct_option_index"])}
                for i, opt in enumerate(t["options"])
            ],
            "correct_option_index": t["correct_option_index"],
            "points": t.get("points", 1),
            "explanation": t.get("explanation", ""),
        })
    return questions
