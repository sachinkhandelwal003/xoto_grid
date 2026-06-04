import React from 'react';

const Jobs = () => {
  // Array of job objects
  const jobs = [
    {
      id: 1,
      company: 'LinkedIn',
      logo: 'https://storage.googleapis.com/a1aa/image/2f625b61-0365-476e-4653-3730f66a47ac.jpg',
      logoAlt: "LinkedIn logo blue background with white 'in' letters",
      location: 'New York, US',
      title: 'UI / UX Designer fulltime',
      type: 'Full time',
      posted: '4 minutes ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae architecto eveniet, dolor quo repellendus pariatur.',
      skills: ['Adobe XD', 'Figma', 'Photoshop'],
      salary: 'AED500',
      salaryPeriod: '/Hour',
    },
    {
      id: 2,
      company: 'Adobe Illustrator',
      logo: 'https://storage.googleapis.com/a1aa/image/324dcc82-3c77-45c5-4512-bf21ecd1a2f1.jpg',
      logoAlt: "Adobe Illustrator logo green background with white text",
      location: 'New York, US',
      title: 'Full Stack Engineer',
      type: 'Part time',
      posted: '5 minutes ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae architecto eveniet, dolor quo repellendus pariatur.',
      skills: ['React', 'NodeJS'],
      salary: 'AED800',
      salaryPeriod: '/Hour',
    },
    {
      id: 3,
      company: 'Bing Search',
      logo: 'https://storage.googleapis.com/a1aa/image/49f0e9e9-2654-4b21-263f-a1bb0e96287b.jpg',
      logoAlt: "Bing Search logo blue background with white 'P' letter",
      location: 'New York, US',
      title: 'Java Software Engineer',
      type: 'Full time',
      posted: '6 minutes ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae architecto eveniet, dolor quo repellendus pariatur.',
      skills: ['Python', 'AWS', 'Photoshop'],
      salary: 'AED250',
      salaryPeriod: '/Hour',
    },
    {
      id: 4,
      company: 'Dailymotion',
      logo: 'https://storage.googleapis.com/a1aa/image/288ef70a-4f49-4a32-049c-063aec7224cd.jpg',
      logoAlt: "Dailymotion logo blue background with white wifi icon",
      location: 'New York, US',
      title: 'Frontend Developer',
      type: 'Full time',
      posted: '6 minutes ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae architecto eveniet, dolor quo repellendus pariatur.',
      skills: ['Typescript', 'Java'],
      salary: 'AED250',
      salaryPeriod: '/Hour',
    },
    {
      id: 5,
      company: 'Linkedin',
      logo: 'https://storage.googleapis.com/a1aa/image/de307103-8c66-44cd-5a8f-ea694add9f46.jpg',
      logoAlt: "Linkedin logo purple background with white 'R' letter",
      location: 'New York, US',
      title: 'React Native Web Developer',
      type: 'Full time',
      posted: '4 minutes ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae architecto eveniet, dolor quo repellendus pariatur.',
      skills: ['Angular'],
      salary: 'AED500',
      salaryPeriod: '/Hour',
    },
    {
      id: 6,
      company: 'Quora JSC',
      logo: 'https://storage.googleapis.com/a1aa/image/4ac00eb7-7aba-4c64-0859-f3dcc500f3db.jpg',
      logoAlt: "Quora JSC logo blue background with white 'FlyChat' text",
      location: 'New York, US',
      title: 'Senior System Engineer',
      type: 'Part time',
      posted: '5 minutes ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit elit. Recusandae architecto eveniet, dolor quo repellendus pariatur.',
      skills: ['javascript'],
      salary: 'AED800',
      salaryPeriod: '/Hour',
    },
    {
      id: 7,
      company: 'Nintendo',
      logo: 'https://storage.googleapis.com/a1aa/image/2d01b8aa-805f-43c1-c95b-59af8c90caab.jpg',
      logoAlt: "Nintendo logo red background with white game controller icon",
      location: 'New York, US',
      title: 'Products Manager',
      type: 'Full time',
      posted: '6 minutes ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae architecto eveniet, dolor quo repellendus pariatur.',
      skills: ['ASP.Net', 'Figma'],
      salary: 'AED250',
      salaryPeriod: '/Hour',
    },
    {
      id: 8,
      company: 'Periscope',
      logo: 'https://storage.googleapis.com/a1aa/image/800b9750-4733-4c87-6d84-5132858ad412.jpg',
      logoAlt: "Periscope logo yellow background with black 'P' letter",
      location: 'New York, US',
      title: 'Lead Quality Control QA',
      type: 'Full time',
      posted: '6 minutes ago',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae architecto eveniet, dolor quo repellendus pariatur.',
      skills: ['iOS', 'Laravel', 'Golang'],
      salary: 'AED250',
      salaryPeriod: '/Hour',
    },
  ];

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            Jobs of the day
          </h1>
          <p className="text-md text-gray-500 mt-2">
            Search and connect with the right candidates faster.
          </p>
        </section>

        <section className="flex flex-wrap justify-center gap-3 mb-12">
          <button className="flex items-center gap-2 text-xl font-semibold text-blue-600 border border-blue-600 rounded px-3 py-1">
            <i className="fas fa-sitemap text-xs"></i>
            Management
          </button>
          <button className="flex items-center gap-2 text-xl font-semibold text-blue-600 border border-blue-600 rounded px-3 py-1">
            <i className="fas fa-tags text-xs"></i>
            Marketing & Sale
          </button>
          <button className="flex items-center gap-2 text-xl font-semibold text-blue-600 border border-blue-600 rounded px-3 py-1">
            <i className="fas fa-chart-bar text-xs"></i>
            Finance
          </button>
          <button className="flex items-center gap-2 text-xl font-semibold text-blue-600 border border-blue-600 rounded px-3 py-1">
            <i className="fas fa-users text-xs"></i>
            Human Resource
          </button>
          <button className="flex items-center gap-2 text-xl font-semibold text-blue-600 border border-blue-600 rounded px-3 py-1">
            <i className="fas fa-box-open text-xs"></i>
            Retail & Products
          </button>
          <button className="flex items-center gap-2 text-xl font-semibold text-blue-600 border border-blue-600 rounded px-3 py-1">
            <i className="far fa-file-alt text-xs"></i>
            Content Writer
          </button>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    alt={job.logoAlt}
                    className="w-12 h-12 rounded"
                    height={48}
                    src={job.logo}
                    width={48}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {job.company}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-xs"></i>
                      {job.location}
                    </p>
                  </div>
                </div>
                <i className="fas fa-bolt text-green-400 text-sm"></i>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {job.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                <div className="flex items-center gap-2">
                  <i className="far fa-clock text-xs"></i>
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="far fa-clock text-xs"></i>
                  <span>{job.posted}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs text-gray-400 border border-gray-300 rounded px-2 py-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="text-lg font-semibold text-blue-600">
                {job.salary}
                <span className="text-sm font-normal text-gray-400">
                  {job.salaryPeriod}
                </span>
              </div>

              <button className="mt-4 w-full text-sm text-blue-600 font-semibold border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition">
                Apply Now
              </button>
            </article>
          ))}
        </section>
      </main>
    </>
  );
};

export default Jobs;