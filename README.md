# ExamGuard AI

ExamGuard AI is a comprehensive, secure, and intelligent examination management system designed to facilitate seamless online assessments. It features dual portals for Administrators and Students, ensuring a robust environment for creating, monitoring, and taking exams with integrated proctoring capabilities.

## 🚀 Project Overview

The system is split into two distinct applications:

1.  **Admin Portal**: For creating exams, managing students, and viewing analytics.
2.  **User (Student) Portal**: For students to take assigned exams in a secure environment.

### Key Features
-   **Role-Based Access Control**: Separate secure logins for Admins and Students.
-   **Comprehensive Exam Creation**: Support for Multiple Choice Questions (MCQs) and Coding Challenges (with test cases).
-   **Real-time Exam Interface**: Timer-based assessments with auto-submit functionality.
-   **Proctoring Features**: Tab switch detection and full-screen enforcement.
-   **Analytics Dashboard**: Visual insights into exam performance and student statistics.

## 🛠 Tech Stack

### Backend (Admin & User)
-   **Framework**: FastAPI (Python) - High performance, easy to use.
-   **Database**: MongoDB (via Motor & Beanie ODM) - Flexible document storage.
-   **Authentication**: JWT (JSON Web Tokens) with OAuth2.
-   **Security**: BCrypt password hashing.

### Frontend (Admin & User)
-   **Framework**: React (Vite) - Fast modern web development.
-   **Styling**: Tailwind CSS - Utility-first CSS framework.
-   **Icons**: Lucide React.
-   **HTTP Client**: Axios.

## � API Documentation

### Admin API (Port 9000)
Base URL: `http://localhost:9000/admin/api`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/auth/login` | Admin login (returns JWT) | No |
| `POST` | `/auth/register` | Register new admin | No |
| `GET` | `/auth/me` | Get current admin details | Yes |
| **Exams** | | | |
| `GET` | `/exams` | List all exams | Yes |
| `POST` | `/exams` | Create new exam | Yes |
| `GET` | `/exams/{id}` | Get exam details | Yes |
| `PUT` | `/exams/{id}` | Update exam | Yes |
| `DELETE` | `/exams/{id}` | Delete exam | Yes |
| **Students** | | | |
| `GET` | `/students` | List all registered students | Yes |
| `GET` | `/students/{id}/submissions` | Get student's exam submissions | Yes |
| **Analytics** | | | |
| `GET` | `/analytics/overview` | System-wide stats | Yes |

### User API (Port 8002)
Base URL: `http://localhost:8002/api`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/auth/register` | Student registration | No |
| `POST` | `/auth/token` | Student login (returns JWT) | No |
| **Exams** | | | |
| `GET` | `/exams/available` | List assigned/active exams | Yes |
| `GET` | `/exams/{id}/take` | Start valid exam session | Yes |
| `POST` | `/exams/{id}/submit` | Submit exam answers | Yes |

### Code Execution API (External)
The platform uses **Judge0** for compiling and executing code.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/submissions` | Submit code for execution |
| `GET` | `/submissions/{token}` | Get execution result |

### Test Management (via Admin API)
Tests (Exams) are managed via the standard Exam endpoints but include specific structures for coding challenges.

| Feature | Description | Interaction |
| :--- | :--- | :--- |
| **Test Cases** | Defined within `coding` questions | Stored in MongoDB `exams` collection |
| **Validation** | Auto-graded against hidden test cases | Backend `exam_service.py` logic |

## �📂 Project Structure

```
EXAMGUARD-AI/
├── Admin/                  # Administrator Application
│   ├── backend/            # FastAPI Backend (Port 9000)
│   │   ├── app/            # Application Logic (Routes, Models)
│   │   └── scripts/        # Utility scripts (Seed data, Setup)
│   └── frontend/           # React Frontend (Port 5175)
│
├── User/                   # Student Application
│   ├── backend/            # FastAPI Backend (Port 8002)
│   │   ├── app/            # Application Logic
│   │   └── scripts/        # Utility scripts
│   └── frontend/           # React Frontend (Port 5174)
```

## ⚡️ Quick Start Guide

### Prerequisites
-   Python 3.8+
-   Node.js 16+
-   MongoDB (running locally on default port 27017)

### 1. Database Setup
Ensure your local MongoDB instance is running. The application will automatically create the `examguard_db` database and collections upon first run.

### 2. Admin Portal Setup

**Backend:**
```bash
cd Admin/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 9000
```

**Frontend:**
```bash
cd Admin/frontend
npm install
npm run dev -- --port 5175
```
Access Admin Portal at: `http://localhost:5175`

### 3. User Portal Setup

**Backend:**
```bash
cd User/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

**Frontend:**
```bash
cd User/frontend
npm install
npm run dev -- --port 5174
```
Access User Portal at: `http://localhost:5174`

## 👨‍💻 Development Workflow

1.  **Branching**: Work on feature branches (`feature/your-feature`) and merge to `main` via Pull Requests.
2.  **Code Structure**:
    -   **Models**: Defined in `backend/app/models/` using Beanie (Pydantic). Shared models are often replicated or symlinked if strict separation is needed, but currently defined independently for service isolation.
    -   **API Routes**: Modular routes in `backend/app/routes` or `api/routes`.
    -   **React Components**: Reusable UI components in `frontend/src/components`.
3.  **Testing**:
    -   Use `scripts/` folder in backend for testing database interactions and seeding data.
    -   Manual verification via the browser for UI flows.

## 🔄 Recent Updates
-   **Refactored Architecture**: Split monolithic codebase into isolated Admin and User apps.
-   **Enhanced Security**: Implemented JWT auth flow for both portals.
-   **Admin Registration**: Added public registration flow for new admins.
