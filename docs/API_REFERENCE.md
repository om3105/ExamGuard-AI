# ExamGuard AI — API Reference

Base URL: `http://localhost:8000`

All endpoints requiring authentication expect a `Bearer` token in the `Authorization` header.

---

## Student Authentication

### Register Student

```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "id": "665abc...",
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2026-03-12T00:00:00+00:00"
}
```

### Login Student

```
POST /auth/token
Content-Type: application/x-www-form-urlencoded
```

**Request Body:** `username=john_doe&password=securepassword123`

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI...",
  "token_type": "bearer"
}
```

---

## Student Exams

### List Assigned Exams

```
GET /exams/
Auth: Required (Student)
```

**Response (200):**
```json
[
  {
    "_id": "665abc...",
    "title": "Data Structures Final",
    "description": "Comprehensive test",
    "total_marks": 100,
    "duration_minutes": 60,
    "start_time": "2026-03-12T01:30:00+00:00",
    "attempt_count": 0,
    "max_attempts": 2,
    "sections": [...]
  }
]
```

### Get Exam by ID

```
GET /exams/{exam_id}
Auth: Required (Student)
```

### Start Exam Session

```
POST /exams/{exam_id}/start
Auth: Required (Student)
```

**Response (201):**
```json
{
  "submission_id": "665def..."
}
```

**Error Cases:**
- `403` — Exam hasn't started yet
- `400` — Maximum attempts reached
- `404` — Exam not found or not assigned

### Submit Exam

```
POST /exams/{exam_id}/submit?submission_id={id}
Auth: Required (Student)
```

**Request Body:**
```json
{
  "answers": {
    "0": {
      "0": "1",
      "1": "2"
    }
  }
}
```

Structure: `{section_index: {question_index: selected_option_index}}`

**Response (201):**
```json
{
  "submission_id": "665def...",
  "score": 85,
  "mcq_score": 70,
  "coding_score": 15,
  "status": "COMPLETED"
}
```

### Get Submission Details

```
GET /exams/submissions/{submission_id}
Auth: Required (Student)
```

### Execute Code (Judge0 Proxy)

```
POST /exams/execute
Auth: Required (Student)
```

**Request Body:**
```json
{
  "source_code": "print('hello')",
  "language_id": 71,
  "stdin": "",
  "expected_output": "hello"
}
```

**Response (200):**
```json
{
  "input": "",
  "expected": "hello",
  "actual": "hello",
  "passed": true,
  "status": "Accepted",
  "error": null
}
```

---

## Student Courses

### List Available Courses

```
GET /courses/
Auth: Required (Student)
```

### Get Course Details

```
GET /courses/{course_id}
Auth: Required (Student)
```

### Request Enrollment

```
POST /courses/{course_id}/request-enrollment
Auth: Required (Student)
```

**Response (201):**
```json
{
  "message": "Enrollment request submitted",
  "enrollment_id": "665ghi..."
}
```

### Get Course Progress

```
GET /courses/{course_id}/progress
Auth: Required (Student)
```

### Mark Lesson Complete

```
POST /courses/{course_id}/lessons/{lesson_id}/complete
Auth: Required (Student)
```

### Submit Quiz

```
POST /courses/{course_id}/quiz/{quiz_id}/submit
Auth: Required (Student)
```

**Request Body:**
```json
{
  "answers": {
    "0": 1,
    "1": 2,
    "2": 0
  }
}
```

---

## Student Profile

### Get Profile

```
GET /student/profile
Auth: Required (Student)
```

### Update Profile

```
PUT /student/profile
Auth: Required (Student)
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone_number": "+91 9876543210",
  "course": "B.Tech CSE",
  "college": "MIT"
}
```

---

## Admin Authentication

### Admin Login

```
POST /admin/api/auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Register Admin

```
POST /admin/api/auth/register
Auth: Required (Admin)
```

### Get Current Admin

```
GET /admin/api/auth/me
Auth: Required (Admin)
```

---

## Admin Exam Management

### List All Exams

```
GET /admin/api/exams/
Auth: Required (Admin)
```

### Create Exam

```
POST /admin/api/exams/
Auth: Required (Admin)
```

**Request Body:**
```json
{
  "title": "Data Structures Final",
  "description": "Comprehensive assessment",
  "total_marks": 100,
  "duration_minutes": 60,
  "start_time": "2026-03-12T01:30:00.000Z",
  "sections": [
    {
      "title": "MCQ Section",
      "questions": [
        {
          "type": "mcq",
          "text": "What is O(1)?",
          "points": 5,
          "options": [
            {"text": "Constant time", "is_correct": true},
            {"text": "Linear time", "is_correct": false}
          ]
        }
      ]
    },
    {
      "title": "Coding Section",
      "questions": [
        {
          "type": "coding",
          "text": "Two Sum",
          "points": 20,
          "problem_statement": "Find two numbers...",
          "constraints": "1 <= n <= 10^4",
          "test_cases": [
            {"input": "2 7 11 15\n9", "output": "0 1"}
          ]
        }
      ]
    }
  ]
}
```

### Update Exam

```
PUT /admin/api/exams/{exam_id}
Auth: Required (Admin)
```

### Delete Exam

```
DELETE /admin/api/exams/{exam_id}
Auth: Required (Admin)
```

### Assign Exam

```
POST /admin/api/exams/{exam_id}/assign
Auth: Required (Admin)
```

**Request Body:**
```json
{
  "assigned_students": ["user_id_1", "user_id_2"],
  "max_attempts": 2
}
```

### Get Exam Assignment

```
GET /admin/api/exams/{exam_id}/assign
Auth: Required (Admin)
```

---

## Admin Course Management

### Create Course

```
POST /admin/api/courses/
Auth: Required (Admin)
```

### Update Course

```
PUT /admin/api/courses/{course_id}
Auth: Required (Admin)
```

### Delete Course

```
DELETE /admin/api/courses/{course_id}
Auth: Required (Admin)
```

---

## Admin Enrollment Management

### List Enrollments

```
GET /admin/api/enrollments?status_filter=pending
Auth: Required (Admin)
```

### Approve Enrollment

```
POST /admin/api/enrollments/{enrollment_id}/approve
Auth: Required (Admin)
```

### Reject Enrollment

```
POST /admin/api/enrollments/{enrollment_id}/reject
Auth: Required (Admin)
```

---

## Admin Student Management

### List Students

```
GET /admin/api/students/
Auth: Required (Admin)
```

### Create Student

```
POST /admin/api/students/
Auth: Required (Admin)
```

### Delete Student

```
DELETE /admin/api/students/{student_id}
Auth: Required (Admin)
```

### Toggle Student Status

```
PATCH /admin/api/students/{student_id}/status
Auth: Required (Admin)
```

---

## Admin Analytics

### Dashboard Overview

```
GET /admin/api/analytics/overview
Auth: Required (Admin)
```

**Response (200):**
```json
{
  "total_exams": 5,
  "total_students": 42,
  "total_submissions": 120,
  "high_risk_submissions": 3,
  "avg_anomaly_score": 22.5,
  "recent_submissions": [...]
}
```

### Exam Results

```
GET /admin/api/analytics/exams/{exam_id}/results
Auth: Required (Admin)
```

### Student Performance

```
GET /admin/api/analytics/students/{student_id}/performance
Auth: Required (Admin)
```

---

## Admin Progress Monitoring

### Progress Overview

```
GET /admin/api/progress/overview
Auth: Required (Admin)
```

**Response (200):**
```json
{
  "total_students": 42,
  "total_courses": 5,
  "avg_course_completion": 65.3,
  "avg_quiz_score": 72.1,
  "avg_coding_score": 58.4,
  "total_exam_submissions": 120
}
```

### Student Progress Table

```
GET /admin/api/progress/students
Auth: Required (Admin)
```

### Student Progress Detail

```
GET /admin/api/progress/student/{student_id}
Auth: Required (Admin)
```

---

## Error Response Format

All errors return a consistent structure:

```json
{
  "status": "error",
  "message": "Maximum exam attempts reached"
}
```

Validation errors include field details:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["body -> username: field required"]
}
```
