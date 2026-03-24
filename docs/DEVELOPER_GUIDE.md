# ExamGuard AI: Comprehensive Developer Guide

## 1. System Architecture Overview

ExamGuard AI operates on a strictly decoupled client-server architecture.
- **Frontend Layer**: React 19 + Vite + Tailwind CSS.
- **Backend Layer**: FastAPI + Motor (Async MongoDB).
- **Core Integrations**: 
  - Google OAuth2 (SSO Authentication)
  - Resend.com (Transactional Email / Password Reset)
  - Judge0 (Remote Code Execution for IDE exams)

### 1.1 Directory Map
```text
EXAMGUARD-AI/
├── backend/
│   ├── app/
│   │   ├── core/         # Global singletons (Security, DB Config, Logging)
│   │   ├── models/       # Beanie ORM Schemas (NoSQL Documents)
│   │   ├── routes/       # FastAPI REST Controllers (Admin & Student)
│   │   ├── services/     # Third-party Integrations (Email, Generative AI)
│   │   └── utils/        # Generic pure helper functions
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── admin/        # Domain-specific pages and context for Admin Panel
│   │   ├── student/      # Domain-specific pages and context for Student Panel
│   │   ├── components/   # Pure UI Widgets globally accessible (Modal, Sidebar)
│   │   ├── hooks/        # Centrally abstracted React Custom Hooks
│   │   └── services/     # API networking singletons (apiClient.js)
└── docs/                 # Engineering Guides & Topographies
```

## 2. API Gateway & Network Services

The frontend no longer uses arbitrary `fetch()` calls. All HTTP activity is routed through the centralized `frontend/src/services/apiClient.js` Axios factory.

- **Student Gateway**: `import api from 'services/api.js'` maps to `http://localhost:8000`
- **Admin Gateway**: `import { adminAuth, examAPI } from 'services/adminApi.js'` maps to `http://localhost:8000/admin/api`

### Cold-Start Tolerances
The `apiClient.js` service is engineered to automatically stall and retry HTTP failures intersecting with 5xx layer errors. This specifically prevents the React UI from crashing if the Render FastAPI instance is sleeping (cold start).

## 3. Local Development Startup

### 3.1 Backend FastAPI Server
1. Ensure MongoDB is running locally (`mongod`), explicitly bridging to `mongodb://localhost:27017/examguard`.
2. Activate a Python `3.12` venv and `pip install -r requirements.txt`.
3. Fill your local `backend/.env` according to `backend/.env.example`.
4. Start the server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 3.2 Frontend React (Vite) Server
1. Using Node `18+`, execute `npm install`.
2. Fill your local `frontend/.env` according to `frontend/.env.example`.
3. Launch proxy server:
   ```bash
   npm run dev
   ```

## 4. Expanding the Architecture

When developing new features, adherence to the strict domain layouts is mandatory:
- **New Reusable React Component?** Placed directly into `frontend/src/components/`. If strictly domain-locked, place into `components/admin/` or `components/student/`.
- **New Complex React State Logic?** Built out as a discrete file in `frontend/src/hooks/use<Feature>.js`.
- **New FastAPI Data Endpoint?** Register under `backend/app/routes/` and explicitly import to the router chain in `backend/app/main.py`.

## 5. Deployment Readiness

1. The backend is configured to cleanly absorb traffic over standard ports while exposing explicit allowed `CORS_ORIGINS`.
2. Avoid committing the `.env` configuration matrices into Git version control. Rely strictly on external container secrets managers (Vercel / Render environment variable consoles).
