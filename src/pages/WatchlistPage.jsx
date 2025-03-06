import React, { useState, useRef } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { 
  Trash2, Star, Play, Calendar, Clock, Filter, 
  Eye, EyeOff, Info, ChevronRight, Check, Heart,
  ArrowUpDown, Search 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import MovieDetailsModal from '../modals/MovieDetailsModal';

const WatchlistPage = () => {
  const { 
    colorScheme, 
    darkMode, 
    watchlist, 
    setWatchlist, 
    showToast, 
    setActiveTab
  } = useAppContext();
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showQuickRate, setShowQuickRate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [watchedFilter, setWatchedFilter] = useState('all'); // 'all', 'watched', 'unwatched'
  const [sortOrder, setSortOrder] = useState('added'); // 'added', 'rating', 'title', 'year'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs for swipe delete
  const touchStartX = useRef(null);
  const swipingItemId = useRef(null);
  const swipeThreshold = 100; // Pixels needed to trigger delete
  
  // Handle remove from watchlist
  const handleRemoveFromWatchlist = (movieId) => {
    setWatchlist(watchlist.filter(movie => movie.id !== movieId));
    showToast("Removed from watchlist");
  };

  // Toggle selection of a movie for batch operations
  const toggleSelection = (movieId) => {
    if (selectedMovies.includes(movieId)) {
      setSelectedMovies(selectedMovies.filter(id => id !== movieId));
    } else {
      setSelectedMovies([...selectedMovies, movieId]);
    }
  };

  // View movie details
  const handleViewDetails = (movie) => {
    setSelectedMovie(movie);
    setShowDetailsModal(true);
  };

  // Mark movie as watched/unwatched
  const toggleWatched = (movieId) => {
    setWatchlist(prev => 
      prev.map(movie => 
        movie.id === movieId 
          ? { ...movie, watched: !movie.watched }
          : movie
      )
    );
    
    const movie = watchlist.find(m => m.id === movieId);
    const newStatus = !movie.watched;
    showToast(`Marked as ${newStatus ? 'watched' : 'unwatched'}`);
  };

  // Quick rate a movie
  const handleQuickRate = (movieId, rating) => {
    setWatchlist(prev => 
      prev.map(movie => 
        movie.id === movieId 
          ? { ...movie, userRating: rating, watched: true }
          : movie
      )
    );
    
    showToast(`Rated ${rating} stars`);
    setShowQuickRate(null);
  };

  // Batch delete selected movies
  const deleteSelected = () => {
    if (selectedMovies.length === 0) return;
    
    setWatchlist(prev => prev.filter(movie => !selectedMovies.includes(movie.id)));
    showToast(`Removed ${selectedMovies.length} movies from watchlist`);
    setSelectedMovies([]);
    setIsEditMode(false);
  };

  // Apply filters and sorting
  const filteredWatchlist = watchlist
    .filter(movie => {
      // Apply watched/unwatched filter
      if (watchedFilter === 'watched' && !movie.watched) return false;
      if (watchedFilter === 'unwatched' && movie.watched) return false;
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          movie.title.toLowerCase().includes(query) ||
          (movie.genre && movie.genre.some(g => g.toLowerCase().includes(query))) ||
          (movie.director && movie.director.toLowerCase().includes(query))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortOrder) {
        case 'rating':
          return (b.userRating || b.rating || 0) - (a.userRating || a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return b.year - a.year;
        case 'added':
        default:
          return 0; // Maintain current order
      }
    });
    
  // Touch handling for swipe-to-delete
  const handleTouchStart = (e, movieId) => {
    touchStartX.current = e.touches[0].clientX;
    swipingItemId.current = movieId;
  };

  const handleTouchMove = (e, movieId, elementRef) => {
    if (swipingItemId.current !== movieId || !touchStartX.current) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    
    // Only allow swiping left (negative diff)
    if (diff < 0 && elementRef.current) {
      const swipeAmount = Math.min(Math.abs(diff), 150); // Limit maximum swipe
      elementRef.current.style.transform = `translateX(-${swipeAmount}px)`;
      
      // Show delete button as user swipes
      const deleteButton = elementRef.current.querySelector('.delete-button');
      if (deleteButton) {
        deleteButton.style.opacity = Math.min(swipeAmount / swipeThreshold, 1);
      }
    }
  };

  const handleTouchEnd = (e, movieId, elementRef) => {
    if (swipingItemId.current !== movieId || !touchStartX.current) return;
    
    const currentX = e.changedTouches[0].clientX;
    const diff = currentX - touchStartX.current;
    
    if (diff < -swipeThreshold) {
      // Swiped far enough to delete
      handleRemoveFromWatchlist(movieId);
    } else {
      // Reset position
      if (elementRef.current) {
        elementRef.current.style.transform = 'translateX(0)';
        
        const deleteButton = elementRef.current.querySelector('.delete-button');
        if (deleteButton) {
          deleteButton.style.opacity = 0;
        }
      }
    }
    
    touchStartX.current = null;
    swipingItemId.current = null;
  };
  
  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header />
      
      {/* Watchlist Header with Actions */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className={`text-2xl font-bold ${colorScheme.text}`}>Your Watchlist</h2>
          
          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <button 
                  onClick={() => {
                    setIsEditMode(false);
                    setSelectedMovies([]);
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${colorScheme.text} border ${colorScheme.border}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={deleteSelected}
                  className={`px-3 py-1 rounded-full text-sm bg-red-500 text-white ${selectedMovies.length === 0 ? 'opacity-50' : ''}`}
                  disabled={selectedMovies.length === 0}
                >
                  Delete ({selectedMovies.length})
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-full ${colorScheme.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                {watchlist.length > 0 && (
                  <button 
                    onClick={() => setIsEditMode(true)}
                    className={`px-3 py-1 rounded-full text-sm ${colorScheme.text} border ${colorScheme.border}`}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Search and Filter UI */}
        {showFilters && (
          <div className={`mb-4 p-3 rounded-lg ${colorScheme.card} shadow-md animate-slide-down`}>
            {/* Search */}
            <div className={`flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-3 py-1.5 mb-3`}>
              <Search className={`w-4 h-4 ${colorScheme.textSecondary} mr-2`} />
              <input 
                type="text"
                placeholder="Search your watchlist..."
                className={`w-full bg-transparent focus:outline-none text-sm ${colorScheme.text}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`${colorScheme.textSecondary}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button 
                className={`px-3 py-1 text-xs rounded-full ${
                  watchedFilter === 'all'
                    ? 'bg-purple-500 text-white'
                    : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text}`
                }`}
                onClick={() => setWatchedFilter('all')}
              >
                All Movies
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded-full ${
                  watchedFilter === 'watched'
                    ? 'bg-purple-500 text-white'
                    : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text}`
                }`}
                onClick={() => setWatchedFilter('watched')}
              >
                Watched
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded-full ${
                  watchedFilter === 'unwatched'
                    ? 'bg-purple-500 text-white'
                    : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text}`
                }`}
                onClick={() => setWatchedFilter('unwatched')}
              >
                Unwatched
              </button>
            </div>
            
            <div className="flex items-center">
              <span className={`text-xs ${colorScheme.textSecondary} mr-2`}>Sort by:</span>
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`px-3 py-1 text-xs rounded-full flex items-center ${
                    sortOrder === 'added'
                      ? 'bg-purple-500 text-white'
                      : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text}`
                  }`}
                  onClick={() => setSortOrder('added')}
                >
                  Date Added
                  {sortOrder === 'added' && <Check className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-full flex items-center ${
                    sortOrder === 'rating'
                      ? 'bg-purple-500 text-white'
                      : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text}`
                  }`}
                  onClick={() => setSortOrder('rating')}
                >
                  Rating
                  {sortOrder === 'rating' && <Check className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-full flex items-center ${
                    sortOrder === 'title'
                      ? 'bg-purple-500 text-white'
                      : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text}`
                  }`}
                  onClick={() => setSortOrder('title')}
                >
                  Title
                  {sortOrder === 'title' && <Check className="w-3 h-3 ml-1" />}
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-full flex items-center ${
                    sortOrder === 'year'
                      ? 'bg-purple-500 text-white'
                      : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text}`
                  }`}
                  onClick={() => setSortOrder('year')}
                >
                  Year
                  {sortOrder === 'year' && <Check className="w-3 h-3 ml-1" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className={`text-xs ${colorScheme.textSecondary}`}>
                {filteredWatchlist.length} {filteredWatchlist.length === 1 ? 'movie' : 'movies'}
              </span>
              <button 
                className="text-xs text-purple-500"
                onClick={() => {
                  setSearchQuery('');
                  setWatchedFilter('all');
                  setSortOrder('added');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
        
        {/* View Mode Toggle */}
        {filteredWatchlist.length > 0 && !isEditMode && !showFilters && (
          <div className="flex justify-end mb-3">
            <div className={`flex rounded-md overflow-hidden border ${colorScheme.border}`}>
              <button 
                className={`px-2 py-1 ${viewMode === 'grid' 
                  ? 'bg-purple-500 text-white' 
                  : `${colorScheme.card} ${colorScheme.text}`}`}
                onClick={() => setViewMode('grid')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button 
                className={`px-2 py-1 ${viewMode === 'list' 
                  ? 'bg-purple-500 text-white' 
                  : `${colorScheme.card} ${colorScheme.text}`}`}
                onClick={() => setViewMode('list')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 px-4 pb-20 overflow-y-auto">
        {filteredWatchlist.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid View - Enhanced Visual Design
            <div className="grid grid-cols-2 gap-4">
              {filteredWatchlist.map(movie => {
                const movieRef = useRef(null);
                return (
                  <div 
                    key={movie.id} 
                    ref={movieRef}
                    className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transition-all transform hover:scale-[1.02] relative`}
                    onTouchStart={(e) => handleTouchStart(e, movie.id)}
                    onTouchMove={(e) => handleTouchMove(e, movie.id, movieRef)}
                    onTouchEnd={(e) => handleTouchEnd(e, movie.id, movieRef)}
                  >
                    {/* Watched badge */}
                    {movie.watched && (
                      <div className="absolute top-2 right-2 z-10 bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Selection checkbox for edit mode */}
                    {isEditMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            selectedMovies.includes(movie.id)
                              ? 'bg-purple-500 text-white'
                              : 'bg-black bg-opacity-50 border border-white'
                          }`}
                          onClick={() => toggleSelection(movie.id)}
                        >
                          {selectedMovies.includes(movie.id) && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Poster Image */}
                    <div 
                      className="relative h-48"
                      onClick={() => !isEditMode && handleViewDetails(movie)}
                    >
                      <img 
                        src={movie.posterUrl} 
                        alt={movie.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent h-16 opacity-80"></div>
                      
                      {/* User Rating */}
                      {movie.userRating && (
                        <div className="absolute bottom-2 left-2 flex items-center bg-black bg-opacity-70 rounded-full px-2 py-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-white ml-1">
                            {movie.userRating}
                          </span>
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      {!isEditMode && (
                        <div className="absolute bottom-2 right-2 flex space-x-1">
                          <button 
                            className="w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatched(movie.id);
                            }}
                          >
                            {movie.watched ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button 
                            className="w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (showQuickRate === movie.id) {
                                setShowQuickRate(null);
                              } else {
                                setShowQuickRate(movie.id);
                              }
                            }}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Movie Info */}
                    <div className="p-3">
                      <h3 
                        className={`font-bold text-base ${colorScheme.text} leading-tight line-clamp-1`}
                        onClick={() => !isEditMode && handleViewDetails(movie)}
                      >
                        {movie.title}
                      </h3>
                      <div className={`flex items-center mt-1 text-xs ${colorScheme.textSecondary}`}>
                        <span>{movie.year}</span>
                        {movie.duration && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{movie.duration}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Quick Rate - Star selector */}
                      {showQuickRate === movie.id && (
                        <div className="mt-2 p-2 bg-black bg-opacity-70 rounded-lg animate-fade-in">
                          <div className="flex justify-between">
                            {[1, 2, 3, 4, 5].map(rating => (
                              <button 
                                key={rating}
                                className="p-1.5 rounded-full hover:bg-gray-700"
                                onClick={() => handleQuickRate(movie.id, rating)}
                              >
                                <Star 
                                  className={`w-4 h-4 ${
                                    (movie.userRating && rating <= movie.userRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Swipe-to-delete button */}
                    <div className="absolute right-0 top-0 bottom-0 opacity-0 delete-button flex items-center">
                      <div className="bg-red-500 h-full p-4 flex items-center justify-center">
                        <Trash2 className="text-white w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View - Enhanced with Actions
            <div className="space-y-3">
              {filteredWatchlist.map(movie => {
                const movieRef = useRef(null);
                return (
                  <div 
                    key={movie.id} 
                    ref={movieRef}
                    className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transform transition-all relative`}
                    onTouchStart={(e) => handleTouchStart(e, movie.id)}
                    onTouchMove={(e) => handleTouchMove(e, movie.id, movieRef)}
                    onTouchEnd={(e) => handleTouchEnd(e, movie.id, movieRef)}
                  >
                    <div className="flex">
                      {/* Selection checkbox for edit mode */}
                      {isEditMode && (
                        <div className="absolute top-3 left-3 z-10">
                          <div 
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              selectedMovies.includes(movie.id)
                                ? 'bg-purple-500 text-white'
                                : 'bg-black bg-opacity-50 border border-white'
                            }`}
                            onClick={() => toggleSelection(movie.id)}
                          >
                            {selectedMovies.includes(movie.id) && (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      )}
                    
                      {/* Poster Image */}
                      <div 
                        className={`relative w-24 h-36 flex-shrink-0 ${isEditMode ? 'ml-4' : ''}`}
                        onClick={() => !isEditMode && handleViewDetails(movie)}
                      >
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title} 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Watched badge */}
                        {movie.watched && !isEditMode && (
                          <div className="absolute top-2 right-2 z-10 bg-green-500 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Movie Info */}
                      <div 
                        className="p-3 flex-1 flex flex-col" 
                        onClick={() => !isEditMode && handleViewDetails(movie)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className={`font-bold text-base ${colorScheme.text} leading-tight`}>
                              {movie.title}
                            </h3>
                            <div className={`flex items-center mt-1 text-xs ${colorScheme.textSecondary}`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{movie.year}</span>
                              {movie.duration && (
                                <>
                                  <span className="mx-1">•</span>
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{movie.duration}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {!isEditMode && (
                            <div className="flex">
                              {movie.userRating ? (
                                <div className="flex items-center bg-yellow-400 bg-opacity-20 rounded-full px-2 py-0.5">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className={`text-xs font-medium ml-1 text-yellow-600 dark:text-yellow-400`}>
                                    {movie.userRating}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                                  <Star className="w-3 h-3 text-gray-400" />
                                  <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>
                                    {movie.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Genre Tags */}
                        <div className="flex flex-wrap my-1">
                          {movie.genre && movie.genre.slice(0, 2).map((genre, idx) => (
                            <span 
                              key={idx}
                              className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1"
                            >
                              {genre}
                            </span>
                          ))}
                          {movie.genre && movie.genre.length > 2 && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1">
                              +{movie.genre.length - 2}
                            </span>
                          )}
                        </div>
                        
                        {/* Bottom actions */}
                        {!isEditMode && (
                          <div className="flex items-center justify-between mt-auto pt-1">
                            <div className="flex space-x-2">
                              <button 
                                className={`text-xs flex items-center ${movie.watched ? 'text-green-500' : colorScheme.textSecondary}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWatched(movie.id);
                                }}
                              >
                                {movie.watched ? (
                                  <>
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Unwatched
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Watched
                                  </>
                                )}
                              </button>
                              <button 
                                className="text-xs flex items-center text-yellow-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (showQuickRate === movie.id) {
                                    setShowQuickRate(null);
                                  } else {
                                    setShowQuickRate(movie.id);
                                  }
                                }}
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Rate
                              </button>
                            </div>
                            <button
                              className={`text-xs flex items-center ${colorScheme.textSecondary}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(movie);
                              }}
                            >
                              <Info className="w-3 h-3 mr-1" />
                              Details
                            </button>
                          </div>
                        )}
                        
                        {/* Quick Rate - Star selector */}
                        {showQuickRate === movie.id && (
                          <div className="mt-2 p-2 bg-black bg-opacity-70 rounded-lg animate-fade-in">
                            <div className="flex justify-between">
                              {[1, 2, 3, 4, 5].map(rating => (
                                <button 
                                  key={rating}
                                  className="p-1.5 rounded-full hover:bg-gray-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickRate(movie.id, rating);
                                  }}
                                >
                                  <Star 
                                    className={`w-4 h-4 ${
                                      (movie.userRating && rating <= movie.userRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Right Actions - Desktop */}
                      {!isEditMode && (
                        <div className={`${colorScheme.bg} flex flex-col justify-center px-2`}>
                          <ChevronRight className={`w-5 h-5 ${colorScheme.textSecondary}`} />
                        </div>
                      )}
                    </div>
                    
                    {/* Swipe-to-delete button */}
                    <div className="absolute right-0 top-0 bottom-0 opacity-0 delete-button flex items-center">
                      <div className="bg-red-500 h-full p-4 flex items-center justify-center">
                        <Trash2 className="text-white w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Enhanced Empty State
          <div className={`flex flex-col items-center justify-center h-64 text-center ${colorScheme.textSecondary} mt-8`}>
            <div className="mb-6 relative">
              <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <Film className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              </div>
              <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Heart className="w-6 h-6 text-gray-300 dark:text-gray-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-medium mb-2">Your watchlist is empty</h3>
            <p className="text-sm max-w-xs mb-6">
              Add movies to your watchlist by swiping right or using the heart button while browsing
            </p>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow animate-pulse"
              onClick={() => setActiveTab('discover')}
            >
              Discover Movies
            </button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
      
      {/* Movie Details Modal */}
      {showDetailsModal && selectedMovie && (
        <MovieDetailsModal 
          currentMovie={selectedMovie}
          setShowDetails={setShowDetailsModal}
        />
      )}
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease forwards;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease forwards;
        }
        
        /* Hide scrollbar but allow scrolling */
        .overflow-y-auto {
          scrollbar-width: none; /* Firefox */
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          display: none; /* Chrome/Safari/Opera */
        }
      `}</style>
    </div>
  );
};

export default WatchlistPage;