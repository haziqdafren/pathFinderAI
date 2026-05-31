/**
 * Utility to validate onboarding answers in Pathfinder AI
 * Prevents gibberish, keyboard mashes (e.g. asdfgh, asdasdsa),
 * pure number inputs (like 123456), repeating patterns, or short nonsense.
 * Also checks for relevance and off-topic topics.
 */

// Broad list of roots associated with tech, design, analytical, data, digital, or general study/coursework/projects
const TECH_RELEVANT_KEYWORDS = [
  // Tech/IT/Code
  "web", "dev", "app", "apk", "coding", "ngoding", "koding", "code", "ngulik", "ngoprek", "program", 
  "software", "hardware", "komputer", "it", "teknologi", "technology", "siber", "cyber", "security", 
  "keamanan", "hack", "sistem", "informasi", "jaringan", "network", "lan", "wifi", "server", "cloud", 
  "database", "db", "sql", "excel", "data", "analyst", "analis", "spreadsheet", "vlookup", "python", 
  "java", "cpp", "php", "js", "html", "css", "react", "vue", "laravel", "figma", "ui", "ux", "desain", 
  "design", "wireframe", "flow", "logo", "video", "editor", "game", "photoshop", "canva", "corel", 
  "illustrator", "animasi", "bot", "api", "wordpress", "cms", "gcp", "aws", "firebase", "supabase", 
  "git", "github", "visual", "chart", "dashboard", "looker", "tableau", "admin", "scout", "scra", 
  "scrap", "developer", "komputasi", "rekayasa", "engine", "pemrograman", "debugging", "debug", 
  "error", "bug", "otomasi", "automation", "tech", "digital", "front", "back", "api", "endpoint",
  
  // 3D/Motion/Graphics
  "blender", "motion", "graphic", "grafis", "3d", "object", "objek", "model", "render", "vfx", "maya", "cinema4d",

  // Learning/Academic/General Project/Work (allows users to talk about general learning or basic tasks)
  "tugas", "kuliah", "sekolah", "belajar", "studi", "magang", "intern", "portfolio", "portofolio", 
  "kerja", "karir", "lomba", "proyek", "project", "bikin", "buat", "ngelas", "kursus", "sertifikat", 
  "micro", "pelatihan", "uji", "test", "audit", "analisa", "analisis", "bisnis", "pembelajaran", 
  "bantu", "mengerjakan", "mengolah", "mengedit", "merancang", "membangun"
];

export function detectNonsenseInput(text, step, lang = 'id') {
  const clean = (text || '').trim();
  const isEn = lang === 'en';
  
  if (clean.length === 0) {
    return isEn 
      ? "Answer cannot be empty! Please type something or click a suggestion button below."
      : "Jawaban tidak boleh kosong! Silakan ketik sesuatu atau klik tombol rekomendasi di bawah.";
  }

  // Common gibberish patterns
  const lower = clean.toLowerCase();

  // 1. Check for pure numbers or symbols (e.g. "654654", "!!!")
  const onlyDigitsAndSymbols = /^[^a-zA-Z]*$/.test(clean);
  if (onlyDigitsAndSymbols) {
    if (step === 0) {
      return isEn 
        ? "Nickname must contain alphabetical characters (not just numbers/symbols)."
        : "Nama panggilan harus mengandung huruf abjad (bukan hanya angka/simbol).";
    }
    if (step === 3) {
      return isEn 
        ? "Please enter a valid work location (e.g., Jakarta, Bandung, Remote) or click a suggestion."
        : "Masukkan nama kota lokasi kerja yang nyata (contoh: Jakarta, Bandung, Remote) atau klik salah satu tombol pilihan di bawah.";
    }
    return isEn 
      ? "Your answer appears to contain only random numbers or symbols. Please enter valid words."
      : "Jawaban kamu terdeteksi hanya berisi angka atau simbol acak. Silakan berikan jawaban dengan kata-kata yang valid.";
  }

  // 2. Check for extreme repeating characters "aaaaaa", "111111"
  if (/([a-zA-Z0-9])\1{4,}/.test(lower)) {
    return isEn 
      ? "Repeated character pattern detected. Please type a genuine answer."
      : "Jawaban terdeteksi karakter berulang acak (spam). Harap ketik jawaban asli kamu.";
  }

  // 3. Repeating patterns like "asdasdasd", "qwerqwer", "haha"
  const repeatingPatterns = [
    /^(asd|qwe|zxc|jkl|dfg|fgh|yui|op|bnm)\1+$/,
    /^(asdasd|qwerqwer|zxcvzxcv)$/,
    /(.+?)\1{2,}/ // Repeating any substring 3 or more times (e.g. "asdasdasd")
  ];
  for (const pattern of repeatingPatterns) {
    if (pattern.test(lower)) {
      return isEn 
        ? "Random keyboard stroke pattern detected. Please provide a genuine answer."
        : "Jawaban terdeteksi menggunakan ketukan keyboard acak berulang. Silakan tulis cerita atau pilihan yang sungguhan.";
    }
  }

  // 4. Known keyboard mash substrings
  const keyboardMashes = [
    "asdfgh", "dfghj", "ghjkl", "asdasd", "zxcvbn", "qwerty", "qwer", "zxcv",
    "asdgasdf", "asdff", "fdsaf", "123123", "987987", "654654", "cbvcb", "dfgh"
  ];
  for (const mash of keyboardMashes) {
    if (lower.includes(mash)) {
      return isEn 
        ? "Keyboard mash detected (e.g., random characters). Please explain your real experience or use an inspiration button."
        : "Jawaban terdeteksi berisi kombinasi huruf acak (keyboard mash). Silakan ceritakan pengalaman aslimu atau gunakan salah satu tombol inspirasi.";
    }
  }

  // 5. Letter/Vowel Ratio for longer texts (e.g. step 1 & 2)
  if (step === 1 || step === 2) {
    const minLength = 6;
    if (clean.length < minLength) {
      return isEn 
        ? `Can you explain more? Minimum ${minLength} characters so Pathy can detect your career interests.`
        : "Bisa ceritakan lebih banyak? Minimal " + minLength + " karakter agar asisten Pathy bisa mendeteksi ketertarikan karirmu.";
    }

    // Check vowel ratio in words
    const words = lower.split(/\s+/).filter(w => w.length >= 4);
    if (words.length > 0) {
      let suspiciousWordsCount = 0;
      for (const w of words) {
        const cleanWord = w.replace(/[^a-z]/g, '');
        if (cleanWord.length >= 5) {
          const vowels = cleanWord.match(/[aeiouy]/g);
          // If a long word has extremely low vowel count, it's highly likely to be gibberish like "xcvbnm"
          if (!vowels || vowels.length / cleanWord.length < 0.15) {
            suspiciousWordsCount++;
          }
        }
      }
      if (suspiciousWordsCount > 0) {
        return isEn 
          ? "Answer contains unreadable or random words. Please replace with normal words."
          : "Jawaban mengandung kata-kata yang tidak terbaca atau acak. Mohon ganti dengan tulisan normal/kata-kata bahasa Indonesia atau Inggris.";
      }
    }

    // New Topic/Relevance validation: Prevent off-topic inputs (like movies, cooking, sleep, romance)
    // If text does not contain ANY of our broad list of technology, project, or learning keywords:
    const hasTagMatch = TECH_RELEVANT_KEYWORDS.some(kw => lower.includes(kw));
    if (!hasTagMatch) {
      return isEn 
        ? "Answer seems irrelevant to IT/tech. As an IT career assistant, Pathy needs to know about your courses, tasks, projects, or digital interests. Please retype or pick an inspiration suggestion!"
        : "Jawaban sepertinya kurang relevan dengan IT/teknologi. Sebagai asisten karir IT, Pathy perlu tahu tentang pelajaran, tugas, proyek, atau minat digitalmu. Silakan ketik ulang atau pilih salah satu inspirasi siap-pakai di bawah!";
    }
  }

  // 6. Step-specific extra checks
  if (step === 0) {
    // Name step
    if (clean.length < 2) {
      return isEn 
        ? "Nickname is too short (minimum 2 characters)."
        : "Nama panggilan terlalu singkat (minimal 2 karakter).";
    }
    if (clean.length > 30) {
      return isEn 
        ? "Nickname is too long (maximum 30 characters)."
        : "Nama panggilan terlalu panjang (maksimal 30 karakter).";
    }
    // Check for weird symbols in Name
    if (/[@#$%^&*()_+={}[\]|\\:;"'<>,.?/~`]/.test(clean)) {
      return isEn 
        ? "Nickname cannot contain special symbols."
        : "Nama panggilan tidak boleh mengandung simbol khusus.";
    }
    // Name vowel structure check to prevent keyboard mashes (like hgfd, jkl, etc)
    const hasVowels = /[aeiouy]/i.test(clean);
    if (!hasVowels && clean.length >= 3) {
      return isEn 
        ? "Nickname seems invalid (must contain vowels)."
        : "Nama panggilan sepertinya tidak valid (harus memiliki huruf vokal).";
    }
  }

  if (step === 4) {
    // Timeline step
    if (clean.length < 3) {
      return isEn 
        ? "Target timeline is too short. Please type your target timeframe or click a suggestion."
        : "Jangka waktu target terlalu singkat. Ketik target waktumu bekerja atau klik tombol pilihan siap pakai.";
    }
  }

  return null; // Passes validation!
}
