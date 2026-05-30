import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingMagic, setIsLoadingMagic] = useState(false);

  const lang = localStorage.getItem('pref_lang') || 'id';
  const isEn = lang === 'en';

  useEffect(() => {
    const handleOAuthMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsLoadingGoogle(true);
        if (supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const { data, error } = await supabase
                .from('analyses')
                .select('id')
                .eq('user_id', session.user.id)
                .limit(1)
                .maybeSingle();

              if (error) {
                console.error("Error checking user analysis:", error);
              }

              if (error || !data) {
                await supabase.auth.signOut();
                sessionStorage.removeItem('logged_in');
                toast.error(isEn ? "This Google account does not have a profiling history yet. Please complete the career interview on the home page first." : "Akun Google ini belum memiliki riwayat analisis. Silakan ikuti onboarding/analisis terlebih dahulu di halaman utama sebelum mendaftar.");
                setIsLoadingGoogle(false);
                return;
              }

              sessionStorage.setItem('logged_in', 'true');
              localStorage.setItem('pathy_shuffles_left', '3');
              toast.success(isEn ? "Successfully signed in with Google!" : "Berhasil masuk dengan akun Google!");
              setIsLoadingGoogle(false);
              navigate('/results');
              return;
            }
          } catch (err) {
            console.error("Auth redirect error checks", err);
          }
        }
        
        // Default fallback if session check failed or supabase is not active
        sessionStorage.setItem('logged_in', 'true');
        localStorage.setItem('pathy_shuffles_left', '3');
        toast.success(isEn ? "Successfully signed in!" : "Berhasil masuk!");
        setIsLoadingGoogle(false);
        navigate('/results');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [navigate, isEn]);

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      toast.error(isEn ? "Supabase relies on API keys which are missing in this environment. Authentication is disabled." : "Supabase API Key tidak ditemukan di environment ini. Login dinonaktifkan.");
      return;
    }

    try {
      setIsLoadingGoogle(true);
      const isSimulated = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
      const isPreviewUrl = window.location.hostname.includes('run.app') || window.location.hostname.includes('googleusercontent');
      
      if (isSimulated || isPreviewUrl) {
        // Fast direct path for virtual sandbox or preview environments lacking valid redirect configs
        sessionStorage.setItem('logged_in', 'true');
        localStorage.setItem('pathy_logged_in', 'true');
        localStorage.setItem('pathy_user_name', 'Guest');
        localStorage.setItem('pathy_user_email', 'guest@pathfinder.com');
        localStorage.setItem('pathy_shuffles_left', '3');
        toast.success(isEn ? "Successfully signed in with Google (Preview Bypass)!" : "Berhasil masuk dengan akun Google (Bypass Preview)!");
        setIsLoadingGoogle(false);
        setTimeout(() => {
          navigate('/results');
        }, 600);
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
          setIsLoadingGoogle(false);
        }
      } else {
        throw new Error(isEn ? "Failed to obtain Google authentication URL." : "Gagal memperoleh URL autentikasi Google.");
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      toast.error((isEn ? 'Failed to sign in: ' : 'Gagal login: ') + error.message);
      setIsLoadingGoogle(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    if (!email) return;

    if (!supabase) {
      toast.error(isEn ? "Supabase relies on API keys which are missing in this environment. Authentication is disabled." : "Supabase API Key tidak ditemukan di environment ini. Login dinonaktifkan.");
      return;
    }

    try {
      setIsLoadingMagic(true);
      const isSimulated = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
      const isPreviewUrl = window.location.hostname.includes('run.app') || window.location.hostname.includes('googleusercontent');
      
      if (isSimulated || isPreviewUrl) {
        // Fast direct login for virtual magic link
        sessionStorage.setItem('logged_in', 'true');
        localStorage.setItem('pathy_logged_in', 'true');
        localStorage.setItem('pathy_user_email', email);
        const namePart = email.split('@')[0];
        localStorage.setItem('pathy_user_name', namePart.charAt(0).toUpperCase() + namePart.slice(1));
        localStorage.setItem('pathy_shuffles_left', '3');
        
        toast.success(isEn ? `Preview Bypass: Logged in automatically as ${email}!` : `Bypass Preview: Otomatis masuk sebagai ${email}!`);
        setTimeout(() => {
          navigate('/results');
        }, 800);
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
      toast.success(isEn ? 'Magic link successfully sent to your email!' : 'Magic link berhasil dikirim ke email kamu!');
    } catch (error) {
      console.error('Error:', error.message);
      toast.error((isEn ? 'Failed to send email: ' : 'Gagal mengirim email: ') + error.message);
    } finally {
      setIsLoadingMagic(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex font-sans">
       <div className="hidden lg:flex w-[480px] bg-ink text-white flex-col p-12 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-[0.07]" style={{background: 'repeating-linear-gradient(135deg, transparent 0px, transparent 14px, #E8642A 14px, #E8642A 15px)'}}></div>
          
          <div className="relative z-10 mb-20 inline-flex items-center gap-2.5 font-bold text-[15px] tracking-[-0.015em] text-white">
            <span className="w-6 h-6 bg-orange rounded-[7px] relative inline-flex items-center justify-center shrink-0 before:content-[''] before:w-[9px] before:h-[9px] before:border-[1.6px] before:border-white before:rounded-full before:border-t-transparent before:border-r-transparent after:content-[''] after:absolute after:w-[3px] after:h-[3px] after:bg-white after:rounded-full after:top-[5px] after:right-[5px]"></span>
            PathFinder<span className="text-orange ml-[1px] font-medium animate-pulse">·AI</span>
          </div>

          <div className="relative z-10 mt-auto">
            <h2 className="text-[clamp(34px,4.8vw,62px)] leading-[1.04] font-medium tracking-tight mb-5 text-white text-balance">
              {isEn ? (
                <>Track your learning journey, <span className="text-orange">reach your career goal.</span></>
              ) : (
                <>Pantau progress belajarmu, <span className="text-orange font-medium">capai target rolenya.</span></>
              )}
            </h2>
            <p className="text-white/60 text-[15px] leading-relaxed">
              {isEn ? (
                "Review your portfolio target project, track your IT readiness index, and discover live matching jobs customized for you today."
              ) : (
                "Akses kembali rekomendasi proyek portfolio, lacak readiness score kamu, dan cek lowongan terbaru yang sesuai posisimu hari ini."
              )}
            </p>
          </div>
       </div>

       <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-cream">
         <button onClick={() => navigate('/')} className="absolute top-6 sm:top-10 left-6 sm:left-10 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center text-ink-2 hover:bg-cream-2 transition-transform active:scale-95 cursor-pointer shadow-sm">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
         </button>

         <div className="w-full max-w-[420px] bg-white rounded-2xl p-8 border border-border shadow-sm">
            <div className="font-mono text-[11px] text-orange tracking-[0.14em] uppercase mb-2 inline-flex items-center gap-2 font-bold">
              <span className="w-1.5 h-1.5 bg-orange rounded-full"></span>
              {isEn ? "welcome back" : "selamat datang kembali"}
            </div>
            <h1 className="text-[28px] font-bold tracking-[-0.015em] leading-[1.1] text-ink m-0 mb-6">
              {isEn ? "Sign in to Account" : "Masuk ke Akun"}
            </h1>

            <button disabled={isLoadingGoogle} onClick={handleGoogleLogin} className="bg-ink text-white border border-ink rounded-xl px-4 py-3.5 flex items-center gap-3.5 text-[14.5px] w-full text-left transition-colors hover:bg-ink-3 tracking-tight mb-4 cursor-pointer disabled:opacity-70 justify-center font-bold">
              {isLoadingGoogle ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>{isEn ? "Sign in with Google" : "Masuk dengan Google"}</span>
                  <svg className="ml-auto text-orange-2 shrink-0 hidden sm:block" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </>
              )}
            </button>

            <div className="flex items-center gap-[10px] my-5 text-muted-dark font-mono text-[10px] tracking-[0.10em] uppercase before:content-[''] before:flex-1 before:h-[1px] before:bg-border after:content-[''] after:flex-1 after:h-[1px] after:bg-border font-bold">
              {isEn ? "or use email magic link" : "atau pakai email"}
            </div>

            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <div>
                <label className="block font-mono text-[10px] text-muted-dark tracking-[0.06em] uppercase mb-1.5 ml-1 font-bold">
                  {isEn ? "EMAIL ADDRESS" : "ALAMAT EMAIL"}
                </label>
                <input type="email" placeholder="name@email.com" className="w-full bg-cream border border-border rounded-xl px-4 py-3 font-sans text-[14.5px] outline-none text-ink tracking-tight placeholder:text-muted focus:border-orange transition-colors" />
              </div>
              <button disabled={isLoadingMagic} type="submit" className="bg-orange text-white border-0 rounded-xl py-3.5 text-[14.5px] font-bold tracking-[-0.005em] hover:bg-orange-2 transition-colors active:scale-[0.98] w-full mt-2 cursor-pointer disabled:opacity-70 flex justify-center items-center">
                {isLoadingMagic ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isEn ? "Send Magic Link" : "Kirim Magic Link"
                )}
              </button>
            </form>

            <div className="bg-orange/5 border border-orange/20 rounded-xl p-3.5 mt-4 text-left">
              <span className="font-mono text-[9px] text-orange tracking-[0.08em] font-bold block mb-1">
                {isEn ? "GMAIL INTEGRATION TIPS" : "TIPS INTEGRASI GMAIL"}
              </span>
              <p className="m-0 text-[11.5px] text-ink-2 leading-relaxed">
                {isEn ? (
                  <>Signing in with <strong className="text-ink font-semibold">Google</strong> above is recommended. Beyond one-click access without waiting for PIN codes, you instantly pair Gmail capabilities to submit your official reports.</>
                ) : (
                  <>Masuk dengan <strong className="text-ink font-semibold">Google</strong> di atas adalah opsi terbaik. Selain masuk instan tanpa repot menunggu email OTP, kamu langsung menghubungkan integrasi Gmail untuk mengirim laporan kesiapan resmi.</>
                )}
              </p>
            </div>

            <p className="text-[12px] text-muted-dark leading-relaxed mt-4 tracking-[0.01em]">
              {isEn ? (
                <>If your email has not been registered, we will automatically set up a starting profile. By signing in, you agree to our <a href="#" className="text-ink underline font-medium">Terms of Use</a>.</>
              ) : (
                <>Jika email kamu belum terdaftar, kami akan otomatis membuatkan profil dasar. Dengan melanjutkan, kamu menyetujui <a href="#" className="text-ink underline">Syarat Penggunaan</a> kami.</>
              )}
            </p>
         </div>
       </div>
    </div>
  )
}
