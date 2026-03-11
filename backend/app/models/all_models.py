"""
all_models.py — Core data models for users, exams, and submissions.

Defines Beanie Document models for:
- User          Student accounts (username, email, profile)
- Exam          Exam definitions with sections containing MCQ and Coding questions
- ExamSubmission Student exam attempts with scoring and integrity data
- BehaviorLog   Behavioral biometrics captured during exam sessions
- ExamAssignment Maps exams to assigned students with attempt limits

Also defines Pydantic schemas: UserCreate, UserResponse, UserUpdate,
ExamCreate, MCQOption, Section, TestCase, etc.
"""
from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timezone
from pymongo import IndexModel, ASCENDING

class User(Document):
    username: str = Field(..., unique=True)
    email: EmailStr = Field(..., unique=True)
    password_hash: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    course: Optional[str] = None
    college: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "users"
        indexes = [
            IndexModel([('email', ASCENDING)], unique=True),
            IndexModel([('username', ASCENDING)], unique=True),
        ]

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    course: Optional[str] = None
    college: Optional[str] = None
    created_at: datetime
    is_active: bool = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    course: Optional[str] = None
    college: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# Exam Related Models
from enum import Enum
from typing import List, Literal, Union
from bson import ObjectId

class QuestionType(str, Enum):
    MCQ = "mcq"
    CODING = "coding"

class MCQOption(BaseModel):
    text: str
    is_correct: bool = False

class BaseQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    text: str
    points: int = 1

class MCQQuestion(BaseQuestion):
    type: Literal[QuestionType.MCQ] = QuestionType.MCQ
    options: List[MCQOption]
    correct_option_index: Optional[int] = None # Or use is_correct in options

class TestCase(BaseModel):
    input: str
    output: str
    is_hidden: bool = False

class CodingQuestion(BaseQuestion):
    type: Literal[QuestionType.CODING] = QuestionType.CODING
    problem_statement: str
    constraints: str
    test_cases: List[TestCase]

class Section(BaseModel):
    title: str # "Aptitude MCQ", "Technical MCQ", "Coding"
    description: Optional[str] = None
    questions: List[Union[MCQQuestion, CodingQuestion, dict]] # dict allow for payload flexibility

class Exam(Document):
    title: str
    description: Optional[str] = None
    sections: List[Section]
    total_marks: int
    duration_minutes: int
    start_time: datetime  # Scheduled start time (timezone-aware)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "exams"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone.utc).isoformat()
        }


class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    sections: List[Section]
    total_marks: int
    duration_minutes: int
    start_time: datetime

class ExamSubmission(Document):
    user_id: str
    exam_id: str
    exam_title: str
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    answers: dict = Field(default_factory=dict)  # {section_index: {question_index: answer}}
    status: str = "IN_PROGRESS"  # IN_PROGRESS, COMPLETED, GRADED, TERMINATED
    attempt_number: int = 1
    score: Optional[float] = None
    mcq_score: Optional[float] = 0.0
    coding_score: Optional[float] = 0.0
    anomaly_score: Optional[int] = None    # 0-100 integrity risk score
    risk_level: Optional[str] = None       # LOW, MEDIUM, HIGH
    
    class Settings:
        name = "exam_submissions"
        indexes = ["user_id", "exam_id", "status"]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone.utc).isoformat()
        }


class BehaviorLog(Document):
    """Stores aggregated behavioral biometric data captured during an exam session."""
    submission_id: str
    user_id: str
    exam_id: str
    keystroke_count: int = 0
    avg_typing_speed: float = 0.0    # keys per second
    backspace_ratio: float = 0.0     # backspace / total keys
    paste_count: int = 0
    pasted_chars: int = 0
    tab_switch_count: int = 0
    mouse_click_count: int = 0
    time_per_question: dict = {}     # {"sIdx-qIdx": milliseconds}
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "behavior_logs"
        indexes = ["submission_id", "exam_id", "user_id"]

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone.utc).isoformat()
        }

class ExamAssignment(Document):
    exam_id: str
    assigned_students: List[str] = [] # List of user IDs
    assigned_groups: List[str] = []   # List of group IDs
    assigned_course: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    max_attempts: int = 1 # 0 for unlimited, 1 default

    class Settings:
        name = "exam_assignments"
        indexes = [
            IndexModel([('exam_id', ASCENDING)]),
            IndexModel([('assigned_students', ASCENDING)]),
            IndexModel([('exam_id', ASCENDING), ('assigned_students', ASCENDING)]),
        ]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone.utc).isoformat()
        }
