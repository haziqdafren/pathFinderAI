from typing import List, Dict, Any
import logging

# jobspy import is mocked or caught if not installed locally
try:
    from jobspy import scrape_jobs as jobspy_scrape
except ImportError:
    jobspy_scrape = None

class JobSpyService:
    async def scrape_jobs(self, search_term: str, location: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Scrapes jobs from id.indeed.com using JobSpy."""
        try:
            if not jobspy_scrape:
                raise Exception("JobSpy not installed")
            
            jobs = jobspy_scrape(
                site_name=["indeed"],
                search_term=search_term,
                location=location,
                results_wanted=limit,
                country_indeed="Indonesia"
            )
            
            # Convert pandas DataFrame to list of dicts
            return jobs.to_dict(orient="records")
        except Exception as e:
            logging.error(f"JobSpy failed: {e}")
            # Fallback data if JobSpy fails or isn't installed
            return self._get_fallback_jobs(limit)
            
    def _get_fallback_jobs(self, limit: int) -> List[Dict[str, Any]]:
        return [
            {"title": "Junior Data Analyst", "company": "Bukalapak", "location": "Jakarta"},
            {"title": "BI Analyst Intern", "company": "Tokopedia", "location": "Jakarta"},
            {"title": "Data Operations", "company": "Sayurbox", "location": "Bandung"},
            {"title": "Business Intelligence", "company": "Blibli", "location": "Remote"},
            {"title": "Junior Data Analyst", "company": "eFishery", "location": "Bandung"}
        ]

jobspy_service = JobSpyService()
