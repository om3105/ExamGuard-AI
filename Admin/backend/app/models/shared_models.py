from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timezone

class User(Document):
    username: str = Field(..., unique=True)
    email: EmailStr = Field(..., unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "users"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    created_at: datetime

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
    answers: dict
    status: str = "COMPLETED"
    score: Optional[float] = None
    anomaly_score: Optional[int] = None
    risk_level: Optional[str] = None
    
    class Settings:
        name = "exam_submissions"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone.utc).isoformat()
        }


class BehaviorLog(Document):
    """Behavioral biometrics data captured during exam."""
    submission_id: str
    user_id: str
    exam_id: str
    keystroke_count: int = 0
    avg_typing_speed: float = 0.0
    backspace_ratio: float = 0.0
    paste_count: int = 0
    pasted_chars: int = 0
    tab_switch_count: int = 0
    mouse_click_count: int = 0
    time_per_question: dict = {}
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "behavior_logs"
