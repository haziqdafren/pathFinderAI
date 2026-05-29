# PathFinder AI
An AI career discovery system for Indonesian IT fresh graduates.

This repository implements the PathFinder Progressive Career Discovery flow with a unified React full-stack structure.

## Dependencies Note ⚠️
If you previously installed dependencies inside `/frontend`, delete `frontend/node_modules` before building from root to avoid duplicate React runtime issues:
```bash
rm -rf frontend/node_modules
```

## How to Get API Keys
- Minta kunci Gemini API di [Google AI Studio](https://aistudio.google.com/app/apikey).
- Buat proyek Supabase di [Supabase.com](https://supabase.com/) dan dapatkan URL + Anon Key.

## How to run locally
From the repository root:
1. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.
2. `npm install`
3. `npm run dev`

## Deployment to Cloud Run
1. `npm run build`
2. `npm run start`

*(Note for AI Studio Live Preview: The application uses Vite middleware via Express to serve the frontend in dev mode, and static generation in production mode).*
