export default function MetricCard({ label, value, subtext, highlight, dark }) {
  return (
    <div className={`rounded-[12px] border-[0.5px] border-border p-5 flex flex-col justify-between ${dark ? 'bg-dark text-white' : 'bg-surface text-text-primary'} ${highlight ? 'bg-orange text-white border-orange' : ''}`}>
      <div className={`text-[10px] font-medium uppercase tracking-[0.07em] mb-4 flex items-center gap-2 ${dark && !highlight ? 'text-text-hint' : (highlight ? 'text-orange-100' : 'text-text-hint')}`}>
        {highlight && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
        {label}
      </div>
      <div>
        <div className={`text-[48px] font-medium tracking-tight leading-none mb-2 text-white`}>
          {value}
        </div>
        <div className={`text-[13px] ${highlight ? 'text-orange-100' : 'text-text-secondary'}`}>
          {subtext}
        </div>
      </div>
    </div>
  );
}
