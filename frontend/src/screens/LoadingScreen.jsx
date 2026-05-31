import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';

export default function LoadingScreen() {
  const navigate = useNavigate();
  const { startAnalysis } = useAnalysis();
  
  const [stepStatus, setStepStatus] = useState(['pending', 'pending', 'pending', 'pending']);
  const [scannedJobs, setScannedJobs] = useState([]);
  
  const answersData = JSON.parse(sessionStorage.getItem('pathfinder_answers') || '[""]');
  const lang = localStorage.getItem('pref_lang') || 'id';
  const isEn = lang === 'en';
  
  const userName = answersData[0]?.trim() || (isEn ? 'my friend' : 'Teman');
  const joinedAnswers = `${answersData[1] || ''} ${answersData[2] || ''}`.toLowerCase();
  const localField = (() => {
    if (/\b(cyber|security|keamanan|siber|network|jaringan|packet|traffic|threat|soc|siem|firewall|port|vulnerability|owasp|incident|linux|deteksi|detecting)\b/.test(joinedAnswers)) return 'cybersecurity';
    if (/\b(animasi|animation|animator|blender|3d|modeling|modelling|render|film|video|motion|storyboard|vfx)\b/.test(joinedAnswers)) return 'creative3d';
    if (/\b(data|sql|excel|spreadsheet|dashboard|analyst|python)\b/.test(joinedAnswers)) return 'data';
    if (/\b(ui|ux|figma|design|desain|wireframe)\b/.test(joinedAnswers)) return 'uiux';
    if (/\b(api|backend|database|server|express|node|postgres|jwt|middleware)\b/.test(joinedAnswers)) return 'backend';
    return 'web';
  })();
  
  // Dynamic category detector to make scanner immersion genuine
  const q1Content = (answersData[1] || "").toLowerCase();
  const q2Content = (answersData[2] || "").toLowerCase();
  
  let resolvedField = "web";
  if (
    q1Content.includes("cyber") || q1Content.includes("security") || q1Content.includes("keamanan") || 
    q1Content.includes("hack") || q1Content.includes("pentest") || q1Content.includes("ctf") || 
    q1Content.includes("capture") || q1Content.includes("flag") || q1Content.includes("lomba") || 
    q1Content.includes("siber") || q1Content.includes("jaringan") || q1Content.includes("network") ||
    q2Content.includes("cyber") || q2Content.includes("security") || q2Content.includes("keamanan") || 
    q2Content.includes("hack") || q2Content.includes("pentest") || q2Content.includes("ctf") || 
    q2Content.includes("capture") || q2Content.includes("flag") || q2Content.includes("lomba") ||
    q2Content.includes("siber") || q2Content.includes("jaringan") || q2Content.includes("network")
  ) {
    resolvedField = "cybersecurity";
  } else if (
    q1Content.includes("animasi") || q1Content.includes("animation") || q1Content.includes("animator") ||
    q1Content.includes("blender") || q1Content.includes("3d") || q1Content.includes("render") ||
    q1Content.includes("film") || q1Content.includes("motion") || q1Content.includes("storyboard") ||
    q2Content.includes("animasi") || q2Content.includes("animation") || q2Content.includes("animator") ||
    q2Content.includes("blender") || q2Content.includes("3d") || q2Content.includes("render") ||
    q2Content.includes("film") || q2Content.includes("motion") || q2Content.includes("storyboard")
  ) {
    resolvedField = "creative3d";
  } else if (
    q1Content.includes("data") || q1Content.includes("sql") || q1Content.includes("excel") || 
    q1Content.includes("analyst") || q1Content.includes("spreadsheet") || q1Content.includes("python") ||
    q2Content.includes("data") || q2Content.includes("sql") || q2Content.includes("excel") || 
    q2Content.includes("analyst")
  ) {
    resolvedField = "data";
  } else if (
    q1Content.includes("ui") || q1Content.includes("ux") || q1Content.includes("desain") || 
    q1Content.includes("design") || q1Content.includes("figma") ||
    q2Content.includes("ui") || q2Content.includes("ux") || q2Content.includes("desain") || 
    q2Content.includes("design") || q2Content.includes("figma")
  ) {
    resolvedField = "uiux";
  } else if (
    q1Content.includes("backend") || q1Content.includes("api") || q1Content.includes("database") || 
    q1Content.includes("server") || q1Content.includes("express") || q1Content.includes("node") ||
    q2Content.includes("backend") || q2Content.includes("api") || q2Content.includes("database") || 
    q2Content.includes("server")
  ) {
    resolvedField = "backend";
  }

  const dataJobs = [
    { role: 'Junior Data Analyst', co: 'Bukalapak · Jakarta', tag: 'matched' },
    { role: 'BI Analyst Intern', co: 'Tokopedia · Jakarta', tag: 'matched' },
    { role: 'Frontend Engineer', co: 'Gojek · Jakarta', tag: '' },
    { role: 'Data Operations', co: 'Sayurbox · Bandung', tag: 'matched' },
    { role: 'Mobile Engineer (iOS)', co: 'Dana · Jakarta', tag: '' },
    { role: 'Business Intelligence', co: 'BliBli · remote', tag: 'matched' },
    { role: 'Reporting Analyst', co: 'Astra Digital · Jakarta', tag: 'matched' },
    { role: 'Data Analyst (Ops)', co: 'Lalamove · remote', tag: 'matched' },
    { role: 'Junior BI Developer', co: 'BCA Digital · Jakarta', tag: 'matched' },
    { role: 'Marketing Analytics', co: 'Shopee · Jakarta', tag: 'matched' }
  ];

  const cyberJobs = [
    { role: 'Junior Cybersecurity Analyst', co: 'Gojek · Jakarta', tag: 'matched' },
    { role: 'IT Security Associate', co: 'BCA · Jakarta', tag: 'matched' },
    { role: 'SOC Analyst Intern', co: 'Telkom Indonesia · Jakarta', tag: 'matched' },
    { role: 'Network Engineer Support', co: 'Adaro · remote', tag: '' },
    { role: 'Penetration Tester (Jr)', co: 'Siberia Security · Jakarta', tag: 'matched' },
    { role: 'Information Security Staff', co: 'Halodoc · Jakarta', tag: 'matched' },
    { role: 'Junior Web Developer', co: 'Tokopedia · Jakarta', tag: '' },
    { role: 'IT Support & Security', co: 'AdaKami · Tangerang', tag: 'matched' },
    { role: 'Cybersecurity Analyst', co: 'Traveloka · Jakarta', tag: 'matched' },
    { role: 'System Administrator (Linux)', co: 'eFishery · Bandung', tag: '' },
    { role: 'Infrastructure Security Support', co: 'Mekari · Jakarta', tag: 'matched' },
    { role: 'Junior SOC Analyst', co: 'LRT Jakarta · Jakarta', tag: 'matched' }
  ];

  const creativeJobs = [
    { role: 'Junior 3D Animator', co: 'Agate Studio · Bandung', tag: 'matched' },
    { role: 'Motion Designer Intern', co: 'Dentsu · Jakarta', tag: 'matched' },
    { role: 'Blender Generalist', co: 'Brandoville · Jakarta', tag: 'matched' },
    { role: '3D Artist Junior', co: 'Infinite Studios · Batam', tag: 'matched' },
    { role: 'Video & Motion Graphics Assistant', co: 'Ruangguru · remote', tag: '' },
    { role: 'Storyboard & Animation Junior', co: 'MD Animation · Jakarta', tag: 'matched' }
  ];

  const uiuxJobs = [
    { role: 'Junior UI/UX Designer', co: 'BFI Finance · Tangerang', tag: 'matched' },
    { role: 'Product Design Intern', co: 'Tiket.com · Jakarta', tag: 'matched' },
    { role: 'Graphic Designer', co: 'Ruangguru · remote', tag: '' },
    { role: 'UI Designer Specialist', co: 'Mekari · Jakarta', tag: 'matched' },
    { role: 'Web Developer', co: 'eFishery · Bandung', tag: '' },
    { role: 'Product Researcher Associate', co: 'Bibit · Jakarta', tag: 'matched' },
    { role: 'UI/UX Designer', co: 'Gojek · hybrid', tag: 'matched' },
    { role: 'UI Anatomy Intern', co: 'Kredivo · Jakarta', tag: 'matched' },
    { role: 'Brand & Graphic Support', co: 'Sayurbox · Jakarta', tag: '' }
  ];

  const backendJobs = [
    { role: 'Junior Backend Engineer', co: 'Bibit · Jakarta', tag: 'matched' },
    { role: 'Web Developer Intern', co: 'Astra Digital · Jakarta', tag: 'matched' },
    { role: 'Frontend Support', co: 'Shopee · Jakarta', tag: '' },
    { role: 'Backend Engineer (Node/Express)', co: 'Kredivo · Jakarta', tag: 'matched' },
    { role: 'Junior DevOps/Sysadmin', co: 'Bukalapak · Jakarta', tag: 'matched' },
    { role: 'QA Tester', co: 'Halodoc · Jakarta', tag: '' },
    { role: 'API Middleware dev', co: 'Tokopedia · Jakarta', tag: 'matched' },
    { role: 'Database Support Associate', co: 'Dana · Jakarta', tag: 'matched' },
    { role: 'WordPress/CMS developer', co: 'Astra · Jakarta', tag: '' }
  ];

  const webJobs = [
    { role: 'Junior Web Developer', co: 'Traveloka · Jakarta', tag: 'matched' },
    { role: 'Frontend Developer Intern', co: 'eFishery · Bandung', tag: 'matched' },
    { role: 'BI Analyst Intern', co: 'Tokopedia · Jakarta', tag: '' },
    { role: 'Web Generalist Developer', co: 'Halodoc · Jakarta', tag: 'matched' },
    { role: 'WordPress & CMS Specialist', co: 'Ruangguru · remote', tag: 'matched' },
    { role: 'HTML/CSS Layout support', co: 'Mekari · Jakarta', tag: 'matched' },
    { role: 'Python Data Operations', co: 'Sayurbox · Bandung', tag: '' },
    { role: 'Junior Web Developer', co: 'Bukalapak · remote', tag: 'matched' }
  ];

  let defaultJobs = webJobs;
  if (resolvedField === "cybersecurity") defaultJobs = cyberJobs;
  else if (resolvedField === "creative3d") defaultJobs = creativeJobs;
  else if (resolvedField === "data") defaultJobs = dataJobs;
  else if (resolvedField === "uiux") defaultJobs = uiuxJobs;
  else if (resolvedField === "backend") defaultJobs = backendJobs;

  useEffect(() => {
    const answers = JSON.parse(sessionStorage.getItem('pathfinder_answers')) || ['', '', '', ''];
    let analysisFinished = false;
    let sequenceFinished = false;
    
    // Start backend process
    const runBackend = async () => {
      try {
        const { resultPromise, sessionId } = await startAnalysis(answers, lang);
        if (resultPromise) {
          const data = await resultPromise;
          const enrichedData = { ...data, session_id: sessionId };
          sessionStorage.setItem('pathfinder_session_id', sessionId);
          sessionStorage.setItem('pathfinder_session', JSON.stringify({
            session_id: sessionId,
            results: enrichedData,
            timestamp: Date.now()
          }));
          localStorage.setItem('pathy_shuffles_left', '3');
          analysisFinished = true;
          checkAndNavigate();
        }
      } catch (err) {
        console.error("Backend error:", err);
        const localFallbacks = {
          cybersecurity: {
            role: "Junior Cybersecurity Analyst",
            role_id: "cybersecurity_analyst",
            skills: ["Network Security", "Threat Detection", "Incident Response"],
            gaps: ["Linux Networking & Packet Analysis", "Security Report Writing"],
            project: {
              name: "Network Traffic Detection Lab",
              dataset_name: "PCAP Sample Traffic Dataset",
              duration_weeks: 3,
              skills_closed: ["Packet Analysis", "Threat Detection", "Security Reporting"],
              tech_stack: ["Python", "Wireshark", "Suricata"],
              week_1: "Week 1: Capture safe sample traffic and label normal vs suspicious patterns.",
              week_2: "Week 2: Build detection rules, export findings, and write a concise incident report."
            },
            jobs: [
              { title: "Junior Cybersecurity Analyst", company: "Telkomsigma", location: "Jakarta", match: 82, type: "Full-time (Search Example)", is_fallback: true },
              { title: "SOC Analyst Intern", company: "ITSEC Asia", location: "Jakarta", match: 76, type: "Internship (Search Example)", is_fallback: true }
            ]
          },
          creative3d: {
            role: "Junior 3D Animator",
            role_id: "junior_3d_animator",
            skills: ["Blender", "3D Animation", "Storyboarding"],
            gaps: ["Animation Reel Polish", "Lighting & Rendering Breakdown"],
            project: {
              name: "Short 3D Animation Portfolio Film",
              dataset_name: "Blender Scene & Shot Breakdown",
              duration_weeks: 3,
              skills_closed: ["Storyboarding", "3D Animation", "Lighting & Rendering"],
              tech_stack: ["Blender", "DaVinci Resolve", "ArtStation"],
              week_1: "Week 1: Create storyboard, asset list, camera plan, and one polished test shot.",
              week_2: "Week 2: Animate a 20-30 second sequence, render it, and publish a breakdown reel."
            },
            jobs: [
              { title: "Junior 3D Animator", company: "Agate Studio", location: "Bandung", match: 82, type: "Full-time (Search Example)", is_fallback: true },
              { title: "Motion Designer Intern", company: "Dentsu Indonesia", location: "Jakarta", match: 74, type: "Internship (Search Example)", is_fallback: true }
            ]
          },
          web: {
            role: "Junior Web Developer",
            role_id: "web_dev",
            skills: ["HTML", "CSS", "Frontend Basics"],
            gaps: ["React.js / Frontend Framework", "Backend Integration"],
            project: {
              name: "Customer Interactive Web Dashboard",
              dataset_name: "Product Catalog Dataset",
              duration_weeks: 2,
              skills_closed: ["Async API Fetching", "Dynamic Filtering", "State Management (React)"],
              tech_stack: ["Vite React", "Tailwind CSS"],
              week_1: "Week 1: Membuat rancangan layout interaktif responsif pada semua ukuran layar.",
              week_2: "Week 2: Tambahkan fetch data dari dummy API serta pasang fungsionalitas visual filter."
            },
            jobs: [
              { title: "Frontend Web Developer", company: "Bukalapak", location: "Jakarta", match: 75, type: "Full-time (Search Example)", is_fallback: true },
              { title: "React Developer Intern", company: "Tokopedia", location: "Jakarta", match: 70, type: "Internship (Search Example)", is_fallback: true }
            ]
          }
        };
        const fallback = localFallbacks[localField] || localFallbacks.web;
        // Fallback session on error so results page uses local cache logic
        sessionStorage.setItem('pathfinder_session', JSON.stringify({
          session_id: 'error_fallback',
          results: {
            session_id: 'error_fallback',
            user_name: localStorage.getItem('pathy_user_name') || "Teman",
            readiness_score: 55,
            top_roles: [
              { rank: 1, role_name: fallback.role, role_id: fallback.role_id, fit_score: 75, skills_shown: fallback.skills, job_count: 5 },
            ],
            signal_chips: ["Mempelajari hal baru", "Belum ada portfolio khusus"],
            skill_gaps: fallback.gaps.map((skill, idx) => ({ skill, count: idx === 0 ? 12 : 8, total: 20 })),
            scout_message: `Waktu analisis dari AI sedang tinggi atau tidak tersedia. PathFinder menampilkan simulasi data jatuh-kembali (fallback) ini agar kamu bisa melihat contoh laporan. Coba ulang lagi nanti dengan API Key aktif.`,
            project: fallback.project,
            visual_roadmap: [
              { day: 7, title: "Foundation", task: "Setup repository & React basic routing." },
              { day: 30, title: "Milestone 1", task: "Build the visual components layout." },
              { day: 60, title: "Milestone 2", task: "Integrate APIs and dummy data." },
              { day: 90, title: "Deploy", task: "Deploy the app to vercel and share." }
            ],
            jobs_analyzed: 20,
            jobs_source: "Local fallback",
            is_live: false,
            fetched_at: new Date().toISOString(),
            live_jobs: fallback.jobs
          },
          error: "Backend took too long or failed"
        }));
        analysisFinished = true;
        checkAndNavigate();
      }
    };
    
    const checkAndNavigate = () => {
      if (analysisFinished && sequenceFinished) {
        navigate('/results');
      }
    };

    runBackend();

    // Fake UI animation sequence to match backend timing (~5-10 seconds mock feel)
    const sequence = async () => {
      const wait = (ms) => new Promise(res => setTimeout(res, ms));
      
      setStepStatus(['active', 'pending', 'pending', 'pending']);
      await wait(1300);
      setStepStatus(['completed', 'active', 'pending', 'pending']);
      
      let jobIndex = 0;
      const jobInterval = setInterval(() => {
        if (jobIndex < defaultJobs.length) {
          setScannedJobs(prev => {
            const next = [defaultJobs[jobIndex], ...prev];
            if (next.length > 7) next.pop(); // keep only latest few for performance/look
            return next;
          });
          jobIndex++;
        }
      }, 350);

      await wait(1800);
      setStepStatus(['completed', 'completed', 'active', 'pending']);
      
      await wait(2200);
      setStepStatus(['completed', 'completed', 'completed', 'active']);
      
      await wait(1300);
      setStepStatus(['completed', 'completed', 'completed', 'completed']);
      clearInterval(jobInterval);
      
      await wait(900);
      sequenceFinished = true;
      checkAndNavigate();
    };
    
    sequence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col px-6 py-8 md:px-12 md:py-9 relative overflow-hidden font-sans">
      <div className="absolute -bottom-[30%] -left-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(232,100,42,0.12)_0%,transparent_60%)] pointer-events-none"></div>

      <header className="flex justify-between items-center relative z-10">
        <div className="inline-flex items-center gap-2.5 font-semibold text-[15px] tracking-[-0.015em] text-white">
          <span className="w-6 h-6 bg-orange rounded-[7px] relative inline-flex items-center justify-center shrink-0 before:content-[''] before:w-[9px] before:h-[9px] before:border-[1.6px] before:border-white before:rounded-full before:border-t-transparent before:border-r-transparent after:content-[''] after:absolute after:w-[3px] after:h-[3px] after:bg-white after:rounded-full after:top-[5px] after:right-[5px]"></span>
          PathFinder<span className="text-orange ml-[1px] font-medium">·AI</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-2 items-center">
            <span className="h-1 rounded-[2px] transition-all duration-300 bg-white/40 w-[26px]"></span>
            <span className="h-1 rounded-[2px] transition-all duration-300 bg-white/40 w-[26px]"></span>
            <span className="h-1 rounded-[2px] transition-all duration-300 bg-white/40 w-[26px]"></span>
            <span className="h-1 rounded-[2px] transition-all duration-300 bg-white/40 w-[26px]"></span>
            <span className="font-mono text-[11px] text-white/50 tracking-[0.06em] ml-2.5">
              {isEn ? "analysis running" : "analisis berjalan"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-14 max-w-[1240px] mx-auto w-full items-center py-9 relative z-10">
        <div>
          <div className="font-mono text-[11px] text-orange tracking-[0.16em] uppercase mb-[18px] inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-orange rounded-full flex shrink-0 relative animate-[signal_1.6s_ease-out_infinite] shadow-[0_0_0_0_rgba(232,100,42,0.6)]"></span>
            <style>{`@keyframes signal { 0% { box-shadow: 0 0 0 0 rgba(232,100,42,0.6); } 100% { box-shadow: 0 0 0 14px rgba(232,100,42,0); } }`}</style>
            {isEn ? "Pathy is working" : "Pathy sedang bekerja"}
          </div>
          <h1 className="text-[clamp(34px,4.8vw,62px)] font-medium tracking-tight leading-[1.04] m-0 mb-3.5 text-balance">
            {isEn ? (
              <>Hold on, {userName} — Pathy is plotting a realistic career trajectory for you.</>
            ) : (
              <>Bentar ya, {userName} — Pathy lagi susun gambaran karier yang masuk akal buat kamu.</>
            )}
          </h1>
          <p className="text-white/55 text-[16px] leading-relaxed m-0 mb-9 max-w-[480px]">
            {isEn ? (
              "Every metric in your results can be traced backward to active job postings. No guesses, no empty motivational speech."
            ) : (
              "Setiap angka di hasilmu nanti bisa kamu telusuri balik ke lowongan asli. Bukan tebakan, bukan motivasi kosong."
            )}
          </p>

          <div className="flex flex-col border-t border-white/10">
            {[
              { 
                id: 0, 
                text: isEn ? "Reading your background profile…" : "Membaca latar belakangmu…", 
                meta: isEn ? "4 replies · 1.2KB" : "4 jawaban · 1.2KB" 
              },
              { 
                id: 1, 
                text: isEn ? "Broadcasting live query via JobSpy Scraper Engine…" : "Mengambil lowongan live via JobSpy Scraper Engine…", 
                meta: "Indeed · LinkedIn · Glints" 
              },
              { 
                id: 2, 
                text: isEn ? "Matching profile against market-demand factors…" : "Mencocokkan profilmu dengan pasar kerja…", 
                meta: "embedding · cosine" 
              },
              { 
                id: 3, 
                text: isEn ? "Resolving highest-fit tech trajectories…" : "Menemukan role terbaik untukmu…", 
                meta: "ranking" 
              }
            ].map((step, idx) => {
              const status = stepStatus[idx];
              const isShown = status !== 'pending';
              const isLoading = status === 'active';
              return (
                <div key={idx} className={`py-4 px-1 flex items-center gap-4 border-b border-white/10 transition-all duration-500 ease-in-out ${isShown ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2'}`}>
                  <span className="font-mono text-[11px] text-white/40 w-[26px] tracking-[0.05em]">0{idx + 1}</span>
                  <span className={`w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center ${isLoading ? 'border-[1.5px] border-white/15 border-t-orange animate-spin ' : status === 'completed' ? 'bg-orange relative after:content-[\'\'] after:w-2 after:h-1 after:border-l-[1.5px] after:border-b-[1.5px] after:border-white after:-rotate-45 after:translate-x-[1px] after:-translate-y-[1px]' : 'border-[1.5px] border-white/15'}`}></span>
                  <span className={`flex-1 text-[16px] tracking-[-0.005em] ${isShown ? 'text-white' : 'text-white/50'}`}>{step.text}</span>
                  <span className="font-mono text-[11px] text-white/40 tracking-[0.04em] text-right min-w-[90px]">{step.meta}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="bg-white/5 border border-white/10 rounded-2xl p-5 px-[22px] relative w-full" aria-live="polite">
          <div className="flex justify-between items-center mb-4 pb-[14px] border-b border-dashed border-white/10">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange rounded-full animate-[pulse_1.6s_ease-in-out_infinite]"></span>
              {isEn ? "listings found · live" : "lowongan masuk · live"}
            </span>
            <span className="font-mono text-[12px] text-orange-2 tracking-[0.04em]">
              {isEn ? `${Math.min(scannedJobs.length * 3, 20)} / 20 reviewed` : `${Math.min(scannedJobs.length * 3, 20)} / 20 di-scan`}
            </span>
          </div>
          <div className="flex flex-col gap-0 h-[360px] overflow-hidden relative [mask-image:linear-gradient(180deg,transparent_0%,black_12%,black_80%,transparent_100%)]">
            {scannedJobs.map((j, i) => j && (
              <div key={i} className="py-[11px] border-b border-dashed border-white/5 grid grid-cols-[1fr_auto] gap-2 items-center animate-[fade-in-up_0.4s_ease-out_forwards]">
                <div>
                  <div className="text-[14px] text-white tracking-[-0.005em]">{j.role || ''}</div>
                  <div className="font-mono text-[10px] text-white/45 tracking-[0.04em] uppercase mt-[2px]">{j.co || ''}</div>
                </div>
                <div>
                  {j.tag ? (
                    <span className="font-mono text-[10px] tracking-[0.06em] uppercase px-[7px] py-[3px] rounded-full bg-[#E8642A]/15 text-orange-2 border border-[#E8642A]/30">MATCH</span>
                  ) : (
                    <span className="font-mono text-[10px] tracking-[0.06em] uppercase px-[7px] py-[3px] rounded-full bg-white/5 text-white/50 border border-white/10">SKIP</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="col-span-1 md:col-span-2 flex gap-3.5 items-center p-3.5 px-[18px] border border-white/10 rounded-xl bg-white/[0.02] text-white/55 text-[13px]">
          <span className="w-7 h-7 bg-[#E8642A]/15 text-orange-2 rounded-lg inline-flex items-center justify-center shrink-0">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          </span>
          <div>
            {isEn ? (
              <>
                <strong className="text-white font-medium mr-1">Privacy Guarantee:</strong> Your answers are never shared with third parties. Pathy only uses this context to rank matches. Once completed, you can wipe your session files anytime.
              </>
            ) : (
              <>
                <strong className="text-white font-medium mr-1">Privasi:</strong> jawabanmu tidak dikirim ke pihak ketiga. Pathy cuma butuh konteks untuk match — selesai analisis, kamu bisa hapus kapan saja.
              </>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
