import axios from 'axios';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  try {
    const { data } = await api.post('/api/v1/analysis', {
      answers,
      session_id: sessionId,
      lang: activeLang
    });
    return data;
  } catch (err) {
    // Mock response for preview / Network failure
    return {
      user_name: "Kamu",
      readiness_score: 75,
      top_roles: [
        { rank: 1, role_name: "Junior Web Developer", role_id: "frontend_dev", fit_score: 75, skills_shown: ["HTML/CSS"], job_count: 12 },
        { rank: 2, role_name: "IT Support", role_id: "it_support", fit_score: 60, skills_shown: ["Troubleshooting"], job_count: 8 }
      ],
      signal_chips: ["suka ngulik", "problem solver"],
      skill_gaps: [{ skill: "React Fundamentals", pct: 75 }],
      scout_message: "Pathy sedang dalam mode offline. Jangan khawatir, rekomendasi awal ini kami buat berdasarkan minat belajarmu secara umum. Coba muat ulang halaman ini untuk hasil yang terhubung langsung dengan AI.",
      follow_up_questions: ["Apa framework andalanmu saat ini?", "Tertarik belajar backend juga?"],
      project: {
        name: "Personal Portfolio Website",
        dataset_name: "Your Profile Data",
        duration_weeks: 1,
        week_1: "Week 1: Setup HTML/CSS dan deploy ke GitHub Pages"
      },
      jobs_analyzed: 20,
      jobs_source: "Offline Data",
      live_jobs: [
        { title: "Junior Web Developer", company: "Tech Indo", location: "Jakarta", match: 75, type: "Full-time" },
        { title: "IT Support Staff", company: "Local Corp", location: "Bandung", match: 60, type: "Contract" }
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
    return { saved: true, analysis_id: "mock" };
  }
};

export default api;
