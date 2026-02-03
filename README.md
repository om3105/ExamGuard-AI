# ExamGuard AI

ExamGuard AI is a comprehensive full-stack assessment platform designed for secure and efficient online examinations. It features separate portals for Administrators and Users (Candidates), enabling end-to-end exam management, proctoring, and automated evaluation.

## Project Structure

The project is divided into two main applications:

-   **Admin**: The administrative portal for creating exams, managing students, and viewing analytics.
    -   Frontend: React (Vite)
    -   Backend: FastAPI
-   **User**: The candidate portal for taking exams and viewing results.
    -   Frontend: React (Vite)
    -   Backend: FastAPI

## Deployment Guide

This project is configured for deployment on **Render** (Backend) and **Vercel** (Frontend), with **MongoDB Atlas** as the database.

### 1. Database Setup (MongoDB Atlas)
1.  Create a free **M0 Sandbox** cluster on MongoDB Atlas.
2.  Create a database user and save the password.
3.  Allow network access from `0.0.0.0/0`.
4.  Copy your **connection string**.

### 2. Backend Deployment (Render)
Deploy two Web Services:

**Admin Backend** (`Admin/backend`)
-   **Build Command**: `pip install -r requirements.txt`
-   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
-   **Env Vars**:
    -   `MONGODB_URL`: Your connection string
    -   `ALLOWED_ORIGINS`: Your Vercel frontend URLs (comma-separated result URLs)

**User Backend** (`User/backend`)
-   **Build Command**: `pip install -r requirements.txt`
-   **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
-   **Env Vars**:
    -   `MONGODB_URL`: Your connection string
    -   `ALLOWED_ORIGINS`: Your User frontend URL
    -   `JUDGE0_API_URL`: `https://judge0-ce.p.rapidapi.com` (or your instance)
    -   `JUDGE0_API_KEY`: Your RapidAPI key (if using RapidAPI)

### 3. Frontend Deployment (Vercel)
Deploy two Projects:

**Admin Frontend** (`Admin/frontend`)
-   **Framework**: Vite
-   **Env Vars**:
    -   `VITE_ADMIN_API_URL`: Your Admin Backend URL from Render

**User Frontend** (`User/frontend`)
-   **Framework**: Vite
-   **Env Vars**:
    -   `VITE_USER_API_URL`: Your User Backend URL from Render

### 4. Final Integration
After deploying frontends, go back to Render and update the `ALLOWED_ORIGINS` variable in your backends to match the actual Vercel URLs (e.g., `https://examguard-admin.vercel.app`).
