import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

# We need the User model and security hash function
from app.models.all_models import User
from app.core.security import get_password_hash

async def main():
    load_dotenv()
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db_name = os.getenv("MONGODB_DB", "examguard")
    database = client[db_name] if db_name else client.get_default_database()
    await init_beanie(database=database, document_models=[User])
    
    user = await User.find_one(User.username == "Om")
    if user:
        user.password_hash = get_password_hash("12345678")
        await user.save()
        print("Password updated successfully!")
    else:
        print("User Om not found")

if __name__ == "__main__":
    asyncio.run(main())
