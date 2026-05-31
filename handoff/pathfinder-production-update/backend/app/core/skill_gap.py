from typing import List, Dict

def calculate_skill_gap(user_skills: List[str], required_skills_freq: Dict[str, int], target_role: str) -> List[Dict]:
    """Calculates skill gaps by comparing user skills to job requirements."""
    # Simplified mock gap calculation based on requirement frequency
    gaps = []
    # Normalize
    user_skills_lower = [s.lower() for s in user_skills]
    
    for skill, count in required_skills_freq.items():
        if skill.lower() not in user_skills_lower:
            gaps.append({
                "skill": skill,
                "count": count,
                "total": 20, # representing 20 scraped jobs
                "pct": int((count / 20) * 100)
            })
            
    # Sort by frequency
    gaps.sort(key=lambda x: x["count"], reverse=True)
    return gaps[:3] # Return top 3 gaps
