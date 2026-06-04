function JobCard({ job }) {
  return (
    <article className="bg-white rounded-xl p-5 flex justify-between items-center gap-4 shadow-sm">
      <div className="flex-1">
        <h3 className="font-semibold text-sm leading-tight mb-1 truncate max-w-[400px]">{job.title}</h3>
        <div className="flex items-center gap-1 text-xs text-[#475569] mb-1">
          <span className="font-semibold text-[#0f172a] cursor-pointer hover:underline">{job.company}</span>
          <i className="fas fa-star text-yellow-400"></i>
          <span>{job.rating}</span>
          <span className="underline cursor-pointer">{job.reviews} Reviews</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#475569] mb-1">
          <div className="flex items-center gap-1">
            <i className="far fa-briefcase"></i>
            <span>{job.experience}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="fas fa-map-marker-alt"></i>
            <span>{job.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#475569] mb-1">
          <i className="far fa-file-alt"></i>
          <span>{job.description}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[#475569] mb-2">
          {job.tags.map((tag, index) => (
            <span key={index} className="cursor-pointer hover:underline">{tag}</span>
          ))}
        </div>
        <div className="text-[10px] text-[#94a3b8] mb-1">{job.posted}</div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <img alt="Company logo" className="w-12 h-12 rounded-lg" src={job.logo} width="48" height="48" />
        <button aria-label="Save job" className="text-[#475569] hover:text-[#0f172a] text-sm">
          <i className="far fa-bookmark"></i> Save
        </button>
      </div>
    </article>
  );
}

export default JobCard;