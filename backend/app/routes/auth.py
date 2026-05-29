from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from ..services.supabase_service import supabase_service

router = APIRouter()

class SaveRequest(BaseModel):
    session_id: str
    user_id: str
    analysis_data: Dict[str, Any]

@router.post("/save")
async def save_analysis(request: SaveRequest):
    """Saves the analysis results to Supabase for logged in users."""
    try:
        saved_id = await supabase_service.save_analysis(
            user_id=request.user_id,
            session_id=request.session_id,
            data=request.analysis_data
        )
        return {"saved": True, "analysis_id": saved_id}
    except Exception as e:
        return {"error": "Gagal menyimpan data ke database.", "error_source": "supabase", "fallback_used": True}
