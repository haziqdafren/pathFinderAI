import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import GmailShareModal from './GmailShareModal';

export default function SaveSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [userName, setUserName] = useState('Teman');
  const [projectName, setProjectName] = useState('dashboard warung kopi');
  const [email, setEmail] = useState('');
  const [showGmailShare, setShowGmailShare] = useState(false);

  const lang = localStorage.getItem('pref_lang') || 'id';
  const isEn = lang === 'en';

  const isLoggedIn = sessionStorage.getItem('logged_in') === 'true' || localStorage.getItem('pathy_logged_in') === 'true';

  useEffect(() => {
    const openSheet = () => {
      setIsOpen(true);
      try {
        const session = JSON.parse(sessionStorage.getItem('pathfinder_session'));
        if (session && session.results) {
          setSessionData(session.results);
          if (session.results.user_name) {
            setUserName(session.results.user_name);
          }
          if (session.results.project && session.results.project.name) {
            setProjectName(session.results.project.name);
          }
        } else {
          const answersData = JSON.parse(sessionStorage.getItem('pathfinder_answers') || '[""]');
          if (answersData[0]) {
            setUserName(answersData[0].trim());
          } else {
            setUserName(isEn ? 'Friend' : 'Teman');
          }
        }
      } catch (err) {
        console.error("Error reading session on open:", err);
      }
    };
    
    window.addEventListener('open-save-sheet', openSheet);
    
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { supabase, syncSessionDataToSupabase } = await import('../utils/supabase');
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            sessionStorage.setItem('logged_in', 'true');
            // Re-read current sessionData
            const currentStr = sessionStorage.getItem('pathfinder_session');
            if (currentStr) {
               try {
                 const parsed = JSON.parse(currentStr);
                 if (parsed.results) {
                   await syncSessionDataToSupabase(parsed.results);
                 }
               } catch (e) {}
            }
            toast.success(isEn ? "Successfully signed in via Google & synced data!" : "Berhasil masuk via Google & sinkronisasi data!");
            closeSheet();
            setTimeout(() => {
              window.location.reload();
            }, 600);
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('open-save-sheet', openSheet);
      window.removeEventListener('message', handleMessage);
    };
  }, [isEn]);

  const closeSheet = () => setIsOpen(false);

  const handleDismissAndGuest = () => {
    closeSheet();
    toast.success(isEn ? "Entered as Guest! Your progress is active for 24 hours." : "Masuk sebagai Tamu! Kemajuan Anda aktif selama 24 jam.");
  };

  const handleGoogleSubmit = async () => {
    try {
      const { isAuthBypassEnabled, supabase, syncSessionDataToSupabase } = await import('../utils/supabase');
      if (!supabase) {
        toast.error(isEn ? "Authentication is not configured in this deployment yet." : "Autentikasi belum dikonfigurasi di deployment ini.");
        return;
      }
      
      if (isAuthBypassEnabled) {
        sessionStorage.setItem('logged_in', 'true');
        localStorage.setItem('pathy_logged_in', 'true');
        localStorage.setItem('pathy_user_name', userName || (isEn ? 'Guest' : 'Tamu'));
        localStorage.setItem('pathy_user_email', 'guest@pathfinder.com');
        localStorage.setItem('pathy_shuffles_left', '3');
        if (sessionData) await syncSessionDataToSupabase(sessionData);
        toast.success(isEn ? "Successfully signed in with Google (Virtual Mode)!" : "Berhasil masuk dengan Google (Virtual Mode)!");
        closeSheet();
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;

      if (data?.url) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        
        const popup = window.open(
          data.url,
          'google_login_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );
        if (!popup) {
          toast.error(isEn ? "Popup blocked by browser. Please enable/permit popups to complete login." : "Popup terblokir oleh browser. Harap aktifkan/ijinkan popup untuk melakukan login.");
        }
      } else {
        throw new Error(isEn ? "Failed to obtain Google authentication URL." : "Gagal memperoleh URL autentikasi Google.");
      }
    } catch (err) {
      console.error(err);
      toast.error((isEn ? 'Login failed: ' : 'Login gagal: ') + err.message);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const { isAuthBypassEnabled, supabase, syncSessionDataToSupabase } = await import('../utils/supabase');
      if (!supabase) {
        toast.error(isEn ? "Authentication is not configured in this deployment yet." : "Autentikasi belum dikonfigurasi di deployment ini.");
        return;
      }
      
      if (isAuthBypassEnabled) {
        sessionStorage.setItem('logged_in', 'true');
        localStorage.setItem('pathy_logged_in', 'true');
        localStorage.setItem('pathy_user_email', email);
        const namePart = email.split('@')[0];
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        localStorage.setItem('pathy_user_name', capitalized);
        localStorage.setItem('pathy_shuffles_left', '3');
        if (sessionData) await syncSessionDataToSupabase(sessionData);
        
        toast.success(isEn ? `Successfully signed in as ${email} (Virtual Mode)!` : `Berhasil masuk sebagai ${email} (Virtual Mode)!`);
        closeSheet();
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
      
      localStorage.setItem('pathfinder_session_transfer', sessionStorage.getItem('pathfinder_session') || '{}');
      localStorage.setItem('pathy_shuffles_left', '3');
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        }
      });
      if (error) throw error;
      toast.success(isEn ? `Magic link successfully sent to ${email}!` : `Magic link berhasil dikirim ke ${email}!`);
      closeSheet();
    } catch (err) {
      console.error(err);
      toast.error((isEn ? 'Failed to send email: ' : 'Gagal mengirim email: ') + err.message);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#111110]/55 backdrop-blur-[4px] z-[200] transition-opacity duration-250 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSheet}
      ></div>
      
      <aside 
        className={`fixed bottom-0 left-0 right-0 bg-card z-[201] transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-t-[24px] shadow-[0_-20px_60px_rgba(0,0,0,0.18)] max-h-[92vh] overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="max-w-[1000px] mx-auto pt-[14px] px-8 pb-8 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-10 items-stretch font-sans">
          <div className="w-11 h-[5px] bg-border rounded-full mx-auto mb-[22px] col-span-1 md:col-span-2"></div>

          <div className="py-2">
            <button 
              onClick={handleDismissAndGuest}
              className="font-mono text-[11px] text-orange tracking-[0.14em] uppercase mb-3.5 inline-flex items-center gap-2 bg-orange/10 hover:bg-orange/20 border border-orange/15 px-3 py-1.5 rounded-full text-left transition-all cursor-pointer font-bold"
            >
              <span className="w-1.5 h-1.5 bg-orange rounded-full animate-pulse"></span>
              {isEn ? "optional • continue as guest" : "opsional · selesai dulu pakai tanpa akun"}
            </button>
            <h2 className="text-[clamp(28px,3vw,38px)] font-bold tracking-tight leading-[1.1] m-0 mb-3.5 text-balance text-ink">
              {isEn ? `Save your results, ${userName} — so Pathy remembers you.` : `Simpan hasilmu, ${userName} — biar Pathy ingat kamu.`}
            </h2>
            <p className="text-ink-2 text-[15px] leading-relaxed m-0 mb-[22px] max-w-[440px]">
              {isEn ? "You’ve shared a lot with Pathy. Save now so you don't start from scratch next week — and Pathy can track your progress as the job market continuously evolves." : "Kamu udah cerita banyak ke Pathy. Simpan sekarang biar minggu depan kamu nggak mulai dari nol — dan Pathy bisa lacak progress kamu sambil pasar kerja terus berubah."}
            </p>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex items-start gap-3 text-[14px] leading-relaxed text-ink-2">
                <span className="w-[22px] h-[22px] bg-orange-soft rounded-full inline-flex items-center justify-center shrink-0 text-orange relative top-1 font-bold text-[11px]">✓</span>
                <span>
                  {isEn ? (
                    <><strong>Resume conversations</strong> anytime. Pathy won’t lose your alignment – including your <span className="text-orange font-medium">{projectName}</span> project.</>
                  ) : (
                    <><strong>Lanjut percakapan</strong> kapanpun. Pathy nggak akan lupa konteks kamu — termasuk proyek <span className="text-orange font-medium">{projectName}</span>.</>
                  )}
                </span>
              </div>
              <div className="flex items-start gap-3 text-[14px] leading-relaxed text-ink-2">
                <span className="w-[22px] h-[22px] bg-orange-soft rounded-full inline-flex items-center justify-center shrink-0 text-orange relative top-1 font-bold text-[11px]">✓</span>
                <span>
                  {isEn ? (
                    <><strong>Weekly alerts</strong> when matching roles open (you are in control — unsubscribe anytime).</>
                  ) : (
                    <><strong>Notifikasi mingguan</strong> jika lowongan baru rilis (kamu kontrol — bisa dimatikan kpn saja).</>
                  )}
                </span>
              </div>
              <div className="flex items-start gap-3 text-[14px] leading-relaxed text-ink-2">
                <span className="w-[22px] h-[22px] bg-orange-soft rounded-full inline-flex items-center justify-center shrink-0 text-orange relative top-1 font-bold text-[11px]">✓</span>
                <span>
                  {isEn ? (
                    <><strong>Project progress tracker</strong> — check off completed skills and watch your real readiness index rise.</>
                  ) : (
                    <><strong>Tracker progress proyek</strong> — centang skill yang sudah kamu tutup, lihat readiness score-mu naik beneran.</>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-cream border border-border rounded-2xl p-6 flex flex-col justify-center">
            {isLoggedIn ? (
              <div className="text-center py-6 px-4 bg-white border border-green-200 rounded-2xl shadow-sm text-ink flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-[#4ade80]/15 text-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold tracking-tight text-ink m-0 mb-1">
                  {isEn ? "Onboarding Synced!" : "Onboarding Tersinkron!"}
                </h3>
                <p className="text-[12.5px] text-muted-dark leading-relaxed m-0 mb-5 max-w-[320px]">
                  {isEn ? "Your session has been securely matched and saved. Your learning path progress will be safely preserved." : "Sesi kamu sudah berhasil terhubung dan tersimpan dengan aman di database. Progres belajarmu akan terus terjaga."}
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={() => {
                      closeSheet();
                      setShowGmailShare(true);
                    }}
                    className="bg-orange text-white border-0 rounded-xl px-4 py-3 text-[13.5px] font-bold tracking-tight text-center hover:bg-orange-2 transition-colors cursor-pointer w-full flex items-center justify-center gap-2"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {isEn ? "Send Report via Gmail" : "Kirim Laporan via Gmail"}
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const { signOutPathfinder } = await import('../utils/supabase');
                        await signOutPathfinder();
                      } catch(e) {}
                      toast.success(isEn ? "Successfully logged out from account session." : "Berhasil keluar dari sesi akun.");
                      closeSheet();
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    }}
                    className="bg-white border border-border text-red-500 rounded-xl px-4 py-2 text-[12.5px] font-bold tracking-tight text-center hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer w-full"
                  >
                    {isEn ? "Log Out of Session" : "Keluar Sesi Akun"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Best recommendation via Gmail option */}
                <div className="bg-white border border-orange/40 rounded-xl p-4 flex flex-col mb-5 shadow-sm">
                  <div className="font-mono text-[9px] text-orange tracking-[0.14em] uppercase font-bold mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-orange rounded-full animate-pulse"></span>
                    {isEn ? "BEST RECOMMENDATION VIA GMAIL" : "REKOMENDASI TERBAIK VIA GMAIL"}
                  </div>
                  <p className="text-[12.5px] text-ink-2 leading-relaxed m-0 mb-3 text-left">
                    {isEn ? "Send the direct interactive dashboard, complete skill gaps, and 90-day roadmap to your inbox instantly." : "Kirim langsung rincian dashboard, skill gaps, & 90-day roadmap lengkap ke email kamu (cepat & aman)."}
                  </p>
                  <button 
                    onClick={() => {
                      closeSheet();
                      setShowGmailShare(true);
                    }}
                    className="bg-orange text-white border-0 rounded-xl px-4 py-3 text-[13.5px] font-bold tracking-tight text-center hover:bg-orange-2 transition-colors cursor-pointer w-full flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {isEn ? "Send Report via Gmail" : "Kirim Laporan via Gmail"}
                  </button>
                </div>

                <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-dark mb-1 text-center font-bold">
                  {isEn ? "OR SIGN IN TO ACCOUNT" : "ATAU MASUK KE AKUN"}
                </div>

                <button 
                  onClick={handleGoogleSubmit}
                  type="button" 
                  className="bg-ink text-white border-ink rounded-xl px-4 py-3.5 flex items-center gap-3.5 text-[14.5px] w-full text-left transition-colors hover:bg-ink-3 tracking-tight cursor-pointer font-bold"
                >
                   <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>{isEn ? "Continue with Google" : "Lanjut dengan Google"}</span>
                  <svg className="ml-auto text-orange-2 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>

                <div className="flex items-center gap-[10px] my-1 text-muted-dark font-mono text-[10px] tracking-[0.1em] uppercase before:content-[''] before:flex-1 before:h-[1px] before:bg-border after:content-[''] after:flex-1 after:h-[1px] after:bg-border font-bold">
                  {isEn ? "or use email" : "atau pakai email"}
                </div>

                <form onSubmit={handleEmailSubmit} className="bg-white border border-border rounded-xl p-1 pl-4 flex items-center gap-2">
                  <input 
                    type="email" 
                    placeholder={isEn ? "your.name@mail.com" : "nama.kamu@mail.com"} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border-0 bg-transparent font-sans text-[14.5px] py-[10px] outline-none text-ink tracking-tight placeholder:text-muted" 
                    required
                  />
                  <button type="submit" className="bg-orange text-white border-0 rounded-[10px] p-[9px] px-3 inline-flex items-center justify-center hover:bg-orange-2 transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                  </button>
                </form>

                <p className="text-[12px] text-muted-dark leading-relaxed mt-1.5 text-center">
                  {isEn ? "We send a secure magic-link, password-free. By continuing you agree to our terms of use." : "Kami kirim magic-link, no password. Dengan lanjut kamu setuju syarat penggunaan."}
                </p>
              </>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-dashed border-border flex justify-between items-center flex-wrap gap-2.5">
            <span className="font-mono text-[11px] text-muted-dark tracking-[0.06em] uppercase">
              {isEn ? "Your guest session is active for 24 hours on this browser" : "Sesi tamu kamu tetap aktif selama 24 jam di browser ini"}
            </span>
            <button onClick={handleDismissAndGuest} className="bg-transparent border-0 text-ink-2 text-[13px] underline underline-offset-[3px] py-1.5 hover:text-orange transition-colors cursor-pointer">
              {isEn ? "Continue without account for now" : "Selesai dulu pakai tanpa akun"}
            </button>
          </div>
        </div>
      </aside>

      <GmailShareModal 
        isOpen={showGmailShare} 
        onClose={() => setShowGmailShare(false)} 
        sessionData={sessionData} 
      />
    </>
  );
}
