import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('pref_lang') || 'id');

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('pref_lang', newLang);
  };

  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col px-6 py-8 md:px-12 md:py-9 relative overflow-hidden font-sans">
      <div className="absolute -top-[30%] -right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(232,100,42,0.10)_0%,transparent_60%)] pointer-events-none"></div>
      
      <header className="flex justify-between items-center relative z-10 w-full">
        <div className="inline-flex items-center gap-2.5 font-semibold text-[15px] tracking-[-0.015em] text-white">
          <span className="w-6 h-6 bg-orange rounded-[7px] relative inline-flex items-center justify-center shrink-0 before:content-[''] before:w-[9px] before:h-[9px] before:border-[1.6px] before:border-white before:rounded-full before:border-t-transparent before:border-r-transparent after:content-[''] after:absolute after:w-[3px] after:h-[3px] after:bg-white after:rounded-full after:top-[5px] after:right-[5px]"></span>
          PathFinder<span className="text-orange ml-[1px] font-medium">·AI</span>
        </div>

        {/* Dynamic Compact Language Toggle */}
        <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-[10px] font-mono uppercase tracking-[0.05em] h-7 items-center">
          <button 
            type="button"
            onClick={() => changeLang('id')} 
            className={`px-2.5 h-full rounded-md transition-all font-semibold ${!isEn ? 'bg-orange text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
          >
            ID
          </button>
          <button 
            type="button"
            onClick={() => changeLang('en')} 
            className={`px-2.5 h-full rounded-md transition-all font-semibold ${isEn ? 'bg-orange text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
          >
            EN
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-[720px] mx-auto w-full py-12 relative z-10">
        <div className="flex items-center gap-2.5 mb-[22px]">
          <span className="w-7 h-7 rounded-full bg-orange inline-flex items-center justify-center text-white font-semibold text-[11px] relative after:content-[''] after:absolute after:-bottom-[1px] after:-right-[1px] after:w-[7px] after:h-[7px] after:bg-[#4ade80] after:rounded-full after:border-[1.5px] after:border-ink resize-none">
            P
          </span>
          <span className="text-[13px] text-white/60">
            {isEn ? (
              <>
                <strong className="text-white font-medium">Pathy</strong> is ready to guide your IT career path.
              </>
            ) : (
              <>
                <strong className="text-white font-medium">Pathy</strong> siap ngebantu nentuin karier IT kamu.
              </>
            )}
          </span>
        </div>

        <h1 className="text-[clamp(34px,4.8vw,62px)] leading-[1.04] font-medium tracking-tight mb-5 text-white text-balance">
          {isEn ? (
            <>
              Mapping your profile to the most <span className="text-orange font-medium">viable IT jobs.</span>
            </>
          ) : (
            <>
              Mapping profilmu ke peluang kerja IT yang <span className="text-orange font-medium">paling masuk akal.</span>
            </>
          )}
        </h1>
        <p className="text-white/55 text-[16px] leading-[1.7] mb-10 max-w-[540px]">
          {isEn ? (
            "Pathy will analyze your background, find reachable roles based on matched market data, and give concrete guidance with an exact targeted portfolio project."
          ) : (
            "Pathy akan bantu mengurai latar belakangmu, temukan role yang reachable berdasarkan kecocokan data pasar, dan berikan panduan konkret lewat satu proyek portfolio yang tepat sasaran."
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5">
          <button 
            onClick={() => navigate('/conversation')}
            className="bg-orange text-white border-0 px-6 py-[16px] rounded-xl inline-flex flex-col items-start gap-1 transition-all hover:bg-orange-2 active:scale-[0.98] text-left w-full sm:w-[280px] cursor-pointer"
          >
            <span className="font-medium text-[15px] tracking-[-0.005em] flex items-center justify-between w-full">
              {isEn ? "Start New Analysis" : "Mulai Analisis Baru"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="font-mono text-white/80 text-[10px] tracking-[0.04em] uppercase">
              {isEn ? "Chat time ± 2 mins" : "Obrolan ± 2 menit"}
            </span>
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="bg-transparent border border-white/10 text-white px-6 py-[16px] rounded-xl inline-flex flex-col items-start gap-1 transition-all hover:bg-white/5 hover:border-white/20 active:scale-[0.98] text-left w-full sm:w-[280px] cursor-pointer"
          >
            <span className="font-medium text-[15px] tracking-[-0.005em]">
              {isEn ? "Resume Session / Login" : "Lanjut Sesi / Masuk"}
            </span>
            <span className="font-mono text-white/50 text-[10px] tracking-[0.04em] uppercase">
              {isEn ? "View latest recommendations" : "Lihat rekomendasi terakhir"}
            </span>
          </button>
        </div>
      </main>

      <footer className="relative z-10 mt-auto pt-6 border-t border-white/10 flex justify-between items-center text-[11px] font-mono tracking-[0.04em] text-white/40 uppercase">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange"></span> 
            {isEn ? "Powered by JobSpy Engine" : "Didukung oleh JobSpy Engine"}
          </span>
          <span className="hidden sm:inline">
            {isEn ? "100+ Tech Roles Indexed" : "100+ Karir Tech Terindeks"}
          </span>
        </div>
        <span>PathFinder AI © 2026</span>
      </footer>
    </div>
  );
}
