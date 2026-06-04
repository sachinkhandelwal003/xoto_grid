import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate =useNavigate()
  const dashboard =()=>{
    navigate('/Jobportal/dashboard')
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-r from-blue-50 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-b from-indigo-50 to-transparent opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your <span className="text-blue-600">Dream Job</span> 
              <br className="hidden md:block" /> Today
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Search through 500,000+ jobs from top companies worldwide. Your next career move starts here.
            </p>
          </div>

          {/* Centered Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-2">
              <form className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 py-3">
                  <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <input 
                    type="text" 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-2 placeholder-gray-400" 
                    placeholder="Job title, skills, or company"
                  />
                </div>
                <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 py-3">
                  <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <input 
                    type="text" 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-2 placeholder-gray-400" 
                    placeholder="Location or remote"
                  />
                </div>
                <button 
                  type="submit" 
                  onClick={()=>{dashboard()}}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  Search Jobs
                </button>
              </form>
            </div>

              {/* Popular Tags */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['Software Engineer', 'Product Manager', 'Remote', 'UX Designer', 'Data Scientist', 'Marketing'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Connecting Talent with <span className="text-blue-600">Opportunity</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform uses advanced matching algorithms to connect you with the perfect job opportunities based on your skills, experience, and preferences.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '500K+', label: 'Job Listings' },
                  { value: '10M+', label: 'Active Users' },
                  { value: '95%', label: 'Success Rate' },
                  { value: '24h', label: 'Fast Response' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-w-16 aspect-h-9">
                <img 
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80" 
                  alt="Team working together in modern office"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg w-2/3">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Daily Job Matches</p>
                    <p className="text-sm text-gray-500">Personalized to your profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;