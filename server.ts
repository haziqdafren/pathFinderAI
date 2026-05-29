import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let ai = null;
function getAiClient() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY env variable missing");
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function callAIPortable(prompt: string, isJson: boolean = false, useSearch: boolean = false): Promise<{ text: string; source: string }> {
  // 1. First choice: Gemini AI
  try {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in the environment");
    }
    const client = getAiClient();
    
    console.log("[AI Routing] Directing request to prime provider: Gemini 3.5...");
    const config: any = {};
    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }
    if (isJson) {
      config.responseMimeType = 'application/json';
    }

    // Set a 9-second timeout for Gemini, especially if utilizing Google Search grounding which can be slow
    const response: any = await withTimeout(
      client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: config
      }),
      9000,
      "Gemini generation timed out after 9 seconds"
    );

    if (response && response.text) {
      return { text: response.text, source: "Gemini 2.0 Flash" };
    }
    throw new Error("Empty content returned from Gemini SDK");
  } catch (gemError: any) {
    const errorMsg = gemError?.message || String(gemError);
    const isQuotaExhausted = errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("exhausted") || errorMsg.toLowerCase().includes("timeout");
    console.warn(`[AI Routing] Gemini is unavailable, timed out, or quota exhausted (isQuota: ${isQuotaExhausted}). Detail: ${errorMsg}`);
    
    // Supplement prompt if search fails and we've fell back to non-grounded backup models
    let augmentedPrompt = prompt;
    if (useSearch) {
      augmentedPrompt += "\n\n[System Info for Fallback AI: You do not have internet search tools right now. Please use your internal knowledge to list 3 real, active, or highly realistic digital industry junior job opportunities in Indonesia (specifically matching the location specified above) for the recommended role. Use recognizable, real tech employers like Tokopedia, Gojek, Bukalapak, Traveloka, Halodoc, eFishery, etc.]";
    }

    // 2. Second choice: Groq API Fallback
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      console.log("[AI Routing] GROQ_API_KEY found, initiating Groq fallback routing...");
      try {
        const payload: any = {
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "user", content: augmentedPrompt }
          ],
          temperature: 0.15,
          max_tokens: 1500
        };
        if (isJson) {
          payload.response_format = { type: "json_object" };
        }

        const groqResponse = await withTimeout(
          fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }),
          5000,
          "Groq fetch timed out after 5 seconds"
        );

        if (!groqResponse.ok) {
          const errText = await groqResponse.text();
          throw new Error(`Groq HTTP ${groqResponse.status}: ${errText}`);
        }

        const resBody = await groqResponse.json() as any;
        const textContent = resBody?.choices?.[0]?.message?.content;
        if (textContent) {
          console.log("[AI Routing] Groq carrier completed successfully under LLaMA 3.1 8B.");
          return { text: textContent, source: "Groq LLaMA 3.1 8B" };
        }
        throw new Error("Groq parsed JSON with missing choice output contents");
      } catch (groqError: any) {
        console.error("[AI Routing] Groq backup routing error:", groqError?.message || groqError);
      }
    } else {
      console.log("[AI Routing] GROQ_API_KEY is not defined.");
    }

    // 3. Third choice: OpenAI API Fallback
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      console.log("[AI Routing] OPENAI_API_KEY found, initiating OpenAI fallback routing...");
      try {
        const payload: any = {
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: augmentedPrompt }
          ],
          temperature: 0.15,
          max_tokens: 1500
        };
        if (isJson) {
          payload.response_format = { type: "json_object" };
        }

        const openaiResponse = await withTimeout(
          fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }),
          5000,
          "OpenAI fetch timed out after 5 seconds"
        );

        if (!openaiResponse.ok) {
          const errText = await openaiResponse.text();
          throw new Error(`OpenAI HTTP ${openaiResponse.status}: ${errText}`);
        }

        const resBody = await openaiResponse.json() as any;
        const textContent = resBody?.choices?.[0]?.message?.content;
        if (textContent) {
          console.log("[AI Routing] OpenAI carrier completed successfully under GPT-4o-mini.");
          return { text: textContent, source: "OpenAI GPT-4o-mini" };
        }
        throw new Error("OpenAI parsed JSON with missing choice output contents");
      } catch (oaError: any) {
        console.error("[AI Routing] OpenAI backup routing error:", oaError?.message || oaError);
      }
    } else {
      console.log("[AI Routing] OPENAI_API_KEY is not defined.");
    }

    // 4. Fourth choice: OpenRouter API Fallback
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      console.log("[AI Routing] OPENROUTER_API_KEY found, initiating OpenRouter fallback routing...");
      try {
        const payload: any = {
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "user", content: augmentedPrompt }
          ],
          temperature: 0.15,
          max_tokens: 1500
        };
        if (isJson) {
          payload.response_format = { type: "json_object" };
        }

        const openrouterResponse = await withTimeout(
          fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openrouterKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://ai.studio/build",
              "X-Title": "PathFinder"
            },
            body: JSON.stringify(payload)
          }),
          5000,
          "OpenRouter fetch timed out after 5 seconds"
        );

        if (!openrouterResponse.ok) {
          const errText = await openrouterResponse.text();
          throw new Error(`OpenRouter HTTP ${openrouterResponse.status}: ${errText}`);
        }

        const resBody = await openrouterResponse.json() as any;
        const textContent = resBody?.choices?.[0]?.message?.content;
        if (textContent) {
          console.log("[AI Routing] OpenRouter carrier completed successfully under google/gemini-2.0-flash-001.");
          return { text: textContent, source: "OpenRouter Gemini 2.0 Flash" };
        }
        throw new Error("OpenRouter parsed JSON with missing choice output contents");
      } catch (orError: any) {
        console.error("[AI Routing] OpenRouter backup routing error:", orError?.message || orError);
      }
    } else {
      console.log("[AI Routing] OPENROUTER_API_KEY is not defined.");
    }

    throw new Error("All active AI options (Gemini, Groq, OpenAI, OpenRouter) are currently unavailable or exhausted.");
  }
}


async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // Load JSON data at startup
  let taxonomyMap = "";
  let templatesData = "";
  try {
    taxonomyMap = fs.readFileSync(path.join(process.cwd(), "backend/app/data/role_taxonomy.json"), "utf8");
    templatesData = fs.readFileSync(path.join(process.cwd(), "backend/app/data/project_templates.json"), "utf8");
  } catch(e) {
    console.error("Could not load data files:", e);
  }

  // API Routes
  app.post("/api/v1/conversation/question", async (req, res) => {
    try {
      const lang = req.body?.lang || 'id';
      const isEn = lang === 'en';
      if (req.body.question_index === 2) {
        const prompt = isEn
          ? `User answered Q1 (project they are proud of): "${req.body.previous_answer}"\nGenerate Q2 asking about what specific task engages them for hours, tailored to their Q1 answer. Present all questions and onboarding tips entirely in professional, encouraging English language.\n\nReturn JSON ONLY: {"question": "...", "tip": "..."}`
          : `User answered Q1 (project they are proud of): "${req.body.previous_answer}"\nGenerate Q2 asking about what specific task engages them for hours, tailored to their Q1 answer.\n\nReturn JSON ONLY: {"question": "...", "tip": "..."}`;
        const aiRes = await callAIPortable(prompt, true, false);
        const text = aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);
        res.json(data);
        return;
      }
      res.json({ question: isEn ? "Static Question" : "Pertanyaan statis", tip: "..." });
    } catch (e) {
      console.error("Conversation API failed to generate with AI:", e);
      const isEn = req.body?.lang === 'en';
      if (isEn) {
        res.json({
          question: "From your story, which part often makes you lose track of time? (e.g., designing visual layouts, troubleshooting backend bugs, or crafting databases)",
          tip: "Pathy needs to identify what makes you tick — so the recommended tech role fits you perfectly."
        });
      } else {
        res.json({
          question: "Dari ceritamu tadi, bagian mana yang sering bikin kamu lupa waktu? (misal: mikirin layout UI, ngoprek bug, atau ngulik database)",
          tip: "Pathy perlu tahu hal spesifik yang bikin kamu enjoy — biar role tech yang disarankan beneran cocok."
        });
      }
    }
  });

  app.post("/api/v1/analysis", async (req, res) => {
    let sessionId = req.body?.session_id || "session";
    try {
      const answers = req.body?.answers || [];
      const lang = req.body?.lang || 'id';
      const isEn = lang === 'en';

      // 1. Extract Signals & Match Roles
      const prompt = `
        You are Pathy — an expert career advisor analyzing a fresh IT graduate's background for the Indonesian job market.
        
        You MUST use Google Search to find 3 real, CURRENT, and OPEN job postings in Indonesia (especially matching the user's location) for the matched roles.
        Populate the "live_jobs" array with these real job listings.

        AVAILABLE ROLES TAXONOMY:
        ${taxonomyMap}

        PROJECT TEMPLATES:
        ${templatesData}

        User's 5 answers:
        Name: ${answers[0] || ''}
        Q1 (proud of): ${answers[1] || ''}
        Q2 (engaging task): ${answers[2] || ''}
        Q3 (location): ${answers[3] || ''}
        Q4 (timeline/pressure): ${answers[4] || ''}

        Return ONLY a JSON block describing the extracted profile, the matched job roles, skill gaps, and a single recommended project.
        Important: Do NOT include citation brackets (like [1]) inside the JSON string values.

        Rules:
        - "user_name": User's first name, or "Kamu".
        - "readiness_score": Integer out of 100 on how ready they seem based on answers.
        - "top_roles": Array of 1 to 3 objects representing matched roles from the taxonomy, e.g. [{"rank": 1, "role_id": "...", "role_name": "...", "fit_score": 85, "skills_shown": ["skill 1"]}]
        - "signal_chips": Array of 1 to 4 short casual phrases (In ${isEn ? "English" : "Indonesian"}, e.g., ${isEn ? '"loves coding at night", "dashboard fan"' : '"suka ngoding malam", "dashboard ukm"'}).
        - "scout_message": 2-3 sentences. Honest observation from data. Name what they're good at, name the gap, end with ONE concrete action. Use casual, clear, and encouraging ${isEn ? "English language" : "Indonesian language"}.
        - "follow_up_questions": Array of 2 to 3 questions in ${isEn ? "English" : "Indonesian"}.
        - "skill_gaps": Array of up to 3 objects representing what they need to learn, e.g. [{"skill": "Python", "count": 15, "total": 20, "pct": 75}] (Where count/total represent simulated job frequency)
        - "project_recommendation": Object containing EXACTLY the data from ONE of the provided PROJECT TEMPLATES that fits them best. The object must include "name", "dataset_name", "dataset_url", "skills_closed" (array), "tech_stack" (array), "duration_weeks", "week_1", "week_2". ${isEn ? "All project fields (name, week_1, week_2) MUST be translated to English." : "Keep initial Indonesian content."}
        - "visual_roadmap": Array of exactly 4 objects mapping skill gaps to project tasks over 90 days. e.g. [{"day": 7, "title": "Setup", "task": "Setup project and ingest data"}, {"day": 30, "title": "Milestone 1", "task": "Learn X to do Y"}, {"day": 60, "title": "Milestone 2", "task": "Implement Z"}, {"day": 90, "title": "Mastery", "task": "Finish and deploy"}]. ${isEn ? "Titles and tasks must be in English." : "Titles and tasks must be in Indonesian."}
        - "jobs_analyzed": Integer representing number of jobs.
        - "live_jobs": Array of 3 objects representing real, current job postings you found via Google Search, e.g. [{"title": "Junior Web Developer", "company": "Real Company Name", "location": "Jakarta", "match": 85, "type": "Full-time"}]
        
        LANGUAGE MODE: Return all explanations, descriptions, recommendations, and roadmaps strictly in ${isEn ? "ENGLISH" : "INDONESIAN"}.
        JSON ONLY. No markdown wrapping.
      `;

      const aiRes = await callAIPortable(prompt, true, true);

      let text = aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const resultObj = JSON.parse(text);

      res.json({
        session_id: sessionId,
        user_name: resultObj.user_name || answers[0] || "Kamu",
        readiness_score: resultObj.readiness_score || 70,
        top_roles: resultObj.top_roles || [],
        signal_chips: resultObj.signal_chips || [],
        skill_gaps: resultObj.skill_gaps || [],
        scout_message: resultObj.scout_message || "Oke, ini profil kamu...",
        follow_up_questions: resultObj.follow_up_questions || [],
        project: resultObj.project_recommendation || null,
        visual_roadmap: resultObj.visual_roadmap || null,
        jobs_analyzed: resultObj.jobs_analyzed || 25,
        jobs_source: resultObj.live_jobs ? "AI Google Search" : "Cached/Fallback Data",
        is_live: !!resultObj.live_jobs,
        fetched_at: new Date().toISOString(),
        live_jobs: resultObj.live_jobs || [
          { title: "Junior Data Analyst", company: "Simulated Bukalapak", location: "Jakarta", match: 78, type: "Full-time (Sample)", is_fallback: true },
          { title: "BI Analyst Intern", company: "Simulated Tokopedia", location: "Jakarta", match: 74, type: "Internship (Sample)", is_fallback: true },
          { title: "Data Operations", company: "Simulated Sayurbox", location: "Bandung", match: 68, type: "Full-time (Sample)", is_fallback: true }
        ]
      });

    } catch (e) {
      console.error("Gemini failed, using dynamic local analyzer fallback:", e);
      const answers = req.body?.answers || [];
      const lang = req.body?.lang || 'id';
      const isEn = lang === 'en';
      const uName = answers[0]?.trim() || "Kamu";
      const q1Content = (answers[1] || "").trim().toLowerCase();
      const q2Content = (answers[2] || "").trim().toLowerCase();
      
      // Sanitize location: default to Jakarta if pure numbers, empty, or lacks alphabet
      let rawLocation = (answers[3] || "Jakarta").trim();
      if (!rawLocation || /^\d+$/.test(rawLocation) || !/[a-zA-Z]/.test(rawLocation) || rawLocation.length < 2) {
        rawLocation = "Jakarta";
      }
      const location = rawLocation;

      // Enhanced nonsense/mash/short answer detector
      const isNonsenseInput = (q1: string, q2: string): boolean => {
        const combined = (q1 + " " + q2).trim().toLowerCase();
        if (combined.length < 8) return true;
        if (/^([a-z0-9])\1+$/.test(combined)) return true; // e.g. "aaaaa"
        
        // Match common repeating mashes
        const mashKeywords = ["asdasd", "asdfasdf", "qwerqwer", "zxcvbn", "qwerty", "123123", "654654", "cbvcb", "asdgasdf"];
        if (mashKeywords.some(keyword => combined.includes(keyword))) {
          return true;
        }

        // Pure digit/symbol check
        if (/^[^a-zA-Z]*$/.test(combined)) {
          return true;
        }
        
        // Pure keyboard consonant mashes like "dfghjkl", "zxcvbnm"
        const cleanAlpha = combined.replace(/[^a-z]/g, '');
        if (cleanAlpha.length > 5) {
          const vowels = cleanAlpha.match(/[aeiouy]/g);
          if (!vowels || vowels.length / cleanAlpha.length < 0.15) {
            return true;
          }
        }
        return false;
      };

      // Detect field
      // Instead of static "web" (Junior Web Developer) default, rotate dynamically across four categories
      const fallbackPool = ["web", "backend", "data", "uiux"];
      const charSum = uName.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
      let field = fallbackPool[charSum % fallbackPool.length];
      
      if (isNonsenseInput(q1Content, q2Content)) {
        field = "nonsense";
      } else if (
        q1Content.includes("cyber") || q1Content.includes("security") || q1Content.includes("keamanan") || 
        q1Content.includes("hack") || q1Content.includes("pentest") || q1Content.includes("ctf") || 
        q1Content.includes("capture") || q1Content.includes("flag") || q1Content.includes("lomba") || 
        q1Content.includes("siber") || q1Content.includes("jaringan") || q1Content.includes("network") ||
        q2Content.includes("cyber") || q2Content.includes("security") || q2Content.includes("keamanan") || 
        q2Content.includes("hack") || q2Content.includes("pentest") || q2Content.includes("ctf") || 
        q2Content.includes("capture") || q2Content.includes("flag") || q2Content.includes("lomba") ||
        q2Content.includes("siber") || q2Content.includes("jaringan") || q2Content.includes("network")
      ) {
        field = "cybersecurity";
      } else if (
        q1Content.includes("data") || q1Content.includes("sql") || q1Content.includes("excel") || 
        q1Content.includes("analyst") || q1Content.includes("spreadsheet") || q1Content.includes("python") ||
        q2Content.includes("data") || q2Content.includes("sql") || q2Content.includes("excel") || 
        q2Content.includes("analyst")
      ) {
        field = "data";
      } else if (
        q1Content.includes("ui") || q1Content.includes("ux") || q1Content.includes("desain") || 
        q1Content.includes("design") || q1Content.includes("figma") ||
        q2Content.includes("ui") || q2Content.includes("ux") || q2Content.includes("desain") || 
        q2Content.includes("design") || q2Content.includes("figma")
      ) {
        field = "uiux";
      } else if (
        q1Content.includes("backend") || q1Content.includes("api") || q1Content.includes("database") || 
        q1Content.includes("server") || q1Content.includes("express") || q1Content.includes("node") ||
        q2Content.includes("backend") || q2Content.includes("api") || q2Content.includes("database") || 
        q2Content.includes("server")
      ) {
        field = "backend";
      }

      let topRoles = [];
      let signalChips = [];
      let scoutMessage = "";
      let project = {};
      let liveJobs = [];

      if (field === "nonsense") {
        if (isEn) {
          topRoles = [
            { rank: 1, role_name: "Input Too Short or Irrelevant", role_id: "re_onboard", fit_score: 20, skills_shown: ["Re-Onboarding"] },
            { rank: 2, role_name: "Let's Restart the Session", role_id: "re_onboard", fit_score: 10, skills_shown: ["Retry Responses"] }
          ];
          signalChips = ["short feedback", "needs real details", "click settings gear"];
          scoutMessage = `Hello ${uName}, Pathy detected that your input is a bit brief or random. To get high-value career suggestions and custom portfolio target projects, click the Settings (gear icon) on the lower-left and choose Restart Profiling!`;
          project = {
            name: "Restart Onboarding & Tell Your Story",
            dataset_name: "Manual Onboarding Reset",
            duration_weeks: 1,
            skills_closed: ["Follow Pathy instructions", "Share genuine IT interests"],
            tech_stack: ["Re-Onboarding"],
            week_1: "Week 1: Click the Settings gear icon on the left, then hit Restart Career Profiling.",
            week_2: "Week 2: Complete the onboarding interview by sharing your real experience or interest in tech."
          };
        } else {
          topRoles = [
            { rank: 1, role_name: "Masukan Kurang Spesifik / Acak", role_id: "re_onboard", fit_score: 20, skills_shown: ["Onboarding Ulang"] },
            { rank: 2, role_name: "Yuk Mulai Ulang Sesi", role_id: "re_onboard", fit_score: 10, skills_shown: ["Ulangi Jawaban"] }
          ];
          signalChips = ["jawaban acak", "butuh cerita nyata", "klik gir pengaturan"];
          scoutMessage = `Halo ${uName}, Pathy mendeteksi jawaban yang dimasukkan sepertinya berupa ketukan acak atau terlalu singkat. Agar Pathy bisa ngasih rekomendasi karir tech & target proyek portfolio yang pas dan beneran bernilai buat karirmu, yuk buka 'Pengaturan' (ikon gir) dan klik 'Mulai Ulang Analisis' untuk mengulang dengan cerita nyatamu ya!`;
          project = {
            name: "Mulai Ulang Sesi & Ceritakan Pengalamanmu",
            dataset_name: "Manual Reset Onboarding",
            duration_weeks: 1,
            skills_closed: ["Mengikuti petunjuk Pathy", "Mengisi cerita proyek riil"],
            tech_stack: ["Onboarding Ulang"],
            week_1: "Week 1: Klik tombol gir Pengaturan di sebelah kiri bawah layar, lalu klik Mulai Ulang Analisis Karir.",
            week_2: "Week 2: Selesaikan onboarding baru dengan menceritakan pengalaman/tertarikan aslimu di dunia IT."
          };
        }
        liveJobs = [
          { title: "Junior Web Developer (General)", company: "Halodoc", location: location, match: 30, type: "Full-time" },
          { title: "IT Support Staff", company: "AdaKami", location: location, match: 25, type: "Full-time" }
        ];
      } else if (field === "data") {
        if (isEn) {
          topRoles = [
            { rank: 1, role_name: "Junior Data Analyst", role_id: "data_analyst", fit_score: 82, skills_shown: ["SQL", "Spreadsheets", "Data Cleansing"] },
            { rank: 2, role_name: "BI Analyst Intern", role_id: "bi_intern", fit_score: 75, skills_shown: ["SQL", "Dashboards", "Visualization"] },
            { rank: 3, role_name: "Data Operations Staff", role_id: "data_ops", fit_score: 68, skills_shown: ["Admin", "Detail Oriented"] }
          ];
          signalChips = ["loves data", "spreadsheet enthusiast", "loves deep analysis", "curious about business insights"];
          scoutMessage = `Hello ${uName}, your interest in data analytics is highly promising! You thrive when cleaning messy spreadsheets and visualizing trends. One critical gap: build an interactive dashboard (like Looker or Tableau) using an open dataset to prove your skills with data relations to recruiters.`;
          project = {
            name: "Customer Retention Cohort Dashboard",
            dataset_name: "E-Commerce Market Dataset",
            duration_weeks: 2,
            skills_closed: ["SQL Joins", "Cohort Analysis", "Data Source Linking"],
            tech_stack: ["Looker Studio", "BigQuery"],
            week_1: "Week 1: Clean order and customer datasets, then establish the base table for cohort analytics.",
            week_2: "Week 2: Complete user retention visualizations and implement location filters."
          };
        } else {
          topRoles = [
            { rank: 1, role_name: "Junior Data Analyst", role_id: "data_analyst", fit_score: 82, skills_shown: ["SQL", "Spreadsheet", "Data Cleansing"] },
            { rank: 2, role_name: "BI Analyst Intern", role_id: "bi_intern", fit_score: 75, skills_shown: ["SQL", "Dashboard", "Visualization"] },
            { rank: 3, role_name: "Data Operations Staff", role_id: "data_ops", fit_score: 68, skills_shown: ["Admin", "Detail Oriented"] }
          ];
          signalChips = ["suka data", "nyaman excel/spreadsheet", "tahan analisis mendalam", "penasaran insight bisnis"];
          scoutMessage = `Halo ${uName}, ketertarikanmu pada data sangat menjanjikan! Kamu paling menikmati bagian merapikan data kotor dan memvisualisasikannya. Satu gap penting: buat portofolio interaktif seperti Looker dashboard dari public dataset agar rekruter yakin kemampuan teknismu sudah terbiasa dengan relasi data kompleks.`;
          project = {
            name: "Customer Retention Cohort Dashboard",
            dataset_name: "E-Commerce Market Dataset",
            duration_weeks: 2,
            skills_closed: ["SQL Joins", "Cohort Analysis", "Data Source Linking"],
            tech_stack: ["Looker Studio", "BigQuery"],
            week_1: "Week 1: Cleansing data order dan customer, bikin base table buat cohort analysis.",
            week_2: "Week 2: Selesaikan visualisasi retensi pelanggan serta penyaringan (filter) berdasarkan lokasi."
          };
        }
        liveJobs = [
          { title: "Junior Data Analyst", company: "Bukalapak", location: location, match: 82, type: "Full-time" },
          { title: "BI Analyst Intern", company: "Tokopedia", location: location, match: 75, type: "Internship" },
          { title: "Data Operations Specialist", company: "Sayurbox", location: location, match: 68, type: "Full-time" }
        ];
      } else if (field === "uiux") {
        if (isEn) {
          topRoles = [
            { rank: 1, role_name: "Junior UI/UX Designer", role_id: "uiux_designer", fit_score: 85, skills_shown: ["Figma", "User Research", "Wireframing"] },
            { rank: 2, role_name: "Product Design Intern", role_id: "product_designer", fit_score: 72, skills_shown: ["Prototyping", "UI Anatomy", "Design System"] },
            { rank: 3, role_name: "Graphic Designer & UI Specialist", role_id: "graphic_designer", fit_score: 64, skills_shown: ["Visual Harmony", "Adobe Creative"] }
          ];
          signalChips = ["loves Figma", "visually meticulous", "understands UI anatomy", "user flow centric"];
          scoutMessage = `Hello ${uName}, your focus on visual design detail and user experience is stellar. Your Figma templates show a solid layout sense. Your next challenge is to build a high-fidelity case study that details "why" you made those visual compromises, rather than just "how pretty" they look.`;
          project = {
            name: "FinTech Mobile App Redesign",
            dataset_name: "E-wallet Usability Audit",
            duration_weeks: 2,
            skills_closed: ["Usability Testing", "High Fidelity Prototyping", "Design System Setup"],
            tech_stack: ["Figma", "Maze Testing"],
            week_1: "Week 1: Perform a usability audit on 5 users, then draft paper coordinate wireframes.",
            week_2: "Week 2: Construct a comprehensive visual design system with micro-animated prototype links."
          };
        } else {
          topRoles = [
            { rank: 1, role_name: "Junior UI/UX Designer", role_id: "uiux_designer", fit_score: 85, skills_shown: ["Figma", "User Research", "Wireframing"] },
            { rank: 2, role_name: "Product Design Intern", role_id: "product_designer", fit_score: 72, skills_shown: ["Prototyping", "UI Anatomy", "Design System"] },
            { rank: 3, role_name: "Graphic Designer & UI Specialist", role_id: "graphic_designer", fit_score: 64, skills_shown: ["Visual Harmony", "Adobe Creative"] }
          ];
          signalChips = ["suka desain figma", "sangat detail visual", "paham anatomi UI", "fokus ke user-flow"];
          scoutMessage = `Halo ${uName}, kepedulianmu pada detail visual dan kenyamanan pengguna sangat menonjol. Proyek Figma milikmu membuktikan kamu punya sense of layout yang solid. Fokus berikutnya adalah membuat studi kasus / UI portfolio yang bercerita tentang "mengapa" desain tersebut dibuat, bukan sekadar "cantik" secara visual saja.`;
          project = {
            name: "FinTech Mobile App Redesign",
            dataset_name: "E-wallet Usability Audit",
            duration_weeks: 2,
            skills_closed: ["Usability Testing", "High Fidelity Prototyping", "Design System Setup"],
            tech_stack: ["Figma", "Maze Testing"],
            week_1: "Week 1: Melakukan audit sederhana pada 5 user dan membuat rancangan wireframe solusi baru.",
            week_2: "Week 2: Menyusun visual design system lengkap dengan komponen interaktif beranimasi di Figma."
          };
        }
        liveJobs = [
          { title: "Junior UI/UX Designer", company: "BFI Finance", location: location, match: 85, type: "Full-time" },
          { title: "UI Designer Intern", company: "Tiket.com", location: location, match: 72, type: "Internship" },
          { title: "Product Designer", company: "Mekari", location: location, match: 70, type: "Full-time" }
        ];
      } else if (field === "backend") {
        if (isEn) {
          topRoles = [
            { rank: 1, role_name: "Junior Backend Engineer", role_id: "backend_dev", fit_score: 80, skills_shown: ["Node.js", "Express.js", "Database Logic"] },
            { rank: 2, role_name: "Web Developer (Backend Focus)", role_id: "web_dev", fit_score: 74, skills_shown: ["REST APIs", "Routing", "Base SQL"] },
            { rank: 3, role_name: "Junior DevOps/Sysadmin", role_id: "devops", fit_score: 60, skills_shown: ["Bash commands", "Docker", "Git Flow"] }
          ];
          signalChips = ["database enthusiast", "loves REST APIs", "endpoints design", "finds satisfaction in debugging"];
          scoutMessage = `Hello ${uName}, you have a strong passion for behind-the-scenes systems! Structuring secure API endpoints and optimizing query latency is an incredible foundation. Your next step: deploy a live REST API to a public cloud (Koyeb or Render) with full Swagger docs so recruiters can hit the active ports directly.`;
          project = {
            name: "Secure E-Commerce REST API Engine",
            dataset_name: "Dynamic API Middleware",
            duration_weeks: 2,
            skills_closed: ["JWT Authentication", "Middleware Routing", "Database Migration Setup"],
            tech_stack: ["Express.js", "PostgreSQL", "Railway Cloud"],
            week_1: "Week 1: Draft ERD schemas for products, and complete DB routing rules.",
            week_2: "Week 2: Implement secure JWT authorization tokens, input sanitization, and REST routes."
          };
        } else {
          topRoles = [
            { rank: 1, role_name: "Junior Backend Engineer", role_id: "backend_dev", fit_score: 80, skills_shown: ["Node.js", "Express", "Database Logic"] },
            { rank: 2, role_name: "Web Developer (Backend)", role_id: "web_dev", fit_score: 74, skills_shown: ["REST API", "Routing", "SQL Basics"] },
            { rank: 3, role_name: "Junior DevOps/Sysadmin", role_id: "devops", fit_score: 60, skills_shown: ["Linux commands", "Docker", "Git Flow"] }
          ];
          signalChips = ["senang logic database", "suka ngulik REST API", "paham endpoint routing", "senang cari bugs"];
          scoutMessage = `Halo ${uName}, kamu punya passion yang kuat di belakang layar! Kepuasanmu merapikan endpoint API dan mengatur relasi database adalah fondasi yang luar biasa. Tugas utamamu sekarang: deploy mandiri satu API nyata ke public cloud (misalnya Koyeb atau Render) dan lengkapi dengan dokumentasi Swagger berkualitas agar rekruter bisa langsung tes karya aslimu.`;
          project = {
            name: "Secure E-Commerce REST API Engine",
            dataset_name: "Dynamic API Middleware",
            duration_weeks: 2,
            skills_closed: ["JWT Authentication", "Middleware Routing", "Database Migration Setup"],
            tech_stack: ["Express.js", "PostgreSQL", "Railway Cloud"],
            week_1: "Week 1: Desain skema ERD produk & penjualan, selesaikan routing CRUD database.",
            week_2: "Week 2: Implementasi otentikasi secure token JWT, sanitasi input, dan dokumentasi REST API."
          };
        }
        liveJobs = [
          { title: "Junior Backend Developer", company: "Bibit", location: location, match: 80, type: "Full-time" },
          { title: "Web Developer Intern", company: "Astra Digital", location: location, match: 74, type: "Internship" },
          { title: "Backend Engineer", company: "Kredivo", location: location, match: 70, type: "Full-time" }
        ];
      } else if (field === "cybersecurity") {
        if (isEn) {
          topRoles = [
            { rank: 1, role_name: "Junior Cybersecurity Analyst", role_id: "cybersecurity_analyst", fit_score: 86, skills_shown: ["Network Security", "Linux Systems", "Vulnerability Assessment"] },
            { rank: 2, role_name: "IT Security Associate", role_id: "cybersecurity_analyst", fit_score: 78, skills_shown: ["Security Audits", "OWASP fundamentals", "Incident Handling"] },
            { rank: 3, role_name: "Junior Network Engineer (Sec Ops)", role_id: "network_engineer", fit_score: 70, skills_shown: ["Firewalls", "TCP/IP Support", "VPN Access"] }
          ];
          signalChips = ["loves cybersecurity", "ethical hacking curious", "commands Linux", "focused on cyber defense"];
          scoutMessage = `Hello ${uName}, your interest in Cybersecurity is critical and highly sought after! To stand out, recruiters assess practical analysis skills rather than just theory certificate sheets. An active portfolio, such as writing a vulnerability port-scanner or auditing OWASP guidelines, will drastically index your hiring potential.`;
          project = {
            name: "Network Vulnerability Scanner & Incident Logger",
            dataset_name: "CVE Live Feed",
            duration_weeks: 4,
            skills_closed: ["Vulnerability Assessment", "Security Monitoring", "Network Security"],
            tech_stack: ["Python", "MITRE CVE API", "React.js"],
            week_1: "Week 1: Construct a base Python socket port scanner.",
            week_2: "Week 2: Map open ports automatically to live CVE vulnerability feeds.",
            week_3: "Week 3: Render discovered security warnings on a clean interactive React interface.",
            week_4: "Week 4: Export a complete markdown hardening recommendation guide."
          };
        } else {
          topRoles = [
            { rank: 1, role_name: "Junior Cybersecurity Analyst", role_id: "cybersecurity_analyst", fit_score: 86, skills_shown: ["Network Security", "Linux", "Vulnerability Assessment"] },
            { rank: 2, role_name: "IT Security Associate", role_id: "cybersecurity_analyst", fit_score: 78, skills_shown: ["Security Monitoring", "OWASP basics", "Incident Handling"] },
            { rank: 3, role_name: "Junior Network Engineer (Security)", role_id: "network_engineer", fit_score: 70, skills_shown: ["Firewall", "TCP/IP", "VPN Support"] }
          ];
          signalChips = ["suka keamanan IT", "paham ethical hacking", "senang kulik Linux", "tertarik defense siber"];
          scoutMessage = `Halo ${uName}, ketertarikanmu di dunia Cybersecurity sangat kritis dan dicari! Untuk menembus industri ini, rekruter tidak hanya menilai sertifikasi teori, melainkan juga kemampuan praktis dalam mendiagnosis kelemahan sistem secara nyata. Portofolio aktif seperti membangun CVE matcher mandiri atau membedah lubang OWASP Top 10 akan menaikkan level kesiapan karirmu secara pesat.`;
          project = {
            name: "Network Vulnerability Scanner & Incident Logger",
            dataset_name: "CVE Live Feed",
            duration_weeks: 4,
            skills_closed: ["Vulnerability Assessment", "Security Monitoring", "Network Security"],
            tech_stack: ["Python", "MITRE CVE API", "React.js"],
            week_1: "Week 1: Bangun script Python port & service status utility.",
            week_2: "Week 2: Integrasikan penelusuran CVE matching otomatis.",
            week_3: "Week 3: Visualkan hasil deteksi port terekspos ke dashboard log UI.",
            week_4: "Week 4: Berikan laporan rekomendasi pengerasan (hardening) & deploy."
          };
        }
        liveJobs = [
          { title: "Junior Cybersecurity Analyst", company: "Gojek", location: location, match: 86, type: "Full-time" },
          { title: "SOC Analyst Intern", company: "Telkom Indonesia", location: location, match: 78, type: "Internship" },
          { title: "Information Security Officer Support", company: "BCA", location: location, match: 72, type: "Full-time" }
        ];
      } else {
        if (isEn) {
          topRoles = [
            { rank: 1, role_name: "Junior Web Developer", role_id: "web_dev", fit_score: 83, skills_shown: ["HTML/CSS", "JavaScript", "Responsive Layouts"] },
            { rank: 2, role_name: "Frontend Engineer Intern", role_id: "frontend_dev", fit_score: 76, skills_shown: ["React Basics", "Git Workflows", "Tailwind CSS"] },
            { rank: 3, role_name: "WordPress / CMS Specialist", role_id: "wordpress_specialist", fit_score: 65, skills_shown: ["CMS Management", "Page Builders"] }
          ];
          signalChips = ["visual layouts fan", "Tailwind styling", "responsive grids", "deployment enthusiast"];
          scoutMessage = `Hello ${uName}, having experience in building responsive web views is highly valued. You have a great visual flow. To level up your readiness index, focus on integrating async API fetching workflows to make your layouts completely dynamic and interactive.`;
          project = {
            name: "Customer Interactive Web Dashboard",
            dataset_name: "Product Catalog Dataset",
            duration_weeks: 2,
            skills_closed: ["Async API Fetching", "Dynamic Filtering", "State Management (React)"],
            tech_stack: ["Vite React", "Tailwind CSS"],
            week_1: "Week 1: Build fluid wireframes and implement responsive grids with Tailwind CSS.",
            week_2: "Week 2: Implement async API data fetches with custom filtering states."
          };
        } else {
          topRoles = [
            { rank: 1, role_name: "Junior Web Developer", role_id: "web_dev", fit_score: 83, skills_shown: ["HTML/CSS", "JavaScript", "Responsive Design"] },
            { rank: 2, role_name: "Frontend Engineer Intern", role_id: "frontend_dev", fit_score: 76, skills_shown: ["React basics", "Git Flow", "Tailwind CSS"] },
            { rank: 3, role_name: "WordPress / CMS Specialist", role_id: "wordpress_specialist", fit_score: 65, skills_shown: ["CMS Setup", "Page Builders"] }
          ];
          signalChips = ["suka tampilan web", "bisa CSS/Tailwind", "paham responsive grid", "paling lega pas web dideploy"];
          scoutMessage = `Halo ${uName}, pengalaman membuat website responsif adalah modal awal yang sangat dibutuhkan di industri global maupun lokal. Sangat bagus kamu berani eksplorasi. Upayakan untuk naik kelas dengan membuat portfolio yang menggunakan fungsionalitas fetch data API secara asinkron agar situsmu aktif dan interaktif seutuhnya!`;
          project = {
            name: "Customer Interactive Web Dashboard",
            dataset_name: "Product Catalog Dataset",
            duration_weeks: 2,
            skills_closed: ["Async API Fetching", "Dynamic Filtering", "State Management (React)"],
            tech_stack: ["Vite React", "Tailwind CSS"],
            week_1: "Week 1: Membuat rancangan layout interaktif responsif pada semua ukuran layar.",
            week_2: "Week 2: Tambahkan fetch data dari dummy API serta pasang fungsionalitas visual filter."
          };
        }
        liveJobs = [
          { title: "Junior Web Developer", company: "Traveloka", location: location, match: 83, type: "Full-time" },
          { title: "Frontend Developer Intern", company: "eFishery", location: location, match: 76, type: "Internship" },
          { title: "Web Generalist Developer", company: "Halodoc", location: location, match: 70, type: "Full-time" }
        ];
      }

      res.json({
        session_id: sessionId,
        user_name: uName,
        readiness_score: 75,
        top_roles: topRoles,
        signal_chips: signalChips,
        skill_gaps: [
          { skill: field === "data" ? "Python (pandas)" : field === "uiux" ? "Design System Setup" : field === "cybersecurity" ? "Linux Command Line & Networking" : "React/JavaScript ES6", pct: 80 },
          { skill: field === "cybersecurity" ? (isEn ? "Vulnerability Logging & Hardening Compilation" : "Kompilasi Vulnerability Log & Hardening") : (isEn ? "Data Storytelling & Presentation" : "Data Storytelling & Presentation"), pct: 60 }
        ],
        scout_message: scoutMessage,
        follow_up_questions: isEn ? [
          field === "data" ? "How do I build a Looker Studio dashboard for free?" : field === "cybersecurity" ? "How do I simulate security OWASP test audits safely?" : "What portfolio steps do tech recruiters love most?",
          "What is the ideal technical learning roadmap for this month?"
        ] : [
          field === "data" ? "Gimana cara bikin Looker Studio dashboard gratis?" : field === "cybersecurity" ? "Bagaimana cara mensimulasikan test OWASP dengan aman?" : "Langkah portofolio apa yang paling disukai HRD?",
          "Apa roadmap belajar technical yang pas untuk target 1 bulan ini"
        ],
        project: project,
        visual_roadmap: [
          { day: 7, title: isEn ? "Foundation Setup" : "Setup Fondasi", task: isEn ? "Configure project environment and define DB / code repository." : "Siapkan project environment dan inisialisasi basis data / repository." },
          { day: 30, title: isEn ? "Core Milestone 1" : "Milestone Utama 1", task: field === "data" ? (isEn ? "Begin learning SQL Joins to model sales performance." : "Mulai belajar SQL Joins untuk menganalisa visual.") : field === "cybersecurity" ? (isEn ? "Write standard Python socket port-scanner scripts." : "Mulai script port scanner & service discovery dasar.") : (isEn ? "Integrate visual state management & routing." : "Setup state manager & routing dinamis.") },
          { day: 60, title: isEn ? "Core Milestone 2" : "Milestone Utama 2", task: field === "cybersecurity" ? (isEn ? "Automate target matching rules with live vulnerability feeds." : "Susun sistem matching database kerentanan dengan CVE feed.") : (isEn ? "Form custom dashboard graphs with responsive animated components." : "Buat halaman interaktif dashboard lengkap dengan UI transisi yang ramah.") },
          { day: 90, title: isEn ? "Publish & Deploy" : "Hasil Akhir & Deploy", task: isEn ? "Deploy your actual build to a free cloud host and link the URL to your CV." : "Deploy karya aslimu di platform cloud dan tautkan url portfolio di CV-mu." }
        ],
        jobs_analyzed: 20,
        jobs_source: "Cached/Fallback Data",
        is_live: false,
        fetched_at: new Date().toISOString(),
        live_jobs: liveJobs.map(j => ({ ...j, is_fallback: true, company: "Simulated " + j.company }))
      });
    }
  });

  app.post("/api/v1/chat", async (req, res) => {
    try {
      const { message, sessionData, lang, mentorStyle } = req.body;
      const isEn = lang === 'en';
      const tone = mentorStyle === 'profesional' 
        ? (isEn ? "professional, formal, and focused" : "profesional, baku, dan terfokus") 
        : (isEn ? "casual, friendly, and relaxed" : "santai, kasual, dan ramah seperti teman");

      const prompt = `You are Pathy, a career assistant. The user says: "${message}". 
Current dashboard data (JSON):
${JSON.stringify(sessionData)}

Please respond in ${isEn ? "English" : "Bahasa Indonesia"}.
Your tone should be: ${tone}.

If the user asks to change or update something on their dashboard (like changing the project recommendation, updating the skills roadmap, etc), create a fully updated version of the "sessionData" object. 

IMPORTANT: Your response must be ONLY valid JSON matching this schema exactly. No markdown blocks. No extra text.
{
  "reply": "Your conversational response here as Pathy",
  "updatedData": null // Or the fully updated sessionData object if changes are made
}
`;

      const aiRes = await callAIPortable(prompt, true, false);

      let text = aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const resultObj = JSON.parse(text);
      res.json(resultObj);
    } catch (e) {
      console.error(e);
      res.json({
        reply: "Maaf ya, koneksi Pathy lagi gangguan sebentar. Nggak bisa update dashboard saat ini.",
        updatedData: null
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
