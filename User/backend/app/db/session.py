from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
import os

load_dotenv()

async def init_db():
    # Get MongoDB URL from env or default
    # Note: In a real app we'd load this from config
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/examguard")
    
    client = AsyncIOMotorClient(mongodb_url)
    db_name = os.getenv("MONGODB_DB")
    database = client[db_name] if db_name else client.get_default_database()
    
    # Initialize Beanie with the document models
    # We will add models to this list as we create them
    from app.models.all_models import User, Exam, ExamSubmission, BehaviorLog
    await init_beanie(database=database, document_models=[User, Exam, ExamSubmission, BehaviorLog])
