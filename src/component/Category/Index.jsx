import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';

const Category = () => {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const categories = [
    {
      name: "Marketing & Sale",
      jobs: "1526 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/e6f807cf-95bf-4551-70a7-2b6500e85802.jpg"
    },
    {
      name: "Finance",
      jobs: "168 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/4e2d041f-534d-42aa-13b0-02b3694615c1.jpg"
    },
    {
      name: "Human Resource",
      jobs: "165 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/90159d06-2341-4c6f-2d39-853c0e0b6231.jpg"
    },
    {
      name: "Retail & Products",
      jobs: "563 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/0a5e7ae9-f3b3-45ad-82d4-7d8d118cf44d.jpg"
    },
    {
      name: "Content Writer",
      jobs: "142 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/347141a7-b34e-4a06-0717-2f2a9e4b0531.jpg"
    },
    {
      name: "Customer Help",
      jobs: "185 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/6bcb1636-0b16-4d4d-4a62-3583ec23c3d6.jpg"
    },
    {
      name: "Software",
      jobs: "1856 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/dad66ea9-0e60-4fcc-5fe7-0334229354f3.jpg"
    },
    {
      name: "Management",
      jobs: "965 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/e1a23ec6-f24c-4b12-96b6-ea45b1cbca35.jpg"
    },
    {
      name: "Security Analyst",
      jobs: "254 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/47041256-75a7-4a62-bd91-29a0ee684e10.jpg"
    },
    {
      name: "Market Research",
      jobs: "532 Jobs Available",
      icon: "https://storage.googleapis.com/a1aa/image/6741d7e9-cd09-4e4f-c82e-668df2518296.jpg"
    }
  ];

  // Split categories into two rows
  const firstRow = categories.slice(0, 5);
  const secondRow = categories.slice(5, 10);

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1a4b] tracking-tight">
            Explore Job Categories
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#5a5f7d] max-w-2xl mx-auto">
            Discover the <span className="font-semibold text-[#4f6ef7]">perfect job</span> for you with over 800 new opportunities daily.
          </p>
        </div>

        {/* Category Slider */}
        <div className="relative">
          <button
            aria-label="Previous"
            onClick={scrollLeft}
            className="absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg text-[#4f6ef7] flex items-center justify-center cursor-pointer hover:bg-[#f0f5ff] transition-all duration-200 z-10"
          >
            <FiChevronLeft className="text-xl" />
          </button>

          <div
            ref={sliderRef}
            className="overflow-x-auto scrollbar-hide py-6 px-2"
          >
            <div className="w-max mx-auto">
              {/* First Row */}
              <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6">
                {firstRow.map((category, index) => (
                  <div key={index} className="w-[200px] sm:w-[220px] flex-shrink-0">
                    <a
                      className="block bg-white border border-[#e6eeff] rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      href="#"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          alt={`${category.name} icon`}
                          className="w-10 h-10 rounded-full object-cover"
                          src={category.icon}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#0c1a4b] leading-tight truncate">
                            {category.name}
                          </p>
                          <p className="text-xs text-[#5a5f7d] mt-1">
                            {category.jobs}
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
              {/* Second Row */}
              <div className="flex gap-4 sm:gap-6">
                {secondRow.map((category, index) => (
                  <div key={index} className="w-[200px] sm:w-[220px] flex-shrink-0">
                    <a
                      className="block bg-white border border-[#e6eeff] rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      href="#"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          alt={`${category.name} icon`}
                          className="w-10 h-10 rounded-full object-cover"
                          src={category.icon}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#0c1a4b] leading-tight truncate">
                            {category.name}
                          </p>
                          <p className="text-xs text-[#5a5f7d] mt-1">
                            {category.jobs}
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            aria-label="Next"
            onClick={scrollRight}
            className="absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg text-[#4f6ef7] flex items-center justify-center cursor-pointer hover:bg-[#f0f5ff] transition-all duration-200 z-10"
          >
            <FiChevronRight className="text-xl" />
          </button>
        </div>

        {/* Banner Section */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-[#4f6ef7] to-[#2f5fff] rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8 text-white shadow-2xl">
            <div className="flex items-center gap-6 flex-1">
              <img
                alt="Illustration of a person standing next to a plant"
                className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-full bg-white/20 p-2"
                src="https://storage.googleapis.com/a1aa/image/f5edf0a7-19a1-4a72-e9b2-d964222ea37c.jpg"
              />
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold opacity-80">
                  Join Our Team
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight mt-2">
                  We're Hiring!
                </h3>
                <p className="text-sm sm:text-base mt-2 opacity-90 max-w-sm">
                  Collaborate with us and unlock exciting career opportunities.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-white text-[#4f6ef7] text-sm font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#f0f5ff] transition-all duration-200">
                <FiCheckCircle className="text-lg" />
                Apply Now
              </button>
              <img
                alt="Illustration of two people sitting and talking with a plant"
                className="hidden sm:block w-32 h-24 flex-shrink-0 rounded-lg object-cover"
                src="https://storage.googleapis.com/a1aa/image/03cbd730-313b-4e88-ac6c-95c576275af5.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Custom scrollbar styling */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Category;