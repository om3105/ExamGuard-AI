# ExamGuard AI

AI-powered online examination platform with real-time proctoring, behavior analysis, and course management.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.12 |
| Database | MongoDB (Beanie ODM) |
| Auth | JWT (bcrypt + HS256) |
| Code Execution | Judge0 API |
| Deployment | Vercel (frontend) + Render (backend) |

## Project Structure

```
EXAMGUARD-AI/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── core/            # Security, logging, config
│   │   ├── db/              # Database session
│   │   ├── models/          # Beanie document models
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   └── main.py          # Application entry point
│   ├── tests/               # pytest test suite
│   ├── scripts/             # Seed scripts
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                # React + Vite application
│   ├── src/
│   │   ├── admin/           # Admin portal (dashboard, exams, courses, monitoring)
│   │   ├── student/         # Student portal (dashboard, exams, courses, profile)
│   │   ├── App.jsx          # Root component with routing
│   │   └── main.jsx         # Entry point
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── docs/                    # Documentation
│   ├── DEVELOPER_GUIDE.md
│   └── API_REFERENCE.md
│
├── render.yaml              # Render deployment config
└── .gitignore
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.12+
- **MongoDB** running on `localhost:27017`

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and secret keys

# Start server (port 9000)
uvicorn app.main:app --reload --port 9000
```

API docs available at: http://localhost:9000/docs

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Default: VITE_USER_API_URL=http://localhost:9000

# Start dev server (port 5173)
npm run dev
```

Open http://localhost:5173 in your browser.

## Features

### Student Portal
- Registration and login
- Interactive exam taking with code editor
- Real-time behavior monitoring
- Course enrollment and progress tracking
- Student profile management

### Admin Portal
- Exam creation and management (manual + AI-generated)
- Live proctoring and monitoring
- Student management
- Course and enrollment management
- Analytics dashboard
- Student progress tracking

## API Overview

| Endpoint | Description |
|---|---|
| `POST /auth/register` | Student registration |
| `POST /auth/token` | Student login |
| `GET /exams/` | List assigned exams |
| `GET /courses/` | List courses |
| `POST /admin/api/auth/login` | Admin login |
| `GET /admin/api/analytics/overview` | Dashboard analytics |

Full API reference: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

## Deployment

- **Frontend**: Deploy to Vercel — see `frontend/vercel.json`
- **Backend**: Deploy to Render — see `render.yaml`

## Documentation

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)
