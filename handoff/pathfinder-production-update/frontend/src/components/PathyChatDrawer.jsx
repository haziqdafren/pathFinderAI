import { useState, useRef, useEffect } from 'react';

export default function PathyChatDrawer({ isOpen, onClose, initialMessage, sessionData, setSessionData }) {
  const isLoggedIn = sessionStorage.getItem('logged_in') === 'true' || localStorage.getItem('pathy_logged_in') === 'true';
  const name = sessionData?.user_name || 'Teman';
  const projectName = sessionData?.project?.name || 'proyek portofolio-mu';
  const lang = localStorage.getItem('pref_lang') || 'id';
  const isEn = lang === 'en';
  const mentorStyle = localStorage.getItem('pathy_mentor_style') || 'santai';
  
  const defaultMsg = isLoggedIn 
    ? (isEn ? `Welcome back, ${name}! Your progress on ${projectName} is looking solid. Anything you're stuck on today?` : `Halo kembali, ${name}! Progress project ${projectName}-mu terpantau stabil. Ada task yang bikin mentok hari ini?`)
    : (isEn ? 'Hello! Is there anything Pathy can help you with regarding your career or project?' : 'Halo! Ada yang bisa Pathy bantu soal karier atau proyekmu?');

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: defaultMsg }]);
    }
  }, [defaultMsg, messages.length]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (initialMessage) {
        handleSend(initialMessage);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text) => {
    const messageText = typeof text === 'string' ? text : input;
    if (!messageText.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, sessionData, lang, mentorStyle })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
      if (data.updatedData) {
        setSessionData(data.updatedData);
        // Persist to session storage
        const currentStored = JSON.parse(sessionStorage.getItem('pathfinder_session') || '{}');
        currentStored.results = data.updatedData;
        sessionStorage.setItem('pathfinder_session', JSON.stringify(currentStored));
      }
    } catch(e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Pathy sedang gangguan koneksi. Coba lagi nanti ya!' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-ink/40 backdrop-blur-sm z-[200] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <aside 
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-cream shadow-2xl z-[201] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col font-sans ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-ink text-white border-b border-ink-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-orange text-white flex items-center justify-center text-[12px] font-semibold relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2.5 after:h-2.5 after:bg-[#4ade80] after:rounded-full after:border-[2px] after:border-ink">P</span>
            <div>
              <div className="font-semibold text-[14px] leading-tight flex items-center gap-2">
                Pathy <span className="font-mono text-[9px] uppercase tracking-[0.06em] bg-[#4ade80]/20 text-[#4ade80] py-0.5 px-1.5 rounded-full font-medium">Online</span>
              </div>
              <div className="text-[11px] text-white/50 tracking-[0.02em]">Career & Project Assistant</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white border-0 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="text-center font-mono text-[10px] text-muted-dark uppercase tracking-[0.1em] mb-2 mt-1">
            SESI DIMULAI HARI INI
          </div>
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed tracking-[-0.005em] ${msg.role === 'user' ? 'bg-orange text-white rounded-tr-sm' : 'bg-white border border-border text-ink-2 rounded-tl-sm shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {loading && (
             <div className="flex justify-start">
               <div className="bg-white border border-border text-ink-2 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 text-[14px] leading-relaxed tracking-[-0.005em] flex gap-[3px] items-center">
                 <span className="w-1.5 h-1.5 bg-muted rounded-full animate-[typing_1.4s_infinite_ease-in-out]"></span>
                 <span className="w-1.5 h-1.5 bg-muted rounded-full animate-[typing_1.4s_infinite_ease-in-out_0.15s]"></span>
                 <span className="w-1.5 h-1.5 bg-muted rounded-full animate-[typing_1.4s_infinite_ease-in-out_0.3s]"></span>
               </div>
             </div>
          )}

          {/* Autocomplete / Suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <button 
                onClick={() => handleSend("Jelasin lebih detail tentang role ini dong!")}
                className="bg-cream-2 hover:bg-cream-3 border border-border rounded-full px-3 py-1.5 text-[12px] text-ink-2 transition-colors cursor-pointer text-left"
              >
                Jelasin lebih detail role ini
              </button>
              <button 
                onClick={() => handleSend("Gimana cara bikin portfolio yang bagus?")}
                className="bg-cream-2 hover:bg-cream-3 border border-border rounded-full px-3 py-1.5 text-[12px] text-ink-2 transition-colors cursor-pointer text-left"
              >
                Gimana cara bikin portfolio?
              </button>
              <button 
                onClick={() => handleSend("Bisa bantu buatin timeline belajar?")}
                className="bg-cream-2 hover:bg-cream-3 border border-border rounded-full px-3 py-1.5 text-[12px] text-ink-2 transition-colors cursor-pointer text-left"
              >
                Bikin timeline belajar
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-border">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-end gap-2 bg-cream border border-border rounded-xl p-2 focus-within:border-orange transition-colors"
          >
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya Pathy..."
              className="flex-1 bg-transparent border-0 resize-none max-h-[120px] min-h-[40px] px-2 py-2 text-[14px] text-ink outline-none tracking-[-0.005em] font-sans placeholder:text-muted"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="w-10 h-10 rounded-lg bg-ink text-white flex items-center justify-center shrink-0 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ink-3 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
          <div className="text-center mt-2.5 font-mono text-[9px] text-muted-dark tracking-[0.06em] uppercase">
            PATHY BISA MEMBERIKAN RESPONS TIDAK AKURAT
          </div>
        </div>
      </aside>
    </>
  );
}
