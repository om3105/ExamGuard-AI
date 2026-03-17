# ExamGuard AI — Developer Guide

This guide explains the internal architecture and workflows for developers joining the project.

## Table of Contents

1. [Authentication Architecture](#authentication-architecture)
2. [Exam Lifecycle](#exam-lifecycle)
3. [Course System](#course-system)
4. [Judge0 Code Execution](#judge0-code-execution)
5. [Progress Tracking](#progress-tracking)
6. [Admin Analytics](#admin-analytics)
7. [Behavioral Biometrics & Proctoring](#behavioral-biometrics--proctoring)
8. [Database Models](#database-models)

---

## Authentication Architecture

The system uses **two separate JWT systems** — one for students, one for admins.

```
Student Auth                          Admin Auth
─────────────                         ──────────
POST /auth/token                      POST /admin/api/auth/login
↓                                     ↓
security.py → create_access_token()   admin_security.py → create_admin_access_token()
↓                                     ↓
SECRET_KEY                            ADMIN_SECRET_KEY
↓                                     ↓
get_current_user() dependency         get_current_admin() dependency
```

**Why two systems?** Students and admins are stored in different collections (`users` vs `admin_users`) with separate JWT signing keys. This prevents a student token from ever being used on admin endpoints.

**Key files:**
- `core/security.py` — Student JWT creation, password hashing, `get_current_user`
- `core/admin_security.py` — Admin JWT creation, `get_current_admin`

---

## Exam Lifecycle

An exam goes through these stages:

```
1. CREATION        Admin creates exam with sections (MCQ + Coding)
      ↓
2. ASSIGNMENT      Admin assigns exam to students with max_attempts
      ↓
3. WAITING ROOM    Student sees countdown timer until start_time
      ↓
4. START SESSION   POST /exams/{id}/start → creates IN_PROGRESS submission
      ↓
5. EXAM TAKING     Student answers MCQs, writes code, navigates sections
      ↓
6. SUBMISSION      POST /exams/{id}/submit → grades MCQs, calculates score
      ↓
7. GRADING         Anomaly score computed from BehaviorLog data
      ↓
8. COMPLETION      Student sees results on TestCompletedPage
```

### Attempt Control

The system tracks attempts to prevent abuse:

```python
# In exam_service.py → start_session()
# 1. Check if exam has started (compare start_time with now)
# 2. Find the ExamAssignment for this user
# 3. Count COMPLETED/GRADED submissions (not IN_PROGRESS ones)
# 4. If count >= max_attempts, block with 400 error
# 5. If an IN_PROGRESS session exists, reconnect to it (don't create new)
# 6. Otherwise, create new IN_PROGRESS submission shell
```

### Question Status Logic (Frontend)

Each question has a status tracked in `useQuestionStatus.js`:

| Status | Meaning | Color |
|--------|---------|-------|
| `NOT_VISITED` | Student hasn't seen this question | Gray |
| `NOT_ANSWERED` | Visited but no answer selected | Red |
| `ANSWERED` | Answer saved | Green |
| `MARKED_FOR_REVIEW` | Flagged for later review | Purple |
| `ANSWERED_AND_MARKED` | Answered but also flagged | Blue |

### MCQ Scoring

```python
# In exam_service.py → submit_exam()
# For each section:
#   For each MCQ question:
#     Compare selected_option_index with correct_option_index
#     If match → add question.points to mcq_score
# Total score = mcq_score + coding_score
```

**Key files:**
- `services/exam_service.py` — Core exam business logic
- `routes/exam_routes.py` — Student-facing exam API endpoints
- `routes/exam_mgmt.py` — Admin exam CRUD + assignment

---

## Course System

### Course Structure

```
Course
├── Module 1
│   ├── Lesson 1 (video + notes)
│   ├── Lesson 2 (video + notes)
│   ├── Quiz 1 (multiple choice)
│   └── Coding Problem 1
├── Module 2
│   ├── Lesson 3
│   └── Quiz 2
```

### Enrollment Flow

```
1. Student browses courses        GET /courses
2. Student requests enrollment    POST /courses/{id}/request-enrollment
3. Admin sees pending requests    GET /admin/api/enrollments?status_filter=pending
4. Admin approves                 POST /admin/api/enrollments/{id}/approve
5. Student gains access           Course appears on student dashboard
```

### Progress Calculation

```python
# In course_progress_routes.py → mark_lesson_complete()
# progress_percentage = (completed_lessons / total_lessons_in_course) * 100
#
# Quiz scores stored as: {quiz_id: score_percentage}
# Coding scores stored as: {problem_id: score_percentage}
```

**Key files:**
- `models/course_models.py` — Course, Module, Lesson, Quiz, CodingProblem, CourseProgress
- `routes/course_routes.py` — Student course browsing + enrollment
- `routes/course_progress_routes.py` — Lesson completion, quiz submission
- `routes/admin_course.py` — Admin course CRUD

---

## Judge0 Code Execution

Code execution is **proxied through the backend** so the frontend never sees API keys.

```
Student writes code in CodeEditor
        ↓
POST /exams/execute (via backend proxy)
        ↓
Backend → POST judge0/submissions (submit code)
        ↓
Backend → GET judge0/submissions/{token} (poll every 1s, max 15 attempts)
        ↓
Compare stdout with expected_output
        ↓
Return {passed: true/false, actual: "...", expected: "..."}
```

### Judge0 Status Codes

| ID | Meaning |
|----|---------|
| 1 | In Queue |
| 2 | Processing |
| 3 | Accepted (execution complete) |
| 4 | Wrong Answer |
| 5 | Time Limit Exceeded |
| 6+ | Runtime/Compilation errors |

The backend polls until `status.id >= 3` (any finished state).

**Key files:**
- `routes/exam_routes.py` → `execute_code()` function
- Frontend: `student/hooks/useCodeExecution.js`

---

## Progress Tracking

### StudentProgress model (CourseProgress collection)

```
CourseProgress {
    user_id: string
    course_id: string
    completed_lessons: [lesson_id, lesson_id, ...]
    quiz_scores: {quiz_id: score, ...}
    coding_scores: {problem_id: score, ...}
    progress_percentage: float (0-100)
    updated_at: datetime
}
```

### Admin Progress Dashboard

The `admin_progress.py` endpoints aggregate data from:
- `CourseProgress` → course completion, quiz/coding averages
- `ExamSubmission` → exam attempts and scores
- `BehaviorLog` → integrity warnings
- `CourseEnrollment` → enrollment status

Alert flags are computed server-side:
- `low_quiz` — quiz average < 50%
- `low_completion` — course progress < 25%
- `inactive` — no activity for 7+ days

**Key files:**
- `routes/admin_progress.py` — Admin progress APIs
- `frontend/src/admin/pages/StudentProgress.jsx` — Progress dashboard UI

---

## Admin Analytics

The analytics system provides:

1. **Overview metrics** — total exams, students, submissions, high-risk count
2. **Exam results** — per-exam submission list with behavioral data
3. **Student performance** — per-student exam history

**Key files:**
- `routes/analytics.py` — Analytics APIs
- `frontend/src/admin/pages/Analytics.jsx` — Analytics dashboard

---

## Behavioral Biometrics & Proctoring

During exams, the frontend tracks behavioral signals via `useBehaviorLogger.js`:

| Signal | What It Tracks |
|--------|---------------|
| `keystroke_count` | Total keys pressed |
| `avg_typing_speed` | Keys per second |
| `backspace_ratio` | Backspace / total keys |
| `paste_count` | Number of paste events |
| `pasted_chars` | Total characters pasted |
| `tab_switch_count` | Times student left the tab |
| `time_per_question` | Milliseconds spent on each question |

The `anomaly_service.py` computes a **risk score (0-100)** from this data:
- **LOW** (0-30) — Normal behavior
- **MEDIUM** (31-60) — Suspicious patterns
- **HIGH** (61-100) — Likely integrity violation

---

## Database Models

### Collections Overview

| Collection | Model | Purpose |
|-----------|-------|---------|
| `users` | `User` | Student accounts |
| `admin_users` | `AdminUser` | Admin accounts |
| `exams` | `Exam` | Exam definitions (sections, questions) |
| `exam_submissions` | `ExamSubmission` | Student exam attempts + scores |
| `exam_assignments` | `ExamAssignment` | Which students are assigned which exams |
| `behavior_logs` | `BehaviorLog` | Behavioral biometrics per submission |
| `courses` | `Course` | Course definitions (modules, lessons) |
| `course_progress` | `CourseProgress` | Per-student course completion |
| `course_enrollments` | `CourseEnrollment` | Enrollment requests + approvals |

### Key Relationships

```
User ──┬── ExamAssignment ──── Exam
       │         │
       │         ▼
       ├── ExamSubmission ──── BehaviorLog
       │
       ├── CourseEnrollment ── Course
       │
       └── CourseProgress ──── Course
```
