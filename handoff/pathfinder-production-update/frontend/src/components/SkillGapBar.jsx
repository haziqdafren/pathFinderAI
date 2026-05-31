export default function SkillGapBar({ skill, count, total }) {
  const percentage = Math.round((count / total) * 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[13px] font-medium text-text-primary">{skill}</span>
        <span className="text-[12px] text-text-secondary font-medium">{count}/{total}</span>
      </div>
      <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden">
        <div 
          className="h-full bg-orange rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
