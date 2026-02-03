import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import Exam, User
import os
from datetime import datetime, timedelta

mongodb_url = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017/examguard")

async def update_to_current_time():
    """Update exam to start 2 minutes from now"""
    client = AsyncIOMotorClient(mongodb_url)
    database = client.get_default_database()
    await init_beanie(database=database, document_models=[User, Exam])
    
    # Get current time and add 2 minutes
    now = datetime.now()
    start_time = now + timedelta(minutes=2)
    formatted_time = start_time.strftime("%Y-%m-%dT%H:%M:%S")
    
    exam = await Exam.find_one(Exam.title == "Full Stack Assessment (Final)")
    
    if exam:
        print(f"Found Exam: {exam.title}")
        print(f"Old Start Time: {exam.start_time}")
        print(f"New Start Time: {formatted_time}")
        
        exam.start_time = formatted_time
        await exam.save()
        
        print(f"✅ Exam updated successfully!")
    else:
        print("❌ Exam not found!")

if __name__ == "__main__":
    asyncio.run(update_to_current_time())
