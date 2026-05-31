export default function RoleCard({ rank, roleName, fitScore, skills, highlight }) {
  return (
    <div className={`p-4 border-[0.5px] border-border rounded-[12px] flex items-center justify-between mb-3 ${highlight ? 'bg-dark text-white border-dark' : 'bg-surface text-text-primary'}`}>
      <div className="flex items-center gap-4">
        <div className={`text-[12px] font-medium ${highlight ? 'text-orange' : 'text-text-hint'}`}>
          {rank.toString().padStart(2, '0')}
        </div>
        <div>
          <div className="text-[14px] font-medium mb-1">{roleName}</div>
          <div className="flex gap-2">
            {skills.map((s, i) => (
              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${highlight ? 'bg-white/10 text-white/70' : 'bg-bg text-text-secondary'}`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className={`text-[20px] font-medium ${highlight ? 'text-orange' : 'text-text-primary'}`}>
        {fitScore}%
      </div>
    </div>
  );
}
