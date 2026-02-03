import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import User, Exam
import os

# --- CONFIGURE YOUR NEW TIME HERE ---
# Format: YYYY-MM-DDTHH:MM:SS
# Example: "2026-01-29T15:30:00"
NEW_START_TIME = "2026-01-31T15:00:00"
# ------------------------------------

mongodb_url = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017/examguard")

async def update_exam_time():
    client = AsyncIOMotorClient(mongodb_url)
    database = client.get_default_database()
    await init_beanie(database=database, document_models=[User, Exam])
    
    # Find the scheduled exam
    # You can also find by ID if you know it: await Exam.get("ID_HERE")
    exam = await Exam.find_one(Exam.title == "Software Engineer Assessment (Scheduled)")
    
    if exam:
        print(f"Found Exam: {exam.title}")
        print(f"Current Start Time: {exam.start_time}")
        
        # Update the time AND description
        exam.start_time = NEW_START_TIME
        exam.description = f"Timed exam starting at {NEW_START_TIME.split('T')[1][:5]}."
        await exam.save()
        
        print(f"✅ Updated Start Time to: {NEW_START_TIME}")
    else:
        print("❌ Exam not found!")

if __name__ == "__main__":
    asyncio.run(update_exam_time())
