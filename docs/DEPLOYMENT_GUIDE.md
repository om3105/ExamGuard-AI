# Deployment Guide — ExamGuard AI

This guide provides step-by-step instructions to deploy the ExamGuard AI project using **MongoDB Atlas**, **Render**, and **Vercel**.

---

## 1. Database: MongoDB Atlas

1.  **Create Account/Login**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create Cluster**: Create a free "M0" cluster. 
3.  **Network Access**: In the "Network Access" tab, click **Add IP Address** and select **Allow Access From Anywhere** (or add Render's outbound IPs if preferred).
4.  **Database Access**: Create a database user with a username and password.
5.  **Get Connection String**:
    *   Click **Connect** on your cluster.
    *   Select **Drivers** (Python).
    *   Copy the connection string. It looks like: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    *   **Keep this string** for the Backend setup.

---

## 2. Backend: Render (Docker)

1.  **Create Web Service**: In [Render Dashboard](https://dashboard.render.com/), click **New +** > **Web Service**.
2.  **Connect Repo**: Connect your GitHub repository.
3.  **Config**:
    *   **Name**: `examguard-api`
    *   **Root Directory**: `backend` (Important! This tells Render to look inside the backend folder)
    *   **Language**: `Docker`
4.  **Environment Variables**: Click **Advanced** and add the following:
    *   `MONGODB_URL`: Your Atlas connection string (replace `<password>` with actual password).
    *   `DB_NAME`: `examguard` (or your preferred name).
    *   `SECRET_KEY`: Generate a random string (e.g., `openssl rand -hex 32`).
    *   `ADMIN_SECRET_KEY`: Generate another random string.
    *   `CORS_ORIGINS`: `https://your-frontend-name.vercel.app` (You'll update this once you have the Vercel URL).
| Key | Value |
| :--- | :--- |
| `PORT` | `9000` |
5.  **Deploy**: Render will build the image from the `Dockerfile` and start the server on port 9000.
6.  **Get URL**: Copy the Render URL (e.g., `https://examguard-api.onrender.com`).

---

## 3. Frontend: Vercel

1.  **Import Project**: In [Vercel](https://vercel.com/), click **Add New** > **Project**.
2.  **Connect Repo**: Select your GitHub repository.
3.  **Framework Preset**: Select **Vite**.
4.  **Root Directory**: `frontend` (Important!)
5.  **Install/Build Commands**: Vercel should detect these automatically (`npm install` and `npm run build`).
6.  **Environment Variables**: Add the following:
    *   `VITE_USER_API_URL`: Your Render Backend URL (e.g., `https://examguard-api.onrender.com`).
    *   `VITE_ADMIN_API_URL`: Your Render Backend URL + `/admin/api` (e.g., `https://examguard-api.onrender.com/admin/api`).
7.  **Deploy**: Click **Deploy**.
8.  **Get URL**: You will get a `.vercel.app` URL.

---

## 4. Final Verification & CORS Fix

Once your frontend is deployed (e.g., `https://examguard-ai.vercel.app`):

1.  **Go back to Render Settings**.
2.  **Update `CORS_ORIGINS`**: Add your Vercel URL to the variable.
    *   Example: `https://examguard-ai.vercel.app`
3.  **Restart Render Service**: This ensures the backend allows requests from your new production frontend.

---

## Summary Table

| Service | Responsibility | Key Config |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Data Storage | Connection String |
| **Render** | FastAPI Backend | Docker, Root Dir: `backend`, Port: `9000` |
| **Vercel** | React Frontend | Vite, Root Dir: `frontend`, `.vercel.app` domain |
