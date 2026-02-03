import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import User, Exam
import os

mongodb_url = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017/examguard")

async def update_exam_duration():
    client = AsyncIOMotorClient(mongodb_url)
    database = client.get_default_database()
    await init_beanie(database=database, document_models=[User, Exam])
    
    exam = await Exam.find_one(Exam.title == "Full Stack Assessment (Final)")
    # Fallback to the other title if the full stack one isn't the active one, 
    # but based on previous steps we created "Full Stack Assessment (Final)".
    
    if not exam:
        # Try the previous title if the new one wasn't seeded correctly or to be safe
        exam = await Exam.find_one(Exam.title == "Software Engineer Assessment (Scheduled)")

    if exam:
        print(f"Found Exam: {exam.title}")
        print(f"Current Duration: {exam.duration_minutes}")
        
        # Update duration to 140 minutes
        exam.duration_minutes = 140
        await exam.save()
        
        print(f"✅ Updated Duration to: {exam.duration_minutes} minutes")
    else:
        print("❌ Exam not found!")

if __name__ == "__main__":
    asyncio.run(update_exam_duration())
