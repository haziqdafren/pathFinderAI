from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import conversation, analysis, auth
import os

app = FastAPI(title="PathFinder API", version="1.0.0")

# Configure CORS
allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", os.getenv("FRONTEND_URL", "http://localhost:5173,http://localhost:3000")).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Request-Id"],
)

app.include_router(conversation.router, prefix="/api/v1/conversation", tags=["conversation"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint to verify API is running."""
    return {"status": "ok", "version": "1.0.0"}
