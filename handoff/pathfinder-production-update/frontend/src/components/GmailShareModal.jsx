import { useState, useEffect } from 'react';
import { googleSignInForGmail, sendGmailMessage, auth } from '../utils/gmailAuth';
import { generateDiscoveryEmailHtml } from '../utils/emailTemplate';
import { toast } from 'sonner';

export default function GmailShareModal({ isOpen, onClose, sessionData }) {
  const [user, setUser] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Synchronize Google Auth user on open
  useEffect(() => {
    if (isOpen) {
      const currentUser = auth.currentUser;
      setUser(currentUser);
      if (currentUser?.email) {
        setRecipient(currentUser.email);
      }
      
      const uName = sessionData?.user_name || 'Teman';
      const roleName = sessionData?.top_roles?.[0]?.role_name || 'Data Analyst';
      setSubject(`PathFinder AI: Laporan Kesiapan Karir ${uName} — ${roleName}`);
    }
  }, [isOpen, sessionData]);

  if (!isOpen) return null;

  const handleConnectGoogle = async () => {
    try {
      setIsLoggingIn(true);
      const result = await googleSignInForGmail();
      if (result) {
        setUser(result.user);
        setRecipient(result.user.email);
        toast.success(`Berhasil menghubungkan Gmail: ${result.user.email}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungkan ke Gmail: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipient) {
      toast.error('Harap masukkan alamat email penerima.');
      return;
    }
    if (!subject) {
      toast.error('Harap isi subjek email.');
      return;
    }

    // MANDATORY confirmation dialog for Workspace mutating/sending APIs
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin mengirim laporan karir ini dari email kamu (${user?.email}) ke ${recipient}?`
    );
    if (!confirmed) return;

    try {
      setIsSending(true);
      const uName = sessionData?.user_name || 'Teman';
      const emailHtml = generateDiscoveryEmailHtml(uName, sessionData);
      
      await sendGmailMessage(recipient, subject, emailHtml);
      toast.success(`Laporan kesiapan karir berhasil dikirim ke ${recipient}!`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengirim email: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-ink/75 backdrop-blur-sm z-[200] transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] bg-white rounded-2xl p-7 border border-border shadow-2xl z-[201] font-sans">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
          <div className="font-mono text-[11px] text-orange tracking-[0.14em] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-orange rounded-full animate-pulse"></span>
            WORKSPACE INTEGRASI
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors border-0 bg-transparent cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {!user ? (
          <div className="text-center py-5">
            <div className="w-12 h-12 bg-orange-soft text-orange-2 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h3 className="text-lg font-medium text-ink tracking-tight mb-2">Kirim Hasil via Gmail</h3>
            <p className="text-[13.5px] text-muted-dark leading-relaxed mb-6 max-w-[340px] mx-auto">
              Hubungkan akun Google/Gmail kamu untuk langsung mengirimkan laporan visual kesiapan karir PathFinder ini ke email kamu atau mentor secara resmi.
            </p>

            <button 
              onClick={handleConnectGoogle}
              disabled={isLoggingIn}
              className="bg-ink text-white border border-ink rounded-xl px-4 py-3.5 flex items-center justify-center gap-3 w-full transition-colors hover:bg-ink-3 tracking-tight cursor-pointer font-medium disabled:opacity-70"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Hubungkan via Gmail</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-cream p-3 rounded-xl border border-border">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full border border-border" />
              ) : (
                <div className="w-9 h-9 bg-orange text-white flex items-center justify-center rounded-full font-bold">
                  {user.email.substring(0, 1).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <div className="text-[13px] font-medium text-ink-2 leading-none">{user.displayName || 'Akun Google'}</div>
                <div className="text-[11px] text-muted-dark font-mono mt-1">{user.email}</div>
              </div>
              <button 
                onClick={async () => {
                  try {
                    await auth.signOut();
                    setUser(null);
                  } catch (e) {}
                }} 
                className="ml-auto text-[11px] text-orange hover:underline bg-transparent border-0 cursor-pointer"
              >
                Putuskan
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-muted-dark tracking-[0.06em] uppercase mb-1.5 ml-1">Email Penerima</label>
              <input 
                type="email" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="nama@email.com" 
                className="w-full bg-cream border border-border rounded-xl px-4 py-3 font-sans text-[14px] outline-none text-ink tracking-tight focus:border-orange transition-colors"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-muted-dark tracking-[0.06em] uppercase mb-1.5 ml-1">Subjek</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-cream border border-border rounded-xl px-4 py-3 font-sans text-[14px] outline-none text-ink tracking-tight focus:border-orange transition-colors"
                required
              />
            </div>

            <button 
              onClick={handleSendEmail}
              disabled={isSending}
              className="bg-orange text-white border-0 rounded-xl py-3.5 mt-2 text-[14.5px] font-medium hover:bg-orange-2 transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Mengirim Laporan...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  <span>Kirim Laporan via Gmail</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
