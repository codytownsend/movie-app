import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { 
  Trash2, Star, Play, Calendar, Clock, Filter, 
  Eye, EyeOff, Info, ChevronRight, Check, Heart,
  ArrowUpDown, Search, Film, ListFilter, Award, 
  BarChart2, Clock12, TrendingUp, X, Share2,
  Bookmark, BookmarkCheck, GripVertical, Trophy, Crown
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
  
  // All state declarations - must be unconditional at top level
  const [activeView, setActiveView] = useState('to-watch');
  const [viewMode, setViewMode] = useState('grid');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showQuickRate, setShowQuickRate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('added');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchedStats, setWatchedStats] = useState({
    totalMovies: 0,
    avgRating: 0,
    topGenres: [],
    totalRuntime: 0
  });
  const [rankedMovies, setRankedMovies] = useState([]);
  const [isRankingMode, setIsRankingMode] = useState(false);
  const [draggedMovie, setDraggedMovie] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(-1);
  
  // Refs for swipe delete
  const touchStartX = useRef(null);
  const swipingItemId = useRef(null);
  const swipeThreshold = 100;
  
  // Calculate watched statistics and update ranked movies - NO EARLY RETURNS!
  useEffect(() => {
    const watchedMovies = watchlist.filter(movie => movie.watched);
    
    // Stats calculation - with defaults
    let totalMovies = 0;
    let avgRating = 0;
    let topGenres = [];
    let totalRuntime = 0;
    
    if (watchedMovies.length > 0) {
      totalMovies = watchedMovies.length;
      
      // Calculate average rating
      const moviesWithRatings = watchedMovies.filter(movie => movie.userRating);
      if (moviesWithRatings.length > 0) {
        avgRating = moviesWithRatings.reduce((sum, movie) => sum + movie.userRating, 0) / moviesWithRatings.length;
      }
      
      // Count genres
      const genreCounts = {};
      watchedMovies.forEach(movie => {
        if (movie.genre) {
          movie.genre.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      });
      
      // Sort genres by count and get top 3
      topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre, count]) => ({ genre, count }));
      
      // Calculate total runtime (if available)
      totalRuntime = watchedMovies.reduce((total, movie) => {
        if (typeof movie.duration === 'number') {
          return total + movie.duration;
        } else if (typeof movie.duration === 'string' && movie.duration) {
          // Try to parse runtime from string like "2h 30m"
          const hours = movie.duration.match(/(\d+)h/) ? parseInt(movie.duration.match(/(\d+)h/)[1]) : 0;
          const minutes = movie.duration.match(/(\d+)m/) ? parseInt(movie.duration.match(/(\d+)m/)[1]) : 0;
          return total + (hours * 60 + minutes);
        }
        return total;
      }, 0);
    }
    
    // Always update stats - no conditional update
    setWatchedStats({
      totalMovies,
      avgRating,
      topGenres,
      totalRuntime
    });
    
    // Always update ranked movies - no conditional update
    setRankedMovies(prevRanked => {
      // Keep only movies that are still in watchlist and watched
      const existingRanked = prevRanked.filter(id => 
        watchlist.some(m => m.id === id && m.watched)
      );
      
      // If ranked list has less than 5 movies, try to add more from watched movies
      if (existingRanked.length < 5 && watchedMovies.length > 0) {
        const potentialMovies = watchedMovies
          .filter(m => !existingRanked.includes(m.id))
          .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
          .slice(0, 5 - existingRanked.length);
          
        return [...existingRanked, ...potentialMovies.map(m => m.id)];
      }
      
      return existingRanked.slice(0, 5);
    });
  }, [watchlist]);

  // Handler functions
  const handleRemoveFromWatchlist = (movieId) => {
    setWatchlist(watchlist.filter(movie => movie.id !== movieId));
    showToast("Removed from watchlist");
  };

  const toggleSelection = (movieId) => {
    if (selectedMovies.includes(movieId)) {
      setSelectedMovies(selectedMovies.filter(id => id !== movieId));
    } else {
      setSelectedMovies([...selectedMovies, movieId]);
    }
  };

  const handleViewDetails = (movie) => {
    setSelectedMovie(movie);
    setShowDetailsModal(true);
  };

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
    
    // If toggling in edit mode, update selectedMovies
    if (isEditMode && selectedMovies.includes(movieId)) {
      setSelectedMovies(selectedMovies.filter(id => id !== movieId));
    }
  };

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
    
    // If current view is to-watch, maybe switch to watched view to see the newly rated movie
    if (activeView === 'to-watch') {
      setTimeout(() => setActiveView('watched'), 500);
    }
  };

  const deleteSelected = () => {
    if (selectedMovies.length === 0) return;
    
    setWatchlist(prev => prev.filter(movie => !selectedMovies.includes(movie.id)));
    showToast(`Removed ${selectedMovies.length} movies from watchlist`);
    setSelectedMovies([]);
    setIsEditMode(false);
  };
  
  const batchToggleWatched = (setToWatched) => {
    if (selectedMovies.length === 0) return;
    
    setWatchlist(prev => 
      prev.map(movie => 
        selectedMovies.includes(movie.id) 
          ? { ...movie, watched: setToWatched }
          : movie
      )
    );
    
    const actionText = setToWatched ? 'watched' : 'unwatched';
    showToast(`Marked ${selectedMovies.length} movies as ${actionText}`);
    setSelectedMovies([]);
    setIsEditMode(false);
  };
  
  // Ranking functions
  const handleDragStart = (movieId) => {
    setDraggedMovie(movieId);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  
  const handleDrop = (index) => {
    if (draggedMovie === null) return;
    
    // Create a new array without the dragged movie
    const newRankedMovies = rankedMovies.filter(id => id !== draggedMovie);
    
    // Insert the dragged movie at the new position
    newRankedMovies.splice(index, 0, draggedMovie);
    
    // Update the state with the new order, limited to 5 movies
    setRankedMovies(newRankedMovies.slice(0, 5));
    setDraggedMovie(null);
    setDragOverIndex(-1);
    
    showToast("Movie ranking updated!");
  };
  
  const toggleRankingMode = () => {
    setIsRankingMode(!isRankingMode);
    if (isRankingMode) {
      showToast("Top 5 ranking saved!");
    }
  };
  
  const addToRanking = (movieId) => {
    if (rankedMovies.includes(movieId)) {
      // Remove from ranking if already ranked
      setRankedMovies(rankedMovies.filter(id => id !== movieId));
      showToast("Removed from top 5 ranking");
    } else if (rankedMovies.length < 5) {
      // Add to ranking if we have less than 5 ranked movies
      setRankedMovies([...rankedMovies, movieId]);
      showToast("Added to top 5 ranking");
    } else {
      // Replace the last movie if we already have 5
      setRankedMovies([...rankedMovies.slice(0, 4), movieId]);
      showToast("Added to top 5 ranking");
    }
  };

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
  
  // Format runtime to human-readable format
  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Apply filters and sorting based on activeView
  const filteredWatchlist = watchlist
    .filter(movie => {
      // Apply watched/unwatched filter based on active view
      if (activeView === 'to-watch' && movie.watched) return false;
      if (activeView === 'watched' && !movie.watched) return false;
      
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
          return ((b.userRating || b.rating || 0) - (a.userRating || a.rating || 0));
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return b.year - a.year;
        case 'added':
        default:
          return 0; // Maintain current order
      }
    });
  
  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header />
      
      {/* Main Tab Navigation - Watchlist/Watched */}
      <div className="px-4 pt-3 pb-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className={`text-2xl font-bold ${colorScheme.text}`}>Collections</h2>
          
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
        
        {/* Main Tabs */}
        <div className="flex mb-3 border-b border-gray-200 dark:border-gray-800">
          <button
            className={`flex items-center py-3 px-4 relative font-medium ${
              activeView === 'to-watch' ? 'text-purple-500' : colorScheme.textSecondary
            }`}
            onClick={() => setActiveView('to-watch')}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Watchlist
            {watchlist.filter(m => !m.watched).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                {watchlist.filter(m => !m.watched).length}
              </span>
            )}
            {activeView === 'to-watch' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500"></div>
            )}
          </button>
          <button
            className={`flex items-center py-3 px-4 relative font-medium ${
              activeView === 'watched' ? 'text-green-500' : colorScheme.textSecondary
            }`}
            onClick={() => setActiveView('watched')}
          >
            <Check className="w-4 h-4 mr-2" />
            Watched
            {watchlist.filter(m => m.watched).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                {watchlist.filter(m => m.watched).length}
              </span>
            )}
            {activeView === 'watched' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
            )}
          </button>
        </div>
        
        {/* Search and Filter UI */}
        {showFilters && (
          <div className={`mb-4 p-3 rounded-lg ${colorScheme.card} shadow-md animate-slide-down`}>
            {/* Search */}
            <div className={`flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-3 py-1.5 mb-3`}>
              <Search className={`w-4 h-4 ${colorScheme.textSecondary} mr-2`} />
              <input 
                type="text"
                placeholder={activeView === 'to-watch' ? "Search your watchlist..." : "Search watched movies..."}
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
            
            <div className="flex items-center mb-3">
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
      
      {/* Watched Stats - Only show on Watched tab if there are watched movies */}
      {activeView === 'watched' && watchedStats.totalMovies > 0 && !isEditMode && (
        <div className="px-4 mb-4">
          <div className={`${colorScheme.card} rounded-lg p-3 shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`font-medium text-sm ${colorScheme.text}`}>Your Watched Stats</h3>
              <span className={`text-xs ${colorScheme.textSecondary}`}>
                {watchedStats.totalMovies} {watchedStats.totalMovies === 1 ? 'movie' : 'movies'} watched
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Average Rating */}
              <div className={`flex items-center p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  watchedStats.avgRating >= 4 ? 'bg-green-100 text-green-600' :
                  watchedStats.avgRating >= 3 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-orange-100 text-orange-600'
                } mr-2`}>
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-xs ${colorScheme.textSecondary}`}>Avg Rating</span>
                  <div className={`font-medium ${colorScheme.text}`}>
                    {watchedStats.avgRating ? watchedStats.avgRating.toFixed(1) : 'No ratings'}
                  </div>
                </div>
              </div>
              
              {/* Total Watch Time */}
              <div className={`flex items-center p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-xs ${colorScheme.textSecondary}`}>Watch Time</span>
                  <div className={`font-medium ${colorScheme.text}`}>
                    {watchedStats.totalRuntime > 0 ? 
                      formatRuntime(watchedStats.totalRuntime) : 
                      'Unknown'}
                  </div>
                </div>
              </div>
              
              {/* Top Genres */}
              {watchedStats.topGenres.length > 0 && (
                <div className={`col-span-2 flex items-center p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} mt-1`}>
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-2">
                    <Film className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className={`text-xs ${colorScheme.textSecondary}`}>Top Genres</span>
                    <div className="flex flex-wrap mt-1">
                      {watchedStats.topGenres.map(({ genre, count }) => (
                        <span key={genre} className={`mr-2 text-xs px-2 py-0.5 rounded-full ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {genre} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Top 5 Ranking - Only show on Watched tab if there are ranked movies */}
      {activeView === 'watched' && rankedMovies.length > 0 && !isEditMode && (
        <div className="px-4 mb-4">
          <div className={`${colorScheme.card} rounded-lg p-3 shadow-sm`}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className={`font-medium ${colorScheme.text}`}>Your Top 5</h3>
              </div>
              <button 
                className={`text-xs flex items-center px-2 py-1 rounded-full ${
                  isRankingMode 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                onClick={toggleRankingMode}
              >
                {isRankingMode ? 'Save Ranking' : 'Edit Ranking'}
              </button>
            </div>
            
            <div className="space-y-2">
              {rankedMovies.map((movieId, index) => {
                const movie = watchlist.find(m => m.id === movieId && m.watched);
                if (!movie) return null;
                
                return (
                  <div 
                    key={movieId}
                    className={`flex items-center p-2 ${
                      isRankingMode 
                        ? 'border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-move' 
                        : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`
                    } rounded-lg ${
                      isRankingMode && dragOverIndex === index ? 'bg-purple-100 dark:bg-purple-900' : ''
                    }`}
                    draggable={isRankingMode}
                    onDragStart={() => handleDragStart(movieId)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => setDraggedMovie(null)}
                  >
                    {/* Ranking number with medal for top 3 */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {index === 0 ? (
                        <Crown className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <span className="font-bold text-sm">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Movie info */}
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-14 rounded overflow-hidden mr-2">
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-medium text-sm truncate ${colorScheme.text}`}>{movie.title}</h4>
                        <div className="flex items-center text-xs">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className={`ml-1 ${colorScheme.textSecondary}`}>
                            {movie.userRating || movie.rating}
                          </span>
                          <span className="mx-1">•</span>
                          <span className={colorScheme.textSecondary}>{movie.year}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Drag handle or remove button */}
                    {isRankingMode && (
                      <div className="ml-1">
                        <GripVertical className={`w-5 h-5 ${colorScheme.textSecondary}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Instruction message when in ranking mode */}
            {isRankingMode && (
              <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                Drag and drop to rearrange your top 5 movies
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Edit Mode Action Bar - visible only when editing */}
      {isEditMode && selectedMovies.length > 0 && (
        <div className="px-4 mb-3">
          <div className={`${colorScheme.card} rounded-lg p-2 shadow-sm flex items-center justify-between`}>
            <span className={`text-sm font-medium ${colorScheme.text}`}>
              {selectedMovies.length} selected
            </span>
            <div className="flex space-x-2">
              {activeView === 'to-watch' && (
                <button 
                  className="px-3 py-1 text-xs rounded-lg bg-green-500 text-white flex items-center"
                  onClick={() => batchToggleWatched(true)}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark Watched
                </button>
              )}
              {activeView === 'watched' && (
                <button 
                  className="px-3 py-1 text-xs rounded-lg bg-blue-500 text-white flex items-center"
                  onClick={() => batchToggleWatched(false)}
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  Mark Unwatched
                </button>
              )}
              <button 
                className="px-3 py-1 text-xs rounded-lg bg-red-500 text-white flex items-center"
                onClick={deleteSelected}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                    {movie.watched && activeView === 'to-watch' && (
                      <div className="absolute top-2 right-2 z-10 bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Rating badge for watched view */}
                    {activeView === 'watched' && movie.userRating && (
                      <div className="absolute top-2 right-2 z-10 bg-yellow-500 rounded-full px-1.5 py-0.5 flex items-center shadow">
                        <Star className="w-3 h-3 text-white fill-current" />
                        <span className="text-xs font-bold text-white ml-0.5">{movie.userRating}</span>
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
                      
                      {/* User Rating - only for to-watch that have ratings */}
                      {activeView === 'to-watch' && movie.userRating && (
                        <div className="absolute bottom-2 left-2 flex items-center bg-black bg-opacity-70 rounded-full px-2 py-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-white ml-1">
                            {movie.userRating}
                          </span>
                        </div>
                      )}
                      
                      {/* Quick Actions - different for each view */}
                      {!isEditMode && (
                        <div className="absolute bottom-2 right-2 flex space-x-1">
                          {activeView === 'to-watch' ? (
                            <>
                              <button 
                                className="w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWatched(movie.id);
                                }}
                              >
                                <Eye className="w-3.5 h-3.5" />
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
                                <Star className={`w-3.5 h-3.5 ${movie.userRating ? 'text-yellow-400 fill-current' : ''}`} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWatched(movie.id);
                                }}
                              >
                                <EyeOff className="w-3.5 h-3.5" />
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
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                              </button>
                              <button 
                                className={`w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center ${
                                  rankedMovies.includes(movie.id) ? 'text-yellow-400' : 'text-white'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToRanking(movie.id);
                                }}
                              >
                                <Trophy className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
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
                        
                        {/* Watched badge or rating badge */}
                        {activeView === 'to-watch' && movie.watched && !isEditMode && (
                          <div className="absolute top-2 right-2 z-10 bg-green-500 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        {activeView === 'watched' && movie.userRating && !isEditMode && (
                          <div className="absolute top-2 right-2 z-10 bg-yellow-500 rounded-full px-1.5 py-0.5 flex items-center shadow">
                            <Star className="w-3 h-3 text-white fill-current" />
                            <span className="text-xs font-bold text-white ml-0.5">{movie.userRating}</span>
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
                              {activeView === 'to-watch' ? (
                                movie.userRating ? (
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
                                )
                              ) : (
                                /* Show detailed rating label for watched view */
                                <div className={`flex items-center rounded-full px-2 py-0.5 ${
                                  movie.userRating >= 4 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                  movie.userRating >= 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                  movie.userRating > 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                                  'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}>
                                  <Star className={`w-3 h-3 ${movie.userRating ? 'text-current fill-current' : 'text-gray-400'}`} />
                                  <span className="text-xs font-medium ml-1">
                                    {movie.userRating ? 
                                      (movie.userRating >= 4 ? "Great" : 
                                       movie.userRating >= 3 ? "Good" : 
                                       "Fair") : 
                                      "Not Rated"}
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
                        
                        {/* Bottom actions - different for each view */}
                        {!isEditMode && (
                          <div className="flex items-center justify-between mt-auto pt-1">
                            <div className="flex space-x-2">
                              {activeView === 'to-watch' ? (
                                <>
                                  <button 
                                    className={`text-xs flex items-center ${movie.watched ? 'text-green-500' : colorScheme.textSecondary}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleWatched(movie.id);
                                    }}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    {movie.watched ? 'Watched' : 'Watch'}
                                  </button>
                                  <button 
                                    className={`text-xs flex items-center ${movie.userRating ? 'text-yellow-500' : colorScheme.textSecondary}`}
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
                                    {movie.userRating ? 'Rated' : 'Rate'}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    className="text-xs flex items-center text-blue-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleWatched(movie.id);
                                    }}
                                  >
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Unwatched
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
                                    {movie.userRating ? 'Change' : 'Rate'}
                                  </button>
                                  <button 
                                    className={`text-xs flex items-center ${
                                      rankedMovies.includes(movie.id) ? 'text-yellow-500' : colorScheme.textSecondary
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToRanking(movie.id);
                                    }}
                                  >
                                    <Trophy className="w-3 h-3 mr-1" />
                                    {rankedMovies.includes(movie.id) ? 'Ranked' : 'Rank'}
                                  </button>
                                </>
                              )}
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
          // Empty State - different for each view
          <div className={`flex flex-col items-center justify-center h-64 text-center ${colorScheme.textSecondary} mt-8`}>
            <div className="mb-6 relative">
              {activeView === 'to-watch' ? (
                // Empty Watchlist
                <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                </div>
              ) : (
                // Empty Watched List
                <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <Check className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              
              {activeView === 'to-watch' ? (
                <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                </div>
              ) : (
                <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Star className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>
            
            {activeView === 'to-watch' ? (
              // Empty Watchlist message
              <>
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
              </>
            ) : (
              // Empty Watched List message
              <>
                <h3 className="text-xl font-medium mb-2">No watched movies yet</h3>
                <p className="text-sm max-w-xs mb-6">
                  Mark movies as watched from your watchlist to keep track of what you've seen
                </p>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => setActiveView('to-watch')}
                >
                  Go to Watchlist
                </button>
              </>
            )}
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