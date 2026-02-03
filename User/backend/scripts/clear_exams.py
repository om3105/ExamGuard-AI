import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import User, Exam
import os

mongodb_url = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017/examguard")

async def clear_exams():
    client = AsyncIOMotorClient(mongodb_url)
    database = client.get_default_database()
    await init_beanie(database=database, document_models=[User, Exam])
    print("Deleting all exams...")
    await Exam.delete_all()
    print("Exams cleared.")

if __name__ == "__main__":
    asyncio.run(clear_exams())
