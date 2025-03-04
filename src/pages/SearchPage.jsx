// src/pages/SearchPage.jsx
import React, { useState } from 'react';
import { Search, X, ArrowLeft, Star } from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAppContext } from '../context/AppContext';

const SearchPage = () => {
  const { 
    colorScheme, 
    darkMode,
    movies, 
    setActiveTab,
    showToast
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Handle search input changes
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Filter movies based on search query
    const results = movies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      (movie.genre && movie.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))) ||
      (movie.director && movie.director.toLowerCase().includes(query.toLowerCase())) ||
      (movie.cast && movie.cast.some(actor => actor.toLowerCase().includes(query.toLowerCase())))
    );
    
    setSearchResults(results);
  };

  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header setNotificationsOpen={setNotificationsOpen} />
      
      {/* Search Input */}
      <div className="p-4">
        <div className={`flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-4 py-2`}>
          <Search className={`w-5 h-5 ${colorScheme.textSecondary} mr-2`} />
          <input 
            type="text"
            placeholder="Search movies, genres, actors..."
            className={`w-full bg-transparent focus:outline-none ${colorScheme.text}`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => handleSearch('')}
              className={`${colorScheme.textSecondary}`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Search Results or Default Content */}
      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {searchQuery === '' ? (
          <div>
            <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Recently Viewed</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {movies.slice(0, 4).map(movie => (
                <div 
                  key={movie.id} 
                  className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md`}
                >
                  <div className="h-40 bg-gray-300">
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <h4 className={`font-medium text-sm truncate ${colorScheme.text}`}>{movie.title}</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>{movie.year}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Trending Categories</h3>
            <div className="flex flex-wrap">
              {["Action", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance", "Fantasy"].map(genre => (
                <div 
                  key={genre} 
                  className={`${colorScheme.card} rounded-full px-4 py-2 mr-2 mb-2 flex items-center ${colorScheme.text} cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                  onClick={() => handleSearch(genre)}
                >
                  <Search className="w-4 h-4 mr-1" />
                  {genre}
                </div>
              ))}
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map(movie => (
              <div 
                key={movie.id} 
                className={`${colorScheme.card} rounded-lg overflow-hidden shadow flex cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => {
                  setActiveTab('discover');
                  showToast(`Selected: ${movie.title}`);
                }}
              >
                <div className="w-20 h-28 bg-gray-300">
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex-1">
                  <h4 className={`font-medium ${colorScheme.text}`}>{movie.title}</h4>
                  <p className={`text-xs ${colorScheme.textSecondary} mb-1`}>
                    {movie.year} • {movie.duration || '2h 0m'}
                  </p>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                  </div>
                  <div className="flex flex-wrap mt-1">
                    {movie.genre && movie.genre.slice(0, 2).map((g, i) => (
                      <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className={`w-12 h-12 ${colorScheme.textSecondary} mb-4 opacity-40`} />
            <p className={`${colorScheme.textSecondary}`}>No results found for "{searchQuery}"</p>
            <p className={`text-sm ${colorScheme.textSecondary} mt-2`}>Try different keywords or check for typos</p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default SearchPage;