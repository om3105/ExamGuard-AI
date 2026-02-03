from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.session import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

from app.api.routes.auth_routes import router as auth_router
from app.api.routes.exam_routes import router as exam_router

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

@app.get("/")
def read_root():
    return {"message": "ExamGuard AI API is running"}
