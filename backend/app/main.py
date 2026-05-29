from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import conversation, analysis, auth

app = FastAPI(title="PathFinder API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversation.router, prefix="/api/v1/conversation", tags=["conversation"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint to verify API is running."""
    return {"status": "ok", "version": "1.0.0"}
