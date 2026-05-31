export default function ProjectCard({ project }) {
  if (!project) return null;
  
  return (
    <div className="bg-surface border-[0.5px] border-border rounded-[12px] p-5">
      <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-orange mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-orange"></span>
        PROJECT RECOMMENDATION
      </div>
      <h3 className="text-[18px] font-medium text-text-primary mb-2 line-clamp-2">
        {project.name || project.tagline || 'Ekspansi Dashboard Data'}
      </h3>
      <a href={project.dataset_url || '#'} className="text-[13px] text-text-secondary mb-4 block hover:text-orange transition-colors">
        Dataset: {project.dataset || project.dataset_name || 'Public Kaggle Dataset'} ↗
      </a>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {(project.tech_stack || []).map((t, i) => (
          <span key={i} className="text-[11px] px-2.5 py-1 bg-dark text-white rounded-md">
            {t}
          </span>
        ))}
      </div>
      
      <div className="border-t-[0.5px] border-border mt-4 pt-4 flex justify-between items-center">
        <div>
          <div className="text-[10px] uppercase text-text-hint tracking-wider mb-1">Estimasi</div>
          <div className="text-[13px] font-medium">{project.duration_weeks || 4} Minggu</div>
        </div>
        <button className="bg-orange text-white px-5 py-2.5 rounded-[9px] text-[13px] font-medium hover:bg-orange-hover transition-colors">
          Mulai Project →
        </button>
      </div>
    </div>
  );
}
