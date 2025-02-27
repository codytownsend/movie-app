// components/EnhancedFilterSection.js
import { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaTimes, FaSlidersH, FaCalendarAlt, FaFilm } from 'react-icons/fa';
import MoodSelector from './MoodSelector';

const EnhancedFilterSection = ({ onFilterChange }) => {
  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 
    'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 
    'War', 'Western'
  ];
  
  const decades = [
    '2020s', '2010s', '2000s', '1990s', '1980s', 'Older'
  ];
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('mood'); // 'mood', 'genre', 'decade'
  
  // Track if any filter is active
  const hasActiveFilters = selectedGenre || selectedDecade || selectedMood;
  
  // Use useCallback to memoize the function to prevent infinite rerenders
  const notifyFilterChange = useCallback(() => {
    onFilterChange({
      genre: selectedGenre,
      decade: selectedDecade,
      mood: selectedMood
    });
  }, [selectedGenre, selectedDecade, selectedMood, onFilterChange]);
  
  // Only call the filter change function when dependencies actually change
  useEffect(() => {
    notifyFilterChange();
  }, [selectedGenre, selectedDecade, selectedMood, notifyFilterChange]);
  
  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedDecade('');
    setSelectedMood('');
  };
  
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };
  
  return (
    <div className="mb-8 bg-secondary/40 backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 shadow-lg">
      {/* Filter header */}
      <div 
        className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-secondary/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <FaFilter className={`${hasActiveFilters ? 'text-primary' : 'text-gray-400'}`} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Personalize Your Experience</h2>
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {selectedMood && (
                  <span className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                    Mood: {selectedMood.replace('-', ' ')}
                  </span>
                )}
                {selectedGenre && (
                  <span className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                    Genre: {selectedGenre}
                  </span>
                )}
                {selectedDecade && (
                  <span className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                    Era: {selectedDecade}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          {hasActiveFilters && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="mr-4 text-sm text-primary hover:text-white flex items-center transition-colors"
            >
              <FaTimes className="mr-1" />
              Clear All
            </button>
          )}
          
          <div className="w-8 h-8 flex items-center justify-center text-gray-400">
            <svg 
              className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Filter content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-700/50">
          {/* Filter Tabs */}
          <div className="flex border-b border-gray-700/50">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'mood'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white hover:bg-secondary/30'
              }`}
              onClick={() => setActiveTab('mood')}
            >
              <span className="flex items-center justify-center">
                <FaSlidersH className="mr-2" />
                Mood
              </span>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'genre'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white hover:bg-secondary/30'
              }`}
              onClick={() => setActiveTab('genre')}
            >
              <span className="flex items-center justify-center">
                <FaFilm className="mr-2" />
                Genre
              </span>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'decade'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white hover:bg-secondary/30'
              }`}
              onClick={() => setActiveTab('decade')}
            >
              <span className="flex items-center justify-center">
                <FaCalendarAlt className="mr-2" />
                Era
              </span>
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'mood' && (
              <MoodSelector 
                onMoodSelect={handleMoodSelect} 
                selectedMood={selectedMood}
              />
            )}
            
            {activeTab === 'genre' && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Select a Genre</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      className={`px-4 py-3 rounded-lg text-sm transition-all ${
                        selectedGenre === genre 
                          ? 'bg-primary text-black font-medium shadow-glow-primary transform scale-105' 
                          : 'bg-secondary-light text-gray-300 hover:bg-secondary hover:text-white'
                      }`}
                      onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'decade' && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Select an Era</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {decades.map((decade) => (
                    <button
                      key={decade}
                      className={`px-4 py-4 rounded-lg flex flex-col items-center justify-center transition-all ${
                        selectedDecade === decade 
                          ? 'bg-primary text-black font-medium shadow-glow-primary transform scale-105' 
                          : 'bg-secondary-light text-gray-300 hover:bg-secondary hover:text-white'
                      }`}
                      onClick={() => setSelectedDecade(selectedDecade === decade ? '' : decade)}
                    >
                      <FaCalendarAlt className="mb-2 text-lg" />
                      <span>{decade}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Filter Pills - only shown when section is collapsed */}
      {!isExpanded && (
        <div className="px-6 pb-4 flex flex-wrap gap-2 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
              setActiveTab('mood');
            }}
            className={`px-3 py-1.5 rounded-full text-sm ${
              selectedMood ? 'bg-primary text-black font-medium' : 'bg-secondary-light text-gray-300 hover:bg-secondary'
            }`}
          >
            <span className="flex items-center">
              <FaSlidersH className="mr-1.5" />
              {selectedMood ? selectedMood.replace('-', ' ') : 'Select Mood'}
            </span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
              setActiveTab('genre');
            }}
            className={`px-3 py-1.5 rounded-full text-sm ${
              selectedGenre ? 'bg-primary text-black font-medium' : 'bg-secondary-light text-gray-300 hover:bg-secondary'
            }`}
          >
            <span className="flex items-center">
              <FaFilm className="mr-1.5" />
              {selectedGenre || 'Select Genre'}
            </span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
              setActiveTab('decade');
            }}
            className={`px-3 py-1.5 rounded-full text-sm ${
              selectedDecade ? 'bg-primary text-black font-medium' : 'bg-secondary-light text-gray-300 hover:bg-secondary'
            }`}
          >
            <span className="flex items-center">
              <FaCalendarAlt className="mr-1.5" />
              {selectedDecade || 'Select Era'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedFilterSection;