function JobSearchBanner() {
  return (
    <section className="relative bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 w-full flex flex-col md:flex-row items-center gap-6 shadow-md overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-blue-100 opacity-30"></div>
      <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-cyan-100 opacity-30"></div>
      
      {/* Content */}
      <div className="flex-1 text-center md:text-left relative z-10">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">Find Your Dream Job Today</h4>
        <p className="text-md text-gray-600 max-w-lg">
          Discover {Math.floor(Math.random() * 50000) + 10000}+ opportunities from top companies worldwide
        </p>
        
        {/* Popular search tags */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
          {['Remote', 'Frontend', 'Backend', 'Fullstack', 'Design', 'Marketing'].map((tag) => (
            <span 
              key={tag}
              className="text-xs bg-white/70 text-gray-700 px-3 py-1 rounded-full border border-gray-200 hover:bg-white cursor-pointer transition"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Search form */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto relative z-10">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Job title, keywords"
            className="text-sm border border-gray-200 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent shadow-sm"
          />
          <svg className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="relative w-full md:w-48">
          <input
            type="text"
            placeholder="Location"
            className="text-sm border border-gray-200 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent shadow-sm"
          />
          <svg className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-6 py-3 whitespace-nowrap transition-colors duration-200 shadow-md hover:shadow-lg w-full md:w-auto flex items-center justify-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Jobs
        </button>
      </div>
    </section>
  );
}

export default JobSearchBanner;