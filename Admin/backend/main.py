from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.session import init_admin_db
from app.routes import admin_auth, exam_mgmt, student_mgmt, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    await init_admin_db()
    yield

# Create FastAPI app
app = FastAPI(
    title="ExamGuard AI - Admin API",
    description="Admin panel backend for ExamGuard AI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(admin_auth.router, prefix="/admin/api/auth", tags=["Admin Authentication"])
app.include_router(exam_mgmt.router, prefix="/admin/api/exams", tags=["Exam Management"])
app.include_router(student_mgmt.router, prefix="/admin/api/students", tags=["Student Management"])
app.include_router(analytics.router, prefix="/admin/api/analytics", tags=["Analytics"])

@app.get("/")
def read_root():
    return {"message": "ExamGuard AI - Admin API is running", "version": "1.0.0"}

@app.get("/admin/api/health")
def health_check():
    return {"status": "healthy", "service": "admin-api"}
