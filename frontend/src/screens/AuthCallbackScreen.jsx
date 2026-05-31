import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export default function AuthCallbackScreen() {
  const [errorStatus, setErrorStatus] = useState(false);

  useEffect(() => {
    if (!supabase?.auth) {
      setErrorStatus(true);
      return undefined;
    }

    const completeAuth = (session) => {
      if (!session) return;
      sessionStorage.setItem('logged_in', 'true');
      localStorage.setItem('pathy_shuffles_left', '3');

      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
        setTimeout(() => window.close(), 120);
      } else {
        window.location.href = '/results';
      }
    };

    const code = new URLSearchParams(window.location.search).get('code');
    if (code && supabase.auth.exchangeCodeForSession) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          console.error("Auth exchange error:", error);
          setErrorStatus(true);
          return;
        }
        completeAuth(data?.session);
      });
    }

    // Attempt to get the session after redirect
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session) {
        completeAuth(session);
      } else if (error) {
        console.error("AuthCallback Error:", error);
        setErrorStatus(true);
      }
    });

    // Listen for auth state change to capture the flow as tokens are processed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        completeAuth(session);
      }
    });

    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setErrorStatus(true);
        }
      });
    }, 4000);

    return () => {
      if (subscription) subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const lang = localStorage.getItem('pref_lang') || 'id';
  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-6 text-center">
      {!errorStatus ? (
        <>
          <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin mb-4"></div>
          <h1 className="font-sans text-xl font-medium text-ink tracking-tight mb-2">
            {isEn ? "Completing Authentication" : "Menyelesaikan Autentikasi"}
          </h1>
          <p className="font-sans text-[14px] text-muted-dark leading-relaxed max-w-[320px]">
            {isEn ? "Please wait, PathFinder is confirming your account." : "Mohon tunggu sebentar, PathFinder sedang mengkonfirmasi akun kamu."}
          </p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 flex items-center justify-center text-4xl mb-4">⚠️</div>
          <h1 className="font-sans text-xl font-medium text-ink tracking-tight mb-2">
            {isEn ? "Authentication Failed or Expired" : "Autentikasi Gagal atau Kadaluarsa"}
          </h1>
          <p className="font-sans text-[14px] text-muted-dark leading-relaxed max-w-[320px] mb-4">
            {isEn ? "The magic link is no longer valid or the session failed to create. Please try logging in again." : "Link magic sudah tidak valid atau sesi gagal dibuat. Silakan coba login kembali."}
          </p>
          <a href="/" className="bg-ink text-white px-4 py-2 rounded-xl text-[14px]">
            {isEn ? "Back to Home" : "Kembali ke Beranda"}
          </a>
        </>
      )}
    </div>
  );
}
