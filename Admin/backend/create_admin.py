import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.admin_models import AdminUser
import bcrypt

async def create_default_admin():
    """Create a default admin user for testing"""
    # MongoDB connection
    CONNECTION_STRING = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(CONNECTION_STRING)
    database = client["examguard_db"]
    
    # Initialize just AdminUser model
    await init_beanie(database=database, document_models=[AdminUser])
    
    # Check if admin already exists
    existing_admin = await AdminUser.find_one({"username": "admin"})
    if existing_admin:
        print("⚠️  Default admin already exists")
        print(f"   ID: {existing_admin.id}")
        return
    
    # Create default admin with bcrypt directly
    password =  "admin123"
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    admin = AdminUser(
        username="admin",
        email="admin@examguard.ai",
        password_hash=password_hash,
        full_name="Admin User",
        role="super_admin"
    )
    
    await admin.insert()
    print("✅ Default admin created successfully!")
    print(f"   Username: admin")
    print(f"   Password: admin123")
    print(f"   ID: {admin.id}")

if __name__ == "__main__":
    asyncio.run(create_default_admin())
