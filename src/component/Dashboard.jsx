import Sidebar from './Sidebar';
import JobCard from './JobCard';
import RegisterBanner from './RegisterBanner';

const jobs = [
  {
    id: 1,
    title: "Structural / Infrastructure Design Engineer (Min. 8-12 Yrs)",
    company: "DDF Consultants",
    rating: 4.3,
    reviews: 95,
    experience: "8-12 Yrs",
    location: "Agra",
    description: "Preferred candidate profile",
    tags: ["srfructural engineer", "Structural Engineering", "Structural Design", "Infrastrucure"],
    posted: "1 week ago",
    logo: "https://storage.googleapis.com/a1aa/image/c16b6f89-1ff8-4781-7149-ef38ff1c5413.jpg"
  },
  {
    id: 2,
    title: "Architect Planner (5-10years)",
    company: "DDF Consultants",
    rating: 4.3,
    reviews: 95,
    experience: "5-10 Yrs",
    location: "Agra, Delhi / NCR",
    description: "Bachelors degree in Architecture and Masters degree in Urban Planning, o...",
    tags: ["architect planner", "planning", "Urban Planning", "master plan", "Master Planning", "urban"],
    posted: "3+ weeks ago",
    logo: "https://storage.googleapis.com/a1aa/image/c16b6f89-1ff8-4781-7149-ef38ff1c5413.jpg"
  },
   {
    id: 3,
    title: "Architect Planner (5-10years)",
    company: "DDF Consultants",
    rating: 4.3,
    reviews: 95,
    experience: "5-10 Yrs",
    location: "Agra, Delhi / NCR",
    description: "Bachelors degree in Architecture and Masters degree in Urban Planning, o...",
    tags: ["architect planner", "planning", "Urban Planning", "master plan", "Master Planning", "urban"],
    posted: "3+ weeks ago",
    logo: "https://storage.googleapis.com/a1aa/image/c16b6f89-1ff8-4781-7149-ef38ff1c5413.jpg"
  } ,{
    id: 4,
    title: "Architect Planner (5-10years)",
    company: "DDF Consultants",
    rating: 4.3,
    reviews: 95,
    experience: "5-10 Yrs",
    location: "Agra, Delhi / NCR",
    description: "Bachelors degree in Architecture and Masters degree in Urban Planning, o...",
    tags: ["architect planner", "planning", "Urban Planning", "master plan", "Master Planning", "urban"],
    posted: "3+ weeks ago",
    logo: "https://storage.googleapis.com/a1aa/image/c16b6f89-1ff8-4781-7149-ef38ff1c5413.jpg"
  }
];

function Dashboard() {
  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen bg-[#F8F9FA] max-w-7xl mx-auto mt-6 border border-gray-200">
  {/* Left Sidebar */}
  <aside className="bg-white border-r border-gray-200 p-6">
    <Sidebar />
  </aside>

  {/* Main Content */}
 <main className="p-6 flex flex-col gap-6">
  {/* Header */}
  <div className="flex justify-between items-center text-xs text-[#475569]">
    <div>
      1 - 18 of 18 <span className="font-semibold">Ddf Jobs</span>
    </div>
    <div className="relative inline-block text-sm">
      <label className="mr-2" htmlFor="sort">Sort by:</label>
      <select className="border border-[#cbd5e1] rounded-md text-[#475569] text-xs py-1 px-2 cursor-pointer" id="sort">
        <option>Relevance</option>
      </select>
      <i className="fas fa-chevron-down absolute right-2 top-2.5 pointer-events-none text-[#475569] text-xs"></i>
    </div>
  </div>

  {/* Job Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {jobs.map(job => (
      <JobCard key={job.id} job={job} />
    ))}
  </div>

  {/* Register Banner */}
  <RegisterBanner />
</main>

</div>

  );
}

export default Dashboard;
