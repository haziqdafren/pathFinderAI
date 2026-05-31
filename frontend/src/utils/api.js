import axios from 'axios';

const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getApiErrorMessage = (err, isEn) => {
  if (err?.response?.status === 429) {
    return isEn
      ? "PathFinder is receiving too many requests right now. Please wait a moment and try again."
      : "PathFinder sedang menerima terlalu banyak request. Tunggu sebentar lalu coba lagi.";
  }
  if (err?.code === 'ECONNABORTED') {
    return isEn
      ? "The analysis took too long. Showing safe offline guidance for now."
      : "Analisis terlalu lama. Untuk sementara PathFinder menampilkan panduan offline yang aman.";
  }
  return isEn
    ? "PathFinder is in degraded mode. Showing offline guidance."
    : "PathFinder sedang dalam mode terbatas. Menampilkan panduan offline.";
};

export const getNextQuestion = async (index, prevAnswer, lang) => {
  const activeLang = lang || localStorage.getItem('pref_lang') || 'id';
  try {
    const { data } = await api.post('/api/v1/conversation/question', {
      question_index: index,
      previous_answer: prevAnswer,
      lang: activeLang
    });
    return data;
  } catch (err) {
    const isEn = activeLang === 'en';
    return {
      question: isEn 
        ? "From your project story, what specific tasks make you lose track of time? (e.g., debugging issues, designing UI layouts, or optimizing database schemas)"
        : "Dari ceritamu tadi, bagian mana yang sering bikin kamu lupa waktu? (misal: ngoprek bug, mikirin layout UI, atau ngulik database)",
      tip: isEn 
        ? "Pathy needs to know what specific tasks engage you—so the recommended jobs and tech roles fit you best."
        : "Pathy perlu tahu hal spesifik yang bikin kamu enjoy — biar role tech yang disarankan beneran cocok."
    };
  }
};

export const analyzeProfile = async (answers, sessionId, lang) => {
  const activeLang = lang || localStorage.getItem('pref_lang') || 'id';
  const isEn = activeLang === 'en';
  try {
    const { data } = await api.post('/api/v1/analysis', {
      answers,
      session_id: sessionId,
      lang: activeLang
    });
    return data;
  } catch (err) {
    const degradedMessage = getApiErrorMessage(err, isEn);
    return {
      session_id: sessionId,
      user_name: answers?.[0] || (isEn ? "Friend" : "Kamu"),
      readiness_score: 75,
      top_roles: [
        { rank: 1, role_name: "Junior Web Developer", role_id: "frontend_dev", fit_score: 75, skills_shown: ["HTML/CSS"], job_count: 12 },
        { rank: 2, role_name: "IT Support", role_id: "it_support", fit_score: 60, skills_shown: ["Troubleshooting"], job_count: 8 }
      ],
      signal_chips: ["suka ngulik", "problem solver"],
      skill_gaps: [{ skill: "React Fundamentals", pct: 75 }],
      scout_message: degradedMessage,
      follow_up_questions: isEn ? ["What should I build first?", "How do I make this portfolio-ready?"] : ["Apa yang sebaiknya aku bangun dulu?", "Gimana bikin ini siap jadi portfolio?"],
      project: {
        name: "Personal Portfolio Website",
        dataset_name: "Your Profile Data",
        duration_weeks: 1,
        week_1: "Week 1: Setup HTML/CSS dan deploy ke GitHub Pages"
      },
      jobs_analyzed: 20,
      jobs_source: "Offline Data",
      is_live: false,
      fetched_at: new Date().toISOString(),
      live_jobs: [
        { title: "Junior Web Developer", company: "Sample Tech Indo", location: "Jakarta", match: 75, type: "Full-time (Sample)", is_fallback: true },
        { title: "IT Support Staff", company: "Sample Local Corp", location: "Bandung", match: 60, type: "Contract (Sample)", is_fallback: true }
      ]
    };
  }
};

export const saveResults = async (sessionId, userId, analysisData) => {
  try {
    const { data } = await api.post('/api/v1/auth/save', {
      session_id: sessionId,
      user_id: userId,
      analysis_data: analysisData
    });
    return data;
  } catch (err) {
    return { saved: false, analysis_id: null, error: "Save endpoint unavailable" };
  }
};

export default api;
