// src/modals/FilterModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Sliders, Calendar, Award } from 'lucide-react';
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
    applyFilters,
    showToast,
    movies
  } = useAppContext();

  // Create local state to track changes before applying
  const [localFilters, setLocalFilters] = useState({...filterPreferences});
  const [matchCount, setMatchCount] = useState(0);
  const modalRef = useRef(null);
  
  // State for decade selection
  const [selectedDecades, setSelectedDecades] = useState(() => {
    // Convert current year range to decades
    const startDecade = Math.floor(localFilters.yearRange[0] / 10) * 10;
    const endDecade = Math.floor(localFilters.yearRange[1] / 10) * 10;
    
    // Create array of selected decades
    const decades = [];
    for (let decade = startDecade; decade <= endDecade; decade += 10) {
      if (decade >= 1920 && decade <= 2020) {
        decades.push(decade);
      }
    }
    return decades;
  });
  
  // Calculate the estimated match count when filters change
  useEffect(() => {
    // This is a simplified simulation
    const genreImpact = localFilters.genres.length ? 0.8 : 1;
    const serviceImpact = localFilters.services.length ? 0.7 : 1;
    const ratingImpact = localFilters.minRating > 0 ? (10 - localFilters.minRating) / 10 : 1;
    const yearImpact = (localFilters.yearRange[1] - localFilters.yearRange[0]) / 100;

    // Calculate approximately how many movies would match
    const estimatedMatches = Math.floor(
      movies.length * genreImpact * serviceImpact * ratingImpact * yearImpact
    );
    
    setMatchCount(Math.max(0, Math.min(movies.length, estimatedMatches)));
  }, [localFilters, movies]);
  
  // Detect clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setFilterOpen]);

  // Toggle a decade in selection
  const toggleDecade = (decade) => {
    setSelectedDecades(prev => {
      if (prev.includes(decade)) {
        return prev.filter(d => d !== decade);
      } else {
        return [...prev, decade].sort((a, b) => a - b);
      }
    });
    
    // Update year range based on selected decades
    updateYearRangeFromDecades();
  };
  
  // Update year range filter based on selected decades
  const updateYearRangeFromDecades = () => {
    if (selectedDecades.length === 0) return;
    
    const minDecade = Math.min(...selectedDecades);
    const maxDecade = Math.max(...selectedDecades);
    const newRange = [minDecade, maxDecade + 9];
    
    setLocalFilters(prev => ({
      ...prev,
      yearRange: newRange
    }));
  };

  // Handle filter reset
  const handleResetFilters = () => {
    const resetFilters = {
      genres: [],
      services: [],
      minRating: 0,
      yearRange: [1920, new Date().getFullYear()]
    };
    
    setLocalFilters(resetFilters);
    
    // Reset decades selection too
    setSelectedDecades([1970, 1980, 1990, 2000, 2010, 2020]);
    
    showToast("Filters reset");
  };

  // Handle local genre toggle
  const handleGenreToggle = (genre) => {
    setLocalFilters(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  // Handle local service toggle
  const handleServiceToggle = (service) => {
    setLocalFilters(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  // Apply all filters at once
  const handleApplyFilters = () => {
    // Update year range from selected decades before applying
    if (selectedDecades.length > 0) {
      const minDecade = Math.min(...selectedDecades);
      const maxDecade = Math.max(...selectedDecades);
      setLocalFilters(prev => ({
        ...prev,
        yearRange: [minDecade, maxDecade + 9]
      }));
    }
    
    // Update all filter states at once
    localFilters.genres.forEach(genre => {
      if (!filterPreferences.genres.includes(genre)) {
        toggleGenreFilter(genre);
      }
    });
    
    filterPreferences.genres.forEach(genre => {
      if (!localFilters.genres.includes(genre)) {
        toggleGenreFilter(genre);
      }
    });
    
    localFilters.services.forEach(service => {
      if (!filterPreferences.services.includes(service)) {
        toggleServiceFilter(service);
      }
    });
    
    filterPreferences.services.forEach(service => {
      if (!localFilters.services.includes(service)) {
        toggleServiceFilter(service);
      }
    });
    
    setRatingFilter(localFilters.minRating);
    setYearRangeFilter(localFilters.yearRange);
    
    // Apply filters and close modal
    applyFilters();
    setFilterOpen(false);
    showToast(`Found ${matchCount} movies matching your filters`);
  };

  // Define genres with categories
  const genreCategories = [
    {
      name: "Popular Genres",
      genres: ["Action", "Adventure", "Comedy", "Drama", "Sci-Fi", "Thriller"]
    },
    {
      name: "All Genres",
      genres: ["Animation", "Crime", "Documentary", "Fantasy", "Horror", "Romance", "Mystery", "Western", "Family", "History"]
    }
  ];

  // Define streaming services with colors
  const streamingServices = [
    { name: "Netflix", color: "#E50914" },
    { name: "Disney+", color: "#0063e5" },
    { name: "Hulu", color: "#1CE783" },
    { name: "Prime", color: "#00A8E1" },
    { name: "HBO Max", color: "#5822b4" },
    { name: "Apple TV+", color: "#000000" },
    { name: "Peacock", color: "#110F5E" },
    { name: "Paramount+", color: "#0066FF" }
  ];

  const currentYear = new Date().getFullYear();
  
  // Available decades for selection
  const availableDecades = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  
  // Quick selects for year range
  const yearQuickSelects = [
    { label: "Recent", decades: [2020] },
    { label: "2010s", decades: [2010] },
    { label: "2000s", decades: [2000] },
    { label: "90s", decades: [1990] },
    { label: "80s", decades: [1980] },
    { label: "Classics", decades: [1920, 1930, 1940, 1950, 1960, 1970] }
  ];

  // Rating presets
  const ratingPresets = [
    { label: "Any", value: 0 },
    { label: "6+", value: 6 },
    { label: "7+", value: 7 },
    { label: "8+", value: 8 },
    { label: "9+", value: 9 }
  ];

  // Count active filters
  const activeFilterCount = 
    localFilters.genres.length + 
    localFilters.services.length + 
    (localFilters.minRating > 0 ? 1 : 0) + 
    (selectedDecades.length > 0 && selectedDecades.length < availableDecades.length ? 1 : 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div 
        ref={modalRef}
        className={`${darkMode ? 'bg-gray-900' : 'bg-white'} w-full sm:w-[440px] h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: darkMode 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Filter Movies
            </h2>
            {activeFilterCount > 0 && (
              <div className="flex items-center mt-1.5">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeFilterCount} filters active
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mx-2"></div>
                <span className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} font-medium`}>
                  {matchCount} matches
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="mr-4 group flex items-center"
              >
                <RefreshCw className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} group-hover:rotate-180 transition-transform duration-500`} />
                <span className={`ml-1.5 text-sm font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  Reset
                </span>
              </button>
            )}
            
            <button 
              onClick={() => setFilterOpen(false)}
              className={`w-9 h-9 flex items-center justify-center rounded-full ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <X className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>
        
        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-7 pb-7">
            {/* Genres Section */}
            <div className="mb-8">
              <SectionHeader 
                icon={<Sliders className="w-5 h-5" />}
                title="Select Genres" 
                count={localFilters.genres.length} 
              />
              
              {/* Genre categories */}
              {genreCategories.map((category, index) => (
                <div key={category.name} className={index > 0 ? 'mt-5' : ''}>
                  <div className="text-xs text-white uppercase tracking-wider font-medium mb-3 ml-1 opacity-60">
                    {category.name}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {category.genres.map((genre) => {
                      const isSelected = localFilters.genres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => handleGenreToggle(genre)}
                          className={`group px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                            isSelected
                              ? darkMode 
                                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30' 
                                : 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-400/30'
                              : darkMode 
                                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="relative">
                            {genre}
                            {isSelected && (
                              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 dark:bg-indigo-300 transform origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-300"></span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Streaming Services Section */}
            <div className="mb-8">
              <SectionHeader title="Streaming Services" count={localFilters.services.length} />
              
              <div className="grid grid-cols-4 gap-3">
                {streamingServices.map((service) => {
                  const isSelected = localFilters.services.includes(service.name);
                  // Convert HEX to RGB for CSS
                  const hexToRgb = (hex) => {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `${r}, ${g}, ${b}`;
                  };
                  
                  const rgbColor = hexToRgb(service.color);
                  
                  return (
                    <button
                      key={service.name}
                      onClick={() => handleServiceToggle(service.name)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-200 relative overflow-hidden ${
                        isSelected
                          ? 'ring-2 scale-[1.02]'
                          : 'ring-1 hover:scale-[1.02]'
                      }`}
                      style={{
                        backgroundColor: isSelected 
                          ? darkMode ? `rgba(${rgbColor}, 0.3)` : `rgba(${rgbColor}, 0.1)`
                          : darkMode ? '#1f2937' : '#f3f4f6',
                        ringColor: isSelected 
                          ? `rgba(${rgbColor}, ${darkMode ? 0.8 : 0.5})`
                          : darkMode ? 'rgba(99, 102, 241, 0.6)' : 'rgba(229, 231, 235, 0.8)',
                      }}
                    >
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                          isSelected ? 'scale-110' : 'scale-100'
                        } transition-transform duration-300`}
                                                  style={{
                          backgroundColor: isSelected 
                            ? service.color
                            : darkMode ? '#1f2937' : '#ffffff',
                          boxShadow: isSelected
                            ? `0 4px 12px rgba(${rgbColor}, 0.5)`
                            : darkMode ? '0 4px 6px rgba(255, 255, 255, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <span 
                          className={`text-lg font-bold ${isSelected ? 'text-white' : ''}`}
                          style={{
                            color: isSelected 
                              ? '#ffffff' 
                              : service.color === '#000000' 
                                ? darkMode ? '#ffffff' : '#000000'
                                : darkMode && (service.color === "#110F5E" || service.color === "#5822b4")
                                  ? '#ffffff'
                                  : service.color
                          }}
                        >
                          {service.name.charAt(0)}
                        </span>
                      </div>
                      <span 
                        className={`text-xs font-medium ${
                          isSelected 
                            ? 'text-white' 
                            : darkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        {service.name.split(' ')[0]}
                      </span>
                      
                      {/* Selected indicator */}
                      {isSelected && (
                        <div 
                          className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center rounded-tl-lg"
                          style={{ backgroundColor: service.color }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Decades Section (replacing Year Range) */}
            <div className="mb-8">
              <SectionHeader 
                icon={<Calendar className="w-5 h-5" />}
                title="Release Decades" 
                count={selectedDecades.length > 0 && selectedDecades.length < availableDecades.length ? 1 : 0} 
                value={selectedDecades.length > 0 ? `${Math.min(...selectedDecades)}s—${Math.max(...selectedDecades)}s` : 'All decades'}
              />
              
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-5 rounded-2xl overflow-hidden`}>
                {/* Decades selection */}
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {availableDecades.map((decade) => {
                    const isSelected = selectedDecades.includes(decade);
                    return (
                      <button
                        key={decade}
                        onClick={() => toggleDecade(decade)}
                        className={`group px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                          isSelected
                            ? darkMode 
                              ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30' 
                              : 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-400/30'
                            : darkMode 
                              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 ring-1 ring-gray-200'
                        }`}
                      >
                        <span className="relative">
                          {decade}s
                          {isSelected && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 dark:bg-indigo-300 transform origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-300"></span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Quick selects */}
                <div>
                  <div className="text-xs text-white uppercase tracking-wider font-medium mb-3 ml-1 opacity-60">
                    Quick Select
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {yearQuickSelects.map((option) => {
                      // Check if all of this option's decades are selected
                      const isSelected = option.decades.every(decade => 
                        selectedDecades.includes(decade)
                      ) && option.decades.length === selectedDecades.length;
                      
                      return (
                        <button
                          key={option.label}
                          onClick={() => {
                            setSelectedDecades(option.decades);
                            // Update year range based on selected decades
                            const minDecade = Math.min(...option.decades);
                            const maxDecade = Math.max(...option.decades);
                            setLocalFilters(prev => ({
                              ...prev,
                              yearRange: [minDecade, maxDecade + 9]
                            }));
                          }}
                          className={`py-2.5 rounded-xl text-sm transition-all duration-200 ${
                            isSelected
                              ? darkMode 
                                ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500/40' 
                                : 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-400/40'
                              : darkMode 
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white ring-1 ring-gray-600' 
                                : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rating Section - Modified to remove stars */}
            <div className="mb-8">
              <SectionHeader 
                icon={<Award className="w-5 h-5" />}
                title="Minimum Rating" 
                count={localFilters.minRating > 0 ? 1 : 0}
                value={localFilters.minRating > 0 ? `${localFilters.minRating}+ / 10` : 'Any rating'}
              />
              
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-5 rounded-2xl overflow-hidden`}>
                {/* Rating value indicator */}
                <div 
                  className={`w-full h-14 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl mb-6 flex items-center justify-center text-xl font-semibold shadow-sm border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  style={{
                    color: localFilters.minRating >= 8 ? darkMode ? 'rgb(134, 239, 172)' : 'rgb(22, 163, 74)' : 
                           localFilters.minRating >= 6 ? darkMode ? 'rgb(253, 224, 71)' : 'rgb(202, 138, 4)' : 
                           localFilters.minRating > 0 ? darkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)' :
                           darkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                  }}
                >
                  {localFilters.minRating === 0 ? 'Any Rating' : `${localFilters.minRating}+ / 10`}
                </div>
                
                {/* Slider */}
                <div className="px-1 mb-6">
                  <div className="relative">
                    <div className={`h-1.5 w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full`}></div>
                    <div 
                      className="absolute top-0 left-0 h-1.5 rounded-full"
                      style={{ 
                        width: `${(localFilters.minRating / 10) * 100}%`,
                        background: localFilters.minRating >= 8 ? 'linear-gradient(to right, rgb(134, 239, 172), rgb(74, 222, 128))' :
                                   localFilters.minRating >= 6 ? 'linear-gradient(to right, rgb(253, 224, 71), rgb(234, 179, 8))' :
                                   'linear-gradient(to right, rgb(129, 140, 248), rgb(99, 102, 241))'
                      }}
                    ></div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="1"
                      value={localFilters.minRating}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev, 
                        minRating: parseInt(e.target.value)
                      }))}
                      className="absolute top-0 w-full h-1.5 opacity-0 cursor-pointer"
                    />
                    
                    {/* Custom slider thumb */}
                    <div 
                      className="absolute top-[-4px] w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center transform -translate-x-1/2 pointer-events-none"
                      style={{ 
                        left: `${(localFilters.minRating / 10) * 100}%`,
                        backgroundColor: localFilters.minRating === 0 ? '#ffffff' : (
                          localFilters.minRating >= 8 ? 'rgb(74, 222, 128)' :
                          localFilters.minRating >= 6 ? 'rgb(234, 179, 8)' :
                          'rgb(99, 102, 241)'
                        )
                      }}
                    >
                    </div>
                  </div>
                  
                  {/* Rating scale labels */}
                  <div className="flex justify-between text-xs mt-3 px-1">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>0</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>1</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>2</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>3</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>4</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>5</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>6</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>7</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>8</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>9</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>10</span>
                  </div>
                </div>
                
                {/* Rating presets */}
                <div className="grid grid-cols-5 gap-2">
                  {ratingPresets.map((preset) => {
                    const isSelected = localFilters.minRating === preset.value;
                    let buttonClass = '';
                    
                    if (isSelected) {
                      if (preset.value >= 8) {
                        buttonClass = darkMode 
                          ? 'bg-green-500/30 text-green-300 ring-1 ring-green-500/40' 
                          : 'bg-green-100 text-green-700 ring-1 ring-green-400/40';
                      } else if (preset.value >= 6) {
                        buttonClass = darkMode 
                          ? 'bg-yellow-500/30 text-yellow-300 ring-1 ring-yellow-500/40' 
                          : 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400/40';
                      } else {
                        buttonClass = darkMode 
                          ? 'bg-gray-600 text-white ring-1 ring-gray-500' 
                          : 'bg-gray-200 text-gray-700 ring-1 ring-gray-300';
                      }
                    } else {
                      buttonClass = darkMode 
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white ring-1 ring-indigo-500/30' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-gray-200';
                    }
                    
                    return (
                      <button
                        key={preset.label}
                        onClick={() => setLocalFilters(prev => ({
                          ...prev,
                          minRating: preset.value
                        }))}
                        className={`py-2.5 rounded-xl text-sm transition-all duration-200 ${buttonClass}`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 dark:border-gray-800">
          <button 
            className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
              activeFilterCount > 0 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30' 
                : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-500'
            }`}
            onClick={handleApplyFilters}
            disabled={activeFilterCount === 0}
          >
            <span className="mr-2">Apply Filters</span>
            {matchCount > 0 && activeFilterCount > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm">
                {matchCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon, title, count = 0, value }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center">
      {icon && <div className="mr-2 text-indigo-500 dark:text-indigo-400">{icon}</div>}
      <h3 className="font-medium text-white dark:text-white">{title}</h3>
      {count > 0 && (
        <span className="ml-2 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-medium flex items-center justify-center">
          {count}
        </span>
      )}
    </div>
    {value && (
      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {value}
      </div>
    )}
  </div>
);

// Add required styles to the document
const style = document.createElement('style');
style.innerHTML = `
  @keyframes ping-once {
    0% { transform: scale(1); opacity: 0.8; }
    70% { transform: scale(1.3); opacity: 0; }
    100% { transform: scale(1); opacity: 0; }
  }
  
  .animate-ping-once {
    animation: ping-once 0.5s cubic-bezier(0, 0, 0.2, 1) forwards;
  }
  
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);

export default FilterModal;