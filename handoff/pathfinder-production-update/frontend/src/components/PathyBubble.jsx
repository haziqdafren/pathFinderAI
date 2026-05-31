export default function PathyBubble({ message, timestamp, followUpQuestions }) {
  return (
    <div className="bg-dark rounded-[12px] p-4 flex gap-4 mb-6 shrink-0 max-w-3xl">
      <div className="w-10 h-10 bg-orange rounded-full flex items-center justify-center text-white font-bold shrink-0">
        P
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium text-[13px]">Pathy</span>
          <span className="bg-emerald-500 w-2 h-2 rounded-full"></span>
          <span className="text-emerald-500 text-[10px] uppercase tracking-wider font-bold">Online · Agent Kamu</span>
          <span className="text-text-secondary text-[10px] ml-auto">
            {timestamp || '12 DETIK LALU'}
          </span>
        </div>
        <p className="text-white text-[13px] leading-relaxed mb-4">
          {message}
        </p>
        
        {followUpQuestions && followUpQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {followUpQuestions.map((q, i) => (
              <button key={i} className="px-3 py-1.5 border border-text-secondary rounded-full text-white text-[11px] hover:bg-white/10 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
