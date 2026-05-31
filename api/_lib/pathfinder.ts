import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import crypto from "crypto";

const rateBuckets = new Map<string, { resetAt: number; count: number }>();
const analysisCache = new Map<string, { expiresAt: number; value: any }>();
let ai: GoogleGenAI | null = null;

const AI_LIMIT = Number(process.env.AI_RATE_LIMIT_PER_MIN || 12);
const API_LIMIT = Number(process.env.API_RATE_LIMIT_PER_MIN || 120);
const CACHE_TTL_MS = Number(process.env.ANALYSIS_CACHE_TTL_MS || 1_800_000);
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 9_000);
const DEFAULT_AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const DEFAULT_SEARCH_AI_MODEL = process.env.GEMINI_SEARCH_MODEL || "gemini-3.5-flash";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export const conversationSchema = z.object({
  question_index: z.number().int().min(0).max(10),
  previous_answer: z.string().trim().max(1600).default(""),
  lang: z.enum(["id", "en"]).default("id"),
});

export const analysisSchema = z.object({
  answers: z.array(z.string().trim().max(1200)).min(5).max(5),
  session_id: z.string().trim().min(3).max(120).regex(/^[a-zA-Z0-9._:-]+$/),
  lang: z.enum(["id", "en"]).default("id"),
});

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  sessionData: z.unknown().optional(),
  lang: z.enum(["id", "en"]).default("id"),
  mentorStyle: z.enum(["profesional", "santai"]).default("santai"),
});

export function setCommonHeaders(req: any, res: any) {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.CORS_ORIGINS || process.env.APP_URL || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  res.setHeader("x-request-id", requestId);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-Id");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }

  return requestId;
}

export function handleOptions(req: any, res: any) {
  setCommonHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function enforceMethod(req: any, res: any, method: string) {
  if (req.method !== method) {
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  return true;
}

export function enforceRateLimit(req: any, res: any, kind: "api" | "ai" = "api") {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "anonymous";
  const limit = kind === "ai" ? AI_LIMIT : API_LIMIT;
  const key = `${kind}:${ip}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { resetAt: now + 60_000, count: 1 });
    return true;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
    res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
    return false;
  }

  return true;
}

export function validate<T>(schema: z.ZodType<T>, req: any, res: any): T | null {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
    return null;
  }
  return parsed.data;
}

function parseJsonText(text: string) {
  return JSON.parse(String(text || "{}").replace(/```json/g, "").replace(/```/g, "").trim());
}

function withTimeout<T>(task: Promise<T>, label: string) {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`${label} timed out after ${AI_TIMEOUT_MS}ms`)), AI_TIMEOUT_MS);
  });
  return Promise.race([task, timeout]);
}

function getAiClient() {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  if (!ai) ai = new GoogleGenAI({ apiKey: key });
  return ai;
}

async function generateJsonWithGemini(prompt: string, useSearch = false) {
  const client = getAiClient();
  const config: any = { responseMimeType: "application/json" };
  if (useSearch) config.tools = [{ googleSearch: {} }];

  const response: any = await withTimeout(
    client.models.generateContent({
      model: useSearch ? DEFAULT_SEARCH_AI_MODEL : DEFAULT_AI_MODEL,
      contents: prompt,
      config,
    }),
    "Gemini generation",
  );

  return { ...parseJsonText(response.text || "{}"), __provider: useSearch ? "gemini_search" : "gemini" };
}

async function generateJsonWithOpenRouter(prompt: string) {
  const key = (process.env.OPENROUTER_API_KEY || "").trim();
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured");

  const response = await withTimeout(
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        "HTTP-Referer": process.env.APP_URL || "https://pathfinder-ai-lyart.vercel.app",
        "X-Title": "PathFinder AI",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    }),
    "OpenRouter generation",
  );
  const body = await response.text();
  if (!response.ok) throw new Error(`OpenRouter ${response.status}: ${body.slice(0, 500)}`);
  const data = JSON.parse(body);
  return { ...parseJsonText(data.choices?.[0]?.message?.content || "{}"), __provider: "openrouter" };
}

async function generateJsonWithGroq(prompt: string) {
  const key = (process.env.GROQ_API_KEY || "").trim();
  if (!key) throw new Error("GROQ_API_KEY is not configured");

  const response = await withTimeout(
    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    }),
    "Groq generation",
  );
  const body = await response.text();
  if (!response.ok) throw new Error(`Groq ${response.status}: ${body.slice(0, 500)}`);
  const data = JSON.parse(body);
  return { ...parseJsonText(data.choices?.[0]?.message?.content || "{}"), __provider: "groq" };
}

export async function generateJson(prompt: string, useSearch = false) {
  const failures: string[] = [];
  try {
    return await generateJsonWithGemini(prompt, useSearch);
  } catch (err: any) {
    failures.push(`gemini:${err?.message || err?.name || "failed"}`);
  }

  for (const provider of [generateJsonWithOpenRouter, generateJsonWithGroq]) {
    try {
      return await provider(prompt);
    } catch (err: any) {
      failures.push(err?.message || err?.name || "provider failed");
    }
  }

  throw new Error(`All AI providers failed: ${failures.join(" | ")}`);
}

export function analysisCacheKey(answers: string[], lang: string) {
  return crypto.createHash("sha256").update(JSON.stringify({ answers: answers.map((answer) => answer.toLowerCase()), lang })).digest("hex");
}

export function getCachedAnalysis(key: string) {
  const cached = analysisCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    analysisCache.delete(key);
    return null;
  }
  return cached.value;
}

export function setCachedAnalysis(key: string, value: any) {
  if (analysisCache.size > 500) {
    const firstKey = analysisCache.keys().next().value;
    if (firstKey) analysisCache.delete(firstKey);
  }
  analysisCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

export function fallbackAnalysis(answers: string[], sessionId: string, lang = "id") {
  const isEn = lang === "en";
  const userName = answers[0]?.trim() || (isEn ? "Friend" : "Kamu");
  const joined = `${answers[1] || ""} ${answers[2] || ""}`.toLowerCase();
  const location = answers[3]?.trim() || "Jakarta";
  const isCyber = /\b(cyber|security|keamanan|siber|network|jaringan|packet|traffic|intrusion|threat|soc|siem|firewall|port\s*scan|portscan|detecting system|deteksi|vulnerability|owasp|incident|linux)\b/.test(joined);
  const isCreative = /\b(animasi|animation|animator|blender|3d|modeling|modelling|render|rendering|film|video|motion|storyboard|vfx|visual effect|cinematic|maya|after effects)\b/.test(joined);
  const isBackend = !isCyber && /\b(rest\s+api|api|backend|database|basis\s+data|server|express|node(?:\.js)?|postgres(?:ql)?|jwt|middleware|endpoint)\b/.test(joined);
  const isUi = !isCyber && !isCreative && /ui|ux|figma|design|desain|wireframe/.test(joined);
  const isData = !isCyber && !isCreative && !isBackend && /data|sql|excel|spreadsheet|dashboard|analyst|python/.test(joined);

  const role = isCyber
    ? "Junior Cybersecurity Analyst"
    : isCreative
    ? "Junior 3D Animator"
    : isBackend
    ? "Junior Backend Engineer"
    : isData
    ? "Junior Data Analyst"
    : isUi
    ? "Junior UI/UX Designer"
    : "Junior Web Developer";
  const skill = isCyber
    ? "Network Security & Threat Monitoring"
    : isCreative
    ? "Blender Animation Pipeline"
    : isBackend
    ? "API Authentication & Testing"
    : isData
    ? "Python (pandas)"
    : isUi
    ? "Design System Setup"
    : "React/JavaScript ES6";
  const project = isCyber
    ? {
        name: "Network Traffic Detection Lab",
        dataset_name: "PCAP Sample Traffic Dataset",
        duration_weeks: 3,
        skills_closed: ["Packet Analysis", "Threat Detection", "Security Reporting"],
        tech_stack: ["Python", "Wireshark", "Suricata"],
        week_1: "Week 1: Capture safe sample traffic and label normal vs suspicious patterns.",
        week_2: "Week 2: Build detection rules, export findings, and write a concise incident report.",
      }
    : isCreative
    ? {
        name: "Short 3D Animation Portfolio Film",
        dataset_name: "Blender Scene & Shot Breakdown",
        duration_weeks: 3,
        skills_closed: ["Storyboarding", "3D Animation", "Lighting & Rendering"],
        tech_stack: ["Blender", "DaVinci Resolve", "Behance/ArtStation"],
        week_1: "Week 1: Create storyboard, asset list, camera plan, and one polished test shot.",
        week_2: "Week 2: Animate a 20-30 second sequence, render it, and publish a breakdown reel.",
      }
    : isBackend
    ? {
        name: "Secure E-Commerce REST API Engine",
        dataset_name: "Dynamic API Middleware",
        duration_weeks: 2,
        skills_closed: ["JWT Authentication", "Middleware Routing", "Database Migration Setup"],
        tech_stack: ["Express.js", "PostgreSQL"],
        week_1: "Week 1: Design product schemas and implement authenticated CRUD routes.",
        week_2: "Week 2: Add validation, API tests, docs, and deploy the REST API.",
      }
    : isData
    ? {
        name: "Customer Retention Cohort Dashboard",
        dataset_name: "E-Commerce Market Dataset",
        duration_weeks: 2,
        skills_closed: ["SQL Joins", "Cohort Analysis", "Data Storytelling"],
        tech_stack: ["Looker Studio", "BigQuery"],
        week_1: "Week 1: Clean order and customer data, then build a cohort base table.",
        week_2: "Week 2: Build retention visuals and explain the business insight.",
      }
    : {
        name: "Customer Interactive Web Dashboard",
        dataset_name: "Product Catalog Dataset",
        duration_weeks: 2,
        skills_closed: ["Async API Fetching", "Dynamic Filtering", "State Management"],
        tech_stack: ["Vite React", "Tailwind CSS"],
        week_1: "Week 1: Build a responsive dashboard layout.",
        week_2: "Week 2: Add filters, API states, and deploy the finished portfolio.",
      };

  return {
    session_id: sessionId,
    user_name: userName,
    readiness_score: 75,
    top_roles: [
      { rank: 1, role_name: role, role_id: role.toLowerCase().replace(/[^a-z0-9]+/g, "_"), fit_score: 82, skills_shown: project.skills_closed.slice(0, 3), job_count: 8 },
      { rank: 2, role_name: isCyber ? "SOC Analyst Intern" : isCreative ? "Motion Designer Intern" : isBackend ? "Web Developer (Backend Focus)" : isData ? "BI Analyst Intern" : isUi ? "Product Design Intern" : "Frontend Engineer Intern", role_id: "secondary_role", fit_score: 74, skills_shown: ["Portfolio", "Communication"], job_count: 6 },
    ],
    signal_chips: isEn ? ["practical builder", "portfolio ready", "needs sharper proof"] : ["builder praktis", "siap portfolio", "butuh bukti lebih tajam"],
    skill_gaps: [
      { skill, pct: 80 },
      { skill: isEn ? "Project storytelling" : "Storytelling portfolio", pct: 60 },
    ],
    scout_message: isEn
      ? `${userName}, PathFinder is using safe fallback analysis because the live AI/search provider is unavailable. Your next best move is to finish one focused portfolio project and explain the problem, tools, and measurable result.`
      : `${userName}, PathFinder sedang memakai analisis fallback aman karena provider AI/search live tidak tersedia. Langkah terbaikmu sekarang adalah menyelesaikan satu proyek portfolio yang fokus dan menjelaskan masalah, tools, serta hasil terukurnya.`,
    follow_up_questions: isEn ? ["What should I build first?", "How do I make this portfolio-ready?"] : ["Apa yang sebaiknya aku bangun dulu?", "Gimana bikin ini siap jadi portfolio?"],
    project,
    visual_roadmap: [
      { day: 7, title: isEn ? "Foundation" : "Fondasi", task: isEn ? "Set up repo, data, and project scope." : "Siapkan repo, data, dan scope proyek." },
      { day: 30, title: "Milestone 1", task: isEn ? "Build the core workflow." : "Bangun workflow utama." },
      { day: 60, title: "Milestone 2", task: isEn ? "Polish UI and explain decisions." : "Poles UI dan jelaskan keputusan." },
      { day: 90, title: isEn ? "Publish" : "Publikasi", task: isEn ? "Deploy and link it in your CV." : "Deploy dan tautkan di CV." },
    ],
    jobs_analyzed: 20,
    jobs_source: "Cached/Fallback Data",
    is_live: false,
    fetched_at: new Date().toISOString(),
    live_jobs: [
      { title: role, company: "Sample Tech Company", location, match: 82, type: "Full-time (Sample)", is_fallback: true },
      { title: `${role} Intern`, company: "Sample Startup", location, match: 74, type: "Internship (Sample)", is_fallback: true },
    ],
  };
}

export function readyPayload() {
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  const configured = {
    gemini: Boolean(geminiKey),
    supabaseUrl: Boolean(supabaseUrl),
    openrouter: Boolean((process.env.OPENROUTER_API_KEY || "").trim()),
    groq: Boolean((process.env.GROQ_API_KEY || "").trim()),
    cacheTtlMs: CACHE_TTL_MS,
  };
  return {
    status: configured.gemini || configured.openrouter || configured.groq ? "ready" : "degraded",
    configured,
    cacheSize: analysisCache.size,
  };
}

export function fallbackChatReply(message: string, sessionData: any, lang = "id") {
  const isEn = lang === "en";
  const project = sessionData?.project || {};
  const role = sessionData?.top_roles?.[0]?.role_name || (isEn ? "your target role" : "role targetmu");
  const projectName = project?.name || (isEn ? "your portfolio project" : "proyek portofoliomu");
  const stack = Array.isArray(project?.tech_stack) && project.tech_stack.length
    ? project.tech_stack.slice(0, 3).join(", ")
    : (isEn ? "the simplest tools you already know" : "tools paling sederhana yang sudah kamu kuasai");
  const lower = message.toLowerCase();
  const asksTimeline = /timeline|roadmap|jadwal|belajar|minggu|week/.test(lower);
  const asksPortfolio = /portfolio|portofolio|readme|github|demo/.test(lower);

  if (isEn) {
    if (asksTimeline) {
      return `I can still help in offline mode. For ${role}, use a 7-day sprint: day 1 define the problem and success metric, day 2 collect or mock the data, days 3-4 build the smallest working ${projectName} with ${stack}, day 5 polish the UX, day 6 write the README with screenshots, and day 7 deploy plus record a short demo.`;
    }
    if (asksPortfolio) {
      return `For a recruiter-ready portfolio, make ${projectName} easy to inspect: one live URL, one GitHub repo, a README with problem, tools, screenshots, and measurable outcome, plus 3 bullet points explaining what you personally built. Keep the scope small but finished.`;
    }
    return `Pathy is in offline guidance mode, but here is a concrete next step: open a fresh repo for ${projectName}, create the first screen or notebook using ${stack}, and write one clear goal at the top: what problem it solves, who it helps, and what result proves it works.`;
  }

  if (asksTimeline) {
    return `Aku tetap bisa bantu dalam mode offline. Untuk ${role}, pakai sprint 7 hari: hari 1 tentukan masalah dan metrik sukses, hari 2 kumpulkan atau buat mock data, hari 3-4 bangun versi paling kecil dari ${projectName} dengan ${stack}, hari 5 poles UX, hari 6 tulis README dengan screenshot, dan hari 7 deploy plus rekam demo singkat.`;
  }
  if (asksPortfolio) {
    return `Biar ${projectName} siap dilihat recruiter, pastikan ada satu live URL, satu repo GitHub, README berisi masalah, tools, screenshot, hasil terukur, dan 3 poin tentang bagian yang benar-benar kamu bangun sendiri. Scope kecil tidak masalah, yang penting selesai dan bisa dicoba.`;
  }
  return `Pathy sedang dalam mode panduan offline, tapi langkah pertamanya jelas: buat repo baru untuk ${projectName}, mulai screen/notebook paling sederhana memakai ${stack}, lalu tulis satu tujuan di atasnya: masalah apa yang diselesaikan, siapa yang dibantu, dan bukti apa yang menunjukkan hasilnya berhasil.`;
}
