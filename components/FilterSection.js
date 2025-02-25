import { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

export default function FilterSection({ onFilterChange }) {
  const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'];
  const decades = ['2020s', '2010s', '2000s', '1990s', '1980s', 'Older'];
  const moods = ['Feel-Good', 'Dark & Gritty', 'Thought-Provoking', 'Action-Packed', 'Emotional', 'Inspirational'];
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, selectedDecade, selectedMood]);
  
  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedDecade('');
    setSelectedMood('');
  };
  
  return (
    <div className="mb-6 bg-secondary rounded-xl overflow-hidden transition-all duration-300">
      {/* Filter header */}
      <div 
        className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-secondary-light"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <FaFilter className={`mr-3 ${hasActiveFilters ? 'text-primary' : 'text-gray-400'}`} />
          <h2 className="text-xl font-semibold text-white">Personalize Your Recommendations</h2>
          {hasActiveFilters && (
            <span className="ml-3 px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
              Filters Active
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          {hasActiveFilters && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="mr-4 text-sm text-primary hover:text-primary-light flex items-center"
            >
              <FaTimes className="mr-1" />
              Clear
            </button>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Filter content */}
      <div 
        className={`px-6 pb-6 space-y-6 transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* Genre filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Genre</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                className={`px-3 py-2 text-sm rounded-lg ${
                  selectedGenre === genre 
                    ? 'bg-primary text-white ring-2 ring-primary ring-opacity-50' 
                    : 'bg-secondary-light text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        
        {/* Decade filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Decade</label>
          <div className="flex flex-wrap gap-2">
            {decades.map((decade) => (
              <button
                key={decade}
                className={`px-3 py-2 text-sm rounded-lg ${
                  selectedDecade === decade 
                    ? 'bg-primary text-white ring-2 ring-primary ring-opacity-50' 
                    : 'bg-secondary-light text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setSelectedDecade(selectedDecade === decade ? '' : decade)}
              >
                {decade}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mood filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Mood</label>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                className={`px-3 py-2 text-sm rounded-lg ${
                  selectedMood === mood 
                    ? 'bg-primary text-white ring-2 ring-primary ring-opacity-50' 
                    : 'bg-secondary-light text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setSelectedMood(selectedMood === mood ? '' : mood)}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}