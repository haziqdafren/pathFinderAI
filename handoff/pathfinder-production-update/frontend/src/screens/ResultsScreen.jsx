import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

const PathyChatDrawer = lazy(() => import('../components/PathyChatDrawer'));
const GmailShareModal = lazy(() => import('../components/GmailShareModal'));
const JobsListDrawer = lazy(() => import('../components/JobsListDrawer'));

const ALTERNATIVE_PROJECTS = {
  data: [
    {
      name: "Customer Retention Cohort Dashboard",
      dataset_name: "E-Commerce Market Dataset",
      duration_weeks: 2,
      skills_closed: ["SQL Joins", "Cohort Analysis", "Data Source Linking"],
      tech_stack: ["Looker Studio", "BigQuery"],
      week_1: "Week 1: Cleansing data order dan customer, bikin base table buat cohort analysis.",
      week_2: "Week 2: Selesaikan visualisasi retensi pelanggan serta penyaringan (filter) berdasarkan lokasi."
    },
    {
      name: "Indonesian E-Commerce Sales Dashboard",
      dataset_name: "Indonesia E-Commerce Sales & Shipping 2025",
      duration_weeks: 4,
      skills_closed: ["SQL Queries", "Tableau", "Data Cleaning"],
      tech_stack: ["Tableau Public", "PostgreSQL"],
      week_1: "Week 1: Impor data transaksi 50k+ baris ke SQL, lakukan agregasi performa kuartal.",
      week_2: "Week 2: Rancang dashboard kepatuhan pengiriman antardaerah di Tableau Public."
    },
    {
      name: "Marketplace Review Sentiment Analyser",
      dataset_name: "Shopee Product Reviews Raw",
      duration_weeks: 3,
      skills_closed: ["Python Pandas", "NLP Basics", "Seaborn Visuals"],
      tech_stack: ["Python", "Jupyter Notebook"],
      week_1: "Week 1: Melakukan pre-processing teks ulasan produk Indonesia (stemming & stopword).",
      week_2: "Week 2: Hitung skor polaritas sentimen pembeli dan buat grafik korelasi rating bintang."
    }
  ],
  uiux: [
    {
      name: "FinTech Mobile App Redesign",
      dataset_name: "E-wallet Usability Audit",
      duration_weeks: 2,
      skills_closed: ["Usability Testing", "High Fidelity Prototyping", "Design System Setup"],
      tech_stack: ["Figma", "Maze Testing"],
      week_1: "Week 1: Melakukan audit sederhana pada 5 user dan membuat rancangan wireframe solusi baru.",
      week_2: "Week 2: Menyusun visual design system lengkap dengan komponen interaktif beranimasi di Figma."
    },
    {
      name: "Medicall App Booking Service UX",
      dataset_name: "Healthcare Access Flow Study",
      duration_weeks: 3,
      skills_closed: ["User Persona Design", "Wireframing", "Interactive Component Logic"],
      tech_stack: ["Figma", "FigJam"],
      week_1: "Week 1: Wawancara 3 calon pengguna aplikasi medis dan buat User Persona komprehensif.",
      week_2: "Week 2: Susun rancangan interface wireframe lengkap beserta transisi alur pendaftaran."
    },
    {
      name: "SaaS CRM Web Interface",
      dataset_name: "B2B Dashboard Audit",
      duration_weeks: 4,
      skills_closed: ["Layout Grid Alignment", "Component Library", "Adaptive Breakpoints"],
      tech_stack: ["Figma", "Tailwind Spec"],
      week_1: "Week 1: Desain layout dashboard kolaboratif fungsional dengan skema Auto-Layout modern.",
      week_2: "Week 2: Tambahkan varian interaktif seperti menu tarik (dropdown), tooltip, dan modal pop-up."
    }
  ],
  backend: [
    {
      name: "Secure E-Commerce REST API Engine",
      dataset_name: "Dynamic API Middleware",
      duration_weeks: 2,
      skills_closed: ["JWT Authentication", "Middleware Routing", "Database Migration Setup"],
      tech_stack: ["Express.js", "PostgreSQL", "Railway Cloud"],
      week_1: "Week 1: Desain skema ERD produk & penjualan, selesaikan routing CRUD database.",
      week_2: "Week 2: Implementasi otentikasi secure token JWT, sanitasi input, dan dokumentasi REST API."
    },
    {
      name: "Real-Time Notification Core Engine",
      dataset_name: "WebSockets Event Handler",
      duration_weeks: 3,
      skills_closed: ["Server Broker Connections", "State Event Dispatch", "WebSocket Handshake"],
      tech_stack: ["Node.js", "Socket.io", "Redis"],
      week_1: "Week 1: Setup minimal Node server yang memproses kiriman payload dari client ke Redis.",
      week_2: "Week 2: Hubungkan Socket.io untuk mendispatch notifikasi real-time secara broadcast."
    },
    {
      name: "Indonesian Logistics Shipping Rate API",
      dataset_name: "RajaOngkir Pricing Feed",
      duration_weeks: 3,
      skills_closed: ["External API Proxying", "Caching Strategies", "Unit Testing"],
      tech_stack: ["Fastify", "Redis", "Supertest"],
      week_1: "Week 1: Integrasikan proxy server dengan API pihak ketiga rajaongkir beserta rate-limiter.",
      week_2: "Week 2: Tambahkan cache layer di Redis agar respons pencarian ongkir instan (< 50ms)."
    }
  ],
  cybersecurity: [
    {
      name: "Network Vulnerability Scanner & Incident Logger",
      dataset_name: "CVE Live Feed",
      duration_weeks: 4,
      skills_closed: ["Vulnerability Assessment", "Security Monitoring", "Network Security"],
      tech_stack: ["Python", "MITRE CVE API", "React.js"],
      week_1: "Week 1: Bangun script Python port & service status utility.",
      week_2: "Week 2: Integrasikan penelusuran CVE matching otomatis."
    },
    {
      name: "Malware Threat Intelligence Feed Logger",
      dataset_name: "ThreatIntel Live Feed",
      duration_weeks: 3,
      skills_closed: ["IOC Extraction", "API Integration", "JSON Processing"],
      tech_stack: ["Python", "Elasticsearch"],
      week_1: "Week 1: Lakukan parsing harian otomatis berkas biner berbahaya dari publik feed IOC.",
      week_2: "Week 2: Buat visualisasi sebaran geolokasi alamat IP penyerang di Kibana/Elasticsearch."
    },
    {
      name: "OWASP Top 10 Security Audit Companion",
      dataset_name: "Vulnerable Endpoint Test Mock",
      duration_weeks: 3,
      skills_closed: ["Automated SQL Injection Check", "XSS Identification", "Security Log Export"],
      tech_stack: ["Python Scripts", "Requests", "Burp Suite API"],
      week_1: "Week 1: Kembangkan modul pemindai kerentanan injeksi SQL pada parameter form target.",
      week_2: "Week 2: Ekspor bukti log audit dalam format PDF/HTML lengkap dengan rekomendasi perbaikan."
    }
  ],
  web: [
    {
      name: "Customer Interactive Web Dashboard",
      dataset_name: "Product Catalog Dataset",
      duration_weeks: 2,
      skills_closed: ["Async API Fetching", "Dynamic Filtering", "State Management (React)"],
      tech_stack: ["Vite React", "Tailwind CSS"],
      week_1: "Week 1: Membuat rancangan layout interaktif responsif pada semua ukuran layar.",
      week_2: "Week 2: Tambahkan fetch data dari dummy API serta pasang fungsionalitas visual filter."
    },
    {
      name: "Indonesian Stock Watcher Portal",
      dataset_name: "IDX Stock Feed Mock",
      duration_weeks: 3,
      skills_closed: ["Dynamic Charting", "Context API State", "Search Debouncing"],
      tech_stack: ["React.js", "Recharts", "Tailwind"],
      week_1: "Week 1: Setup React project yang mem-visualkan data pergerakan saham harian pakai Recharts.",
      week_2: "Week 2: Implementasi debounce search untuk kemudahan mencari dan membandingkan emiten."
    },
    {
      name: "Property Landing & Booking Engine",
      dataset_name: "Kamar Listing API Dataset",
      duration_weeks: 3,
      skills_closed: ["Form Validation", "Local Storage Booking History", "CSS Grid Mastery"],
      tech_stack: ["Next.js/React", "Tailwind CSS"],
      week_1: "Week 1: Selesaikan UI landing page dengan gaya minimalis, hero banner, dan listing grid.",
      week_2: "Week 2: Tambahkan form reservasi kamar interaktif lengkap dengan penanggalan dinamis."
    }
  ]
};

const DEFAULT_DATA = {
  user_name: "Teman",
  readiness_score: 78,
  top_roles: [
    { rank: 1, role_name: "Junior Data Analyst", role_id: "data_analyst", fit_score: 78, skills_shown: ["SQL", "Looker", "Spreadsheet"], job_count: 9 },
    { rank: 2, role_name: "BI Developer (entry)", role_id: "bi_dev", fit_score: 64, skills_shown: ["Power BI", "DAX", "ETL"], job_count: 6 },
    { rank: 3, role_name: "Operations Analyst", role_id: "ops_analyst", fit_score: 57, skills_shown: ["Excel", "Proses bisnis"], job_count: 5 }
  ],
  signal_chips: ["suka beresin data berantakan", "pengalaman dashboard untuk UKM", "nyaman pakai SQL dasar + Looker", "belum pernah deploy ke production"],
  skill_gaps: [
    { skill: "SQL (joins, window functions)", count: 17, total: 20 },
    { skill: "Python (pandas, scripting)", count: 13, total: 20 },
    { skill: "Statistical reasoning (A/B)", count: 11, total: 20 }
  ],
  scout_message: "Jujur ya — kamu lebih dekat dari yang kamu pikir. Cerita soal dashboard warung kopi itu sebenarnya pekerjaan analyst beneran, cuma belum kamu sebut begitu di CV. Yang kurang bukan skill SQL-mu, tapi cara kamu mempresentasikannya. Bisa diberesin dalam ±6 minggu kalau kamu serius.",
  follow_up_questions: ["Kenapa bukan Software Engineer?", "Gimana cara bikin portfolio analyst?", "Tunjukkin 20 lowongan-nya"],
  project: {
    name: "Customer Retention Cohort Dashboard",
    dataset_name: "Olist E-commerce Dataset",
    duration_weeks: 2,
    skills_closed: ["SQL (joins, window functions)", "Statistical reasoning (A/B)"],
    tech_stack: ["Looker Studio", "BigQuery"],
    week_1: "Week 1: Cleansing data order dan customer, bikin base table buat cohort.",
    week_2: "Week 2: Build retention churn metric, dan pasang filter per wilayah."
  },
  visual_roadmap: [
    { day: 7, title: "Foundation", task: "Setup Looker Studio & connect sample spreadsheet data." },
    { day: 30, title: "Data Model", task: "Learn SQL Joins to combine customer and order data." },
    { day: 60, title: "Analysis", task: "Build actual cohort metrics. Apply A/B testing logic." },
    { day: 90, title: "Mastery", task: "Deploy full responsive dashboard, ready for CV." }
  ],
  jobs_analyzed: 20,
  live_jobs: [
    { title: "Junior Data Analyst", company: "Bukalapak", location: "Jakarta", match: 78, type: "Full-time" },
    { title: "BI Analyst Intern", company: "Tokopedia", location: "Jakarta", match: 74, type: "Internship" },
    { title: "Data Operations", company: "Sayurbox", location: "Bandung", match: 68, type: "Full-time" }
  ]
};

export default function ResultsScreen() {
  const lang = localStorage.getItem('pref_lang') || 'id';
  const isEn = lang === 'en';

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGmailShare, setShowGmailShare] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const [showJobsExplorer, setShowJobsExplorer] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Settings edit states
  const [editedName, setEditedName] = useState('');
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [mentorStyle, setMentorStyle] = useState('profesional');

  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('logged_in') === 'true' || localStorage.getItem('pathy_logged_in') === 'true';

  const [shufflesLeft, setShufflesLeft] = useState(parseInt(localStorage.getItem('pathy_shuffles_left') ?? '3', 10));

  const handleShuffleProject = async () => {
    const left = parseInt(localStorage.getItem('pathy_shuffles_left') ?? '3', 10);
    if (left <= 0) {
      const { toast } = await import('sonner');
      toast.error(isEn ? "Max project rotations (3 times) reached!" : "Batas rotasi proyek (maksimal 3 kali) sudah tercapai!");
      return;
    }
    
    const roleId = data?.top_roles?.[0]?.role_id || "";
    let category = "web";
    if (roleId.toLowerCase().includes("data_analyst") || roleId.toLowerCase().includes("bi_intern") || roleId.toLowerCase().includes("data_ops") || roleId.toLowerCase().includes("data")) {
      category = "data";
    } else if (roleId.toLowerCase().includes("uiux") || roleId.toLowerCase().includes("product_designer") || roleId.toLowerCase().includes("graphic")) {
      category = "uiux";
    } else if (roleId.toLowerCase().includes("backend") || roleId.toLowerCase().includes("devops")) {
      category = "backend";
    } else if (roleId.toLowerCase().includes("cyber") || roleId.toLowerCase().includes("network_engineer")) {
      category = "cybersecurity";
    }

    const list = ALTERNATIVE_PROJECTS[category] || ALTERNATIVE_PROJECTS.web;
    const currName = data?.project?.name || "";
    const currentIdx = list.findIndex(p => p.name.toLowerCase() === currName.toLowerCase());
    const nextIdx = (currentIdx === -1 ? 0 : currentIdx + 1) % list.length;
    const newProj = list[nextIdx];

    const newLeft = left - 1;
    localStorage.setItem('pathy_shuffles_left', String(newLeft));
    setShufflesLeft(newLeft);

    const sessionData = JSON.parse(sessionStorage.getItem('pathfinder_session') || '{}');
    if (sessionData && sessionData.results) {
      sessionData.results.project = newProj;
      sessionData.results.project_recommendation = newProj;
      sessionStorage.setItem('pathfinder_session', JSON.stringify(sessionData));
    }

    setData(prev => ({
      ...prev,
      project: newProj,
      project_recommendation: newProj
    }));

    const { toast } = await import('sonner');
    toast.success(isEn ? `Project recommendation updated! Rotations left: ${newLeft}x` : `Rekomendasi proyek berhasil diganti! Sisa rotasi: ${newLeft}x`);

    if (isLoggedIn) {
      try {
         const { saveResultToSupabase } = await import('../utils/supabase');
         await saveResultToSupabase(sessionData.results);
      } catch (err) {
         console.error("Error saving updated workspace project to Supabase:", err);
      }
    }
  };

  // Synchronize edit states when settings opens
  useEffect(() => {
    if (settingsOpen && data) {
      setEditedName(data.user_name || localStorage.getItem('pathy_user_name') || 'Teman');
      setNotifyWeekly(localStorage.getItem('pathy_notifications') !== 'false');
      setMentorStyle(localStorage.getItem('pathy_mentor_style') || 'profesional');
    }
  }, [settingsOpen, data]);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        let sessionData = JSON.parse(sessionStorage.getItem('pathfinder_session') || 'null');
        
        if (!sessionData) {
          const transferred = localStorage.getItem('pathfinder_session_transfer');
          if (transferred) {
            sessionData = JSON.parse(transferred);
            sessionStorage.setItem('pathfinder_session', transferred);
          }
        }
        
        if (sessionData && sessionData.results) {
          if (active) {
            setData(sessionData.results);
            setIsLoading(false);
          }
          
          // Auto-save logic
          if (isLoggedIn) {
            const { saveResultToSupabase } = await import('../utils/supabase');
            await saveResultToSupabase(sessionData.results);
            if (active && !sessionStorage.getItem('notified_save')) {
              const { toast } = await import('sonner');
              toast.success(isEn ? "Data synchronized with Supabase!" : "Data berhasil disinkronkan ke Supabase!");
              sessionStorage.setItem('notified_save', 'true');
            }
          }
        } else if (isLoggedIn) {
          // No local session found, try to load from Supabase for this logged-in user
          const { getLatestResultFromSupabase } = await import('../utils/supabase');
          const row = await getLatestResultFromSupabase();
          
          if (row && row.lang && row.lang !== lang) {
            window.location.reload();
            return;
          }
          
          if (row) {
            const parsedResults = {
              user_name: row.user_name || "User",
              readiness_score: row.readiness_score || 0,
              top_roles: row.top_roles || [],
              signal_chips: row.signal_chips || [],
              skill_gaps: row.skill_gaps || [],
              scout_message: row.scout_message || "",
              follow_up_questions: row.follow_up_questions || ["Kenapa bukan Software Engineer?", "Gimana cara bikin portfolio analyst?", "Tunjukkin 20 lowongan-nya"],
              project: row.project_recommendation || row.project || {},
              visual_roadmap: row.visual_roadmap || [
                { day: 7, title: "Foundation", task: "Setup Looker Studio & connect sample spreadsheet data." },
                { day: 30, title: "Data Model", task: "Learn SQL Joins to combine customer and order data." },
                { day: 60, title: "Analysis", task: "Build actual cohort metrics. Apply A/B testing logic." },
                { day: 90, title: "Mastery", task: "Deploy full responsive dashboard, ready for CV." }
              ],
              jobs_analyzed: row.jobs_analyzed || 0,
              jobs_source: row.jobs_source || null,
              is_live: typeof row.is_live === 'boolean' ? row.is_live : false,
              fetched_at: row.fetched_at || null,
              job_data_snapshot: row.job_data_snapshot || null,
              live_jobs: row.live_jobs || [
                { title: "Junior Data Analyst", company: "Bukalapak", location: "Jakarta", match: 78, type: "Full-time" },
                { title: "BI Analyst Intern", company: "Tokopedia", location: "Jakarta", match: 74, type: "Internship" },
                { title: "Data Operations", company: "Sayurbox", location: "Bandung", match: 68, type: "Full-time" }
              ]
            };
            
            if (active) {
              setData(parsedResults);
              setIsLoading(false);
              // Save to sessionStorage for subsequent navigation
              sessionStorage.setItem('pathfinder_session', JSON.stringify({
                results: parsedResults,
                timestamp: Date.now()
              }));
            }
          } else {
            // No saved results in Supabase AND no local session!
            if (active) {
              const { toast } = await import('sonner');
              toast.error(isEn ? "You don't have an analysis history yet. Please complete onboarding first!" : "Kamu belum memiliki riwayat analisis sebelumnya. Silakan ikut onboarding terlebih dahulu!");
              navigate('/conversation');
            }
          }
        } else {
          // Not logged in AND no local session? Show fallback sample or redirect?
          // Since the user explicitly requested "tidak bisa login / masuk kalau belum ada questionnaire answered",
          // new anonymous users should go to start conversation. But let's show default_data if we want to allow demo,
          // or redirect so we enforce onboarding. The prompt says: "orang yang belum pernah jawab onboarding/belum ada data tidak bisa login [existing user]"
          // Let's redirect to Conversation page!
          if (active) {
            const { toast } = await import('sonner');
            toast.error(isEn ? "Please complete the questionnaire first!" : "Silakan laksanakan analisis terlebih dahulu!");
            navigate('/conversation');
          }
        }
      } catch (err) {
        console.error("Error loading results session:", err);
        if (active) {
          setData(DEFAULT_DATA);
          setIsLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, [isLoggedIn, navigate]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin mb-4"></div>
        <h2 className="font-sans text-xl font-medium text-ink tracking-tight mb-2">
          {isEn ? "Loading Analysis Report" : "Memuat Hasil Analisis"}
        </h2>
        <p className="font-sans text-[14px] text-muted-dark leading-relaxed max-w-[320px]">
          {isEn ? "Please wait a moment, PathFinder is compiling your profiling analytics." : "Mohon tunggu sebentar, PathFinder sedang mengumpulkan data profiling-mu."}
        </p>
      </div>
    );
  }

  const topRoleName = data.top_roles?.[0]?.role_name || "Data Analyst";

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleExportReport = async () => {
    const payload = {
      exported_at: new Date().toISOString(),
      source: 'PathFinder AI',
      report: data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pathfinder-report-${(data.user_name || 'user').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    const { toast } = await import('sonner');
    toast.success(isEn ? "Report exported as JSON." : "Laporan berhasil diekspor sebagai JSON.");
  };

  const handleLogout = async () => {
    const { signOutPathfinder } = await import('../utils/supabase');
    await signOutPathfinder();
    const { toast } = await import('sonner');
    toast.success(isEn ? "Signed out. Your local analysis remains on this device." : "Berhasil keluar. Analisis lokal tetap tersimpan di perangkat ini.");
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-[70px] bg-ink text-white flex flex-row md:flex-col items-center py-3 md:py-[22px] px-4 md:px-0 shrink-0 border-b md:border-b-0 border-ink-3">
        <span className="w-6 h-6 bg-orange rounded-[7px] relative inline-flex items-center justify-center shrink-0 mb-0 md:mr-0 mr-3.5 md:mb-[26px] before:content-[''] before:w-[9px] before:h-[9px] before:border-[1.6px] before:border-white before:rounded-full before:border-t-transparent before:border-r-transparent after:content-[''] after:absolute after:w-[3px] after:h-[3px] after:bg-white after:rounded-full after:top-[5px] after:right-[5px]"></span>
        
        <nav className="flex flex-row md:flex-col gap-1 flex-1 items-center md:items-stretch">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="w-[42px] h-[42px] rounded-[10px] bg-white/[0.08] text-white flex items-center justify-center relative md:before:content-[''] md:before:absolute md:before:-left-[14px] md:before:top-1/2 md:before:-translate-y-1/2 md:before:w-[3px] md:before:h-[18px] md:before:bg-orange md:before:rounded-r-[2px]" aria-label="Hasil">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2 4 4 8-8 4 4"/><path d="M3 21h18"/></svg>
          </button>
          <button onClick={() => scrollTo('roles')} className="w-[42px] h-[42px] rounded-[10px] bg-transparent text-white/45 flex items-center justify-center transition-all hover:bg-white/5 hover:text-white cursor-pointer" aria-label="Roles">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>
          </button>
          <button onClick={() => scrollTo('gaps')} className="w-[42px] h-[42px] rounded-[10px] bg-transparent text-white/45 flex items-center justify-center transition-all hover:bg-white/5 hover:text-white cursor-pointer" aria-label="Skills">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18"/></svg>
          </button>
          <button onClick={() => scrollTo('projects')} className="w-[42px] h-[42px] rounded-[10px] bg-transparent text-white/45 flex items-center justify-center transition-all hover:bg-white/5 hover:text-white cursor-pointer" aria-label="Projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
          </button>
          <button onClick={() => scrollTo('roadmap')} className="w-[42px] h-[42px] rounded-[10px] bg-transparent text-white/45 flex items-center justify-center transition-all hover:bg-white/5 hover:text-white cursor-pointer" aria-label="Roadmap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          </button>
          <button onClick={() => scrollTo('jobs')} className="w-[42px] h-[42px] rounded-[10px] bg-transparent text-white/45 flex items-center justify-center transition-all hover:bg-white/5 hover:text-white cursor-pointer" aria-label="Live jobs">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
          </button>
        </nav>
        
        <button 
          onClick={() => setSettingsOpen(true)}
          className="w-[42px] h-[42px] rounded-[10px] bg-transparent text-white/45 flex items-center justify-center transition-all hover:bg-white/5 hover:text-white md:mb-2 ml-auto md:ml-0 cursor-pointer" 
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>
        </button>
        <div className="relative group ml-2 md:ml-0">
          <div 
            onClick={() => window.dispatchEvent(new Event('open-save-sheet'))}
            className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] text-white flex items-center justify-center font-semibold text-[13px] border-2 border-ink-3 shrink-0 cursor-pointer"
          >
            {data.user_name?.[0]?.toUpperCase() || 'T'}
          </div>
          <div className="absolute bottom-10 left-10 md:bottom-2 md:left-12 bg-ink text-white text-[11px] py-2.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap border border-ink-3 flex flex-col gap-1.5 z-40 shadow-lg">
            <span className="font-mono text-[9px] text-white/55 uppercase tracking-wider block">
              {isEn ? "Session Status" : "Kondisi Sesi"}
            </span>
            <span className="font-semibold text-white">{data.user_name} ({isLoggedIn ? (isEn ? 'Active Account' : 'Akun Aktif') : (isEn ? 'Guest Session' : 'Sesi Tamu')})</span>
	            {isLoggedIn ? (
	              <button 
	                onClick={handleLogout}
                className="bg-transparent border-0 text-orange font-medium text-left p-0 cursor-pointer hover:underline mt-0.5"
              >
                {isEn ? "Sign Out" : "Keluar Akun"}
              </button>
            ) : (
              <button 
                onClick={() => window.dispatchEvent(new Event('open-save-sheet'))}
                className="bg-transparent border-0 text-orange font-medium text-left p-0 cursor-pointer hover:underline mt-0.5"
              >
                {isEn ? "Save & Sync" : "Simpan & Sinkron"}
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 py-7 px-5 md:py-[28px] md:px-[36px] md:pb-32 max-w-[1380px] w-full mx-auto">
        <div className="flex flex-col xl:flex-row justify-between items-start gap-6 mb-5">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-[11px] text-muted-dark tracking-[0.12em] uppercase mb-2.5">
              <span className="normal-case font-sans font-medium text-ink text-[13px] tracking-[-0.005em]">
                {isEn ? `Welcome back, ${data.user_name}` : `Halo${isLoggedIn ? ' kembali' : ''}, ${data.user_name}`}
              </span>
              <span className="text-border">/</span>
              <span>{isEn ? "Tuesday · May 24, 2026 · 14:32 WIB" : "selasa · 24 mei 2026 · 14:32 WIB"}</span>
            </div>
            <h1 className="text-[clamp(34px,4.8vw,62px)] font-medium tracking-tight m-0 mb-3.5 leading-[1.04] max-w-[800px] text-balance">
              {isEn ? (
                <>Most reachable role for you right now: <span className="font-medium text-orange bg-gradient-to-b from-transparent from-70% to-orange/15 to-70% px-[3px]">{topRoleName}</span>.</>
              ) : (
                <>Role paling reachable buat kamu sekarang: <span className="font-medium text-orange bg-gradient-to-b from-transparent from-70% to-orange/15 to-70% px-[3px]">{topRoleName}</span>.</>
              )}
            </h1>
            <div className="flex flex-wrap gap-2 my-3.5 mb-5 items-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-dark mr-1">
                {isEn ? "What Pathy heard from you" : "Yang Pathy denger dari kamu"}
              </span>
              {data.signal_chips?.map((chip, i) => (
                <span key={i} className="bg-white border border-border rounded-full py-1.5 px-3 text-[12px] text-ink-2 inline-flex items-center gap-1.5 tracking-[-0.005em]">
                  <span className="w-1.5 h-1.5 bg-orange rounded-full"></span>{chip}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowGmailShare(true)} className="bg-white border border-border rounded-full py-[9px] px-4 text-[13px] text-ink inline-flex items-center gap-2 hover:bg-cream-2 transition-colors cursor-pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {isEn ? "Email via Gmail" : "Kirim via Gmail"}
            </button>
            <button onClick={handleExportReport} className="bg-white border border-border rounded-full py-[9px] px-4 text-[13px] text-ink inline-flex items-center gap-2 hover:bg-cream-2 transition-colors cursor-pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              {isEn ? "Export" : "Ekspor"}
            </button>
            {!isLoggedIn ? (
              <button onClick={() => window.dispatchEvent(new Event('open-save-sheet'))} className="bg-ink text-white border border-ink rounded-full py-[9px] px-4 text-[13px] inline-flex items-center gap-2 hover:bg-ink-3 transition-colors cursor-pointer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
                {isEn ? "Save progress" : "Simpan progress"}
              </button>
            ) : (
              <div className="bg-success/10 text-success border border-success/20 rounded-full py-[9px] px-4 text-[13px] inline-flex items-center gap-2 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {isEn ? "Saved to profile" : "Tersimpan di akun"}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 px-[22px] flex flex-col sm:flex-row gap-3.5 mb-4 items-start relative">
          <div className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center shrink-0 font-semibold text-[13px] relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-[11px] after:h-[11px] after:bg-[#4ade80] after:rounded-full after:border-[2.5px] after:border-white">
            P
          </div>
          <div className="flex-1 text-[15px] leading-[1.6] text-ink-2 tracking-[-0.005em]">
            <div className="font-mono text-[11px] text-muted-dark tracking-[0.06em] uppercase mb-1.5 flex gap-2.5 items-center">
              <strong className="text-ink font-semibold tracking-[-0.01em] normal-case font-sans text-[13px]">Pathy</strong>
              <span className="bg-[#4ade80]/15 text-success border border-[#4ade80]/30 py-[2px] px-[7px] rounded-full text-[9px]">
                {isEn ? "online · your agent" : "online · agent kamu"}
              </span>
              <span>· {isEn ? "12s ago" : "12 detik lalu"}</span>
            </div>
            <p className="m-0 mb-2">
              {data.scout_message ? (
                data.scout_message.split(/\*\*(.*?)\*\*/g).map((part, i) => 
                  i % 2 === 1 ? (
                    <strong key={i} className="text-ink font-semibold bg-gradient-to-b from-transparent from-65% to-orange/20 to-65% px-0.5">
                      {part}
                    </strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )
              ) : null}
            </p>
            <div className="flex gap-2 flex-wrap mt-3">
              {(data.follow_up_questions || []).map((q, i) => (
                <button key={i} onClick={() => { setInitialMessage(q); setChatOpen(true); }} className="bg-cream border border-border rounded-full py-1.5 px-[13px] text-[13px] text-ink-2 transition-all hover:bg-ink hover:text-white hover:border-ink cursor-pointer">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 auto-rows-min">

          <article className="col-span-1 md:col-span-5 md:row-span-2 bg-orange text-white border-0 p-6 flex flex-col justify-between min-h-[340px] relative overflow-hidden rounded-[14px]">
            <div className="absolute -bottom-[100px] -right-[100px] w-[320px] h-[320px] rounded-full bg-white/5 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="bg-black/20 rounded-full py-[5px] px-[11px] font-mono text-[10px] tracking-[0.1em] uppercase text-white inline-flex items-center gap-[6px] self-start mb-3 before:content-[''] before:w-1.5 before:h-1.5 before:bg-white before:rounded-full">
                {isEn ? "job readiness index" : "indeks kesiapan kerja"}
              </div>
              <div className="font-mono text-[10px] text-white/75 tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2">
                <span className="inline-flex items-center justify-center text-white w-3.5 h-3.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.6-6.2 4.6 2.4-7.4L2 9.4h7.6z"/></svg>
                </span>
                {isEn ? `Readiness for ${topRoleName}` : `Readiness untuk ${topRoleName}`}
              </div>
            </div>
            <h2 className="text-[clamp(120px,14vw,210px)] leading-[0.85] font-medium tracking-[-0.05em] m-0 flex items-end">
              {data.readiness_score || 78}<span className="text-[0.32em] font-medium ml-1.5 mb-4 opacity-90">%</span>
            </h2>
            <div className="relative z-10">
              <p className="text-[15px] leading-[1.45] max-w-[340px] text-white/95 text-balance m-0 mb-2.5">
                {isEn ? (
                  "Above the median for fresh graduates (61%). The remaining preparation project closes your heaviest gaps before August cycles."
                ) : (
                  "Di atas median lulusan baru IT (61%). Tiga skill terakhir bisa kamu tutup sebelum siklus rekrut Agustus."
                )}
              </p>
              <div className="flex gap-3.5 items-center mt-1.5 font-mono text-[11px] text-white/85 tracking-[0.04em]">
                <span className="flex gap-[3px] items-end">
                   <span className="w-1 bg-white/45 rounded-[1px] h-2"></span>
                   <span className="w-1 bg-white/45 rounded-[1px] h-[11px]"></span>
                   <span className="w-1 bg-white/45 rounded-[1px] h-[9px]"></span>
                   <span className="w-1 bg-white/45 rounded-[1px] h-[14px]"></span>
                   <span className="w-1 bg-white/45 rounded-[1px] h-[12px]"></span>
                   <span className="w-1 bg-white/45 rounded-[1px] h-[18px]"></span>
                   <span className="w-1 bg-white rounded-[1px] h-[22px]"></span>
                </span>
                <span>{isEn ? "+17 pts in 6 weeks (est.)" : "+17 pts dalam 6 minggu (estimasi)"}</span>
              </div>
            </div>
          </article>

          <article id="roles" className="col-span-1 md:col-span-7 bg-card border border-border rounded-[14px] p-[22px] flex flex-col relative overflow-hidden">
            <div className="font-mono text-[10px] text-muted-dark tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2">
              <span className="inline-flex items-center justify-center text-orange w-3.5 h-3.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 12l5 5L21 4"/></svg>
              </span>
              {isEn ? "Top 3 roles · ranked matching your profile" : "Top 3 role · diranking ulang vs. profilmu"}
            </div>
            <div className="flex flex-col gap-0 flex-1">
              {(data.top_roles || []).map((r, i) => (
                <div key={i} className={`grid grid-cols-[22px_1fr_60px] md:grid-cols-[26px_1fr_88px_90px] items-center gap-4 md:gap-[18px] py-3.5 border-b border-dashed border-border last:border-0 ${i === 0 ? 'bg-ink text-white -mx-[22px] px-[22px] py-4 rounded-xl border-b-0 relative mt-0' : i === 1 ? 'border-t border-dashed border-border pt-4 mt-1' : ''}`}>
                  <span className={`font-mono text-[11px] tracking-[0.04em] ${i === 0 ? 'text-orange font-medium' : 'text-muted'}`}>0{i+1}</span>
                  <div>
                    <div className={`font-medium tracking-[-0.01em] ${i === 0 ? 'text-[17px]' : 'text-[16px]'}`}>{r.role_name}</div>
                    <div className={`font-mono text-[10px] tracking-[0.05em] mt-0.5 uppercase ${i === 0 ? 'text-white/55' : 'text-muted-dark'}`}>{r.skills_shown?.join(' · ')}</div>
                  </div>
                  <div className={`font-mono text-[12px] tracking-[0.05em] text-right hidden md:block ${i === 0 ? 'text-white/70' : 'text-muted-dark'}`}>
                    {r.job_count || 5} {isEn ? "openings" : "lowongan"}
                  </div>
                  <div className={`text-right font-medium tracking-[-0.02em] ${i === 0 ? 'text-[26px] text-orange' : 'text-[22px]'}`}>{r.fit_score}%</div>
                </div>
              ))}
            </div>
          </article>

          <article id="jobs" className="col-span-1 md:col-span-3 bg-ink text-white border-0 rounded-[14px] p-[22px] flex flex-col justify-between min-h-[220px] relative overflow-hidden">
            <div>
              {data.is_live === true ? (
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase bg-orange/20 text-orange-2 border border-orange/30 py-[3px] px-2 rounded-full mb-2 self-start before:content-[''] before:w-[5px] before:h-[5px] before:bg-orange before:rounded-full before:animate-[pulse_1.4s_ease-in-out_infinite]">
                  live multi-portal via JobSpy Engine
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase bg-white/10 text-white/70 border border-white/20 py-[3px] px-2 rounded-full mb-2 self-start before:content-[''] before:w-[5px] before:h-[5px] before:bg-white/70 before:rounded-full">
                  {isEn ? "sample fallback data" : "data contoh fallback"}
                </div>
              )}
              <div className="font-mono text-[10px] text-white/55 tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2">
                <span className="inline-flex items-center justify-center text-orange w-3.5 h-3.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>
                </span>
                {isEn ? "Jobs Analyzed" : "Lowongan dianalisis"}
              </div>
            </div>
            <h2 className="text-[clamp(80px,9vw,132px)] leading-[0.85] font-medium tracking-[-0.045em] m-0">{data.jobs_analyzed || 20}</h2>
            <div className="text-[13px] text-white/60 leading-[1.5] tracking-[-0.005em]">
              {data.is_live === true ? (
                isEn ? (
                  "Aggregated in real-time utilizing the JobSpy Scraper Engine to bundle listing feeds from Indeed, LinkedIn, and Glints for absolute confidence. No assumptions."
                ) : (
                  "Diagregasi real-time terintegrasi lewat JobSpy Scraper Engine mengumpulkan info teranyar dari Indeed ID, LinkedIn, Glints, dan papan lowongan kerja terpopuler untuk akurasi penuh. Bukan estimasi."
                )
              ) : (
                isEn ? (
                  "AI/search provider is unavailable, so PathFinder is showing simulated fallback data for guidance. Re-run with API keys enabled for live listings."
                ) : (
                  "AI/search provider tidak tersedia, maka PathFinder menampilkan simulasi data contoh. Ulangi dengan melampirkan API key untuk mendapat data asli."
                )
              )}
            </div>
          </article>

          <article id="gaps" className="col-span-1 md:col-span-4 bg-card border border-border rounded-[14px] p-[22px] relative overflow-hidden flex flex-col">
            <div className="font-mono text-[10px] text-muted-dark tracking-[0.14em] uppercase mb-[18px] flex items-center gap-2">
              <span className="inline-flex items-center justify-center text-orange w-3.5 h-3.5 shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>
              </span>
              {isEn ? "Top 3 Gaps · extracted from requirements" : "Top 3 gap · dari requirement lowongan"}
            </div>
            <div className="flex flex-col gap-[18px] flex-1">
              {(data.skill_gaps || []).map((sg, i) => {
                const percentage =
                  typeof sg.pct === "number"
                    ? sg.pct
                    : sg.count && sg.total
                      ? Math.round((sg.count / sg.total) * 100)
                      : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5 items-baseline">
                      <span className="text-[14px] font-medium tracking-[-0.005em]">{sg.skill}</span>
                      <span className="font-mono text-[13px] text-ink font-medium">
                        {sg.count != null && sg.total != null ? `${sg.count} / ${sg.total}` : `${percentage}%`}
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-cream-2 rounded-full overflow-hidden">
                      <span className="absolute inset-y-0 left-0 bg-orange rounded-full" style={{ width: `${percentage}%` }}></span>
                    </div>
                    <div className="font-mono text-[10px] text-muted-dark tracking-[0.04em] mt-1.5 uppercase">
                      {isEn ? `Found in ${percentage}% of listings` : `Disebut di ${percentage}% lowongan`}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {data.project && (
            <article id="projects" className="col-span-1 md:col-span-12 bg-white p-0 grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden border border-border rounded-[14px]">
              <div className="bg-ink text-white py-6 px-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{background: 'repeating-linear-gradient(135deg, transparent 0px, transparent 14px, #E8642A 14px, #E8642A 15px)'}}></div>
                <div className="relative">
                  <div className="font-mono text-[10px] text-orange tracking-[0.14em] uppercase">
                    {isEn ? "↳ recommended portfolio blueprint" : "↳ proyek yang Pathy saranin"}
                  </div>
                  <div className="font-mono text-[60px] font-medium text-white tracking-[-0.04em] leading-none my-2.5">P·01</div>
                  <div className="font-mono text-[10px] tracking-[0.06em] text-white/60 uppercase border border-white/20 rounded-md py-1.5 px-2 self-start inline-flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:bg-orange before:rounded-full">
                    {isEn ? `closes ${data.project.skills_closed?.length || 2} of 3 gaps` : `tutup ${data.project.skills_closed?.length || 2} dari 3 gap`}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-white/50 tracking-[0.08em] uppercase mt-6 relative">
                  {isEn ? `Est · 12–18 hours · ${data.project.duration_weeks || 2} weeks` : `Estimasi · 12–18 jam · ${data.project.duration_weeks || 2} minggu`}
                </div>
              </div>
              <div className="py-6 px-[26px] flex flex-col gap-3.5">
                <div>
                  <h3 className="text-[22px] font-medium tracking-[-0.018em] leading-[1.2] m-0 max-w-[600px]">{data.project?.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(data.project?.tech_stack || []).map((t, i) => (
                      <span key={i} className="font-mono text-[10px] tracking-[0.06em] uppercase bg-orange text-white border border-orange py-1 px-[9px] rounded-full">
                        {t}
                      </span>
                    ))}
                    {(data.project?.skills_closed || []).map((s, i) => (
                      <span key={`s-${i}`} className="font-mono text-[10px] tracking-[0.06em] uppercase text-ink bg-cream border border-border py-1 px-[9px] rounded-full">
                        {s}
                      </span>
                    ))}
                    {data.project?.dataset_name && (
                      <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-ink bg-cream border border-border py-1 px-[9px] rounded-full">
                        {data.project.dataset_name}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-ink-2 text-[14.5px] leading-[1.6] max-w-[640px] m-0">
                  {data.project.week_1} {data.project.week_2} {isEn ? "Gain a robust, recruit-ready item to present in your active portfolio files." : "Cukup buat dipajang di portfolio — dan mengisi gap recruiter analyst."}
                </p>
                <div className="flex justify-between items-center border-t border-dashed border-border pt-3.5 mt-1.5 gap-4 flex-wrap">
                  <div className="flex gap-7">
                    <div className="flex flex-col">
                       <span className="text-[20px] font-medium tracking-[-0.015em]">+{data.project.skills_closed?.length * 5 || 11}%</span>
                       <span className="font-mono text-[9px] text-muted-dark tracking-[0.08em] uppercase mt-0.5">readiness</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[20px] font-medium tracking-[-0.015em]">3 / {data.top_roles?.[0]?.job_count || 9}</span>
                       <span className="font-mono text-[9px] text-muted-dark tracking-[0.08em] uppercase mt-0.5">lowongan ter-unlock</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[20px] font-medium tracking-[-0.015em]">{data.project.duration_weeks || 2} wk</span>
                       <span className="font-mono text-[9px] text-muted-dark tracking-[0.08em] uppercase mt-0.5">estimasi</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <button 
                      onClick={handleShuffleProject}
                      className="text-ink border border-border bg-transparent hover:bg-cream py-2.5 px-4 text-[13px] rounded-xl font-medium flex gap-2.5 items-center transition-transform active:scale-95 cursor-pointer shadow-xs"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                      <span>{isEn ? `Shuffle blueprint (${shufflesLeft} left)` : `Ganti Rekomendasi (Sisa ${shufflesLeft}x)`}</span>
                    </button>
                    <button onClick={() => navigate('/project')} className="bg-orange text-white border-0 py-2.5 px-[18px] text-[14px] rounded-xl font-medium flex gap-2.5 items-center hover:bg-orange-2 transition-transform active:scale-95 cursor-pointer">
                      {isEn ? "Start this project" : "Mulai proyek ini"}
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}

          {data.visual_roadmap && data.visual_roadmap.length > 0 && (
            <article id="roadmap" className="col-span-1 md:col-span-12 bg-white border border-border rounded-[14px] p-[30px] flex flex-col relative overflow-hidden mt-2">
              <div className="font-mono text-[10px] text-muted-dark tracking-[0.14em] uppercase mb-8 flex items-center gap-2">
                <span className="inline-flex items-center justify-center text-orange w-3.5 h-3.5">
                  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </span>
                {isEn ? "90-Day Guided Practice Roadmap" : "Roadmap 90 Hari"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
                <div className="hidden md:block absolute top-[27px] left-[40px] right-[40px] h-[2px] bg-cream-2/80 -z-10"></div>
                {data.visual_roadmap.map((step, i) => (
                  <div key={i} className="flex flex-col relative">
                    <div className="flex items-start md:items-center gap-4 md:gap-0 md:block">
                      <div className={`w-[56px] h-[56px] rounded-2xl flex items-center justify-center font-mono text-[14px] font-medium tracking-tight border-[2.5px] z-10 shrink-0 ${i === 0 ? 'bg-orange text-white border-orange shadow-[0_4px_12px_rgba(232,100,42,0.3)]' : 'bg-white text-ink border-cream-2/50 group-hover:border-orange/30 transition-colors'}`}>
                        H{step.day}
                      </div>
                      <div className="md:mt-5 flex-1 pt-1.5 md:pt-0">
                        <div className="text-[16px] font-medium tracking-[-0.01em] text-ink">{step.title}</div>
                        <div className="text-[13.5px] text-muted-dark mt-1.5 leading-[1.45] tracking-tight pr-4 md:pr-0">{step.task}</div>
                      </div>
                    </div>
                    {i !== data.visual_roadmap.length - 1 && (
                      <div className="md:hidden absolute w-[2.5px] h-full bg-cream-2/80 left-[27px] top-[56px] -z-10"></div>
                    )}
                  </div>
                ))}
              </div>
            </article>
          )}

          {data.live_jobs && (
            <article className="col-span-1 md:col-span-12 bg-transparent p-0 mt-3 relative z-10">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="font-mono text-[10px] text-ink-2 tracking-[0.14em] uppercase flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${data.is_live === true ? 'bg-orange animate-pulse' : 'bg-muted-dark'} rounded-full`}></span>
                  {data.is_live === true 
                    ? (isEn ? `Live active ${topRoleName} openings today` : `Lowongan ${topRoleName} live hari ini`)
                    : (isEn ? `Sample matching openings for ${topRoleName}` : `Contoh lowongan cocok untuk ${topRoleName}`)
                  }
                </div>
                <button 
                  onClick={() => setShowJobsExplorer(true)}
                  className="text-[12px] font-medium text-ink bg-transparent border-0 flex items-center gap-1 hover:text-orange transition-colors cursor-pointer p-0"
                >
                  {isEn ? `See ${data.jobs_analyzed || 20} more` : `Lihat ${data.jobs_analyzed || 20} lainnya`}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
              </div>

              {/* Reassurance & Career Counseling Box */}
              {(() => {
                const userLoc = (data?.location || (sessionStorage.getItem('pathfinder_answers') ? JSON.parse(sessionStorage.getItem('pathfinder_answers'))?.[3] : 'Jakarta') || 'Jakarta').trim();
                const isHotspot = userLoc.toLowerCase().includes("jakarta") || 
                                  userLoc.toLowerCase().includes("bandung") || 
                                  userLoc.toLowerCase().includes("remote") ||
                                  userLoc.toLowerCase().includes("jkt") ||
                                  userLoc.toLowerCase().includes("bdg");
                const hasNoJobs = !data?.live_jobs || data.live_jobs.length === 0;

                if (isHotspot && !hasNoJobs) return null;

                return (
                  <div className="bg-orange/5 border border-orange/15 rounded-xl p-4.5 mb-5 text-[13px] leading-relaxed text-ink-2 shadow-xs">
                    <div>
                      <strong className="text-ink font-medium block mb-1">{isEn ? "Application Guide & Career Strategy" : "Panduan Lamaran & Reasuransi Karir"}</strong>
                      {hasNoJobs ? (
                        <div>
                          {isEn 
                            ? <>We apologize, there are no digital industry openings currently available for this role in Indonesia. As a strategy to break into the job market, please <strong className="text-orange-2">focus on building the recommended core portfolio project</strong> to boost your resume and competitiveness.</>
                            : <>Mohon maaf, tidak ada lowongan industri digital untuk posisi ini saat ini di Indonesia. Sebagai upaya menembus pasar kerja, silakan <strong className="text-orange-2">fokus pada pembuatan proyek portfolio utama di atas agar menunjang resume kamu</strong> dan meningkatkan daya saing saat melamar nanti.</>}
                        </div>
                      ) : (
                        <div>
                          {isEn
                            ? <>Jobs were not found in your preferred location ({userLoc}). Most openings are currently centralized in Jakarta, Bandung, or Remote options. As a career solution, please <strong className="text-orange-2">focus on completing the recommended portfolio project below</strong> to strengthen your resume and industry bargaining power.</>
                            : <>Pekerjaan tidak ditemukan di lokasi pilihanmu ({userLoc}). Lowongan kerja saat ini banyak tersedia di Jakarta, Bandung, atau opsi Remote. Sebagai solusi karir, silakan <strong className="text-orange-2">fokus pada pembuatan proyek portfolio utama di atas agar menunjang resume kamu</strong> dan meningkatkan daya saing serta daya tawar di industri.</>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {(data.live_jobs || []).map((job, i) => {
                  const isGoogleSource = i % 2 === 0;
                  const searchUrl = isGoogleSource
                    ? `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + (job.company || "") + " " + (job.location || "") + " lowongan kerja")}`
                    : `https://id.indeed.com/jobs?q=${encodeURIComponent(job.title)}&l=${encodeURIComponent(job.location)}`;
                  
                  return (
                    <a 
                      key={i} 
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-border rounded-[14px] p-5 flex flex-col hover:border-orange transition-colors cursor-pointer group shadow-sm hover:shadow-md no-underline text-ink"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-cream border border-border rounded-[10px] w-[42px] h-[42px] flex items-center justify-center font-semibold text-ink text-[16px] uppercase shrink-0 shadow-sm">
                          {job.company.substring(0, 1)}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="bg-orange/10 text-orange-2 border border-orange/20 px-2 py-0.5 rounded-[6px] font-mono text-[9px] tracking-[0.06em] uppercase font-semibold">
                            {job.match}% match
                          </span>
                          <span className={`text-[8.5px] font-mono font-medium px-1.5 py-0.5 rounded-[4px] shrink-0 ${job.is_fallback ? 'text-slate-600 bg-slate-100 border border-slate-200' : (isGoogleSource ? 'text-blue-600 bg-blue-50 border border-blue-100' : 'text-indigo-600 bg-indigo-50 border border-indigo-100')}`}>
                            {job.is_fallback ? (isEn ? 'Sample' : 'Fallback') : (isGoogleSource ? 'Google Search' : 'Indeed ID')}
                          </span>
                        </div>
                      </div>
                      <div className="mb-4 flex-1">
                        <h4 className="text-[16px] font-medium tracking-[-0.01em] mb-1.5 group-hover:text-orange transition-colors">{job.title}</h4>
                        <div className="text-[13.5px] text-ink-2">{job.company}</div>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10.5px] text-muted-dark uppercase tracking-[0.04em] pt-4 border-t border-dashed border-border">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {job.location} <span className="text-border mx-0.5">•</span> {job.type}
                      </div>
                    </a>
                  );
                })}
              </div>
            </article>
          )}

        </div>
      </main>

      <button onClick={() => { setInitialMessage(''); setChatOpen(true); }} className="fixed bottom-6 right-6 bg-ink text-white border-0 rounded-full py-3 pr-[18px] pl-3 inline-flex items-center gap-2.5 text-[14px] tracking-[-0.005em] shadow-[0_6px_24px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.08)] z-50 transition-transform hover:-translate-y-0.5 cursor-pointer">
        <span className="w-7 h-7 rounded-full bg-orange text-white flex items-center justify-center text-[11px] font-semibold relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-[#4ade80] after:rounded-full after:border-[1.5px] after:border-ink">P</span>
        <span>{isEn ? "Ask Pathy Again" : "Tanya Pathy lagi"}</span>
        <span className="w-3.5 h-3.5 text-orange">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </span>
      </button>

      <Suspense fallback={null}>
        <GmailShareModal isOpen={showGmailShare} onClose={() => setShowGmailShare(false)} sessionData={data} />
        <PathyChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} initialMessage={initialMessage} sessionData={data} setSessionData={setData} />
        <JobsListDrawer 
          isOpen={showJobsExplorer} 
          onClose={() => setShowJobsExplorer(false)} 
          roleName={topRoleName} 
          locationInput={data.location || (sessionStorage.getItem('pathfinder_answers') ? JSON.parse(sessionStorage.getItem('pathfinder_answers'))?.[3] : 'Jakarta')}
          isLive={data.is_live === true}
        />
      </Suspense>

      {settingsOpen && (
        <>
          <div 
            className="fixed inset-0 bg-[#111110]/55 backdrop-blur-[4px] z-[200] transition-opacity cursor-pointer"
            onClick={() => setSettingsOpen(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[460px] bg-white rounded-2xl p-7 border border-border shadow-2xl z-[201] font-sans text-ink">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
              <div className="font-mono text-[10px] text-orange tracking-[0.14em] uppercase flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-orange rounded-full animate-pulse"></span>
                Pengaturan Akun &amp; Asisten
              </div>
              <button onClick={() => setSettingsOpen(false)} className="text-muted hover:text-ink transition-colors border-0 bg-transparent cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block font-mono text-[9px] text-muted-dark tracking-[0.06em] uppercase mb-1.5 ml-0.5">{isEn ? "Nickname" : "Nama Panggilan"}</label>
                <input 
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-cream border border-border rounded-xl px-4 py-2.5 font-sans text-[14px] outline-none text-ink focus:border-orange transition-colors"
                  placeholder={isEn ? "Type your nickname..." : "Ketik nama panggilanmu..."}
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-muted-dark tracking-[0.06em] uppercase mb-2 ml-0.5">{isEn ? "Career Notifications" : "Notifikasi Karir"}</label>
                <label className="flex items-start gap-3 bg-white border border-border p-3.5 rounded-xl cursor-pointer hover:bg-cream/45 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={notifyWeekly}
                    onChange={(e) => setNotifyWeekly(e.target.checked)}
                    className="mt-1 accent-orange rounded cursor-pointer animate-none" 
                  />
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink leading-tight">{isEn ? "Weekly Job Opening Alerts" : "Notifikasi Weekly Lowongan Kerja"}</div>
                    <p className="text-[11.5px] text-muted-dark leading-normal m-0 mt-1 max-w-[320px]">
                      {isEn 
                        ? `Get weekly email alerts when new jobs are posted in ${data?.location || 'your area'} that match your profile.` 
                        : `Dapatkan notifikasi email mingguan jika terdapat lowongan baru di ${data?.location || 'wilayahmu'} yang relevan dengan karirmu.`}
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-mono text-[9px] text-muted-dark tracking-[0.06em] uppercase mb-1.5 ml-0.5">{isEn ? "Mentorship Tone" : "Gaya Pendampingan Mentor"}</label>
                <select 
                  value={mentorStyle}
                  onChange={(e) => setMentorStyle(e.target.value)}
                  className="w-full bg-cream border border-border rounded-xl px-4 py-3 font-sans text-[13.5px] outline-none text-ink cursor-pointer focus:border-orange transition-colors"
                >
                  <option value="profesional">{isEn ? "Professional (Formal & Focused)" : "Professional (Bahasa Indonesia Baku & Terfokus)"}</option>
                  <option value="santai">{isEn ? "Casual Partner (Slang & Relaxed)" : "Santai Partner Diskusi (Bahasa Gaul Kasual)"}</option>
                </select>
              </div>

	              <div className="pt-4 border-t border-dashed border-border flex flex-col gap-2.5">
	                {isLoggedIn && (
	                  <button 
	                    onClick={handleLogout}
	                    className="w-full bg-white border border-border text-ink rounded-xl py-3 text-[13.5px] font-medium hover:bg-cream transition-colors cursor-pointer text-center"
	                  >
	                    {isEn ? "Log Out" : "Keluar Akun"}
	                  </button>
	                )}

	                <button 
	                  onClick={() => {
                    const confirmReset = window.confirm(isEn ? "Are you sure you want to restart onboarding? Your career analytics history will be erased." : "Apakah kamu yakin ingin mengulang onboarding? Riwayat analisis karir lokal kamu akan dihapus.");
                    if (confirmReset) {
                      sessionStorage.removeItem('pathfinder_session');
                      sessionStorage.removeItem('pathfinder_answers');
                      sessionStorage.setItem('onboarding_restart', 'true');
                      navigate('/conversation');
                    }
                  }}
                  className="w-full bg-white border border-red-200 text-red-500 rounded-xl py-3 text-[13.5px] font-medium hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer text-center"
                >
                  {isEn ? "Restart Career Analysis (Reset)" : "Mulai Ulang Analisis Karir (Reset)"}
                </button>
                
                <button 
                  onClick={() => {
                    if (!editedName.trim()) {
                      import('sonner').then(({ toast }) => {
                        toast.error(isEn ? "Nickname cannot be empty!" : "Nama panggilan tidak boleh kosong!");
                      });
                      return;
                    }
                    localStorage.setItem('pathy_user_name', editedName);
                    localStorage.setItem('pathy_notifications', notifyWeekly ? 'true' : 'false');
                    localStorage.setItem('pathy_mentor_style', mentorStyle);
                    
                    setData(prev => {
                      if (!prev) return null;
                      const updated = { ...prev, user_name: editedName };
                      
                      const session = JSON.parse(sessionStorage.getItem('pathfinder_session') || '{}');
                      if (session && session.results) {
                        session.results = updated;
                        sessionStorage.setItem('pathfinder_session', JSON.stringify(session));
                      }

                      if (isLoggedIn) {
                        import('../utils/supabase').then(({ saveResultToSupabase }) => {
                          saveResultToSupabase(updated);
                        }).catch(err => console.error("Error saving updated details to Supabase:", err));
                      }

                      return updated;
                    });

                    import('sonner').then(({ toast }) => {
                      toast.success(isEn ? "Account & Assistant settings saved successfully!" : "Pengaturan Akun & Asisten berhasil disimpan!");
                    });
                    setSettingsOpen(false);
                  }}
                  className="w-full bg-orange text-white border-0 rounded-xl py-3 text-[13.5px] font-medium hover:bg-orange-2 transition-colors cursor-pointer text-center"
                >
                  {isEn ? "Save Settings" : "Simpan Pengaturan"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
