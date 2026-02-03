import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import User, Exam
import os
from datetime import datetime

mongodb_url = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017/examguard")

async def verify_state():
    client = AsyncIOMotorClient(mongodb_url)
    database = client.get_default_database()
    await init_beanie(database=database, document_models=[User, Exam])
    
    print("--- SYSTEM STATE CHECK ---")
    
    # 1. Check Exam
    exam = await Exam.find_one(Exam.title == "Full Stack Assessment (Final)")
    if not exam:
        print("❌ Exam 'Full Stack Assessment (Final)' NOT FOUND.")
        # Try fallback
        exam = await Exam.find_one(Exam.title == "Software Engineer Assessment (Scheduled)")
        if exam:
            print(f"⚠️ Found older title: '{exam.title}'")
    
    if exam:
        print(f"✅ Exam Found: {exam.title}")
        print(f"   ID: {exam.id}")
        print(f"   Start Time: {exam.start_time} (ISO)")
        print(f"   Duration: {exam.duration_minutes} minutes")
        print(f"   Sections: {len(exam.sections)}")
        for sec in exam.sections:
            print(f"     - {sec.title}: {len(sec.questions)} questions")
            
        # Check current time vs start time
        now = datetime.utcnow() # Beanie/Mongo uses UTC usually, but our strings might be local naive.
        # Let's just print simple comparison
        print(f"   System UTC Time: {now}")
    else:
        print("❌ CRITICAL: No exam found in database.")

    # 2. Check Users
    user_count = await User.count()
    print(f"✅ Users registered: {user_count}")

if __name__ == "__main__":
    asyncio.run(verify_state())
