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

## Production Readiness Notes
- Deploy the root Node service (`npm run build && npm run start`) as the primary full-stack app. The `/backend` FastAPI service is kept as a secondary/reference API and needs a separate Cloud Run service if used.
- Set `CORS_ORIGINS` to the exact production domains only, for example `https://your-app.vercel.app,https://your-cloud-run-url.run.app`.
- Keep `VITE_PREVIEW_AUTH_BYPASS=false` on Vercel and final Cloud Run deployments.
- Required production secrets: `GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and Supabase OAuth redirect URLs for the final HTTPS domain.
- Recommended safety envs:
  - `API_RATE_LIMIT_PER_MIN=120`
  - `AI_RATE_LIMIT_PER_MIN=12`
  - `AI_TIMEOUT_MS=9000`
  - `ANALYSIS_CACHE_TTL_MS=1800000`
- Before public launch, run `npm run lint`, `npm run build`, `npm audit --audit-level=moderate`, backend Python compile, and a 50-user load test against `/api/v1/analysis` and `/api/v1/chat`.

## Vercel Deployment
This repo is ready for Vercel using static Vite output plus serverless API routes in `/api`.

1. Push the latest code to GitHub.
2. Import the GitHub repo in Vercel.
3. Use these settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variables in Vercel:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `APP_URL=https://your-vercel-domain.vercel.app`
   - `CORS_ORIGINS=https://your-vercel-domain.vercel.app`
   - `VITE_PREVIEW_AUTH_BYPASS=false`
   - `API_RATE_LIMIT_PER_MIN=120`
   - `AI_RATE_LIMIT_PER_MIN=12`
   - `AI_TIMEOUT_MS=9000`
   - `ANALYSIS_CACHE_TTL_MS=1800000`
   - Optional fallback providers: `GROQ_API_KEY`, `OPENROUTER_API_KEY`
5. In Supabase Auth, set:
   - Site URL: `https://your-vercel-domain.vercel.app`
   - Redirect URLs: `https://your-vercel-domain.vercel.app/**`
   - Google provider callback in Google Cloud OAuth: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
6. Apply `supabase/schema.sql` in Supabase SQL editor before testing login/save.
7. After deploy, verify:
   - `/api/v1/health`
   - `/api/v1/ready`
   - onboarding -> loading -> results
   - Google login
   - save result to Supabase
