from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
from app.core.logging_config import get_logger
import os

load_dotenv()

logger = get_logger("db")

# Module-level flag so the health endpoint can report real DB status
_db_connected: bool = False


async def init_db():
    """Initialize MongoDB connection and Beanie ODM.

    Raises RuntimeError if the database cannot be reached, so the app fails
    fast with a clear error rather than crashing on the first DB query.
    """
    global _db_connected
    _db_connected = False

    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB", "examguard")
    server_selection_timeout_ms = int(os.getenv("MONGODB_TIMEOUT_MS", "10000"))

    logger.info("Connecting to MongoDB at %s (db: %s)…", mongodb_url, db_name)

    try:
        client = AsyncIOMotorClient(mongodb_url, serverSelectionTimeoutMS=server_selection_timeout_ms)

        # Verify the server is actually reachable before proceeding
        await client.admin.command("ping")
        logger.info("MongoDB ping succeeded.")
    except Exception as exc:
        logger.error(
            "Failed to connect to MongoDB at %s — %s: %s",
            mongodb_url,
            type(exc).__name__,
            exc,
        )
        raise RuntimeError(
            f"Cannot connect to MongoDB at '{mongodb_url}'. "
            "Ensure MongoDB is running and MONGODB_URL is set correctly in .env."
        ) from exc

    database = client[db_name]

    # Initialize Beanie with the document models
    from app.models.admin_models import AdminUser
    from app.models.all_models import User, Exam, ExamSubmission, BehaviorLog, ExamAssignment
    from app.models.course_models import Course, CourseProgress, CourseEnrollment
    await init_beanie(
        database=database,
        document_models=[
            AdminUser, User, Exam, ExamSubmission, BehaviorLog,
            ExamAssignment, Course, CourseProgress, CourseEnrollment,
        ],
    )

    _db_connected = True
    logger.info("Database '%s' initialized successfully with all models.", db_name)


def is_db_connected() -> bool:
    """Return True if the database was initialized successfully on startup."""
    return _db_connected


# Export models for easy import
__all__ = ['init_db', 'is_db_connected', 'Exam', 'ExamSubmission', 'User', 'BehaviorLog', 'AdminUser', 'ExamAssignment', 'Course']
