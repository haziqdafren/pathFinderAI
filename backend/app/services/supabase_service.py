import os
from typing import Dict, Any
import logging

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None

class SupabaseService:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_KEY", "")
        if create_client and url and key:
            self.client: Client = create_client(url, key)
        else:
            self.client = None

    async def save_analysis(self, user_id: str, session_id: str, data: Dict[str, Any]) -> str:
        """Saves analysis to Supabase."""
        if not self.client:
            logging.warning("Supabase client not initialized. Using mock save.")
            return "mock-uuid-1234"
            
        try:
            record = {
                "user_id": user_id,
                "session_id": session_id,
                "user_name": data.get("user_name", ""),
                "readiness_score": data.get("readiness_score", 0),
                "top_roles": data.get("top_roles", []),
                "skill_gaps": data.get("skill_gaps", []),
                "scout_message": data.get("scout_message", ""),
                "project_recommendation": data.get("project", {})
            }
            response = self.client.table("analyses").insert(record).execute()
            return response.data[0]["id"] if response.data else "saved-no-id"
        except Exception as e:
            logging.error(f"Supabase save failed: {e}")
            raise e

supabase_service = SupabaseService()
