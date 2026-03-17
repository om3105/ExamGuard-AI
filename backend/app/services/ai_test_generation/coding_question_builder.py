"""
coding_question_builder.py — Builds coding problems from templates.

Selects coding templates from the repository and formats them
to match the existing CodingQuestion / Section schema used by
the Exam model.
"""
from bson import ObjectId
from typing import List
from . import template_repository


def build_coding_questions(topic: str, difficulty: str, count: int) -> List[dict]:
    """Build coding questions compatible with the Exam model."""
    templates = template_repository.get_coding_questions(topic, difficulty, count)
    questions = []
    for t in templates:
        questions.append({
            "id": str(ObjectId()),
            "type": "coding",
            "text": t["text"],
            "problem_statement": t["problem_statement"],
            "constraints": t.get("constraints", ""),
            "test_cases": [
                {
                    "input": tc["input"],
                    "output": tc["output"],
                    "is_hidden": tc.get("is_hidden", False),
                }
                for tc in t.get("test_cases", [])
            ],
            "starter_code": t.get("starter_code", ""),
            "points": t.get("points", 10),
        })
    return questions
