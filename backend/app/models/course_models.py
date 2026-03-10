from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId


# --- Quiz Models ---
class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int


class CourseQuiz(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    title: str
    questions: List[QuizQuestion] = []


# --- Coding Problem Models ---
class TestCase(BaseModel):
    input: str
    expected_output: str


class CodingProblem(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    title: str
    description: str
    constraints: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    starter_code: str = ""
    language_id: int = 71  # Python 3
    test_cases: List[TestCase] = []


# --- Lesson Model ---
class Lesson(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    title: str
    video_url: Optional[str] = None
    notes_markdown: Optional[str] = None
    quiz_id: Optional[str] = None
    coding_problem_id: Optional[str] = None
    duration: int = 0  # seconds


# --- Module Model ---
class CourseModule(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    title: str
    description: Optional[str] = None
    lessons: List[Lesson] = []
    quizzes: List[CourseQuiz] = []
    coding_problems: List[CodingProblem] = []


# --- Course Document ---
class Course(Document):
    title: str
    description: str
    instructor_id: str
    thumbnail_url: Optional[str] = None
    modules: List[CourseModule] = []
    enrolled_students: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    class Settings:
        name = "courses"

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone.utc).isoformat()
        }


class CourseCreate(BaseModel):
    title: str
    description: str
    thumbnail_url: Optional[str] = None
    modules: List[CourseModule] = []


# --- Progress Tracking ---
class CourseProgress(Document):
    user_id: str
    course_id: str
    completed_lessons: List[str] = []  # List of lesson IDs
    quiz_scores: dict = Field(default_factory=dict)  # {quiz_id: score}
    coding_scores: dict = Field(default_factory=dict)  # {problem_id: score}
    progress_percentage: float = 0.0
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    class Settings:
        name = "course_progress"


# --- Enrollment Approval ---
class CourseEnrollment(Document):
    user_id: str
    course_id: str
    status: str = "PENDING"  # PENDING, APPROVED, REJECTED
    requested_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    approved_by: Optional[str] = None  # admin user id
    approved_at: Optional[datetime] = None

    class Settings:
        name = "course_enrollments"
