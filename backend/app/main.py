from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.session import init_db
from app.core.logging_config import setup_logging, get_logger
from app.core.error_handlers import register_error_handlers
import time

# Initialize logging first
setup_logging()
logger = get_logger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ExamGuard AI API...")
    await init_db()
    logger.info("Database initialized successfully")
    yield
    logger.info("Shutting down ExamGuard AI API")

from app.routes.auth_routes import router as auth_router
from app.routes.exam_routes import router as exam_router
from app.routes.behavior_routes import router as behavior_router
from app.routes.course_routes import router as course_router
from app.routes.course_progress_routes import router as course_progress_router
from app.routes.student_profile_routes import router as student_profile_router
from app.routes import admin_auth, exam_mgmt, student_mgmt, analytics, admin_course, monitoring_routes, admin_enrollment_routes, admin_progress

app = FastAPI(title="ExamGuard AI API", lifespan=lifespan)

# Register global error handlers
register_error_handlers(app)

import os

# Parse CORS origins from environment, fallback to defaults
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:5174,http://localhost:5175")
origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000)
    # Skip logging health checks and static files
    if request.url.path not in ("/", "/health", "/docs", "/openapi.json"):
        logger.info(
            "%s %s → %s (%dms)",
            request.method, request.url.path, response.status_code, duration_ms,
            extra={"method": request.method, "path": request.url.path, "status_code": response.status_code, "duration_ms": duration_ms}
        )
    return response


app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(exam_router, prefix="/exams", tags=["Exams"])
app.include_router(behavior_router, prefix="/behavior", tags=["Behavior"])
app.include_router(course_router, prefix="/courses", tags=["Courses"])
app.include_router(course_progress_router, prefix="/courses", tags=["Course Progress"])
app.include_router(student_profile_router, prefix="/student/profile", tags=["Student Profile"])

# Admin routes
app.include_router(admin_auth.router, prefix="/admin/api/auth", tags=["Admin Authentication"])
app.include_router(exam_mgmt.router, prefix="/admin/api/exams", tags=["Admin Exam Management"])
app.include_router(admin_course.router, prefix="/admin/api/courses", tags=["Admin Course Management"])
app.include_router(student_mgmt.router, prefix="/admin/api/students", tags=["Admin Student Management"])
app.include_router(analytics.router, prefix="/admin/api/analytics", tags=["Admin Analytics"])
app.include_router(monitoring_routes.router, prefix="/admin/api/monitoring", tags=["Admin Live Monitoring"])
app.include_router(admin_enrollment_routes.router, prefix="/admin/api", tags=["Admin Enrollments"])
app.include_router(admin_progress.router, prefix="/admin/api/progress", tags=["Admin Student Progress"])

# AI Test Generation
from app.routes import ai_generation_routes
app.include_router(ai_generation_routes.router, prefix="/admin/api/ai", tags=["AI Test Generation"])

@app.get("/")
def read_root():
    return {"message": "ExamGuard AI API is running"}

@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint for deployment monitoring"""
    return {
        "status": "healthy",
        "service": "ExamGuard AI"
    }
