from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..services.gemini_service import gemini_service
from ..services.jobspy_service import jobspy_service
from ..core.role_matcher import role_matcher
from ..core.skill_gap import calculate_skill_gap
import uuid

router = APIRouter()

class AnalysisRequest(BaseModel):
    answers: List[str]
    session_id: str
    lang: Optional[str] = "id"

@router.post("")
async def analyze_profile(request: AnalysisRequest):
    """
    Main pipeline endpoint. Runs entire analysis.
    1. Gemini extracts signals.
    2. JobSpy scrapes jobs.
    3. Gemini extracts skills from jobs.
    4. Calculate frequencies.
    5. Cosine similarity matching.
    6. Skill gaps.
    7. Generate Scout message.
    """
    try:
        # Step 1: Extract career signals
        user_signals = await gemini_service.extract_career_signals(request.answers)
        
        # Determine location fallback
        location = user_signals.get("location", "Jakarta")
        if not location or location.lower() == "belum tahu":
            location = "Jakarta"
            
        # Extract keywords for job search
        search_term = "Data Analyst OR Business Intelligence"
        if "domain_signals" in user_signals and len(user_signals["domain_signals"]) > 0:
            search_term = user_signals["domain_signals"][0]

        # Step 2: Scrape jobs
        jobs = await jobspy_service.scrape_jobs(search_term, location, limit=20)
        jobs_analyzed = len(jobs)
        
        # Step 3 & 4: Extract skills from jobs (simplified for latency)
        # Note: In production this loops via Gemini. We mock skill frequencies for speed if needed.
        extracted_skills_freq = await gemini_service.batch_extract_skills(jobs)
        
        # Step 5 & 6: Match roles
        top_roles, readiness_score = await gemini_service.match_roles(user_signals)
        top_role = top_roles[0]["role_name"] if len(top_roles) > 0 else "Junior Data Analyst"
        
        # Step 7: Skill gaps
        user_existing_skills = user_signals.get("extracted_skills", [])
        target_role_id = top_roles[0].get("role_id", "data_analyst") if top_roles else "data_analyst"
        skill_gaps = calculate_skill_gap(user_existing_skills, extracted_skills_freq, target_role=target_role_id)
        
        # Step 8: Scout message and project
        scout_response = await gemini_service.generate_scout_message(
            user_signals, top_role, skill_gaps, user_signals.get("timeline_months", 6), location, request.lang
        )

        return {
            "session_id": request.session_id,
            "user_name": user_signals.get("user_name", "User") if request.lang == "en" else user_signals.get("user_name", "Kamu"),
            "readiness_score": readiness_score,
            "top_roles": top_roles,
            "signal_chips": user_signals.get("signal_chips", []),
            "skill_gaps": skill_gaps,
            "scout_message": scout_response.get("scout_message", "To be honest, you've got the necessary foundation." if request.lang == "en" else "Jujur ya, kamu sudah punya pondasinya."),
            "follow_up_questions": scout_response.get("follow_up_questions", []),
            "project": scout_response.get("project_recommendation", {}),
            "jobs_analyzed": jobs_analyzed,
            "jobs_source": "id.indeed.com"
        }
        
    except Exception as e:
        # Fallback response
        return {
            "error": "Failed to fetch data." if request.lang == "en" else "Scout lagi kesusahan nge-reach server data. Tapi tenang, ini fallback hasilnya.",
            "error_source": "pipeline",
            "fallback_used": True,
            "session_id": request.session_id,
            "user_name": "User" if request.lang == "en" else "Kamu",
            "readiness_score": 75,
            "top_roles": [{"rank": 1, "role_id": "data_analyst", "role_name": "Junior Data Analyst", "fit_score": 75, "job_count": 8, "skills_shown": ["SQL"]}],
            "signal_chips": ["suka data"],
            "skill_gaps": [{"skill": "SQL (joins)", "count": 15, "total": 20, "pct": 75}],
            "scout_message": "Maaf, koneksi data lagi error. Tapi dari sekilas, kamu cocok di data analyst.",
            "follow_up_questions": ["Kenapa Data Analyst?"],
            "project": {
                "name": "Dashboard Sederhana",
                "dataset_name": "Kaggle Dummy",
                "dataset_url": "https://kaggle.com",
                "skills_closed": ["SQL"],
                "tech_stack": ["Google Sheets"],
                "duration_weeks": 2,
                "week_1": "Eksplor",
                "week_2": "Deploy"
            },
            "jobs_analyzed": 20,
            "jobs_source": "id.indeed.com (fallback)"
        }
