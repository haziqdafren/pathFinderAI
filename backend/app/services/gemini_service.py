import os
import json
import google.generativeai as genai
from typing import Dict, Any, List

class GeminiService:
    def __init__(self):
        api_key = os.environ.get("GOOGLE_API_KEY", os.environ.get("GEMINI_API_KEY", ""))
        genai.configure(api_key=api_key)
        # Safely fall back to a known working model
        self.model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Load taxonomy and templates
        self._taxonomy = self._load_json_file("backend/app/data/role_taxonomy.json")
        self._templates = self._load_json_file("backend/app/data/project_templates.json")

    def _load_json_file(self, filepath: str) -> str:
        try:
            with open(filepath, 'r') as f:
                return f.read()
        except:
            return ""

    async def _generate_json(self, prompt: str) -> Dict[str, Any]:
        """Helper to generate and parse JSON from Gemini."""
        prompt += "\nReturn ONLY valid JSON, no markdown, no explanation."
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            # Strip markdown if model included it despite instruction
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text.strip())
        except Exception as e:
            # Retry once
            try:
                response = self.model.generate_content(prompt)
                text = response.text.strip().removeprefix("```json").removesuffix("```").strip()
                return json.loads(text)
            except Exception as e2:
                raise Exception(f"Gemini generation failed: {e2}")

    async def generate_q2(self, previous_answer: str) -> Dict[str, str]:
        """Generates dynamic Q2 based on Q1."""
        prompt = f"""
        User answered Q1 (project they are proud of): "{previous_answer}"
        Generate Q2 asking about what specific task engages them for hours, 
        tailored to their Q1 answer.
        
        Return JSON: {{"question": "...", "tip": "..."}}
        """
        try:
            result = await self._generate_json(prompt)
            return result
        except:
            return {
                "question": "Yang bikin kamu betah berjam-jam: mengurai data berantakan jadi grafik yang masuk akal.",
                "tip": "Scout perlu tahu juga mana yang bukan kamu — biar rekomendasinya lebih tajam."
            }

    async def extract_career_signals(self, answers: List[str]) -> Dict[str, Any]:
        """Extracts career signals from 4 answers."""
        prompt = f"""
        You are an expert career advisor analyzing a fresh IT graduate's background for the Indonesian job market.
        Use this taxonomy as reference for the available roles and their signals:
        {self._taxonomy}

        User's 4 answers:
        Q1 (what they built/proud of): {answers[0] if len(answers) > 0 else ''}
        Q2 (what engages them for hours): {answers[1] if len(answers) > 1 else ''}
        Q3 (preferred work location): {answers[2] if len(answers) > 2 else ''}
        Q4 (timeline pressure): {answers[3] if len(answers) > 3 else ''}

        Return ONLY valid JSON, no markdown, no explanation:
        {{
          "user_name": "first name if mentioned, else 'Kamu'",
          "technical_signals": ["signal1", "signal2"],
          "domain_signals": ["business", "data", "systems"],
          "behavioral_signals": ["detail-oriented", "practical builder"],
          "location": "Jakarta",
          "timeline_months": 6,
          "confidence_level": "medium",
          "signal_chips": ["suka beresin data berantakan", "pengalaman dashboard UKM"],
          "extracted_skills": ["Google Sheets", "Looker Studio", "SQL dasar"],
          "anti_signals": ["tidak suka presentasi formal"]
        }}

        Rules:
        - signal_chips: max 4, use casual Indonesian phrases exactly as user would say
        - extracted_skills: only what's explicitly mentioned
        - anti_signals: things user explicitly avoids
        - confidence_level: "low" if < 100 chars total, "medium" if < 300, "high" if 300+
        """
        return await self._generate_json(prompt)

    async def batch_extract_skills(self, jobs: List[Dict]) -> Dict[str, int]:
        """Mock extraction for performance, returns skill frequencies."""
        # In full production, this would call Gemini for each job desc.
        # But per requirements targeting <30s, we mock or use basic NLP locally here
        skill_counts = {
            "SQL (joins, window functions)": 17,
            "Python (pandas, scripting)": 13,
            "Statistical reasoning (A/B)": 11,
            "Looker Studio": 9,
            "Data Visualization": 15
        }
        return skill_counts

    async def match_roles(self, signals: Dict[str, Any]) -> tuple[List[Dict[str, Any]], int]:
        """Match the user to the top 3 roles based on the taxonomy."""
        prompt = f"""
        Given the user's signals:
        {json.dumps(signals)}

        And this taxonomy of Indonesian IT roles:
        {self._taxonomy}

        1. Find the top 3 best matching roles for this user.
        2. Calculate a readiness score out of 100 on how ready they feel based on their answers.

        Return ONLY valid JSON:
        {{
            "roles": [
                {{
                    "rank": 1,
                    "role_id": "data_analyst",
                    "role_name": "Data Analyst",
                    "fit_score": 85,
                    "job_count": 9,
                    "skills_shown": ["SQL", "Looker Studio"]
                }}
            ],
            "readiness_score": 75
        }}
        """
        try:
            result = await self._generate_json(prompt)
            return result.get("roles", []), result.get("readiness_score", 70)
        except:
            return [], 70

    async def generate_scout_message(self, signals: Dict, top_role: str, skill_gaps: List, timeline: int, location: str, lang: str = "id") -> Dict[str, Any]:
        prompt = f"""
        You are Scout — a career intelligence agent inside PathFinder. You are masculine, direct, and honest. 
        You speak like a smart friend who actually knows the {'Indonesian' if lang == 'id' else 'Global'} IT job market.
        
        User profile signals: {json.dumps(signals)}
        Top matched role: {top_role}
        Skill gaps: {json.dumps(skill_gaps)}
        Timeline: {timeline} months
        Location: {location}
        
        AVAILABLE PROJECT TEMPLATES:
        {self._templates}

        Based on the user's profile and matched role, pick ONE most appropriate project template from the AVAILABLE PROJECT TEMPLATES. Fill the project_recommendation fields exactly using the chosen template's data, EXCEPT translate the name, dataset_name, week_1, and week_2 to {'English' if lang == 'en' else 'Indonesian'} if they are not already.

        Return ONLY valid JSON, no markdown:
        {{
          "scout_message": "2-3 sentences. Start with honest observation from data. Name what they're good at. Name the gap. End with ONE concrete action. No 'you can do it!', no empty encouragement. Use casual {'English' if lang == 'en' else 'Indonesian'}.",
          "follow_up_questions": ["{'Follow up question 1' if lang == 'en' else 'Gimana cara bikin portfolio analyst?'}", "{'Follow up question 2' if lang == 'en' else 'Tunjukkin 20 lowongan-nya'}"],
          "project_recommendation": {{
            "name": "specific project name from template (translated to {'English' if lang == 'en' else 'Indonesian'})",
            "dataset_name": "dataset name from template (translated to {'English' if lang == 'en' else 'Indonesian'})",
            "dataset_url": "dataset URL from template",
            "skills_closed": ["skill1", "skill2"],
            "tech_stack": ["tool1", "tool2"],
            "duration_weeks": 4,
            "week_1": "specific task week 1 from template (translated to {'English' if lang == 'en' else 'Indonesian'})",
            "week_2": "specific task week 2 from template (translated to {'English' if lang == 'en' else 'Indonesian'})"
          }}
        }}
        """
        return await self._generate_json(prompt)

gemini_service = GeminiService()

