import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextQuestion } from '../utils/api';
import { detectNonsenseInput } from '../utils/validation';

const INITIAL_QUESTIONS = [
  {
    title: "Halo! Boleh kenalan dulu? Siapa nama panggilanmu?",
    tip: "Cukup nama panggilan, biar Pathy bisa manggil kamu dengan enak dan lebih personal."
  },
  {
    title: "Ceritain satu bukti kerja digital/IT yang pernah kamu buat atau bantu selesaikan.",
    tip: "Sebutkan konteks, tools, dan hasilnya. Contoh: dashboard Excel, website React, desain Figma, bot, API, CTF, atau tugas kampus yang benar-benar selesai."
  },
  {
    title: "Menyiapkan pertanyaan...",
    tip: "Pathy sedang memikirkan pertanyaan berdasarkan ceritamu."
  },
  {
    title: "Lokasi kerja idealmu apa, dan seberapa fleksibel kamu untuk remote/hybrid?",
    tip: "Jawaban ini dipakai untuk mencocokkan strategi lamaran. Contoh: Jakarta hybrid, Bandung onsite, Remote Indonesia, atau mana saja asal role-nya cocok."
  },
  {
    title: "Kapan targetmu siap melamar, dan apa batasan terbesarmu sekarang?",
    tip: "Contoh batasan: belum punya portfolio, belum pede interview, masih kuliah, laptop terbatas, English, atau belum tahu role yang paling cocok."
  }
];

const EN_INITIAL_QUESTIONS = [
  {
    title: "Hello! Let's get acquainted first. What's your nickname?",
    tip: "Just your nickname is fine, so Pathy can address you personally and comfortably."
  },
  {
    title: "Tell me about one concrete digital/IT proof of work you built or helped finish.",
    tip: "Mention the context, tools, and outcome. Examples: Excel dashboard, React site, Figma flow, bot, API, CTF write-up, or a completed class project."
  },
  {
    title: "Preparing question...",
    tip: "Pathy is thinking of a customized question based on your project description."
  },
  {
    title: "What is your ideal work location, and how flexible are you with remote/hybrid work?",
    tip: "This shapes the application strategy. Example: Jakarta hybrid, Bandung onsite, Remote Indonesia, or anywhere if the role is a strong match."
  },
  {
    title: "When do you want to be ready to apply, and what is your biggest blocker right now?",
    tip: "Examples: no portfolio yet, interview confidence, still in college, limited laptop, English, or not sure which role fits best."
  }
];

const STEP_SUGGESTIONS = {
  1: [
    "Pernah bikin website portofolio simple pakai HTML, CSS, JavaScript",
    "Saya pernah bikin aplikasi kasir sederhana pakai Python / Java",
    "Saya bikin dashboard Excel/Looker untuk merapikan data penjualan dan menemukan produk paling laku",
    "Saya bantu tim kampus membuat landing page acara, dari layout sampai deploy",
    "Dulu sempat bikin REST API sederhana pakai Express dan Node.js",
    "Pernah bikin bot Discord / Telegram sederhana buat server temen",
    "Pernah nyoba clone UI aplikasi (Instagram/Twitter) pakai React/Flutter",
    "Saya pernah ngedebug dan fix error di aplikasi warisan kating/senior",
    "Dulu pernah bantu olah data laporan excel jualan yang berantakan",
    "Pernah bikin dashboard Looker Studio / Tableau buat visualisasi data kampus",
    "Pernah iseng scraping data harga barang dari e-commerce pakai Python",
    "Pernah coba bikin model Machine Learning simpel (klasifikasi gambar)",
    "Saya pernah mainan API OpenAI / Gemini buat bikin chatbot AI sederhana",
    "Saya dulu pernah redesign UI/UX aplikasi ojol/e-commerce di Figma",
    "Pernah bikin user research / wireframing buat project desain antarmuka",
    "Dulu suka ngedit video promosi / motion graphic pakai Premiere Pro",
    "Pernah bikin desain logo atau konten flyer sosmed buat organisasi",
    "Pernah setup jaringan LAN / Wifi dan load balancing di lab komputer",
    "Saya suka ngelakuin penetration testing (CTF) nyari vuln di web web",
    "Pernah bikin home server pakai Raspberry Pi / laptop bekas",
    "Dulu disuruh setup mikrotik buat ngatur bandwidth sama ngeblok web",
    "Pernah ngoding game 2D/3D platformer simple pakai Unity atau Godot",
    "Pernah bantuin bikin company profile pakai CMS WordPress / Elementor"
  ],
  2: [
    "Saya suka ngulik bug error di codingan sampai bener-bener fix (bisa berjam-jam)",
    "Paling suka scroll StackOverflow / dokumentasi nemuin jalan pintas",
    "Suka banget mikirin logic database dan nyusun relasi antar tabel (ERD)",
    "Seru kalau ngulik optimasi performa backend biar dapet ping kecil",
    "Paling asik nge-desain UI di Figma perhatiin padding biar presisi",
    "Suka eksperimen warna, font, dan animasi transisi yang mulus",
    "Suka bagian nge-trim video dan nyocokin grafis ke beat audionya",
    "Paling lega kalau ngerapihin data dataset kotor di excel/pandas",
    "Seneng kalau nemu insight aneh dari chart visualisasi/pivot table",
    "Suka nyoba-nyoba tuning prompt AI biar ngasih output spesifik",
    "Suka mantengin log trafik jaringan dari server Debian/Ubuntu",
    "Paling seru pas nge-deploy aplikasi ke cloud computing terus setting CI/CD",
    "Suka nganalisa traffic di wireshark dan bypass firewall web",
    "Sering kelupaan waktu kalau dapet task belajar framework / AI baru"
  ],
  3: ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Malang", "Bali", "Batam", "Remote", "Luar Negeri", "Mana aja asal perusahaannya cocok"],
  4: ["Siap melamar bulan ini, blocker utama portfolio belum rapi", "Kira-kira 1-3 bulan lagi, masih perlu latihan interview", "Semester depan, sekarang masih padat kuliah", "Lulusnya masih tahun depan, ingin bangun portfolio dari sekarang", "Belum buru-buru, masih mencari role paling cocok"]
};

const EN_STEP_SUGGESTIONS = {
  1: [
    "Built a simple portfolio layout using HTML, CSS, JavaScript",
    "Wrote a simple cashier application with Python / Java",
    "Built an Excel/Looker dashboard to clean sales data and identify top products",
    "Helped a campus team ship an event landing page from layout to deployment",
    "Developed a basic REST API using Express and Node.js",
    "Coded a Discord or Telegram bot for a friend's community server",
    "Tried cloning an app's UI layout (like Instagram) with React or Flutter",
    "Debugged and patched runtime errors on a legacy/school project",
    "Helped organize and clean up messy sales worksheets on MS Excel",
    "Designed live tracking Dashboards with Looker Studio or Tableau",
    "Built a fast web-scraper to crawl listings using Python",
    "Created a basic image classification model with Scikit-learn",
    "Integrated the OpenAI / Gemini API inside a basic terminal assistant",
    "Redesigned the onboarding screens of a mobile app using Figma",
    "Conducted basic user testing sessions and wireframed interface designs",
    "Assembled video cuts and dynamic kinetic texts in Premiere Pro",
    "Created logos and visual brand guidelines for a student body",
    "Configured LAN network routers and optimized traffic in a lab console",
    "Participated in ethical hacking CTF sessions auditing vulnerabilities",
    "Set up a personal headless file server via Raspberry Pi",
    "Implemented routing policies on Mikrotik consoles to shape bandwidth",
    "Assembled a lightweight 2D running game using Unity or Godot",
    "Crafted responsive websites utilizing WordPress and Elementor builders"
  ],
  2: [
    "I enjoy hunting down compiler errors and logic bugs for hours",
    "Love scanning technical docs to uncover API features and utilities",
    "Excited by relational schema design and organizing tables (ERD)",
    "Love profiling backends to reduce latency and execution bottlenecks",
    "Get full satisfaction aligning visual alignments pixel-perfect in Figma",
    "Love playing with colors, layout grids, or fluid micro-transitions",
    "Enjoy splicing tracking channels and synchronizing video to music",
    "Feel highly relieved cleaning up raw unstructured Excel files or dataframes",
    "Excited when spotting key patterns in a pivot table or line chart",
    "Love crafting smart generative model templates to query clean answers",
    "Enjoy monitoring process spikes and network log queues on Linux",
    "Love configuring container workflows and automating server CD runs",
    "Fascinated by network sniffing scripts and inspecting web handshake packets",
    "Instantly lose track of hours when studying a brand-new framework"
  ],
  3: ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Remote", "Overseas", "Anywhere matching targets"],
  4: ["Ready to apply this month, main blocker is portfolio polish", "Within 1-3 months, still need interview practice", "Next semester, current blocker is college workload", "Graduating next year, want to build portfolio now", "No rush, still exploring the best-fit role"]
};

// Helper for smarter suggestion filtering
const getFilteredSuggestions = (step, input, isEn) => {
  const suggestionsMap = isEn ? EN_STEP_SUGGESTIONS : STEP_SUGGESTIONS;
  if (!suggestionsMap[step]) return [];
  const cleanInput = input.toLowerCase().trim();
  
  if (cleanInput.length === 0) return suggestionsMap[step].slice(0, 4);

  const stopWords = isEn 
    ? ['i', 'have', 'built', 'tried', 'simple', 'some', 'the', 'a', 'an', 'worked', 'on', 'my', 'love', 'enjoy', 'like']
    : ['saya', 'aku', 'pernah', 'dulu', 'coba', 'nyoba', 'membuat', 'bikin', 'bantu', 'mengerjakan', 'ngerjain', 'suka', 'sering', 'pengen', 'mau', 'ingin', 'di', 'ke'];
  
  let stripped = cleanInput;
  stopWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    stripped = stripped.replace(regex, '');
  });
  stripped = stripped.trim();

  if (stripped.length === 0) {
    const directMatches = suggestionsMap[step].filter(s => s.toLowerCase().includes(cleanInput));
    if (directMatches.length >= 4) return directMatches.slice(0, 4);
    return [...directMatches, ...suggestionsMap[step].filter(s => !directMatches.includes(s))].slice(0, 4);
  }

  const keywords = stripped.split(/\s+/).filter(w => w.length > 2);
  
  const matched = suggestionsMap[step].filter(s => {
    const sLower = s.toLowerCase();
    if (sLower.includes(cleanInput)) return true;
    if (keywords.length > 0) {
        return keywords.some(k => sLower.includes(k));
    }
    return false;
  });

  if (matched.length > 0) return matched.slice(0, 4);

  return suggestionsMap[step].slice(0, 4);
};

export default function ConversationScreen() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('pref_lang') || 'id';
  const isEn = lang === 'en';

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  const [questions, setQuestions] = useState(isEn ? EN_INITIAL_QUESTIONS : INITIAL_QUESTIONS);
  const [loading, setLoading] = useState(false);

  const currentAnswer = answers[step] || '';
  const charCount = currentAnswer.length;
  
  let qualityIndicator = isEn 
    ? { text: "too short", color: "text-red-500" }
    : { text: "terlalu singkat", color: "text-red-500" };
  const wordCount = currentAnswer.split(/\s+/).filter(w => w.length > 0).length;
  if (charCount >= 50 && charCount < 150) {
    qualityIndicator = isEn 
      ? { text: "could be more detailed", color: "text-orange-500" }
      : { text: "bisa lebih detail", color: "text-orange-500" };
  } else if (charCount >= 150) {
    qualityIndicator = isEn 
      ? { text: "very detailed", color: "text-[#4ade80]" }
      : { text: "cukup detail", color: "text-[#4ade80]" };
  }

  const suggestionsMap = isEn ? EN_STEP_SUGGESTIONS : STEP_SUGGESTIONS;

  const handleSkip = () => {
    const defaults = isEn ? [
      'John Doe',
      'I built a beautiful and highly responsive portfolio web page showcasing local designs using modern HTML and CSS layout practices.',
      'Refining fluid animations and sorting layouts with precise borders and custom spacings.',
      'Remote',
      'Within 1-3 months'
    ] : [
      'Teman',
      'Saya ingin belajar IT umum dan membangun fundamental pemrograman yang baik.',
      'Kombinasi antara logic koding dan merancang antarmuka fungsional.',
      'Jakarta',
      'Secepatnya bulan ini'
    ];
    const defaultVal = defaults[step];
    const newAns = [...answers];
    newAns[step] = defaultVal;
    setAnswers(newAns);
    
    import('sonner').then(({ toast }) => {
      toast.info(isEn ? `Auto filled: "${defaultVal}"` : `Mengisi otomatis: "${defaultVal}"`);
    });

    if (step === 1) {
      setLoading(true);
      getNextQuestion(2, defaultVal, lang).then(nextQ => {
        setQuestions(prev => {
          const newQ = [...prev];
          newQ[2] = { title: nextQ.question, tip: nextQ.tip || newQ[2].tip };
          return newQ;
        });
        setLoading(false);
        setStep(2);
      }).catch(() => {
        setLoading(false);
        setStep(2);
      });
    } else if (step < 4) {
      setStep(s => s + 1);
    } else {
      newAns[step] = defaultVal;
      sessionStorage.setItem('pathfinder_answers', JSON.stringify(newAns));
      navigate('/loading');
    }
  };

  const handleNext = async () => {
    const validationError = detectNonsenseInput(currentAnswer, step, lang);
    if (validationError) {
      import('sonner').then(({ toast }) => {
        toast.error(validationError);
      });
      return;
    }

    if (step === 1) { // Setelah nanya project (step 1), generate AI question buat step 2
      setLoading(true);
      try {
        const nextQ = await getNextQuestion(2, currentAnswer, lang);
        setQuestions(prev => {
          const newQ = [...prev];
          newQ[2] = { title: nextQ.question, tip: nextQ.tip || newQ[2].tip };
          return newQ;
        });
      } catch (err) {
        // Fallback already handled
      }
      setLoading(false);
      setStep(2);
    } else if (step < 4) {
      setStep(s => s + 1);
    } else {
      sessionStorage.setItem('pathfinder_answers', JSON.stringify(answers));
      navigate('/loading');
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col px-6 py-8 md:px-12 md:py-9 relative overflow-hidden font-sans">
      <div className="absolute -top-[30%] -right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(232,100,42,0.10)_0%,transparent_60%)] pointer-events-none"></div>
      
      <header className="flex justify-between items-center relative z-10">
        <div className="inline-flex items-center gap-2.5 font-semibold text-[15px] tracking-[-0.015em] text-white">
          <span className="w-6 h-6 bg-orange rounded-[7px] relative inline-flex items-center justify-center shrink-0 before:content-[''] before:w-[9px] before:h-[9px] before:border-[1.6px] before:border-white before:rounded-full before:border-t-transparent before:border-r-transparent after:content-[''] after:absolute after:w-[3px] after:h-[3px] after:bg-white after:rounded-full after:top-[5px] after:right-[5px]"></span>
          PathFinder<span className="text-orange ml-[1px] font-medium">·AI</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-2 items-center" aria-label={`Progress ${step + 1} of 5`}>
             {[0,1,2,3,4].map(i => (
                <span key={i} className={`h-1 rounded-[2px] transition-all duration-300 ${i === step ? 'bg-orange w-10' : i < step ? 'bg-white/40 w-[26px]' : 'bg-white/12 w-[26px]'}`}></span>
             ))}
             <span className="font-mono text-[11px] text-white/50 tracking-[0.06em] ml-2.5 hidden sm:inline-block">
               {isEn ? `0${step + 1} / 05 · ±30 seconds left` : `0${step + 1} / 05 · ±30 detik lagi`}
             </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-[920px] mx-auto w-full py-6 relative z-10">
        
        <div className="flex items-center gap-2.5 mb-[22px]">
          <span className={`w-7 h-7 rounded-full bg-orange inline-flex items-center justify-center text-white font-semibold text-[11px] relative ${loading ? 'animate-pulse' : ''} after:content-[''] after:absolute after:-bottom-[1px] after:-right-[1px] after:w-[7px] after:h-[7px] after:bg-[#4ade80] after:rounded-full after:border-[1.5px] after:border-ink`}>
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : "P"}
          </span>
          <span className="text-[13px] text-white/60 flex items-center">
            {loading ? (
              <strong className="text-white font-medium mr-1">
                {isEn ? "Pathy is writing the perfect next question..." : "Pathy sedang memikirkan pertanyaan berikutnya..."}
              </strong>
            ) : (
              <>
                <strong className="text-white font-medium mr-1">Pathy</strong> {isEn ? "is listening to your background" : "lagi dengerin cerita kamu"}
              </>
            )}
            <span className="inline-flex gap-[3px] ml-1.5 items-center">
              <span className={`w-1 h-1 bg-orange rounded-full ${loading ? 'animate-ping' : 'animate-[typing_1.4s_infinite_ease-in-out]'}`}></span>
              <span className={`w-1 h-1 bg-orange rounded-full ${loading ? 'animate-ping [animation-delay:0.15s]' : 'animate-[typing_1.4s_infinite_ease-in-out_0.15s]'}`}></span>
              <span className={`w-1 h-1 bg-orange rounded-full ${loading ? 'animate-ping [animation-delay:0.3s]' : 'animate-[typing_1.4s_infinite_ease-in-out_0.3s]'}`}></span>
            </span>
          </span>
        </div>

        {step > 0 && (
          <div className="mb-[26px] flex flex-col gap-2" aria-label="Jawaban sebelumnya">
            {answers.slice(0, step).map((ans, i) => (
              <div key={i} className="flex gap-3 p-2.5 px-3.5 bg-white/5 border border-white/10 rounded-[10px] text-[13px] items-start transition-opacity hover:bg-white/10 group">
                <span className="w-3.5 h-3.5 bg-[#4ade80]/20 rounded-full inline-flex items-center justify-center shrink-0 mt-[2px] after:content-[''] after:w-1.5 after:h-[3px] after:border-l-[1.4px] after:border-b-[1.4px] after:border-[#4ade80] after:-rotate-45 after:translate-x-[0.5px] after:-translate-y-[1px]"></span>
                <span className="font-mono text-white/40 text-[11px] pt-[2px] shrink-0">0{i+1}</span>
                <span className="text-white/65 leading-relaxed flex-1 line-clamp-2">{ans}</span>
                <button type="button" onClick={() => setStep(i)} className="opacity-0 group-hover:opacity-100 text-white/50 text-[11px] font-mono uppercase tracking-[0.06em] cursor-pointer self-center shrink-0 hover:text-orange transition-all bg-transparent border-0">
                  EDIT
                </button>
              </div>
            ))}
          </div>
        )}
 
        <h1 className="text-[clamp(34px,4.8vw,62px)] leading-[1.04] font-medium tracking-tight mb-3.5 text-white text-balance">
          {questions[step]?.title}
        </h1>
        
        <p className="text-white/55 text-[15px] sm:text-[16px] leading-relaxed m-0 mb-6 max-w-[620px]">
          <span className="text-orange-2 font-mono text-[11px] tracking-[0.08em] uppercase mr-1.5">
            {isEn ? "pathy's tip" : "tips dari pathy"}
          </span>
          {questions[step]?.tip}
        </p>

        {/* AUTOCOMPLETE SUGGESTIONS (Pill Buttons) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {suggestionsMap[step] && suggestionsMap[step].slice(0, step === 1 || step === 2 ? 3 : 5).map((s, i) => (
            <button key={i} type="button" onClick={() => { const newAns = [...answers]; newAns[step] = s; setAnswers(newAns); }} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[13px] px-3.5 py-2 rounded-full transition-colors cursor-pointer text-left">
              {s.length > 50 ? s.substring(0, 50) + "..." : s}
            </button>
          ))}
        </div>

        <div className="relative border-t border-white/10 pt-6">
          <div className="relative">
            <textarea 
              autoFocus
              className="w-full bg-transparent border-0 text-white font-sans text-[20px] sm:text-[21px] leading-relaxed resize-none min-h-[120px] outline-none tracking-[-0.01em] placeholder:text-white/30"
              placeholder={isEn ? "Type your answer here..." : "Ketik jawabanmu di sini..."}
              value={answers[step]}
              onChange={e => {
                const newAns = [...answers];
                newAns[step] = e.target.value;
                setAnswers(newAns);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleNext();
                }
              }}
            />
            
            {/* INLINE AUTOCOMPLETE DROPDOWN */}
            {suggestionsMap[step] && answers[step].length > 0 && answers[step].length < 60 && (
              <div className="absolute top-12 left-0 right-0 max-w-[600px] bg-ink border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="font-mono text-[10px] text-white/50 tracking-[0.1em] uppercase mb-2 px-2 pt-1">
                  {isEn ? "Suggested completions:" : "Mungkin maksudmu:"}
                </div>
                {getFilteredSuggestions(step, answers[step], isEn).map((s, i) => (
                  <button 
                    key={i} 
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-[14px] text-white/80 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                    onClick={() => { const newAns = [...answers]; newAns[step] = s; setAnswers(newAns); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-3.5 gap-3 flex-wrap">
            <div className="font-mono text-[11px] text-white/45 tracking-[0.05em] flex items-center gap-2.5">
              <span>
                <span id="charCount">{charCount}</span> {isEn ? "chars" : "karakter"} · ~{wordCount} {isEn ? "words" : "kata"}
              </span>
              {step > 0 && (
                <span className={`inline-flex items-center gap-1 ${qualityIndicator.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${qualityIndicator.color.replace('text-', 'bg-')}`}></span>
                  {qualityIndicator.text}
                </span>
              )}
            </div>
            
            <div className="flex gap-2 items-center">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s -1)} className="bg-transparent text-white/60 border-0 px-4 py-3 text-[14px] rounded-lg transition-colors hover:text-white cursor-pointer">
                  {isEn ? "← Back" : "← Kembali"}
                </button>
              )}
              <button type="button" onClick={handleSkip} className="bg-transparent text-white/60 border-0 px-4 py-3 text-[14px] rounded-lg transition-colors hover:text-white cursor-pointer">
                {isEn ? "Skip question" : "Lewati pertanyaan"}
              </button>
              <button 
                disabled={loading}
                onClick={handleNext} 
                className="bg-orange text-white border-0 px-6 py-[14px] text-[15px] font-medium rounded-xl inline-flex items-center gap-2.5 transition-all hover:bg-orange-2 active:scale-95 tracking-[-0.005em] cursor-pointer"
              >
                {loading ? (isEn ? 'Preparing...' : 'Menyiapkan...') : (isEn ? 'Next' : 'Lanjut')}
                {!loading && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex justify-between text-white/40 font-mono text-[10px] tracking-[0.08em] uppercase pt-3.5 relative z-10 flex-wrap gap-4 border-t border-white/5">
        <div className="flex gap-4 items-center">
          <span className="inline-flex items-center gap-1.5 text-white/55 before:content-[''] before:w-1.5 before:h-1.5 before:bg-[#4ade80] before:rounded-full">
            {isEn ? "Your responses are only saved temporarily in the browser" : "Jawabanmu hanya disimpan sementara di browser"}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <span>
            {isEn ? "Press" : "Tekan"} <span className="border border-white/15 px-[7px] py-[3px] rounded-[4px] mx-[3px]">⌘</span><span className="border border-white/15 px-[7px] py-[3px] rounded-[4px] mx-[3px]">↵</span> {isEn ? "to continue" : "untuk lanjut"}
          </span>
        </div>
      </footer>
    </div>
  );
}
