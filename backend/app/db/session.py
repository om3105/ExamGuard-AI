from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
import os

load_dotenv()

async def init_db():
    # Get MongoDB URL from env or default
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/examguard")
    
    client = AsyncIOMotorClient(mongodb_url)
    db_name = os.getenv("DB_NAME", "examguard")
    database = client[db_name] if db_name else client.get_default_database()
    
    # Initialize Beanie with the document models
    from app.models.admin_models import AdminUser
    from app.models.all_models import User, Exam, ExamSubmission, BehaviorLog, ExamAssignment
    from app.models.course_models import Course, CourseProgress, CourseEnrollment
    await init_beanie(
        database=database, 
        document_models=[AdminUser, User, Exam, ExamSubmission, BehaviorLog, ExamAssignment, Course, CourseProgress, CourseEnrollment]
    )

# Export models for easy import
__all__ = ['init_db', 'Exam', 'ExamSubmission', 'User', 'BehaviorLog', 'AdminUser', 'ExamAssignment', 'Course']
