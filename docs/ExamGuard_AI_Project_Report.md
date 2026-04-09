# ExamGuard AI — Complete Internship Project Report

---

**Project Title:** ExamGuard AI — AI-Powered Online Examination & Proctoring Platform

**Intern Name:** Om Chandrakant Deo

**Report Type:** Internship Project Report

**Technology Stack:** React 19 · FastAPI · MongoDB · Python 3.12 · Vite · Tailwind CSS

**Deployment:** Vercel (Frontend) · Render (Backend) · MongoDB Atlas (Database)

**Live URL:** https://examguardlive.vercel.app

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction](#2-introduction)
3. [Project Objectives](#3-project-objectives)
4. [Technology Stack & Justification](#4-technology-stack--justification)
5. [System Architecture](#5-system-architecture)
6. [Database Design](#6-database-design)
7. [Key Modules & Features](#7-key-modules--features)
   - 7.1 Student Portal
   - 7.2 Admin Portal
   - 7.3 AI Test Generator
   - 7.4 Behavioral Proctoring Engine
   - 7.5 Code Execution Engine
   - 7.6 Course Management System
8. [API Architecture](#8-api-architecture)
9. [Security Implementation](#9-security-implementation)
10. [Deployment & DevOps](#10-deployment--devops)
11. [Codebase Refactoring & Architectural Audit](#11-codebase-refactoring--architectural-audit)
12. [Challenges Faced & Solutions](#12-challenges-faced--solutions)
13. [Intern Responsibilities](#13-intern-responsibilities)
14. [Key Learnings](#14-key-learnings)
15. [Future Scope](#15-future-scope)
16. [Conclusion](#16-conclusion)

---

## 1. Executive Summary

**ExamGuard AI** is a full-stack, enterprise-grade online examination platform built during the internship period. The platform provides a complete end-to-end solution for administering, proctoring, and analyzing academic assessments. It combines real-time behavioral analysis, AI-powered test generation, remote code execution, course management, and a secure multi-role authentication system into one unified application.

The system is designed to serve two distinct user roles — **Students** and **Administrators** — each with dedicated portals, protected API layers, and isolated JWT-based authentication schemes. The backend exposes over **40 REST API endpoints** across 16 route modules. The frontend comprises over **29 React page components** organized across a clean domain-driven architecture.

The project was successfully deployed to production on **Vercel** (frontend) and **Render** (backend), with MongoDB Atlas serving as the cloud database. A comprehensive 10-phase architectural refactoring was also executed to bring the codebase to enterprise production standards.

---

## 2. Introduction

The rise of remote learning and online assessments has exposed critical weaknesses in traditional examination systems: lack of proctoring integrity, manual question paper creation, no real-time monitoring, and limited performance analytics. **ExamGuard AI** was conceived and built to address each of these problems through technology.

The platform is not merely an "online quiz tool." It is a comprehensive academic management system featuring:

- **Behavioral Biometrics Tracking** — Keystroke patterns, paste events, tab switches, and mouse activity are silently logged during exams to generate an **Integrity Risk Score (0–100)** for each student.
- **Live Admin Monitoring** — Administrators can watch student behavior in real-time during examination windows.
- **AI-Powered Test Generation** — Administrators can generate entire exams (MCQ + coding sections) automatically from a curated question bank spanning multiple topics and difficulty levels.
- **Integrated Code IDE** — Students can write, run, and test code directly inside the exam interface, powered by the **Judge0** remote code execution engine.
- **Course Learning Hub** — A complete learning management system (LMS) with lessons, quizzes, and enrollment workflows.

---

## 3. Project Objectives

The following objectives were defined at the start of the internship and successfully fulfilled:

| # | Objective | Status |
|---|-----------|--------|
| 1 | Build a secure multi-role authentication system (Student + Admin) | ✅ Complete |
| 2 | Implement real-time behavioral proctoring with anomaly scoring | ✅ Complete |
| 3 | Build an AI-powered exam generator from curated question banks | ✅ Complete |
| 4 | Integrate Judge0 for in-browser code execution | ✅ Complete |
| 5 | Build a full Course Management / LMS module | ✅ Complete |
| 6 | Deploy the entire stack to cloud (Vercel + Render + Atlas) | ✅ Complete |
| 7 | Perform a 10-phase codebase architectural refactoring | ✅ Complete |
| 8 | Implement Google OAuth2 for Single Sign-On | ✅ Complete |
| 9 | Build Admin Analytics dashboard with performance metrics | ✅ Complete |
| 10 | Create comprehensive developer documentation | ✅ Complete |

---

## 4. Technology Stack & Justification

### 4.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.x | Core UI framework with Concurrent mode |
| **Vite** | 7.x | Build tool — faster than CRA, native ES modules |
| **Tailwind CSS** | 4.x | Utility-first styling, rapid responsive design |
| **React Router DOM** | 7.x | Client-side SPA routing with nested layouts |
| **Axios** | 1.x | HTTP client with interceptors and retry logic |
| **Recharts** | 3.x | Charting library for analytics dashboards |
| **Lucide React** | 0.5x | Consistent icon set |

**Justification:** React 19 was chosen for its mature ecosystem and concurrent rendering capabilities. Vite significantly reduces development cycle time compared to Webpack-based alternatives. Tailwind CSS allows rapid UI prototyping while maintaining strict design consistency.

### 4.2 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.135 | Async Python REST framework with auto Swagger docs |
| **Python** | 3.12 | Core language — latest stable release |
| **Motor** | 3.7 | Async MongoDB driver for Python |
| **Beanie** | 2.0 | Async ODM/ORM layer over Motor (type-safe models) |
| **Pydantic** | 2.x | Data validation and serialization |
| **Uvicorn** | 0.41 | ASGI server for production and development |
| **python-jose** | 3.5 | JWT token creation and validation |
| **bcrypt / passlib** | — | Secure password hashing |
| **httpx** | 0.28 | Async HTTP client for Google OAuth and Judge0 |
| **aiosmtplib** | 3.0 | Async email dispatch |

**Justification:** FastAPI was selected for its first-class `async/await` support, automatic Pydantic validation, and built-in Swagger UI interface for API documentation. Beanie eliminates raw MongoDB query boilerplate while providing full type safety.

### 4.3 Database

| Technology | Purpose |
|-----------|---------|
| **MongoDB Atlas** | Cloud NoSQL document database |
| **Motor / Beanie** | Async ODM for type-safe queries |

**Justification:** MongoDB's document model naturally fits the deeply nested exam data structures (sections → questions → options → test cases). Atlas provides a globally distributed free-tier cluster ideal for a production deployment.

### 4.4 Third-Party Integrations

| Service | Purpose |
|---------|---------|
| **Judge0 API** | Remote code compilation and test execution |
| **Resend API** | Transactional email (password reset, verification) |
| **Google OAuth2** | Single Sign-On for Student portal |
| **Render** | Backend PaaS deployment (Docker-based) |
| **Vercel** | Frontend deployment with automatic CI/CD |

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                          │
│         React 19 + Vite  (Vercel — examguardlive.vercel.app) │
│                                                            │
│  ┌───────────────────┐     ┌──────────────────────────┐   │
│  │   Student Portal  │     │      Admin Portal        │   │
│  │  /login, /dash..  │     │  /admin/login, /admin/.. │   │
│  └─────────┬─────────┘     └────────────┬─────────────┘   │
└────────────┼──────────────────────────┬─┘                  │
             │   Axios + JWT Bearer      │                    │
             ▼                          ▼                    │
┌────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                     │
│        FastAPI (Render — examguard-api.onrender.com)       │
│                                                            │
│  Student API (/auth, /exams, /courses, /behavior)          │
│  Admin API   (/admin/api/auth, /exams, /students...)       │
│                                                            │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Auth   │  │  Exams   │  │ Courses  │  │ Analytics │  │
│  │ Routes  │  │  Routes  │  │  Routes  │  │  Routes   │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
└───────┼────────────┼─────────────┼───────────────┼────────┘
        ▼            ▼             ▼               ▼
┌────────────────────────────────────────────────────────────┐
│                     DATA / SERVICES LAYER                  │
│                                                            │
│  ┌─────────────────────┐     ┌──────────────────────────┐ │
│  │    MongoDB Atlas     │     │    External Services     │ │
│  │  (Motor + Beanie)    │     │  Judge0 | Resend | OAuth │ │
│  │                      │     │                          │ │
│  │  users               │     │  Code Execution          │ │
│  │  exams               │     │  Email Dispatch          │ │
│  │  exam_submissions    │     │  Google SSO              │ │
│  │  behavior_logs       │     │                          │ │
│  │  exam_assignments    │     │                          │ │
│  │  courses             │     │                          │ │
│  └─────────────────────┘     └──────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Frontend Directory Structure

```
frontend/src/
├── admin/
│   ├── context/          # AdminAuthContext.jsx (Admin JWT state)
│   └── pages/            # 17 Admin pages (Dashboard, Exams, Students...)
├── student/
│   ├── context/          # StudentAuthContext.jsx (Student JWT state)
│   └── pages/            # 12 Student pages (Dashboard, ExamPage...)
├── components/
│   ├── admin/            # Sidebar.jsx (Admin navigation)
│   ├── student/          # exam/ sub-components (CodeEditor, QuestionPalette...)
│   ├── Modal.jsx
│   └── ServerWakingOverlay.jsx
├── hooks/                # 6 Custom React Hooks (useExamTimer, useProctoringLogger...)
├── services/             # API Singletons (apiClient.js, api.js, adminApi.js)
└── App.jsx               # Root Router + Protected Route wrappers
```

### 5.3 Backend Directory Structure

```
backend/app/
├── core/
│   ├── database.py        # Motor + Beanie initialization
│   ├── security.py        # JWT creation, password hashing (Student)
│   ├── admin_security.py  # JWT creation (Admin — isolated keys)
│   ├── logging_config.py  # Structured logging setup
│   └── error_handlers.py  # Global 422/500 FastAPI handlers
├── models/
│   ├── all_models.py      # User, Exam, ExamSubmission, BehaviorLog, ExamAssignment
│   ├── admin_models.py    # Admin account document
│   └── course_models.py   # Course, Lesson, Quiz, Enrollment documents
├── routes/                # 16 route modules (see Section 8)
├── services/
│   ├── email_service.py   # Resend API integration
│   └── ai_test_generation/
│       ├── template_repository.py  # 200+ question bank
│       └── builder.py             # Exam assembly engine
└── utils/
    └── datetime_utils.py  # IST timezone helpers
```

---

## 6. Database Design

The application uses **MongoDB** with the **Beanie** ODM. Five core document collections are defined:

### 6.1 User Collection (`users`)
```
User {
  _id           : ObjectId
  username      : String (unique, indexed)
  email         : String (unique, indexed)
  password_hash : String
  full_name     : String?
  phone_number  : String?
  course        : String?
  college       : String?
  is_active     : Boolean
  created_at    : DateTime (IST)
  auth_provider : "local" | "google"
  google_id     : String?
  reset_token   : String?
  reset_token_expiry : DateTime?
}
```

### 6.2 Exam Collection (`exams`)
```
Exam {
  _id              : ObjectId
  title            : String
  description      : String?
  sections         : [Section]
  total_marks      : Integer
  duration_minutes : Integer
  start_time       : DateTime (timezone-aware)
  created_at       : DateTime (IST)
}

Section {
  title     : String
  questions : [MCQQuestion | CodingQuestion]
}

MCQQuestion {
  id      : String
  type    : "mcq"
  text    : String
  points  : Integer
  options : [MCQOption]
}

CodingQuestion {
  id                : String
  type              : "coding"
  text              : String
  points            : Integer
  problem_statement : String
  constraints       : String
  test_cases        : [TestCase]
}
```

### 6.3 Exam Submission Collection (`exam_submissions`)
```
ExamSubmission {
  _id            : ObjectId
  user_id        : String (indexed)
  exam_id        : String (indexed)
  exam_title     : String
  answers        : {section_index: {question_index: answer}}
  status         : "IN_PROGRESS" | "COMPLETED" | "GRADED" | "TERMINATED"
  attempt_number : Integer
  score          : Float?
  mcq_score      : Float?
  coding_score   : Float?
  anomaly_score  : Integer (0-100)
  risk_level     : "LOW" | "MEDIUM" | "HIGH"
  risk_factors   : [String]
  submitted_at   : DateTime
}
```

### 6.4 Behavior Log Collection (`behavior_logs`)
```
BehaviorLog {
  _id               : ObjectId
  submission_id     : String
  user_id           : String (indexed)
  exam_id           : String (indexed)
  keystroke_count   : Integer
  avg_typing_speed  : Float (keys/second)
  backspace_ratio   : Float
  paste_count       : Integer
  pasted_chars      : Integer
  tab_switch_count  : Integer
  mouse_click_count : Integer
  time_per_question : {sIdx-qIdx: milliseconds}
  events            : [{type, timestamp}] (max 500)
  recorded_at       : DateTime
}
```

### 6.5 Exam Assignment Collection (`exam_assignments`)
```
ExamAssignment {
  _id               : ObjectId
  exam_id           : String (indexed)
  assigned_students : [user_id_strings]
  max_attempts      : Integer
  start_time        : DateTime?
  end_time          : DateTime?
}
```

---

## 7. Key Modules & Features

### 7.1 Student Portal

The Student Portal provides the complete examination experience for end-users.

**Pages:**
| Page | File | Description |
|------|------|-------------|
| Login | `LoginPage.jsx` | Email/password + Google OAuth SSO |
| Register | `RegisterPage.jsx` | Account creation with validation |
| Google Callback | `GoogleCallbackPage.jsx` | OAuth token exchange handler |
| Forgot Password | `ForgotPasswordPage.jsx` | Email reset request via Resend API |
| Reset Password | `ResetPasswordPage.jsx` | Token-validated password update |
| Dashboard | `DashboardPage.jsx` | Overview: progress, exams, performance |
| Waiting Room | `WaitingRoomPage.jsx` | Pre-exam countdown and instructions |
| Exam | `ExamPage.jsx` | Full exam interface (MCQ + Code IDE) |
| Test Completed | `TestCompletedPage.jsx` | Score reveal and submission summary |
| Course List | `CourseList.jsx` | Browse and enroll in courses |
| Course View | `CourseView.jsx` | Lessons, quizzes, progress tracking |
| Student Profile | `StudentProfile.jsx` | Profile management and history |

**Core Student Hooks (in `src/hooks/`):**

| Hook | Responsibility |
|------|---------------|
| `useExamTimer.js` | Countdown timer with auto-submit on expiry |
| `useExamNavigation.js` | Section/question traversal state management |
| `useQuestionStatus.js` | Tracks answered/flagged/visited question states |
| `useProctoringLogger.js` | Captures behavioral events and flushes to backend every 15 seconds |
| `useExamSubmission.js` | Handles the submit workflow, scoring, and status transitions |
| `useCodeExecution.js` | Sends code to Judge0 proxy and handles test results |

---

### 7.2 Admin Portal

The Admin Portal gives instructors full control over the examination ecosystem.

**Pages:**

| Page | File | Description |
|------|------|-------------|
| Login | `Login.jsx` | Admin-specific login with isolated JWT |
| Register | `Register.jsx` | Create new admin accounts |
| Dashboard | `Dashboard.jsx` | System-wide KPI overview |
| Exam Management | `ExamManagement.jsx` | List, search, filter all exams |
| Create Exam | `CreateExam.jsx` | Manually build exams with sections |
| Edit Exam | `EditExam.jsx` | Modify existing exam content |
| Preview Exam | `PreviewExam.jsx` | Student-view preview before publishing |
| Exam Results | `ExamResults.jsx` | Per-exam score distribution + anomaly flags |
| AI Test Generator | `AITestGenerator.jsx` | Automated exam creation from question bank |
| Students | `Students.jsx` | Student roster management |
| Student Progress | `StudentProgress.jsx` | Individual student learning analytics |
| Course Management | `CourseManagement.jsx` | Create and manage course content |
| Edit Course | `EditCourse.jsx` | Modify lessons, quizzes, materials |
| Course Requests | `CourseRequests.jsx` | Approve/reject enrollment requests |
| Live Monitoring | `LiveMonitoring.jsx` | Real-time proctoring dashboard |
| Analytics | `Analytics.jsx` | Platform-wide performance analytics |
| Create Admin | `CreateAdmin.jsx` | Provision new admin accounts |

---

### 7.3 AI Test Generator

One of the most technically significant features is the AI-powered exam generation system.

**How it works:**
1. The Admin opens the `AITestGenerator` page and selects:
   - **Topic** (Python, Java, JavaScript, DSA, General CS)
   - **Difficulty Level** (Easy / Medium / Hard)
   - **Number of Aptitude MCQs**, Technical MCQs, and Coding Questions
2. The request is dispatched to `POST /admin/api/ai/generate`
3. The backend's `template_repository.py` module selects questions from over **200+ curated templates** spanning:
   - **Aptitude MCQs:** Speed-Distance, Ratios, Probability, CI/SI, Work-Rate
   - **Technical MCQs:** Python, Java, JavaScript, DSA, General CS
   - **Coding Problems:** Two Sum, Valid Parentheses, Fibonacci, LCS, Merge Intervals, N-Queens
4. The assembled exam JSON is returned to the frontend and pre-fills the Create Exam form

**Question Bank Scale:**
- **Aptitude Templates:** 22 questions across 3 difficulty tiers
- **Technical Templates:** 55+ MCQs across 5 topics × 3 difficulties
- **Coding Templates:** 25+ problems across Python, Java, and General categories

---

### 7.4 Behavioral Proctoring Engine

The proctoring system is one of the core differentiators of ExamGuard AI.

**Data Captured Per Exam Session:**

| Signal | Description |
|--------|-------------|
| `keystroke_count` | Total keystrokes during exam |
| `avg_typing_speed` | Keys per second (weighted average) |
| `backspace_ratio` | Backspace : total keystroke ratio |
| `paste_count` | Number of paste events (Ctrl+V) |
| `pasted_chars` | Characters introduced via paste |
| `tab_switch_count` | Number of times student left the exam tab |
| `mouse_click_count` | Total mouse clicks |
| `time_per_question` | Milliseconds spent on each question |
| `events[]` | Raw timeline (up to 500 entries) |

**Data Flow:**
- The `useProctoringLogger` React hook captures events in the browser continuously.
- Every **15 seconds**, a delta payload (only NEW events since last flush) is sent to `POST /behavior/log`.
- The backend **accumulates** deltas into a single `BehaviorLog` document per session.
- On exam submission, the behavior data is analyzed to compute an **Integrity Risk Score (0–100)**.
- Submissions are flagged as `LOW`, `MEDIUM`, or `HIGH` risk with human-readable `risk_factors` and a `risk_explanation`.

---

### 7.5 Code Execution Engine

The Exam Page includes a full **Code Editor IDE** for programming-type questions.

**Architecture:**
```
Student types code
       ↓
useCodeExecution hook sends code to:
POST /exams/execute
       ↓
FastAPI backend proxies to Judge0 API
(https://ce.judge0.com)
       ↓
Judge0 compiles and executes code
Runs against test cases
       ↓
Returns: { passed, actual, expected, status, error }
       ↓
UI renders pass/fail per test case
```

**Supported Languages:** Any language supported by Judge0, with Language ID passed from the frontend. Default setups include Python 3 (ID: 71), Java (ID: 62), JavaScript (ID: 63).

---

### 7.6 Course Management System

The platform includes a complete **Learning Management System (LMS)**:

**Student Side:**
- Browse available courses with descriptions, lesson counts, and prerequisites
- Submit enrollment requests (pending admin approval)
- Access enrolled courses with structured lessons and video-links
- Track completion with per-lesson checkmarks
- Take module quizzes and see scores

**Admin Side:**
- Create courses with rich content (markdown descriptions, lesson outlines)
- Manage course modules and their ordering
- View and approve/reject enrollment requests
- Monitor student progress per course through the Analytics dashboard

---

## 8. API Architecture

The backend exposes **40+ REST endpoints** organized across 16 route module files.

### 8.1 Route Modules

| Module File | Prefix | Description |
|------------|--------|-------------|
| `auth_routes.py` | `/auth` | Student registration, login, OAuth, password reset |
| `exam_routes.py` | `/exams` | Student exam access, start, submit, execute code |
| `behavior_routes.py` | `/behavior` | Proctoring data ingestion (delta model) |
| `course_routes.py` | `/courses` | Course listing, enrollment, progress |
| `course_progress_routes.py` | `/courses` | Lesson completion, quiz submission |
| `student_profile_routes.py` | `/student/profile` | Profile CRUD |
| `admin_auth.py` | `/admin/api/auth` | Admin login, register, me |
| `exam_mgmt.py` | `/admin/api/exams` | Full exam CRUD + assignment |
| `admin_course.py` | `/admin/api/courses` | Course CRUD |
| `admin_enrollment_routes.py` | `/admin/api` | Enrollment approval workflow |
| `student_mgmt.py` | `/admin/api/students` | Student roster management |
| `analytics.py` | `/admin/api/analytics` | Dashboard analytics, exam results |
| `monitoring_routes.py` | `/admin/api/monitoring` | Live proctoring session feeds |
| `admin_progress.py` | `/admin/api/progress` | Student learning progress metrics |
| `ai_generation_routes.py` | `/admin/api/ai` | AI exam generation trigger |

### 8.2 Authentication Design

The system uses **two completely separate JWT authentication schemes** to prevent privilege escalation:

| Attribute | Student JWT | Admin JWT |
|-----------|------------|----------|
| **Secret Key** | `SECRET_KEY` env var | `ADMIN_SECRET_KEY` env var |
| **Algorithm** | HS256 | HS256 |
| **Expiry** | 1440 minutes (24h) | 1440 minutes (24h) |
| **Guard Function** | `get_current_user()` | `get_current_admin()` |
| **Header** | `Authorization: Bearer <token>` | `Authorization: Bearer <token>` |

### 8.3 Cold-Start Resilience

The Render free tier hibernates services after 15 minutes of inactivity. The `apiClient.js` Axios factory includes:
- Automatic detection of `5xx` cold-start errors
- Loading overlay (`ServerWakingOverlay`) shown to users during server wake-up
- Exponential back-off retry logic for failed requests

---

## 9. Security Implementation

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | `bcrypt` via `passlib` library |
| **Student JWT** | HS256 signed, 24-hour expiry, verified server-side per request |
| **Admin JWT** | Separate HS256 key, completely isolated from student tokens |
| **CORS** | Strict allowlist via `CORS_ORIGINS` environment variable |
| **Google OAuth** | `httpx` async client — token exchanged server-side, user is matched by `google_id` |
| **Password Reset** | Time-limited token (stored hash in DB), compared with `secrets.compare_digest` |
| **Timezone Safety** | All datetime comparisons use timezone-aware objects (UTC/IST) to prevent `TypeError` crashes |
| **Input Validation** | Pydantic V2 schemas validate all request payloads before reaching route handlers |
| **Global Error Handlers** | 422 Unprocessable Entity and 500 Internal Server Error are caught by `error_handlers.py` |

---

## 10. Deployment & DevOps

### 10.1 Cloud Infrastructure

| Layer | Service | Configuration |
|-------|---------|---------------|
| **Database** | MongoDB Atlas (Free M0) | Network access: allow all IPs (for Render) |
| **Backend** | Render (Docker) | Root dir: `backend/`, Dockerfile path auto-detected |
| **Frontend** | Vercel | Framework: Vite, Root dir: `frontend/` |

### 10.2 Backend Dockerfile Strategy

The backend is containerized with Docker. Render pulls the image directly from the GitHub repository's Dockerfile. Key environment variables are injected via Render's secret management console:

```
MONGODB_URL        = (Atlas connection string)
SECRET_KEY         = (random 256-bit hex string)
ADMIN_SECRET_KEY   = (separate random 256-bit hex string)
CORS_ORIGINS       = https://examguardlive.vercel.app
RESEND_API_KEY     = (Resend dashboard API key)
FRONTEND_URL       = https://examguardlive.vercel.app
GOOGLE_CLIENT_ID   = (Google Cloud Console)
GOOGLE_CLIENT_SECRET = (Google Cloud Console)
GOOGLE_REDIRECT_URI  = https://examguardlive.vercel.app/auth/google/callback
JUDGE0_API_URL     = https://ce.judge0.com
```

### 10.3 Frontend Environment (Vercel)

```
VITE_USER_API_URL  = https://examguard-api.onrender.com
VITE_ADMIN_API_URL = https://examguard-api.onrender.com/admin/api
```

### 10.4 CI/CD Pipeline

Both platforms provide automatic CI/CD:
- **Vercel:** Any push to `main` branch triggers a new frontend build and deployment.
- **Render:** Any push to `main` branch triggers a new Docker image build and deployment.

---

## 11. Codebase Refactoring & Architectural Audit

A comprehensive **10-phase architectural refactoring** was executed as a dedicated workstream to bring the codebase to production enterprise standards.

### Phases Completed

| Phase | Description | Outcome |
|-------|-------------|---------|
| **Phase 1** | Full Codebase Analysis & Mapping | All dead code, orphans, and inconsistencies identified |
| **Phase 2** | Remove Unnecessary Files | Deleted 7+ backend diagnostic scripts, orphaned React components |
| **Phase 3** | Architectural Restructuring | Flattened nested route dirs; unified services, hooks, components |
| **Phase 4** | Code Quality & Consolidation | PascalCase/snake_case enforcement; deduplicated API handlers |
| **Phase 5** | Fix Runtime Errors | Patched timezone `TypeError` crashes; hardened API payloads |
| **Phase 6** | Configuration Cleanup | Generated `.env.example` for both stacks; removed all hardcoded URLs |
| **Phase 7** | Documentation | Created `DEVELOPER_GUIDE.md`, `API_REFERENCE.md`, `DEPLOYMENT_GUIDE.md` |
| **Phase 8** | System Testing | Verified Auth flows, Exam rendering, Admin panel operations |
| **Phase 9** | Performance | Minimized React re-renders; optimized MongoDB query indexes |
| **Phase 10** | Final Validation | `npm run build` completes — 2,500+ modules transformed in 2.53s |

### Key Structural Changes

**Frontend (before → after):**
- `src/lib/apiClient.js` → `src/services/apiClient.js`
- `src/admin/components/Sidebar.jsx` → `src/components/admin/Sidebar.jsx`
- `src/admin/services/adminApi.js` → `src/services/adminApi.js`
- `src/student/services/api.js` → `src/services/api.js`
- `src/student/hooks/use*.js` (6 files) → `src/hooks/use*.js`

**Backend (before → after):**
- `backend/app/db/session.py` → `backend/app/core/database.py`
- `backend/app/routes/routes/` (recursive) → `backend/app/routes/` (flat)
- Production API sanitized of all diagnostic endpoints

---

## 12. Challenges Faced & Solutions

### Challenge 1: Naive Datetime `TypeError` Crash
**Problem:** MongoDB returns timezone-naive `datetime` objects. Comparing these with timezone-aware Python `datetime.now(UTC)` caused a `TypeError: can't compare offset-naive and offset-aware datetimes` → HTTP 500 crash on the password reset endpoint.

**Solution:** Implemented a timezone coercion patch in `auth_routes.py`. All datetimes retrieved from MongoDB are explicitly coerced to UTC-aware using `.replace(tzinfo=timezone.utc)` before any comparison operation.

---

### Challenge 2: SMTP Email Failure on Render
**Problem:** The initial email service used `aiosmtplib` connecting to `smtp.gmail.com:587`. Render's free-tier infrastructure **blocks outbound SMTP on port 587**, causing `TimeoutError`.

**Solution:** Migrated the email service entirely to the **Resend API** (HTTP-based transactional email), which uses HTTPS port 443 — always available. Replaced the SMTP implementation with a clean `httpx.AsyncClient.post()` call to `https://api.resend.com/emails`.

---

### Challenge 3: Google SSO — Password-less Account Security
**Problem:** Students who registered via Google OAuth had no `password_hash`. If they later tried the "Forgot Password" flow, there was nothing to reset.

**Solution:** On Google OAuth registration, a **cryptographically random temporary password** is generated using `secrets.token_urlsafe(32)` and hashed before being stored. This allows the standard password reset flow to function normally if the user later wants to set a real password.

---

### Challenge 4: Behavioral Proctoring — Submission ID Timing
**Problem:** The `BehaviorLog` needed to reference a `submission_id`, but the submission record is only created when the student **starts** the exam — the behavior logging begins before that.

**Solution:** Changed the lookup strategy. During the exam, behavior logs are stored and retrieved by `(user_id, exam_id)` pair. The `submission_id` is bound **late** (updated in the log when the student formally starts). This eliminates the circular dependency.

---

### Challenge 5: Import Resolution After Refactoring
**Problem:** After physically moving 40+ frontend files across directories (hooks, services, components), all existing `import` paths broke, causing the Vite build to fail across nearly every component.

**Solution:** Used a targeted `sed` command to atomically rewrite all import paths across every affected file in one pass. The `npm run build` was used as the ground-truth validator after each batch of path corrections.

---

## 13. Intern Responsibilities

As an intern on the ExamGuard AI project, the following responsibilities were assigned and fulfilled:

### Full-Stack Development
- Designed and implemented the complete full-stack system architecture
- Built **17 Admin portal pages** and **12 Student portal pages** in React
- Implemented **40+ FastAPI REST API endpoints** across **16 route files**
- Created **5 MongoDB document models** with strict Beanie ODM schemas

### Core Feature Engineering
- Engineered the **Behavioral Proctoring Engine** — delta-based telemetry system with real-time anomaly scoring
- Built the **AI Test Generator** — curated question bank with 200+ templates across 5+ technical topics
- Integrated the **Judge0 code execution** proxy endpoint for in-browser code IDE
- Implemented **Google OAuth2 SSO** with server-side token exchange
- Built the **Resend API email service** for transactional password reset emails
- Developed the **Cold-Start Resilience** system for Render free-tier hibernation

### Authentication & Security
- Implemented dual-isolated JWT authentication schemes (Student + Admin)
- Applied `bcrypt` password hashing, timezone-safe datetime comparisons, and strict Pydantic input validation
- Configured CORS, environment variable management, and secret key isolation

### DevOps & Deployment
- Dockerized the FastAPI backend and deployed to **Render**
- Configured **Vercel** frontend deployment with environment variable injection
- Set up **MongoDB Atlas** free cluster with network access rules
- Established end-to-end CI/CD via GitHub integration

### Architectural Refactoring (10-Phase Audit)
- Led a comprehensive 10-phase codebase audit
- Restructured both frontend and backend to strict domain-driven architecture
- Authored `DEVELOPER_GUIDE.md`, `API_REFERENCE.md`, and `DEPLOYMENT_GUIDE.md`

---

## 14. Key Learnings

| Domain | Learning |
|--------|----------|
| **FastAPI** | Async route handlers, Beanie ODM, Pydantic V2 schema design, JWT middleware |
| **React Architecture** | Domain-driven component design, Custom hooks as business logic containers, Context API for auth state |
| **MongoDB** | Document schema design for deeply nested data, compound index optimization, Beanie ODM patterns |
| **Security** | JWT isolation between roles, bcrypt hashing, OAuth2 PKCE flow, timezone-safe datetime comparisons |
| **DevOps** | Docker containerization, Vercel/Render CI/CD pipelines, Atlas network configuration |
| **API Design** | REST convention adherence, consistent error response structure, HTTP status code semantics |
| **Problem Solving** | Debugging production SMTP blocks, resolving proctoring data race conditions, fixing import paths at scale |
| **Engineering** | How to systematically audit, refactor, and document a large codebase |

---

## 15. Future Scope

| Feature | Priority | Description |
|---------|----------|-------------|
| **ML Anomaly Detection** | High | Train a scikit-learn classifier on historical behavioral logs to replace the rule-based anomaly scoring |
| **Video Proctoring** | High | Integrate WebRTC + MediaRecorder API for optional webcam snapshots during exam sessions |
| **Plagiarism Engine** | Medium | Run MOSS (Measure of Software Similarity) on submitted code to detect copy-paste plagiarism |
| **Email Notifications** | Medium | Send automated score reports and exam reminders to students |
| **Mobile App** | Medium | Build a React Native app for students to access the platform on mobile |
| **Question Bank Editor** | Low | Admin UI to add/edit questions directly into the `template_repository.py` question bank |
| **WebSocket Live Monitoring** | Low | Replace HTTP polling with WebSocket for truly live proctoring feeds |
| **Multi-Tenant Support** | Low | Allow multiple institutions to run isolated instances on the same backend |

---

## 16. Conclusion

ExamGuard AI successfully demonstrates the development of a production-grade, enterprise-scale full-stack web application from concept to deployment. The project integrates a diverse set of modern technologies — React 19, FastAPI, MongoDB, Docker, Google OAuth, Judge0, and Resend — into a cohesive, well-architected system.

The internship provided deep, practical experience in:
- Designing clean REST APIs that are secure, consistent, and well-documented
- Managing complex state in large React applications through custom hooks and context providers
- Operating cloud infrastructure (Vercel + Render + MongoDB Atlas)
- Performing systematic architectural audits and large-scale codebase refactoring
- Debugging production issues including SMTP blocks, timezone crashes, and data race conditions

The resulting platform is fully functional, deployed to production, and maintained under version control with professional documentation that enables any new developer to understand, extend, and deploy the system independently.

---

*© 2026 Om Chandrakant Deo — ExamGuard AI Internship Project Report*
*Live Application: https://examguardlive.vercel.app*
*GitHub Repository: https://github.com/om3105/ExamGuard-AI*
