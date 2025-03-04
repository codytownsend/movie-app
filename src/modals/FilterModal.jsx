// src/modals/FilterModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const FilterModal = ({ setFilterOpen }) => {
  const { 
    colorScheme, 
    darkMode, 
    filterPreferences, 
    toggleGenreFilter,
    toggleServiceFilter, 
    setYearRangeFilter, 
    setRatingFilter, 
    applyFilters 
  } = useAppContext();

  // Handle filter reset
  const handleResetFilters = () => {
    // Reset filters logic would be in the context
    // For now, just show that we would reset and close the modal
    setFilterOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setFilterOpen(false)}>
      <div 
        className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className={`text-xl font-bold ${colorScheme.text}`}>Refine Your Matches</h2>
            <button onClick={() => setFilterOpen(false)}>
              <X className={`w-6 h-6 ${colorScheme.text}`} />
            </button>
          </div>
          
          <div className="mb-5">
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Genres</h3>
            <div className="flex flex-wrap">
              {["Action", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"].map((genre) => (
                <div key={genre} className="mr-2 mb-2">
                  <input 
                    type="checkbox" 
                    id={genre} 
                    className="sr-only peer" 
                    checked={filterPreferences.genres.includes(genre)}
                    onChange={() => toggleGenreFilter(genre)}
                  />
                  <label 
                    htmlFor={genre} 
                    className={`cursor-pointer px-3 py-2 rounded-full ${
                      darkMode 
                        ? filterPreferences.genres.includes(genre) ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300' 
                        : filterPreferences.genres.includes(genre) ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'
                    } transition-colors`}
                  >
                    {genre}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-5">
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Streaming Services</h3>
            <div className="flex flex-wrap">
              {["Netflix", "Hulu", "Prime Video", "Disney+", "HBO Max", "Apple TV+"].map((service) => (
                <div key={service} className="mr-2 mb-2">
                  <input 
                    type="checkbox" 
                    id={service} 
                    className="sr-only peer" 
                    checked={filterPreferences.services.includes(service)}
                    onChange={() => toggleServiceFilter(service)}
                  />
                  <label 
                    htmlFor={service} 
                    className={`cursor-pointer px-3 py-2 rounded-full ${
                      darkMode 
                        ? filterPreferences.services.includes(service) ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300' 
                        : filterPreferences.services.includes(service) ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'
                    } transition-colors`}
                  >
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-5">
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Release Year</h3>
            <div className="px-2">
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${colorScheme.text}`}>{filterPreferences.yearRange[0]}</span>
                <span className={`text-sm ${colorScheme.text}`}>{filterPreferences.yearRange[1]}</span>
              </div>
              <input 
                type="range" 
                min="1970" 
                max="2025" 
                className="w-full accent-purple-500"
                value={filterPreferences.yearRange[0]}
                onChange={(e) => setYearRangeFilter([parseInt(e.target.value), filterPreferences.yearRange[1]])}
              />
              <input 
                type="range" 
                min="1970" 
                max="2025" 
                className="w-full accent-purple-500"
                value={filterPreferences.yearRange[1]}
                onChange={(e) => setYearRangeFilter([filterPreferences.yearRange[0], parseInt(e.target.value)])}
              />
            </div>
          </div>
          
          <div className="mb-5">
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Minimum Rating</h3>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} onClick={() => setRatingFilter(star * 2)}>
                    <span className={`w-8 h-8 cursor-pointer ${star <= Math.ceil(filterPreferences.minRating / 2) ? 'text-yellow-400' : colorScheme.textSecondary}`}>
                      ★
                    </span>
                  </span>
                ))}
              </div>
              <span className="ml-2 text-yellow-500 font-medium">{filterPreferences.minRating}+</span>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-8">
            <button 
              className={`flex-1 border ${colorScheme.border} ${colorScheme.text} py-3 rounded-lg font-medium`}
              onClick={handleResetFilters}
            >
              Reset
            </button>
            <button 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium"
              onClick={() => {
                applyFilters();
                setFilterOpen(false);
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;