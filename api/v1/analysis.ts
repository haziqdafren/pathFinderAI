import { analysisCacheKey, analysisSchema, enforceMethod, enforceRateLimit, fallbackAnalysis, generateJson, getCachedAnalysis, handleOptions, setCachedAnalysis, setCommonHeaders, validate } from "../_lib/pathfinder.js";

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  setCommonHeaders(req, res);
  if (!enforceMethod(req, res, "POST")) return;
  if (!enforceRateLimit(req, res, "ai")) return;

  const body = validate(analysisSchema, req, res);
  if (!body) return;

  const cacheKey = analysisCacheKey(body.answers, body.lang);
  const cached = getCachedAnalysis(cacheKey);
  if (cached) {
    res.setHeader("x-pathfinder-cache", "hit");
    res.status(200).json({ ...cached, session_id: body.session_id, cache_status: "hit" });
    return;
  }

  res.setHeader("x-pathfinder-cache", "miss");

  try {
    const isEn = body.lang === "en";
    const prompt = `
You are PathFinder AI, a career advisor for Indonesian IT fresh graduates.
Analyze these 5 answers and return JSON only.

Answers:
Name: ${body.answers[0]}
Proof of work: ${body.answers[1]}
Engaging task: ${body.answers[2]}
Location: ${body.answers[3]}
Timeline/blocker: ${body.answers[4]}

Return this exact JSON shape:
{
  "user_name": "first name",
  "readiness_score": 75,
  "top_roles": [{"rank":1,"role_id":"data_analyst","role_name":"Junior Data Analyst","fit_score":82,"skills_shown":["SQL"],"job_count":8}],
  "signal_chips": ["short signal"],
  "skill_gaps": [{"skill":"Python","pct":80}],
  "scout_message": "2-3 concrete sentences in ${isEn ? "English" : "Indonesian"}",
  "follow_up_questions": ["question"],
  "project_recommendation": {"name":"project","dataset_name":"dataset","duration_weeks":2,"skills_closed":["skill"],"tech_stack":["tool"],"week_1":"task","week_2":"task"},
  "visual_roadmap": [{"day":7,"title":"Setup","task":"task"},{"day":30,"title":"Milestone","task":"task"},{"day":60,"title":"Polish","task":"task"},{"day":90,"title":"Deploy","task":"task"}],
  "jobs_analyzed": 20,
  "live_jobs": [{"title":"role","company":"company","location":"location","match":82,"type":"Full-time"}]
}`;
    let result;
    try {
      result = await generateJson(prompt, true);
    } catch (searchErr: any) {
      console.warn("Gemini grounded analysis failed; retrying without search", {
        name: searchErr?.name,
        message: searchErr?.message,
      });
      result = await generateJson(prompt, false);
    }
    const responseBody = {
      session_id: body.session_id,
      user_name: result.user_name || body.answers[0] || "Kamu",
      readiness_score: result.readiness_score || 70,
      top_roles: result.top_roles || [],
      signal_chips: result.signal_chips || [],
      skill_gaps: result.skill_gaps || [],
      scout_message: result.scout_message || "",
      follow_up_questions: result.follow_up_questions || [],
      project: result.project_recommendation || result.project || null,
      visual_roadmap: result.visual_roadmap || null,
      jobs_analyzed: result.jobs_analyzed || 20,
      jobs_source: Array.isArray(result.live_jobs) && result.live_jobs.length > 0 ? "AI Google Search" : "Cached/Fallback Data",
      is_live: Array.isArray(result.live_jobs) && result.live_jobs.length > 0,
      fetched_at: new Date().toISOString(),
      live_jobs: result.live_jobs || [],
    };
    setCachedAnalysis(cacheKey, responseBody);
    res.status(200).json(responseBody);
  } catch (err: any) {
    console.warn("Analysis provider failed; serving deterministic fallback", {
      name: err?.name,
      message: err?.message,
    });
    const fallback = fallbackAnalysis(body.answers, body.session_id, body.lang);
    setCachedAnalysis(cacheKey, fallback);
    res.status(200).json(fallback);
  }
}
