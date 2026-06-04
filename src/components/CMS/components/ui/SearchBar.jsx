// components/ui/SearchBar.js
import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative">
      {/* Desktop Search */}
      <div className="hidden sm:block">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <FiSearch className="w-5 h-5" />
          </button>
        ) : (
          <div className="absolute right-0 top-0 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-40">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;