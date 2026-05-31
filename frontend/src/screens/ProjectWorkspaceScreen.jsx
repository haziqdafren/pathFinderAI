import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PathyChatDrawer from '../components/PathyChatDrawer';

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
  creative3d: [
    {
      name: "Short 3D Animation Portfolio Film",
      dataset_name: "Blender Scene & Shot Breakdown",
      duration_weeks: 3,
      skills_closed: ["Storyboarding", "3D Animation", "Lighting & Rendering"],
      tech_stack: ["Blender", "DaVinci Resolve", "ArtStation"],
      week_1: "Week 1: Buat storyboard, asset list, camera plan, dan satu test shot yang polished.",
      week_2: "Week 2: Animate sequence 20-30 detik, render, lalu publish breakdown reel."
    },
    {
      name: "Motion Graphics Product Teaser",
      dataset_name: "Brand Animation Brief",
      duration_weeks: 2,
      skills_closed: ["Keyframing", "Composition", "Video Editing"],
      tech_stack: ["Blender", "After Effects", "Premiere/DaVinci"],
      week_1: "Week 1: Susun moodboard, style frame, dan animatic kasar.",
      week_2: "Week 2: Finalisasi motion, sound cue, subtitle, dan upload case study."
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

export default function ProjectWorkspaceScreen() {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('logged_in') === 'true' || localStorage.getItem('pathy_logged_in') === 'true';
  const lang = localStorage.getItem('pref_lang') || 'id';
  const isEn = lang === 'en';
  const [chatOpen, setChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Settings edit states
  const [editedName, setEditedName] = useState('');
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [mentorStyle, setMentorStyle] = useState('profesional');
  
  const [data, setData] = useState({
    user_name: "Teman",
    project: {
      name: "Customer Retention Cohort Dashboard",
      dataset_name: "Olist E-commerce Dataset",
      duration_weeks: 2,
      skills_closed: ["SQL (joins, window functions)", "Statistical reasoning (A/B)"],
      tech_stack: ["Looker Studio", "BigQuery"],
      week_1: "Cleansing data order dan customer, bikin base table buat cohort.",
      week_2: "Build retention churn metric, dan pasang filter per wilayah."
    }
  });

  // Synchronize edit states when settings opens
  useEffect(() => {
    if (settingsOpen && data) {
      setEditedName(data.user_name || localStorage.getItem('pathy_user_name') || 'Teman');
      setNotifyWeekly(localStorage.getItem('pathy_notifications') !== 'false');
      setMentorStyle(localStorage.getItem('pathy_mentor_style') || 'profesional');
    }
  }, [settingsOpen, data]);

  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
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
    } else if (roleId.toLowerCase().includes("anim") || roleId.toLowerCase().includes("3d") || roleId.toLowerCase().includes("motion") || roleId.toLowerCase().includes("blender")) {
      category = "creative3d";
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

    // Reset task lists for the new project!
    const newTasks = generateTasks(newProj);
    setTasks(newTasks);
    localStorage.setItem(`pathy_tasks_${newProj.name}`, JSON.stringify(newTasks));

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

  const generateTasks = (project) => {
    if (!project) return [];

    if (Array.isArray(project.week_by_week)) {
      const generated = [];
      project.week_by_week.forEach((w, index) => {
        generated.push({
          id: (index * 2) + 1,
          title: `Focus: ${w.focus}`,
          done: false,
          week: w.week || 1
        });
        generated.push({
          id: (index * 2) + 2,
          title: `Deliverable: ${w.deliverable}`,
          done: false,
          week: w.week || 1
        });
      });
      return generated;
    }

    const week1Desc = project.week_1 || (isEn ? "Project initiation" : "Inisiasi proyek");
    const week2Desc = project.week_2 || (isEn ? "Detailed visualization" : "Visualisasi rincian");
    const techStackStr = (project.tech_stack || []).join(', ') || (isEn ? 'Supporting tools' : 'Tools pendukung');
    const projectName = project.name || (isEn ? 'project' : 'proyek');

    return [
      {
        id: 1,
        title: isEn 
          ? `Prepare workspace & initialize project files using ${techStackStr}`
          : `Persiapkan workspace & inisiasi file proyek menggunakan ${techStackStr}`,
        done: false,
        week: 1
      },
      {
        id: 2,
        title: `${week1Desc}`,
        done: false,
        week: 1
      },
      {
        id: 3,
        title: isEn
          ? `Validate initial data and draft rough schema for ${projectName}`
          : `Validasi data awal dan draft skema kasar untuk ${projectName}`,
        done: false,
        week: 1
      },
      {
        id: 4,
        title: `${week2Desc}`,
        done: false,
        week: 2
      },
      {
        id: 5,
        title: isEn
          ? `Polish visual design and optimize user interaction experience`
          : `Poles desain tampilan serta optimasi pengalaman interaksi pengguna`,
        done: false,
        week: 2
      },
      {
        id: 6,
        title: isEn
          ? `Write an explanation in GitHub README so recruiters can see your original work`
          : `Tulis penjelasan di README GitHub agar rekruter bisa melihat karya aslimu`,
        done: false,
        week: 2
      }
    ];
  };

  const loadTasksWithTranslations = (project) => {
    const currentGenerated = generateTasks(project);
    const savedTasksStr = localStorage.getItem(`pathy_tasks_${project?.name}`);
    if (savedTasksStr) {
      try {
        const parsed = JSON.parse(savedTasksStr);
        return currentGenerated.map(t => {
          const found = parsed.find(pt => pt.id === t.id);
          return found ? { ...t, done: found.done } : t;
        });
      } catch (e) {
        return currentGenerated;
      }
    }
    return currentGenerated;
  };

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const sessionData = JSON.parse(sessionStorage.getItem('pathfinder_session'));
        
        if (sessionData && sessionData.results) {
          if (active) {
            const p = sessionData.results.project || sessionData.results.project_recommendation || {};
            setData(sessionData.results);
            setIsLoading(false);
            
            setTasks(loadTasksWithTranslations(p));
          }
        } else if (isLoggedIn) {
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
              follow_up_questions: row.follow_up_questions || [],
              project: row.project_recommendation || row.project || {},
              visual_roadmap: row.visual_roadmap || [],
              jobs_analyzed: row.jobs_analyzed || 0,
              jobs_source: row.jobs_source || null,
              is_live: typeof row.is_live === 'boolean' ? row.is_live : false,
              fetched_at: row.fetched_at || null,
              job_data_snapshot: row.job_data_snapshot || null,
              live_jobs: row.live_jobs || []
            };
            
            if (active) {
              setData(parsedResults);
              setIsLoading(false);
              sessionStorage.setItem('pathfinder_session', JSON.stringify({
                results: parsedResults,
                timestamp: Date.now()
              }));

              const p = parsedResults.project;
              setTasks(loadTasksWithTranslations(p));
            }
          } else {
            if (active) {
              const { toast } = await import('sonner');
              toast.error("Kamu belum memiliki riwayat analisis sebelumnya. Silakan ikut onboarding terlebih dahulu!");
              navigate('/conversation');
            }
          }
        } else {
          const fallbackProject = {
            name: "Customer Retention Cohort Dashboard",
            dataset_name: "Olist E-commerce Dataset",
            duration_weeks: 2,
            skills_closed: ["SQL (joins, window functions)", "Statistical reasoning (A/B)"],
            tech_stack: ["Looker Studio", "BigQuery"],
            week_1: "Cleansing data order dan customer, bikin base table buat cohort.",
            week_2: "Build retention churn metric, dan pasang filter per wilayah."
          };
          
          if (active) {
            setData({
              user_name: "Teman",
              project: fallbackProject
            });
            setIsLoading(false);
            
            setTasks(loadTasksWithTranslations(fallbackProject));
          }
        }
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    loadSession();
    return () => { active = false; };
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (tasks.length > 0 && data.project?.name) {
      localStorage.setItem(`pathy_tasks_${data.project.name}`, JSON.stringify(tasks));
    }
  }, [tasks, data.project?.name]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleLogout = async () => {
    const { signOutPathfinder } = await import('../utils/supabase');
    await signOutPathfinder();
    const { toast } = await import('sonner');
    toast.success(isEn ? "Signed out. Your local project progress remains on this device." : "Berhasil keluar. Progress proyek lokal tetap tersimpan di perangkat ini.");
    window.location.href = '/';
  };

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-ink-2">{isEn ? "Loading Project..." : "Memuat Proyek..."}</p>
        </div>
      </div>
    );
  }

  const pName = data.project?.name || 'Customer Retention Cohort Dashboard';
  const remainingHours = data.project?.duration_weeks ? data.project.duration_weeks * 6 : 11;

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row font-sans">
      {/* Sidebar - Reused layout styling */}
      <aside className="w-full md:w-[70px] bg-ink text-white flex flex-row md:flex-col items-center py-3 md:py-[22px] px-4 md:px-0 shrink-0 border-b md:border-b-0 border-ink-3">
        <span className="w-6 h-6 bg-orange rounded-[7px] relative inline-flex items-center justify-center shrink-0 mb-0 md:mr-0 mr-3.5 md:mb-[26px] before:content-[''] before:w-[9px] before:h-[9px] before:border-[1.6px] before:border-white before:rounded-full before:border-t-transparent before:border-r-transparent after:content-[''] after:absolute after:w-[3px] after:h-[3px] after:bg-white after:rounded-full after:top-[5px] after:right-[5px]"></span>
        
        <nav className="flex flex-row md:flex-col gap-1 flex-1 items-center md:items-stretch">
          <button onClick={() => navigate('/results')} className="w-[42px] h-[42px] rounded-[10px] bg-transparent text-white/45 flex items-center justify-center transition-all hover:bg-white/5 hover:text-white cursor-pointer" aria-label="Hasil">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2 4 4 8-8 4 4"/><path d="M3 21h18"/></svg>
          </button>
          <button className="w-[42px] h-[42px] rounded-[10px] bg-white/[0.08] text-white flex items-center justify-center relative md:before:content-[''] md:before:absolute md:before:-left-[14px] md:before:top-1/2 md:before:-translate-y-1/2 md:before:w-[3px] md:before:h-[18px] md:before:bg-orange md:before:rounded-r-[2px]" aria-label="Projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
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
            {data.user_name?.[0]?.toUpperCase() || 'H'}
          </div>
          <div className="absolute bottom-10 left-10 md:bottom-2 md:left-12 bg-ink text-white text-[11px] py-2.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap border border-ink-3 flex flex-col gap-1.5 z-40 shadow-lg">
            <span className="font-mono text-[9px] text-white/55 uppercase tracking-wider block">{isEn ? "Session Status" : "Kondisi Sesi"}</span>
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

      <main className="flex-1 py-7 px-5 md:py-[28px] md:px-[36px] md:pb-32 max-w-[1000px] w-full mx-auto relative z-10">
        <button onClick={() => navigate('/results')} className="text-[13px] font-medium text-muted-dark hover:text-ink transition-colors mb-6 flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer text-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {isEn ? "Back to Dashboard" : "Kembali ke Dashboard"}
        </button>

        <div className="bg-white border border-border rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pt-2">
            <div>
              <div className="font-mono text-[10px] text-orange tracking-[0.12em] uppercase mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange rounded-full animate-pulse shadow-[0_0_0_0_rgba(232,100,42,0.6)]"></span>
                  {isEn ? `In Progress • Est. remaining ${remainingHours} Hrs` : `In Progress • Estimasi sisa ${remainingHours} Jam`}
                </div>
                <button 
                  onClick={handleShuffleProject}
                  className="font-mono text-[10px] text-muted-dark hover:text-orange bg-transparent border border-border px-2.5 py-1 rounded-md cursor-pointer transition-colors inline-flex items-center gap-1 shrink-0"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  <span>{isEn ? `Project Shuffle (${shufflesLeft}x left)` : `Ganti Proyek (Sisa ${shufflesLeft}x)`}</span>
                </button>
              </div>
              <h1 className="text-[clamp(34px,4.8vw,62px)] font-medium tracking-tight leading-[1.04] text-ink m-0 mb-5 max-w-[760px] text-balance">
                {pName}
              </h1>
              {data.project?.dataset_name && (
                <div className="text-[13px] text-ink-2 mb-3">
                  Dataset: <strong className="text-ink font-medium">{data.project.dataset_name}</strong>
                </div>
              )}
              <div className="flex flex-wrap gap-2 text-[12px]">
                 {(data.project?.tech_stack || ["SQL", "BigQuery", "Looker"]).map((t, i) => (
                   <span key={i} className="bg-cream border border-border px-3 py-1.5 rounded-full text-ink-2 font-mono uppercase tracking-[0.04em] text-[10px]">{t}</span>
                 ))}
              </div>
            </div>
            
            <div className="bg-cream border border-border p-4 rounded-[14px] w-full md:w-[240px] shrink-0">
               <div className="flex justify-between items-end mb-2.5">
                 <span className="font-mono text-[10px] uppercase text-muted-dark tracking-[0.06em]">Progress</span>
                 <span className="font-medium text-[24px] tracking-[-0.02em] leading-none text-ink">{progress}%</span>
               </div>
               <div className="h-1.5 bg-border rounded-full overflow-hidden">
                 <div className="h-full bg-orange transition-all duration-500 ease-out" style={{width: `${progress}%`}}></div>
               </div>
               <div className="text-[12px] text-ink-2 mt-3 tracking-[-0.005em]">
                 {progress === 100 
                   ? <strong className="text-[#4ade80] font-medium">{isEn ? "Excellent! You are now ready to add this project to your CV." : "Bagus! Kamu sudah siap sampaikan proyek ini di CV-mu."}</strong>
                   : (isEn ? `Finish ${tasks.filter(t => !t.done).length} more tasks, your readiness increases ` : `Selesai ${tasks.filter(t => !t.done).length} task lagi, readiness kamu naik `)}
                 {progress !== 100 && <strong className="text-orange font-semibold">+{tasks.filter(t => !t.done).length * 4} pts</strong>}
               </div>
            </div>
          </div>

          <div className="bg-cream/50 -mx-6 md:-mx-8 border-y border-border px-6 md:px-8 py-5 mb-8 flex gap-3.5 items-center">
            <div className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center shrink-0 font-semibold text-[13px] relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3 after:bg-[#4ade80] after:rounded-full after:border-[2.5px] after:border-white">
              {data.user_name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="flex-1 text-[14.5px] leading-relaxed text-ink-2">
              {isEn ? (
                <>Confused on how to execute <strong className="text-ink font-semibold">{pName}</strong>? Just select a task, and Pathy will generate a starting snippet and explain the logic.</>
              ) : (
                <>Bingung mengerjakan proyek <strong className="text-ink font-semibold">{pName}</strong>? Klik aja task yang mana, nanti Pathy buatin snippet awal dan kasih tahu logic-nya.</>
              )}
            </div>
            <button onClick={() => { setInitialMessage(isEn ? `Pathy, could you give me a starting recommendation / snippet for executing "${pName}"?` : `Pathy, boleh minta rekomendasi / snippet langkah awal untuk pengerjaan proyek "${pName}"?`); setChatOpen(true); }} className="bg-white border border-border text-ink rounded-lg py-2 px-4 text-[13px] font-medium hover:bg-cream-2 transition-colors shrink-0 cursor-pointer">
              {isEn ? "Ask Pathy" : "Tanya Pathy"}
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {Array.from(new Set(tasks.map(t => t.week))).sort((a,b)=>a-b).map(weekNum => {
              let weekTitle = `Week ${weekNum} · Implementasi`;
              if (weekNum === 1) weekTitle = "Week 1 · Data Prep & Setup";
              else if (weekNum === 2) weekTitle = "Week 2 · Viz & Production Deployment";
              else if (weekNum === 3) weekTitle = "Week 3 · Advanced Functional Mechanics";
              else if (weekNum === 4) weekTitle = "Week 4 · Launch, Testing & Hardening Documentation";

              return (
                <div key={weekNum}>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-dark mt-2 mb-3 ml-2">{weekTitle}</h3>
                  <div className="flex flex-col gap-2">
                    {tasks.filter(t => t.week === weekNum).map(task => (
                      <div key={task.id} onClick={() => toggleTask(task.id)} className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${task.done ? 'bg-cream border-border' : 'bg-white border-border hover:border-orange/50'}`}>
                        <div className={`w-[22px] h-[22px] rounded-[6px] border-[1.5px] shrink-0 mt-0.5 flex items-center justify-center transition-colors ${task.done ? 'bg-[#4ade80] border-[#4ade80] text-white' : 'border-muted-dark bg-transparent'}`}>
                          {task.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div className={`flex-1 text-[15px] leading-snug tracking-[-0.005em] pt-[1.5px] ${task.done ? 'text-muted-dark line-through decoration-muted/50' : 'text-ink font-medium'}`}>
                          {task.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating ask button */}
      <button onClick={() => { setInitialMessage(isEn ? `Pathy, let's discuss execution steps for "${pName}"!` : `Pathy, ayuk diskusikan langkah pengerjaan untuk proyek "${pName}"!`); setChatOpen(true); }} className="fixed bottom-6 right-6 bg-ink text-white border-0 rounded-full py-3 pr-[18px] pl-3 inline-flex items-center gap-2.5 text-[14px] tracking-[-0.005em] shadow-[0_6px_24px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.08)] z-50 transition-transform hover:-translate-y-0.5 cursor-pointer">
        <span className="w-7 h-7 rounded-full bg-orange text-white flex items-center justify-center text-[11px] font-semibold relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-[#4ade80] after:rounded-full after:border-[1.5px] after:border-ink">P</span>
        <span>{isEn ? "Ask Pathy Again" : "Tanya Pathy lagi"}</span>
        <span className="w-3.5 h-3.5 text-orange">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </span>
      </button>

      <PathyChatDrawer
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        initialMessage={initialMessage} 
        sessionData={data}
        setSessionData={setData}
      />

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
                {isEn ? "Account & Assistant Settings" : "Pengaturan Akun & Asisten"}
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
