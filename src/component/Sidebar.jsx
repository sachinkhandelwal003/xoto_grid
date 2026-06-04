import { useState } from 'react';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';

function Sidebar() {
  const [experience, setExperience] = useState(10);
  const [showWorkMode, setShowWorkMode] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [showDepartment, setShowDepartment] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

  const handleExperienceChange = (e) => {
    setExperience(e.target.value);
  };

  return (
    <aside className="bg-white rounded-lg p-6 flex-shrink-0 border border-gray-200 w-full">
      <h3 className="font-semibold text-sm mb-4">All Filters</h3>
      <hr className="border-[#e2e8f0] mb-6" />

      {/* Work Mode */}
      <section className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setShowWorkMode(!showWorkMode)}
        >
          <h4 className="font-semibold text-sm">Work mode</h4>
          {showWorkMode ? (
            <HiChevronUp className="text-[#94a3b8] text-lg" />
          ) : (
            <HiChevronDown className="text-[#94a3b8] text-lg" />
          )}
        </div>
        {showWorkMode && (
          <label className="inline-flex items-center mt-3 text-sm text-[#475569] cursor-pointer">
            <input className="form-checkbox h-4 w-4 text-[#0f172a]" type="checkbox" />
            <span className="ml-2">Work from office (18)</span>
          </label>
        )}
      </section>

      {/* Experience */}
      <section className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setShowExperience(!showExperience)}
        >
          <h4 className="font-semibold text-sm">Experience</h4>
          {showExperience ? (
            <HiChevronUp className="text-[#94a3b8] text-lg" />
          ) : (
            <HiChevronDown className="text-[#94a3b8] text-lg" />
          )}
        </div>
        {showExperience && (
          <div className="relative mt-6">
            <input
              className="w-full"
              id="experienceRange"
              type="range"
              min="0"
              max="10"
              value={experience}
              onChange={handleExperienceChange}
            />
            <div className="flex justify-between text-xs text-[#94a3b8] mt-1 px-1 select-none">
              <span>0 Yrs</span>
              <span>Any</span>
            </div>
          </div>
        )}
      </section>

      {/* Department */}
      <section className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setShowDepartment(!showDepartment)}
        >
          <h4 className="font-semibold text-sm">Department</h4>
          {showDepartment ? (
            <HiChevronUp className="text-[#94a3b8] text-lg" />
          ) : (
            <HiChevronDown className="text-[#94a3b8] text-lg" />
          )}
        </div>
        {showDepartment && (
          <div className="mt-3 space-y-2 text-sm text-[#475569]">
            {[
              { name: "Engineering - Soft...", count: 8 },
              { name: "Merchandising, Ret...", count: 3 },
              { name: "Finance & Account...", count: 1 },
              { name: "IT & Information Se...", count: 1 }
            ].map((dept, index) => (
              <label key={index} className="inline-flex items-center cursor-pointer">
                <input className="form-checkbox h-4 w-4 text-[#0f172a]" type="checkbox" />
                <span className="ml-2 truncate max-w-[180px]">
                  {dept.name} ({dept.count})
                </span>
              </label>
            ))}
            <button className="mt-2 text-xs text-[#2563eb] font-semibold">View More</button>
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="mb-6 border border-gray-200 rounded-lg">
        <div className="bg-white p-4 text-xs text-[#475569] max-w-[220px] leading-tight">
          <img
            alt="Naukri FastForward logo"
            className="mb-2"
            src="https://storage.googleapis.com/a1aa/image/a374f729-1513-44fa-8318-306ec149bd1d.jpg"
            width="120"
            height="40"
          />
          <p className="font-semibold text-sm mb-1">
            Get 3X more profile views from recruiters
          </p>
          <p className="mb-2 text-[11px]">
            Increase your chances of callback with Naukri FastForward
          </p>
          <a className="text-[#2563eb] font-semibold text-xs" href="#">Know More</a>
        </div>
      </section>

      {/* Location */}
      <section>
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setShowLocation(!showLocation)}
        >
          <h4 className="font-semibold text-sm">Location</h4>
          {showLocation ? (
            <HiChevronUp className="text-[#94a3b8] text-lg" />
          ) : (
            <HiChevronDown className="text-[#94a3b8] text-lg" />
          )}
        </div>
        {showLocation && (
          <div className="mt-3 space-y-2 text-sm text-[#475569]">
            {[
              { name: "Delhi / NCR", count: 9 },
              { name: "Bengaluru", count: 7 },
              { name: "New Delhi", count: 5 },
              { name: "Chennai", count: 2 }
            ].map((loc, index) => (
              <label key={index} className="inline-flex items-center cursor-pointer">
                <input className="form-checkbox h-4 w-4 text-[#0f172a]" type="checkbox" />
                <span className="ml-2">{loc.name} ({loc.count})</span>
              </label>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}

export default Sidebar;
