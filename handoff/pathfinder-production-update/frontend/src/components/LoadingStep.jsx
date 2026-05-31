export default function LoadingStep({ number, text, meta, status }) {
  // status: 'pending', 'active', 'completed'
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  
  return (
    <div className={`flex items-center justify-between py-4 border-b border-white/10 transition-opacity duration-500 ${status === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
      <div className="flex items-center gap-4">
        <div className="text-[11px] text-white/40 tracking-wider w-6">
          {number}
        </div>
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isCompleted ? 'bg-orange border-orange text-white' : (isActive ? 'border-orange animate-pulse' : 'border-white/20')}`}>
          {isCompleted && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className={`text-[15px] ${isCompleted ? 'text-white' : 'text-white/60'}`}>
          {text}
        </div>
      </div>
      <div className="text-[11px] text-white/40 tracking-wider">
        {meta}
      </div>
    </div>
  );
}
