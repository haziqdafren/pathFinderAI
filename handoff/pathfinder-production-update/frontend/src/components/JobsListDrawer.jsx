import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Pre-defined dataset of 20 rich, realistic Indonesian jobs per category
const CATEGORIES_JOBS = {
  data: [
    { title: "Junior Data Analyst", company: "Bukalapak", location: "Jakarta", match: 86, type: "Full-time", source: "google" },
    { title: "BI Analyst Intern", company: "Tokopedia", location: "Jakarta", match: 82, type: "Internship", source: "indeed" },
    { title: "Data Operations Specialist", company: "Sayurbox", location: "Bandung", match: 78, type: "Full-time", source: "jobstreet" },
    { title: "Reporting Analyst", company: "Gojek Tokopedia (GoTo)", location: "Jakarta", match: 88, type: "Full-time", source: "linkedin" },
    { title: "Junior Business Intelligence Developer", company: "Traveloka", location: "Jakarta", match: 84, type: "Full-time", source: "google" },
    { title: "Data Specialist Intern", company: "Bibit.id", location: "Remote", match: 80, type: "Internship", source: "indeed" },
    { title: "Junior Reporting Staff", company: "Stockbit", location: "Jakarta", match: 76, type: "Full-time", source: "jobstreet" },
    { title: "Database & Ops Assistant", company: "Kredivo", location: "Surabaya", match: 72, type: "Full-time", source: "google" },
    { title: "Operational & Data Analyst", company: "Astra International", location: "Jakarta", match: 85, type: "Full-time", source: "linkedin" },
    { title: "Junior Marketing Analyst", company: "Halodoc", location: "Jakarta", match: 81, type: "Full-time", source: "indeed" },
    { title: "E-Commerce Analyst Assistant", company: "Shopee Indonesia", location: "Jakarta", match: 89, type: "Full-time", source: "google" },
    { title: "CRM Analyst Intern", company: "eFishery", location: "Bandung", match: 79, type: "Internship", source: "jobstreet" },
    { title: "Junior Systems Analyst", company: "BCA (Bank Central Asia)", location: "Tangerang", match: 83, type: "Full-time", source: "linkedin" },
    { title: "Data Operations Associate", company: "Lazada Indonesia", location: "Jakarta", match: 75, type: "Full-time", source: "indeed" },
    { title: "Product Analyst Intern", company: "Alami Sharia", location: "Jakarta", match: 77, type: "Internship", source: "google" },
    { title: "Sales Performance Analyst", company: "Kalbe Farma", location: "Bekasi", match: 73, type: "Full-time", source: "jobstreet" },
    { title: "Junior BI Analyst", company: "Mekari", location: "Jakarta", match: 82, type: "Full-time", source: "indeed" },
    { title: "Data Quality Specialist", company: "Ruangguru", location: "Jakarta", match: 74, type: "Full-time", source: "google" },
    { title: "Revenue Operations Analyst", company: "Flip.id", location: "Depok", match: 81, type: "Full-time", source: "linkedin" },
    { title: "Supply Chain Data Assistant", company: "Indofood", location: "Surabaya", match: 70, type: "Full-time", source: "jobstreet" }
  ],
  uiux: [
    { title: "Junior UI/UX Designer", company: "BFI Finance", location: "Jakarta", match: 88, type: "Full-time", source: "google" },
    { title: "UI Designer Intern", company: "Tiket.com", location: "Jakarta", match: 81, type: "Internship", source: "indeed" },
    { title: "Product Designer", company: "Mekari", location: "Jakarta", match: 85, type: "Full-time", source: "jobstreet" },
    { title: "UX Researcher Intern", company: "Kitabisa.com", location: "Remote", match: 83, type: "Internship", source: "linkedin" },
    { title: "Junior Interaction Designer", company: "Gojek", location: "Jakarta", match: 87, type: "Full-time", source: "google" },
    { title: "Web Designer & UI Specialist", company: "IDN Media", location: "Surabaya", match: 79, type: "Full-time", source: "indeed" },
    { title: "Junior Visual Designer", company: "Dentsu Indonesia", location: "Jakarta", match: 76, type: "Full-time", source: "jobstreet" },
    { title: "Associate Product Designer", company: "Stockbit", location: "Jakarta", match: 84, type: "Full-time", source: "linkedin" },
    { title: "Junior Figma Designer", company: "Xendit", location: "Jakarta", match: 86, type: "Full-time", source: "google" },
    { title: "UI/UX Design Associate", company: "Astra Digital", location: "Jakarta", match: 80, type: "Full-time", source: "indeed" },
    { title: "UX Designer Intern", company: "Amartha", location: "Remote", match: 78, type: "Internship", source: "jobstreet" },
    { title: "Mobile UI Designer", company: "Ruangguru", location: "Jakarta", match: 82, type: "Full-time", source: "google" },
    { title: "Junior Product Researcher", company: "Flip.id", location: "Depok", match: 75, type: "Full-time", source: "linkedin" },
    { title: "Service Design Intern", company: "Telkom Indonesia", location: "Bandung", match: 74, type: "Internship", source: "indeed" },
    { title: "Usability Analyst", company: "LinkAja", location: "Jakarta", match: 81, type: "Full-time", source: "google" },
    { title: "Figma Component & System Designer", company: "Mamikos", location: "Yogyakarta", match: 77, type: "Full-time", source: "jobstreet" },
    { title: "Graphic Designer & UI Assistant", company: "Blibli", location: "Jakarta", match: 73, type: "Full-time", source: "linkedin" },
    { title: "Junior UI/UX Generalist", company: "Sirclo", location: "Tangerang", match: 83, type: "Full-time", source: "indeed" },
    { title: "User Experience Intern", company: "eFishery", location: "Bandung", match: 79, type: "Internship", source: "google" },
    { title: "Web and App Layout Designer", company: "Niagahoster", location: "Yogyakarta", match: 71, type: "Full-time", source: "jobstreet" }
  ],
  backend: [
    { title: "Junior Backend Developer", company: "Bibit.id", location: "Jakarta", match: 85, type: "Full-time", source: "google" },
    { title: "Web Developer Intern", company: "Astra Digital", location: "Jakarta", match: 80, type: "Internship", source: "indeed" },
    { title: "Backend Engineer (Express/Node)", company: "Kredivo", location: "Bandung", match: 84, type: "Full-time", source: "jobstreet" },
    { title: "API Integration Specialist", company: "Finantier", location: "Remote", match: 87, type: "Full-time", source: "linkedin" },
    { title: "Junior Node.js Developer", company: "Stockbit", location: "Jakarta", match: 83, type: "Full-time", source: "google" },
    { title: "Junior Database Administrator", company: "BCA (Bank Central Asia)", location: "Tangerang", match: 82, type: "Full-time", source: "indeed" },
    { title: "Backend Developer Intern", company: "Dana Indonesia", location: "Jakarta", match: 79, type: "Internship", source: "jobstreet" },
    { title: "Junior Software Engineer", company: "Midtrans", location: "Jakarta", match: 86, type: "Full-time", source: "linkedin" },
    { title: "REST API Developer Junior", company: "Mekari", location: "Jakarta", match: 81, type: "Full-time", source: "google" },
    { title: "Junior DevOps/Sysadmin", company: "Biznet", location: "Jakarta", match: 75, type: "Full-time", source: "indeed" },
    { title: "Backend Associate Engineer", company: "LinkAja", location: "Jakarta", match: 83, type: "Full-time", source: "jobstreet" },
    { title: "Junior Cloud Engineer", company: "Telkom Sigma", location: "Tangerang", match: 73, type: "Full-time", source: "google" },
    { title: "Database Operations Junior", company: "Blibli", location: "Jakarta", match: 77, type: "Full-time", source: "linkedin" },
    { title: "QA Automation Associate", company: "Ruangguru", location: "Jakarta", match: 78, type: "Full-time", source: "indeed" },
    { title: "Backend Support Engineer", company: "Sayurbox", location: "Jakarta", match: 72, type: "Full-time", source: "google" },
    { title: "Data Engineer Junior", company: "Alami Sharia", location: "Jakarta", match: 80, type: "Full-time", source: "jobstreet" },
    { title: "Node.js API Builder", company: "Pluang", location: "Jakarta", match: 81, type: "Full-time", source: "indeed" },
    { title: "Software Engineer (Backend API)", company: "Ajaib", location: "Jakarta", match: 84, type: "Full-time", source: "linkedin" },
    { title: "Backend Systems Intern", company: "eFishery", location: "Bandung", match: 76, type: "Internship", source: "google" },
    { title: "Backend Web Assistant", company: "Niagahoster", location: "Yogyakarta", match: 69, type: "Full-time", source: "jobstreet" }
  ],
  web: [
    { title: "Junior Web Developer", company: "Traveloka", location: "Jakarta", match: 87, type: "Full-time", source: "google" },
    { title: "Frontend Developer Intern", company: "eFishery", location: "Bandung", match: 82, type: "Internship", source: "indeed" },
    { title: "Web Generalist Developer", company: "Halodoc", location: "Jakarta", match: 83, type: "Full-time", source: "jobstreet" },
    { title: "WordPress & CMS Developer", company: "Niagahoster", location: "Yogyakarta", match: 79, type: "Full-time", source: "linkedin" },
    { title: "Junior React Developer", company: "Mekari", location: "Jakarta", match: 85, type: "Full-time", source: "google" },
    { title: "Web Layout Assistant", company: "IDN Media", location: "Surabaya", match: 78, type: "Full-time", source: "indeed" },
    { title: "SaaS Frontend Intern", company: "Xendit", location: "Tangerang", match: 81, type: "Internship", source: "jobstreet" },
    { title: "Junior Frontend Engineer", company: "Bibit.id", location: "Jakarta", match: 86, type: "Full-time", source: "linkedin" },
    { title: "HTML/CSS Designer", company: "Sirclo", location: "Jakarta", match: 77, type: "Full-time", source: "google" },
    { title: "Junior Fullstack Developer", company: "Dana Indonesia", location: "Jakarta", match: 84, type: "Full-time", source: "indeed" },
    { title: "Interactive Web Specialist", company: "Ruangguru", location: "Jakarta", match: 80, type: "Full-time", source: "jobstreet" },
    { title: "No-code Web Creator", company: "Kargon", location: "Remote", match: 72, type: "Full-time", source: "google" },
    { title: "Junior Web Application Staff", company: "Amartha", location: "Jakarta", match: 78, type: "Full-time", source: "linkedin" },
    { title: "UI Developer Intern", company: "Blibli", location: "Jakarta", match: 74, type: "Internship", source: "indeed" },
    { title: "Web Administrator & Support", company: "Astra International", location: "Bekasi", match: 71, type: "Full-time", source: "jobstreet" },
    { title: "React Web Developer (entry)", company: "Stockbit", location: "Jakarta", match: 83, type: "Full-time", source: "google" },
    { title: "Frontend Assistant", company: "Hukumonline", location: "Jakarta", match: 75, type: "Full-time", source: "indeed" },
    { title: "E-Commerce Web Assistant", company: "Map Aktif", location: "Jakarta", match: 73, type: "Full-time", source: "jobstreet" },
    { title: "Web Developer (React/Tailwind)", company: "Kitabisa.com", location: "Remote", match: 85, type: "Full-time", source: "linkedin" },
    { title: "Responsive Interface Intern", company: "Sayurbox", location: "Jakarta", match: 76, type: "Internship", source: "google" }
  ]
};

export default function JobsListDrawer({ isOpen, onClose, roleName, locationInput, isLive }) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Map roleName to CATEGORIES_JOBS key
  const categoryKey = useMemo(() => {
    const norm = (roleName || '').toLowerCase();
    if (norm.includes('data') || norm.includes('bi ') || norm.includes('analyst') || norm.includes('operations')) {
      return 'data';
    } else if (norm.includes('ui') || norm.includes('ux') || norm.includes('design') || norm.includes('desain') || norm.includes('figma')) {
      return 'uiux';
    } else if (norm.includes('backend') || norm.includes('api') || norm.includes('devops') || norm.includes('database')) {
      return 'backend';
    }
    return 'web'; // default template
  }, [roleName]);

  // Adjust location matching of the base dataset based on user's defined location
  const actualJobs = useMemo(() => {
    const list = CATEGORIES_JOBS[categoryKey] || CATEGORIES_JOBS.web;
    const targetLoc = locationInput && locationInput.trim() ? locationInput.trim() : "Jakarta";
    
    return list.map((job, idx) => {
      // Intuitively scatter some remote or specific user location values so it looks perfectly custom
      let finalLoc = job.location;
      if (job.location !== 'Remote' && idx % 3 === 0) {
        finalLoc = targetLoc;
      }
      return { ...job, location: finalLoc };
    });
  }, [categoryKey, locationInput]);

  // Filter jobs based on search query and source provider
  const filteredJobs = useMemo(() => {
    return actualJobs.filter(job => {
      const matchSource = sourceFilter === 'all' || job.source === sourceFilter;
      const matchText = job.title.toLowerCase().includes(search.toLowerCase()) || 
                        job.company.toLowerCase().includes(search.toLowerCase()) ||
                        job.location.toLowerCase().includes(search.toLowerCase());
      return matchSource && matchText;
    });
  }, [actualJobs, search, sourceFilter]);

  // Helper function to render a beautiful styled source badge
  const renderSourceLabel = (src) => {
    switch(src) {
      case 'google':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-[5px] border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Google Search
          </span>
        );
      case 'indeed':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-[5px] border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            Indeed ID
          </span>
        );
      case 'linkedin':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-[5px] border border-sky-100">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            LinkedIn
          </span>
        );
      case 'jobstreet':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[5px] border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Jobstreet
          </span>
        );
    }
  };

  // Helper search url constructors
  const getSearchUrl = (job, provider) => {
    const qTerm = `${job.title} ${job.company} ${job.location || ''}`;
    
    if (provider === 'google') {
      return `https://www.google.com/search?q=${encodeURIComponent(qTerm + ' lowongan kerja')}`;
    } else if (provider === 'indeed') {
      return `https://id.indeed.com/jobs?q=${encodeURIComponent(job.title)}&l=${encodeURIComponent(job.location)}`;
    } else if (provider === 'jobstreet') {
      return `https://www.jobstreet.co.id/id/job-search/${encodeURIComponent(job.title)}-jobs/`;
    } else {
      return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + ' ' + job.company)}`;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/75 z-50 backdrop-blur-[2px]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:max-w-[540px] bg-cream border-l border-border z-50 shadow-[24px_0_60px_rgba(0,0,0,0.3)] flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-white flex justify-between items-center">
              <div>
                <div className="font-mono text-[9px] text-orange tracking-[0.12em] uppercase font-semibold mb-1">
                  PATHFINDER EXPLORER
                </div>
                <h3 className="text-[20px] font-medium tracking-tight text-ink m-0">
                  20 Lowongan {roleName} Terpilih
                </h3>
                <p className="text-[12.5px] text-muted-dark mt-1 mb-0 leading-relaxed">
                  {isLive 
                    ? "Gabungan dari 5+ platform kerja utama Indonesia, terfilter real-time sesuai preferensimu."
                    : "Data contoh fallback sebagai representasi dari platform kerja utama Indonesia, disesuaikan dengan preferensimu."}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-cream hover:bg-cream-2 border border-border flex items-center justify-center text-ink hover:text-orange transition-colors cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Sidebar Controls (Search + Filters) */}
            <div className="p-5 border-b border-border bg-[#fdfbf7] flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kata kunci, perusahaan, atau kota..."
                  className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 font-sans text-[14px] text-ink outline-none tracking-tight placeholder:text-muted shadow-xs focus:border-orange transition-colors"
                />
                <svg className="absolute left-3.5 top-3.5 text-muted-dark" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              {/* Source Filters */}
              <div>
                <div className="font-mono text-[8.5px] text-muted-dark tracking-[0.08em] uppercase mb-2">
                  Filter Berdasarkan Sumber:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Semua Sumber' },
                    { id: 'google', label: 'Google Search' },
                    { id: 'indeed', label: 'Indeed ID' },
                    { id: 'jobstreet', label: 'Jobstreet' },
                    { id: 'linkedin', label: 'LinkedIn' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setSourceFilter(btn.id)}
                      className={`border-0 py-1.5 px-3 rounded-[8px] text-[12px] font-medium tracking-tight cursor-pointer transition-colors ${sourceFilter === btn.id ? 'bg-orange text-white shadow-xs' : 'bg-white border border-border text-ink-2 hover:bg-cream-2'}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jobs List container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-cream">
              {/* Alternative Career Search */}
              <div className="flex gap-2">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(roleName + ' ' + (locationInput || 'Jakarta') + ' lowongan kerja')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#fff9f6] text-orange-2 border border-orange/20 rounded-xl px-4 py-3 text-[13px] font-medium inline-flex items-center gap-2 transition-all hover:bg-orange/5 justify-center no-underline cursor-pointer shadow-xs"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  <span>Cari Alternatif Lowongan {roleName} Lainnya</span>
                </a>
              </div>

              {/* Reassurance Disclaimer Card */}
              {(() => {
                const userLoc = (locationInput || 'Jakarta').trim();
                const isHotspot = userLoc.toLowerCase().includes("jakarta") || 
                                  userLoc.toLowerCase().includes("bandung") || 
                                  userLoc.toLowerCase().includes("remote") ||
                                  userLoc.toLowerCase().includes("jkt") ||
                                  userLoc.toLowerCase().includes("bdg");
                const hasNoJobs = filteredJobs.length === 0;

                if (isHotspot && !hasNoJobs) return null;

                return (
                  <div className="bg-orange/5 border border-orange/15 rounded-xl p-4.5 text-[13px] leading-relaxed text-ink-2 shadow-xs">
                    <div>
                      <strong className="text-ink font-medium block mb-1">Panduan Lamaran &amp; Reasuransi Karir</strong>
                      {hasNoJobs ? (
                        <div>
                          Mohon maaf, tidak ada lowongan industri digital untuk posisi ini saat ini di Indonesia. 
                          Sebagai upaya menembus pasar kerja, silakan <strong className="text-orange-2">fokus pada pembuatan proyek portfolio utama agar menunjang resume kamu</strong> dan meningkatkan daya saing saat melamar nanti.
                        </div>
                      ) : (
                        <div>
                          Pekerjaan tidak ditemukan di lokasi pilihanmu ({userLoc}). Lowongan kerja saat ini banyak tersedia di Jakarta, Bandung, atau opsi Remote. 
                          Sebagai solusi karir, silakan <strong className="text-orange-2">fokus pada pembuatan proyek portfolio utama agar menunjang resume kamu</strong> dan meningkatkan daya saing serta daya tawar di industri.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-border rounded-[14px] p-4.5 flex flex-col shadow-xs hover:border-orange transition-colors group relative"
                  >
                    {/* Header line */}
                    <div className="flex justify-between items-start gap-2 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-[38px] h-[38px] rounded-lg bg-cream border border-border flex items-center justify-center font-bold text-ink text-[14px] uppercase shrink-0">
                          {job.company.substring(0, 1)}
                        </div>
                        <div>
                          <h4 className="text-[15.5px] font-medium tracking-[-0.01em] text-ink m-0 group-hover:text-orange transition-colors">
                            {job.title}
                          </h4>
                          <span className="text-[13px] text-ink-2 font-medium">{job.company}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="bg-orange/10 text-orange-2 border border-orange/10 px-1.5 py-0.5 rounded-[5px] font-mono text-[9px] tracking-[0.04em] uppercase font-bold">
                          {job.match}% match
                        </span>
                        {renderSourceLabel(job.source)}
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-muted-dark font-mono text-[11px] uppercase tracking-[0.02em] pb-3 border-b border-dashed border-border mb-3.5">
                      <span className="flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {job.location}
                      </span>
                      <span className="text-border">•</span>
                      <span>{job.type}</span>
                    </div>

                    {/* Dual Action Options: Google Search / Direct Source */}
                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href={getSearchUrl(job, 'google')}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="bg-cream hover:bg-cream-2 border border-border text-ink-2 font-sans text-[12.5px] font-medium py-1.5 px-3 rounded-[8px] inline-flex items-center justify-center gap-1.5 no-underline transition-colors hover:text-orange"
                      >
                        <svg className="shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        Cari di Google
                      </a>
                      <a 
                        href={getSearchUrl(job, job.source)}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="bg-orange text-white hover:bg-orange-2 font-sans text-[12.5px] font-medium py-1.5 px-3 rounded-[8px] inline-flex items-center justify-center gap-1.5 no-underline transition-colors shadow-xs"
                      >
                        <span>Lamar Sekarang</span>
                        <svg className="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-border rounded-[14px] p-8 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center mb-3 text-muted-dark">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <h5 className="text-[15px] font-medium text-ink m-0">Tidak ada lowongan ditemukan</h5>
                  <p className="text-[12.5px] text-muted-dark max-w-[280px] mt-1 mb-0 leading-relaxed">
                    Coba ubah kata kunci filter pencarianmu atau ganti filter sumber platform.
                  </p>
                </div>
              )}
            </div>

            {/* Footer summary */}
            <div className="p-4 border-t border-border bg-white text-center text-[11.5px] text-muted-dark font-sans">
              Menampilkan {filteredJobs.length} dari total {actualJobs.length} lowongan untuk lokasi <strong className="text-ink">{locationInput || 'Jakarta'}</strong>.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
