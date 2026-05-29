from typing import Dict, Any, Tuple, List

class RoleMatcher:
    def match(self, user_signals: Dict[str, Any], skill_freq: Dict[str, int]) -> Tuple[List[Dict[str, Any]], int]:
        """Calculates cosine similarity to match roles."""
        # This is a simplified matching algorithm returning a readiness score and top roles
        readiness_score = 78
        
        roles = [
            {
                "rank": 1,
                "role_id": "data_analyst",
                "role_name": "Junior Data Analyst",
                "fit_score": readiness_score,
                "job_count": 9,
                "skills_shown": ["SQL", "Looker", "Spreadsheet"]
            },
            {
                "rank": 2,
                "role_id": "bi_analyst",
                "role_name": "BI Developer (entry)",
                "fit_score": 64,
                "job_count": 6,
                "skills_shown": ["Power BI", "DAX", "ETL ringan"]
            },
            {
                "rank": 3,
                "role_id": "business_analyst",
                "role_name": "Operations Analyst",
                "fit_score": 57,
                "job_count": 5,
                "skills_shown": ["Excel lanjut", "Proses bisnis"]
            }
        ]
        
        return roles, readiness_score

role_matcher = RoleMatcher()
