import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

def oid():
    return str(ObjectId())

async def seed():
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client["examguard"]

    # Remove existing seeded exam if any
    await db.exams.delete_many({"title": "Quantitative Aptitude Test"})

    now = datetime.now(timezone.utc)
    # Schedule start time for 1 hour from now
    start_time = now + timedelta(hours=1)

    exam = {
        "title": "Quantitative Aptitude Test",
        "description": "A test evaluating quantitative and problem-solving skills in software engineering scenarios.",
        "total_marks": 8,
        "duration_minutes": 30,
        "start_time": start_time,
        "created_at": now,
        "sections": [
            {
                "title": "Section A: Quantitative Aptitude (10 Marks)",
                "description": "(2 Marks each)",
                "questions": [
                    {
                        "id": oid(),
                        "text": "If a backend server handles 250 requests per minute, how many requests will it handle in 3 hours?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "30,000", "is_correct": False},
                            {"text": "45,000", "is_correct": True},
                            {"text": "50,000", "is_correct": False},
                            {"text": "60,000", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "A database query execution time is reduced from 500 ms to 350 ms. What is the percentage improvement?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "20%", "is_correct": False},
                            {"text": "25%", "is_correct": False},
                            {"text": "30%", "is_correct": True},
                            {"text": "35%", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    },
                    {
                        "id": oid(),
                        "text": "A microservice has 5 modules. Each module contains 8 APIs. Total APIs = ?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "35", "is_correct": False},
                            {"text": "40", "is_correct": True},
                            {"text": "45", "is_correct": False},
                            {"text": "50", "is_correct": False}
                        ],
                        "correct_option_index": 1
                    },
                    {
                        "id": oid(),
                        "text": "If 3 developers complete a task in 12 days, how many days will 4 developers take (same efficiency)?",
                        "points": 2,
                        "type": "mcq",
                        "options": [
                            {"text": "6", "is_correct": False},
                            {"text": "8", "is_correct": False},
                            {"text": "9", "is_correct": True},
                            {"text": "10", "is_correct": False}
                        ],
                        "correct_option_index": 2
                    }
                ]
            }
        ]
    }

    result = await db.exams.insert_one(exam)
    print(f"✅ Exam seeded successfully! ID: {result.inserted_id}")

if __name__ == "__main__":
    asyncio.run(seed())
