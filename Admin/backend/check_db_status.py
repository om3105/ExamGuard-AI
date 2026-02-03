import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.admin_models import AdminUser
from app.models.shared_models import Exam, User, ExamSubmission

async def check_db_connection():
    try:
        # Connect to MongoDB
        CONNECTION_STRING = "mongodb://localhost:27017"
        client = AsyncIOMotorClient(CONNECTION_STRING)
        database = client["examguard_db"]
        
        # Initialize models
        await init_beanie(
            database=database,
            document_models=[AdminUser, Exam, ExamSubmission, User]
        )
        
        print("✅ Database Connection Successful!")
        print(f"   Database Name: {database.name}")
        
        # Count documents
        admin_count = await AdminUser.count()
        user_count = await User.count()
        exam_count = await Exam.count()
        submission_count = await ExamSubmission.count()
        
        print("\n📊 Database Statistics:")
        print(f"   - Admins: {admin_count}")
        print(f"   - Students (Users): {user_count}")
        print(f"   - Exams: {exam_count}")
        print(f"   - Submissions: {submission_count}")
        
        # Check specific new admin
        manager = await AdminUser.find_one({"username": "manager"})
        if manager:
             print(f"\n✅ Verified 'manager' admin exists (ID: {manager.id})")
        else:
             print("\n❌ 'manager' admin not found")

    except Exception as e:
        print(f"\n❌ Database Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_db_connection())
