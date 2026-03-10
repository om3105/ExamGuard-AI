from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.session import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

from app.routes.auth_routes import router as auth_router
from app.routes.exam_routes import router as exam_router
from app.routes.behavior_routes import router as behavior_router
from app.routes.course_routes import router as course_router
from app.routes.course_progress_routes import router as course_progress_router
from app.routes import admin_auth, exam_mgmt, student_mgmt, analytics, admin_course, monitoring_routes, admin_enrollment_routes

app = FastAPI(title="ExamGuard AI API", lifespan=lifespan)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(exam_router, prefix="/exams", tags=["Exams"])
app.include_router(behavior_router, prefix="/behavior", tags=["Behavior"])
app.include_router(course_router, prefix="/courses", tags=["Courses"])
app.include_router(course_progress_router, prefix="/courses", tags=["Course Progress"])

# Admin routes
app.include_router(admin_auth.router, prefix="/admin/api/auth", tags=["Admin Authentication"])
app.include_router(exam_mgmt.router, prefix="/admin/api/exams", tags=["Admin Exam Management"])
app.include_router(admin_course.router, prefix="/admin/api/courses", tags=["Admin Course Management"])
app.include_router(student_mgmt.router, prefix="/admin/api/students", tags=["Admin Student Management"])
app.include_router(analytics.router, prefix="/admin/api/analytics", tags=["Admin Analytics"])
app.include_router(monitoring_routes.router, prefix="/admin/api/monitoring", tags=["Admin Live Monitoring"])
app.include_router(admin_enrollment_routes.router, prefix="/admin/api", tags=["Admin Enrollments"])

@app.get("/")
def read_root():
    return {"message": "ExamGuard AI API is running"}
