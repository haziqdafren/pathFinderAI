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

ROLE MATCHING RULES (strictly follow):
- Blender, animation, film, 3D, rendering, storyboard, or VFX => role_id "creative3d", role_name "Junior 3D Animator" or "Motion Designer".
- Network detection, traffic monitoring, packet analysis, cyber, security, SIEM, SOC, vulnerability, wireshark, CTF, incident response => role_id "cybersecurity", role_name "Junior Cybersecurity Analyst".
- Figma, Adobe XD, wireframe, prototype, user research, usability, UI, UX, user interface, user experience => role_id "uiux", role_name "Junior UI/UX Designer". Do NOT classify these as Motion Designer.
- API, database, server, auth, express, node, postgres, REST => role_id "backend", role_name "Junior Backend Developer".
- SQL, Tableau, Excel, Power BI, data visualization, dashboard, data analysis, machine learning, kaggle => role_id "data", role_name "Junior Data Analyst".
- HTML, CSS, React, Vue, Angular, JavaScript, TypeScript, frontend, web => role_id "web", role_name "Junior Web Developer".
- If the input has NO clear IT skills (general interest only, non-technical hobbies), return top_roles as empty array [].
- Do not force vague/non-technical profiles into any specific role.

Answers:
Name: ${body.answers[0]}
Proof of work (tools/projects/skills): ${body.answers[1]}
Most engaging task: ${body.answers[2]}
Location: ${body.answers[3]}
Timeline/blocker: ${body.answers[4]}

For signal_chips: extract 2-4 SHORT keyword tags (2-4 words each) that summarize the candidate's actual demonstrated skills. Examples: "Figma + Prototyping", "Python + SQL", "Cyber + CTF", "Blender 3D". Never return "short signal" — always analyze the actual answers.

For scout_message: write directly to the user ("you have", "your skills") — never use third person ("he", "she"). Write in ${isEn ? "English" : "Indonesian"}.

Return this exact JSON shape:
{
  "user_name": "first name only",
  "readiness_score": 75,
  "top_roles": [{"rank":1,"role_id":"uiux","role_name":"Junior UI/UX Designer","fit_score":82,"skills_shown":["Figma","Adobe XD"],"job_count":8}],
  "signal_chips": ["Figma + Prototyping","User Research","Wireframing"],
  "skill_gaps": [{"skill":"Figma Advanced","pct":60}],
  "scout_message": "2-3 concrete sentences addressing the user directly in ${isEn ? "English" : "Indonesian"}",
  "follow_up_questions": ["one question"],
  "project_recommendation": {"name":"project name","dataset_name":"dataset or asset name","duration_weeks":2,"skills_closed":["skill1"],"tech_stack":["tool1"],"week_1":"specific task","week_2":"specific task"},
  "visual_roadmap": [{"day":7,"title":"Setup","task":"specific task"},{"day":30,"title":"Milestone","task":"specific task"},{"day":60,"title":"Polish","task":"specific task"},{"day":90,"title":"Deploy","task":"specific task"}],
  "jobs_analyzed": 20,
  "live_jobs": [{"title":"role","company":"real Indonesian company","location":"city","match":82,"type":"Full-time"}]
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
    const isGroundedSearch = result.__provider === "gemini_search";
    const hasAiJobs = Array.isArray(result.live_jobs) && result.live_jobs.length > 0;
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
      jobs_source: hasAiJobs ? (isGroundedSearch ? "AI Google Search" : "AI Curated Listings") : "Cached/Fallback Data",
      is_live: hasAiJobs && isGroundedSearch,
      fetched_at: new Date().toISOString(),
      live_jobs: (result.live_jobs || []).map((job: any) => ({
        ...job,
        is_fallback: !isGroundedSearch,
      })),
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
