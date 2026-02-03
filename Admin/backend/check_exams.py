import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

MONGO_URL = "mongodb://localhost:27017"

async def check_exams():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.examguard_db
    exams_collection = db.exams

    exams = await exams_collection.find().to_list(100)
    print(f"Total Exams Found: {len(exams)}")
    for exam in exams:
        print(f"- {exam.get('title')} (ID: {exam.get('_id')})")
        print(f"  Start: {exam.get('start_time')}")
        print(f"  Duration: {exam.get('duration_minutes')} mins")
        # Check if active
        start = exam.get('start_time')
        try:
            if isinstance(start, str):
                start_dt = datetime.fromisoformat(start.replace('Z', '+00:00'))
            else:
                start_dt = start
            
            print(f"  Parsed Start: {start_dt}")
        except Exception as e:
            print(f"  Date Parse Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_exams())
