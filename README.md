# PathFinder AI
An AI career discovery system for Indonesian IT fresh graduates.

This repository implements the PathFinder Progressive Career Discovery flow with a React frontend and Python FastAPI backend.

## Project Structure
The code is divided into:
- `/backend`: Python FastAPI logic, Gemini integrations, JobSpy scrapers
- `/frontend`: React frontend with Vite and Tailwind
- `/supabase`: PostgreSQL schema

## How to Get API Keys
- Minta kunci Gemini API di [Google AI Studio](https://aistudio.google.com/app/apikey).
- Buat proyek Supabase di [Supabase.com](https://supabase.com/) dan dapatkan URL + Anon Key.

## How to run locally

### Backend
1. `cd backend`
2. Tambahkan `GOOGLE_API_KEY` dan Supabase credentials di file `.env` kamu.
3. `pip install -r requirements.txt`
4. `uvicorn app.main:app --reload --port 8080`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Deployment to Cloud Run
1. Konfigurasi `gcloud` CLI 
2. Dari direktori `backend/`, build image dan push ke Artifact Registry (atau langsung deploy dari source).
3. `gcloud run deploy pathfinder-api --source . --port 8080 --allow-unauthenticated`
4. Deploy frontend ke hosting seperti Vercel atau Firebase Hosting.

*(Note for AI Studio Live Preview: To ensure the UI works flawlessly in the preview environment, the frontend is also mounted at the workspace root and has built-in local mock fallbacks when the Python backend isn't running).*
