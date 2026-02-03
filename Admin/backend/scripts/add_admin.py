import asyncio
import argparse
import sys
import os

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.admin_models import AdminUser
# Import security function to ensure matching logic
from app.core.admin_security import hash_password

async def add_admin(username, password, email, full_name):
    """Add or update an admin user"""
    # MongoDB connection
    CONNECTION_STRING = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(CONNECTION_STRING)
    database = client["examguard_db"]
    
    # Initialize just AdminUser model
    await init_beanie(database=database, document_models=[AdminUser])
    
    # Check if admin already exists
    admin = await AdminUser.find_one({"username": username})
    
    if admin:
        print(f"⚠️  Admin '{username}' exists. Updating password...")
        admin.password_hash = hash_password(password)
        if email: admin.email = email
        if full_name: admin.full_name = full_name
        await admin.save()
        print(f"✅ Admin '{username}' password updated successfully!")
    else:
        # Create new admin
        print(f"Creating new admin '{username}'...")
        admin = AdminUser(
            username=username,
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            role="admin"
        )
        await admin.insert()
        print(f"✅ New Admin created successfully!")

    print(f"   Username: {username}")
    print(f"   Password: {password}")
    print(f"   ID: {admin.id}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add or update an admin user")
    parser.add_argument("username", help="Admin username")
    parser.add_argument("password", help="Admin password")
    parser.add_argument("--email", help="Admin email", default="admin@example.com")
    parser.add_argument("--name", help="Full name", default="Admin User")
    
    args = parser.parse_args()
    
    # Simple email generation if not provided unique
    if args.email == "admin@example.com":
        args.email = f"{args.username}@examguard.ai"
        
    asyncio.run(add_admin(args.username, args.password, args.email, args.name))
