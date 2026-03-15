# ExamGuard AI

> Secure, AI-powered online examination platform with proctoring, course management, and student analytics.

## Overview

ExamGuard AI is a full-stack examination management system with two portals:

- **Admin Portal** — Create exams, manage courses, approve enrollments, monitor student progress, view analytics
- **Student Portal** — Take assigned exams (MCQ + Coding), enroll in courses, learn via video/quizzes, track progress

### Key Features

| Feature | Description |
|---------|-------------|
| **MCQ + Coding Exams** | Multi-section exams with auto-graded MCQs and Judge0-powered coding challenges |
| **Proctoring** | Tab-switch detection, paste monitoring, behavioral biometrics scoring |
| **Course System** | Modules → Lessons → Quizzes → Coding Problems with progress tracking |
| **Analytics** | Admin dashboard with exam results, student performance, and integrity risk scores |
| **Live Monitoring** | Real-time exam session monitoring for administrators |

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  React Frontend │ ──API──▶│  FastAPI Backend  │ ──ODM──▶│  MongoDB    │
│  (Vite, :5173)  │         │  (Uvicorn, :8000) │         │  (Atlas)    │
└─────────────────┘         └────────┬─────────┘         └─────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Judge0 API      │
                            │  (Code Execution) │
                            └──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Lucide Icons, Recharts, Axios |
| Backend | FastAPI, Python 3.12, Beanie ODM, Motor (async MongoDB) |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Database | MongoDB (local or Atlas) |
| Code Execution | Judge0 CE via RapidAPI |
| Deployment | Render (backend), Vercel (frontend) |

## Project Structure

```
EXAMGUARD-AI/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, logging, error handling
│   │   ├── db/             # MongoDB connection (Beanie init)
│   │   ├── models/         # Beanie document models
│   │   │   ├── all_models.py       # User, Exam, Submission, BehaviorLog
│   │   │   ├── course_models.py    # Course, Module, Lesson, Quiz, Progress
│   │   │   └── admin_models.py     # AdminUser
│   │   ├── routes/         # FastAPI routers (15 route files)
│   │   ├── services/       # Business logic (exam, anomaly)
│   │   └── utils/          # Helpers (datetime formatting)
│   ├── tests/              # PyTest test suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── admin/          # Admin portal
│       │   ├── pages/      # Dashboard, ExamMgmt, Courses, Analytics, Progress...
│       │   ├── components/ # Sidebar, Modal
│       │   ├── context/    # AdminAuthContext
│       │   └── services/   # adminApi.js (Axios client)
│       ├── student/        # Student portal
│       │   ├── pages/      # Dashboard, ExamPage, CourseView, WaitingRoom...
│       │   ├── components/ # Exam UI (CodeEditor, QuestionPalette, etc.)
│       │   ├── hooks/      # useExamTimer, useExamNavigation, useBehaviorLogger...
│       │   ├── context/    # AuthContext
│       │   └── services/   # api.js (Axios client)
│       ├── App.jsx         # Route definitions
│       └── main.jsx        # Entry point
│
├── docs/                   # Developer documentation
│   ├── DEVELOPER_GUIDE.md
│   └── API_REFERENCE.md
├── render.yaml             # Render deployment blueprint
└── .env.example            # Environment variable template
```

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local instance or Atlas URI)
- Judge0 API key ([RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce))

### 1. Clone & Setup Backend

```bash
git clone <repository-url>
cd EXAMGUARD-AI

# Create Python virtual environment
python -m venv .venv
source .venv/bin/activate    # macOS/Linux
# .venv\Scripts\activate     # Windows

# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, secret keys, and Judge0 API key
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend (port 9000)
cd backend
uvicorn app.main:app --reload --port 9000

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

### 4. Access the Application

| Portal | URL |
|--------|-----|
| Student Portal | http://localhost:5173 |
| Admin Portal | http://localhost:5173/admin |
| API Docs (Swagger) | http://localhost:9000/docs |

### 5. Create First Admin

Register an admin account via the API or the admin registration page.

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URL` | MongoDB connection string | ✅ |
| `MONGODB_DB` | Database name | ✅ |
| `SECRET_KEY` | JWT signing key for students | ✅ |
| `ADMIN_SECRET_KEY` | JWT signing key for admins | ✅ |
| `JUDGE0_API_URL` | Judge0 API base URL | ✅ |
| `JUDGE0_API_KEY` | RapidAPI key for Judge0 | ✅ |
| `CORS_ORIGINS` | Comma-separated allowed origins | ✅ |
| `ENVIRONMENT` | `development` or `production` | ✅ |
| `LOG_LEVEL` | Logging level (INFO, DEBUG, etc.) | Optional |

## Testing

```bash
# Run all backend tests
cd backend
source ../.venv/bin/activate
python -m pytest tests/ -v --tb=short
```

## Documentation

- [Developer Guide](docs/DEVELOPER_GUIDE.md) — System workflows, architecture deep-dive
- [API Reference](docs/API_REFERENCE.md) — Complete endpoint documentation

## Deployment

- **Backend** → [Render](https://render.com) (see `render.yaml`)
- **Frontend** → [Vercel](https://vercel.com) (see `frontend/vercel.json`)
- **Database** → MongoDB Atlas

## Author

**Om Chandrakant Deo** — ExamGuard Global © 2026
