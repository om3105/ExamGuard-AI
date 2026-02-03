from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
import os

from app.models.admin_models import AdminUser
from app.models.shared_models import Exam, ExamSubmission, User

load_dotenv()

async def init_admin_db():
    """Initialize database connection for admin backend"""
    # MongoDB connection string - shared with user backend
    CONNECTION_STRING = os.getenv("MONGODB_URL", "mongodb://localhost:27017/examguard")
    
    import certifi
    client = AsyncIOMotorClient(CONNECTION_STRING, tlsCAFile=certifi.where())
    db_name = os.getenv("MONGODB_DB")
    database = client[db_name] if db_name else client.get_default_database()
    
    # Initialize all models (admin + shared user models)
    await init_beanie(
        database=database,
        document_models=[AdminUser, Exam, ExamSubmission, User]
    )
    
    print("✅ Admin database initialized")

# Export models for easy import
__all__ = ['init_admin_db', 'Exam', 'ExamSubmission', 'User']
