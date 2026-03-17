"""
schemas.py — Request/response schemas for AI test generation.

Defines the data contracts between the frontend, API route, and
the generation engine.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class GenerateTestRequest(BaseModel):
    """Input from the admin UI — either a free-text prompt or explicit config."""
    prompt: str = ""
    topic: Optional[str] = None
    difficulty: Optional[str] = "medium"  # easy, medium, hard
    language: Optional[str] = None        # python, java, javascript, etc.
    aptitude_count: int = Field(default=5, ge=0, le=30)
    technical_count: int = Field(default=5, ge=0, le=30)
    coding_count: int = Field(default=2, ge=0, le=10)
    duration_minutes: int = Field(default=60, ge=10, le=300)


class ParsedPrompt(BaseModel):
    """Structured data extracted from a natural-language prompt."""
    title: Optional[str] = None
    topic: Optional[str] = None
    language: Optional[str] = None
    difficulty: str = "medium"
    aptitude_count: int = 5
    technical_count: int = 5
    coding_count: int = 2
    duration_minutes: int = 60
    tags: List[str] = []


class GeneratedMCQOption(BaseModel):
    text: str
    is_correct: bool = False


class GeneratedMCQ(BaseModel):
    text: str
    options: List[GeneratedMCQOption]
    correct_option_index: int
    points: int = 1
    explanation: Optional[str] = None
    difficulty: str = "medium"
    tags: List[str] = []


class GeneratedTestCase(BaseModel):
    input: str
    output: str
    is_hidden: bool = False


class GeneratedCodingQuestion(BaseModel):
    text: str
    problem_statement: str
    constraints: str = ""
    test_cases: List[GeneratedTestCase]
    starter_code: Optional[str] = None
    points: int = 10
    difficulty: str = "medium"
    tags: List[str] = []


class GeneratedSection(BaseModel):
    title: str
    description: Optional[str] = None
    questions: list  # mix of MCQ and coding dicts


class GeneratedExam(BaseModel):
    """Full generated exam draft, compatible with the existing Exam model."""
    title: str
    description: str
    sections: List[GeneratedSection]
    total_marks: int
    duration_minutes: int
    start_time: Optional[datetime] = None
    tags: List[str] = []
    generation_method: str = "template"  # "template" or "llm" for future


class SaveGeneratedTestRequest(BaseModel):
    """Request to persist a generated exam to MongoDB."""
    exam: GeneratedExam
    start_time: datetime
    publish: bool = False  # False = draft, True = published
