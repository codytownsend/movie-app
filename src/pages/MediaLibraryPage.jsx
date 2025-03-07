// src/pages/MediaLibraryPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, Star, Play, Calendar, Clock, Filter, 
  Eye, EyeOff, Info, ChevronRight, Check, Heart,
  ArrowUpDown, Search, Plus, X, Bookmark, Film, 
  List, Library, Trophy, Menu, GripVertical, Save
} from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAppContext } from '../context/AppContext';
import MovieDetailsModal from '../modals/MovieDetailsModal';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

const MediaLibraryPage = () => {
  const { 
    colorScheme, 
    darkMode, 
    watchlist: originalWatchlist,
    setWatchlist: setOriginalWatchlist, 
    showToast, 
    setActiveTab
  } = useAppContext();
  
  // Extended state for media library
  const [activeLibraryTab, setActiveLibraryTab] = useState('watchlist'); // 'watchlist', 'watched', 'favorites'
  const [watchlist, setWatchlist] = useState(
    originalWatchlist.filter(movie => !movie.watched)
  );
  const [watchedList, setWatchedList] = useState(
    originalWatchlist.filter(movie => movie.watched)
  );
  const [favoritesList, setFavoritesList] = useState(
    originalWatchlist.filter(movie => movie.favorite).slice(0, 5)
  );

  // UI state
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
  const [editingFavorites, setEditingFavorites] = useState(false);
  
  // Ref for item being dragged in favorites
  const dragItem = useRef(null);
  const dragNode = useRef(null);
  
  // Sync state with app context
  useEffect(() => {
    setWatchlist(originalWatchlist.filter(movie => !movie.watched));
    setWatchedList(originalWatchlist.filter(movie => movie.watched));
    setFavoritesList(originalWatchlist.filter(movie => movie.favorite)
      .sort((a, b) => (a.favoriteRank || 999) - (b.favoriteRank || 999))
      .slice(0, 5));
  }, [originalWatchlist]);
  
  // Function to update the main watchlist in context
  const updateMainWatchlist = () => {
    // Combine all lists and update the main watchlist
    const newWatchlist = [
      ...watchlist,
      ...watchedList,
      ...favoritesList.filter(fav => 
        !watchlist.some(w => w.id === fav.id) && 
        !watchedList.some(w => w.id === fav.id)
      )
    ];
    
    // Remove duplicates
    const uniqueWatchlist = [...new Map(newWatchlist.map(item => [item.id, item])).values()];
    
    setOriginalWatchlist(uniqueWatchlist);
  };
  
  // Update main watchlist when any of the lists change
  useEffect(() => {
    updateMainWatchlist();
  }, [watchlist, watchedList, favoritesList]);

  // Handle remove from watchlist
  const handleRemoveFromWatchlist = (movieId) => {
    if (activeLibraryTab === 'watchlist') {
      setWatchlist(watchlist.filter(movie => movie.id !== movieId));
    } else if (activeLibraryTab === 'watched') {
      setWatchedList(watchedList.filter(movie => movie.id !== movieId));
    } else if (activeLibraryTab === 'favorites') {
      setFavoritesList(favoritesList.filter(movie => movie.id !== movieId));
      
      // Update favoriteRank for remaining favorites
      const updatedFavorites = favoritesList
        .filter(movie => movie.id !== movieId)
        .map((movie, index) => ({
          ...movie,
          favoriteRank: index + 1
        }));
      
      setFavoritesList(updatedFavorites);
    }
    
    showToast("Removed from library");
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
    const currentList = activeLibraryTab === 'watchlist' ? watchlist : 
                        activeLibraryTab === 'watched' ? watchedList : 
                        favoritesList;
    
    const movie = currentList.find(m => m.id === movieId);
    if (!movie) return;
    
    const newWatchedState = !movie.watched;
    
    if (newWatchedState) {
      // Remove from watchlist and add to watched list
      setWatchlist(watchlist.filter(m => m.id !== movieId));
      setWatchedList([...watchedList, {...movie, watched: true}]);
    } else {
      // Remove from watched list and add to watchlist
      setWatchedList(watchedList.filter(m => m.id !== movieId));
      setWatchlist([...watchlist, {...movie, watched: false}]);
    }
    
    // If in favorites, update watched status there too
    const favoriteMovie = favoritesList.find(m => m.id === movieId);
    if (favoriteMovie) {
      setFavoritesList(favoritesList.map(m => 
        m.id === movieId ? {...m, watched: newWatchedState} : m
      ));
    }
    
    showToast(`Marked as ${newWatchedState ? 'watched' : 'unwatched'}`);
  };

  // Add to favorites
  const addToFavorites = (movie) => {
    // Check if already in favorites
    const isAlreadyFavorite = favoritesList.some(m => m.id === movie.id);
    
    if (isAlreadyFavorite) {
      // Remove from favorites
      setFavoritesList(favoritesList.filter(m => m.id !== movie.id));
      
      // Update movie in other lists
      setWatchlist(watchlist.map(m => 
        m.id === movie.id ? {...m, favorite: false, favoriteRank: null} : m
      ));
      
      setWatchedList(watchedList.map(m => 
        m.id === movie.id ? {...m, favorite: false, favoriteRank: null} : m
      ));
      
      showToast("Removed from favorites");
    } else {
      // Check if favorites list is full
      if (favoritesList.length >= 5) {
        showToast("Top 5 is full! Remove a movie first");
        return;
      }
      
      // Add to favorites with next rank
      const updatedMovie = {...movie, favorite: true, favoriteRank: favoritesList.length + 1};
      setFavoritesList([...favoritesList, updatedMovie]);
      
      // Update movie in other lists
      setWatchlist(watchlist.map(m => 
        m.id === movie.id ? updatedMovie : m
      ));
      
      setWatchedList(watchedList.map(m => 
        m.id === movie.id ? updatedMovie : m
      ));
      
      showToast("Added to favorites");
    }
  };

  // Quick rate a movie
  const handleQuickRate = (movieId, rating) => {
    // Find which list the movie is in
    const listsToCheck = [
      { list: watchlist, setter: setWatchlist },
      { list: watchedList, setter: setWatchedList },
      { list: favoritesList, setter: setFavoritesList }
    ];
    
    listsToCheck.forEach(({ list, setter }) => {
      const movieIndex = list.findIndex(m => m.id === movieId);
      if (movieIndex !== -1) {
        const updatedList = [...list];
        updatedList[movieIndex] = { 
          ...updatedList[movieIndex], 
          userRating: rating, 
          watched: true 
        };
        setter(updatedList);
        
        // If movie was in watchlist and is now watched, move it to watched list
        if (setter === setWatchlist) {
          setWatchlist(updatedList.filter(m => m.id !== movieId));
          setWatchedList([...watchedList, updatedList[movieIndex]]);
        }
      }
    });
    
    showToast(`Rated ${rating} stars`);
    setShowQuickRate(null);
  };

  // Batch delete selected movies
  const deleteSelected = () => {
    if (selectedMovies.length === 0) return;
    
    if (activeLibraryTab === 'watchlist') {
      setWatchlist(prev => prev.filter(movie => !selectedMovies.includes(movie.id)));
    } else if (activeLibraryTab === 'watched') {
      setWatchedList(prev => prev.filter(movie => !selectedMovies.includes(movie.id)));
    } else if (activeLibraryTab === 'favorites') {
      setFavoritesList(prev => prev.filter(movie => !selectedMovies.includes(movie.id)));
    }
    
    showToast(`Removed ${selectedMovies.length} movies`);
    setSelectedMovies([]);
    setIsEditMode(false);
  };

  // Handle drag start for reordering favorites
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    dragNode.current = e.currentTarget;
    
    dragNode.current.addEventListener('dragend', handleDragEnd);
    
    // Add dragging class
    setTimeout(() => {
      dragNode.current.classList.add('dragging');
    }, 0);
  };
  
  // Handle drag enter for reordering favorites
  const handleDragEnter = (e, index) => {
    if (dragItem.current === null) return;
    
    const currentItem = dragItem.current;
    if (currentItem !== index) {
      // Reorder the list
      const newFavorites = [...favoritesList];
      const movingItem = newFavorites[currentItem];
      
      // Remove item from current position
      newFavorites.splice(currentItem, 1);
      
      // Insert at new position
      newFavorites.splice(index, 0, movingItem);
      
      // Update ranks
      const rerankedFavorites = newFavorites.map((movie, idx) => ({
        ...movie,
        favoriteRank: idx + 1
      }));
      
      setFavoritesList(rerankedFavorites);
      dragItem.current = index;
    }
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    dragItem.current = null;
    
    // Remove dragging class
    dragNode.current.classList.remove('dragging');
    dragNode.current.removeEventListener('dragend', handleDragEnd);
    dragNode.current = null;
    
    showToast("Favorites reordered");
  };
  
  // Get active list based on current tab
  const getActiveList = () => {
    switch (activeLibraryTab) {
      case 'watchlist':
        return watchlist;
      case 'watched':
        return watchedList;
      case 'favorites':
        return favoritesList;
      default:
        return watchlist;
    }
  };

  // Apply filters and sorting
  const getFilteredList = () => {
    const activeList = getActiveList();
    
    return activeList
      .filter(movie => {
        // Apply watched/unwatched filter
        if (activeLibraryTab === 'watchlist' || activeLibraryTab === 'watched') {
          // These tabs are already filtered by watched status
          return true;
        }
        
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
            if (activeLibraryTab === 'favorites') {
              return (a.favoriteRank || 999) - (b.favoriteRank || 999);
            }
            return 0; // Maintain current order
        }
      });
  };
  
  // Get the filtered list for rendering
  const filteredList = getFilteredList();
  
  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header title="Media Library" />
      
      {/* Library Tab Navigation */}
      <div className="px-4 pt-3 pb-0">
        <div className={`flex rounded-xl overflow-hidden border ${colorScheme.border} mb-4`}>
          <button
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              activeLibraryTab === 'watchlist' 
                ? 'bg-purple-500 text-white' 
                : `${colorScheme.card} ${colorScheme.text}`
            }`}
            onClick={() => {
              setActiveLibraryTab('watchlist');
              setIsEditMode(false);
              setSelectedMovies([]);
            }}
          >
            Watchlist
          </button>
          <button
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              activeLibraryTab === 'watched' 
                ? 'bg-purple-500 text-white' 
                : `${colorScheme.card} ${colorScheme.text}`
            }`}
            onClick={() => {
              setActiveLibraryTab('watched');
              setIsEditMode(false);
              setSelectedMovies([]);
            }}
          >
            Watched
          </button>
          <button
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              activeLibraryTab === 'favorites' 
                ? 'bg-purple-500 text-white' 
                : `${colorScheme.card} ${colorScheme.text}`
            }`}
            onClick={() => {
              setActiveLibraryTab('favorites');
              setIsEditMode(false);
              setSelectedMovies([]);
            }}
          >
            Top 5
          </button>
        </div>
      </div>
      
      {/* Section Header with Actions */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className={`text-xl font-bold ${colorScheme.text}`}>
            {activeLibraryTab === 'watchlist' && "Movies to Watch"}
            {activeLibraryTab === 'watched' && "Watched Movies"}
            {activeLibraryTab === 'favorites' && "Your Top 5"}
          </h2>
          
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
                {activeLibraryTab === 'favorites' ? (
                  <>
                    {editingFavorites ? (
                      <button 
                        onClick={() => setEditingFavorites(false)}
                        className={`px-3 py-1 rounded-full text-sm bg-purple-500 text-white`}
                      >
                        Done
                      </button>
                    ) : (
                      <button 
                        onClick={() => setEditingFavorites(true)}
                        className={`px-3 py-1 rounded-full text-sm ${colorScheme.text} border ${colorScheme.border}`}
                      >
                        Reorder
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 rounded-full ${colorScheme.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                    {filteredList.length > 0 && (
                      <button 
                        onClick={() => setIsEditMode(true)}
                        className={`px-3 py-1 rounded-full text-sm ${colorScheme.text} border ${colorScheme.border}`}
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Search and Filter UI */}
        {showFilters && activeLibraryTab !== 'favorites' && (
          <div className={`mb-4 p-3 rounded-lg ${colorScheme.card} shadow-md animate-slide-down`}>
            {/* Search */}
            <div className={`flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-3 py-1.5 mb-3`}>
              <Search className={`w-4 h-4 ${colorScheme.textSecondary} mr-2`} />
              <input 
                type="text"
                placeholder={`Search your ${activeLibraryTab}...`}
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
            
            {/* Sorting Options */}
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
                {filteredList.length} {filteredList.length === 1 ? 'movie' : 'movies'}
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
        
        {/* View Mode Toggle for Watchlist and Watched */}
        {(activeLibraryTab === 'watchlist' || activeLibraryTab === 'watched') && 
         filteredList.length > 0 && !isEditMode && !showFilters && (
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
        {filteredList.length > 0 ? (
          <>
            {/* Favorites View - Specialized */}
            {activeLibraryTab === 'favorites' && (
              <div className="space-y-3">
                {favoritesList.map((movie, index) => {
                  const dragProps = editingFavorites ? {
                    draggable: true,
                    onDragStart: (e) => handleDragStart(e, index),
                    onDragEnter: (e) => handleDragEnter(e, index),
                    onDragOver: (e) => e.preventDefault()
                  } : {};
                  
                  return (
                    <div 
                      key={movie.id} 
                      className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transition-all relative ${
                        editingFavorites ? 'cursor-move draggable hover:shadow-lg' : ''
                      }`}
                      {...dragProps}
                    >
                      {/* Favorite Rank Badge */}
                      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {movie.favoriteRank || index + 1}
                      </div>
                      
                      {/* Selection checkbox for edit mode */}
                      {isEditMode && (
                        <div className="absolute top-3 right-3 z-10">
                          <div 
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              selectedMovies.includes(movie.id)
                                ? 'bg-purple-500 text-white'
                                : 'bg-black bg-opacity-50 border border-white'
                            }`}
                            onClick={() => toggleSelection(movie.id)}
                          >
                            {selectedMovies.includes(movie.id) && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      )}
                      
                      {/* Drag handle */}
                      {editingFavorites && (
                        <div className="absolute top-3 right-3 z-10 p-1 bg-black bg-opacity-50 rounded-md">
                          <GripVertical className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex">
                        {/* Movie Poster */}
                        <div 
                          className="w-1/3 aspect-[2/3] relative flex-shrink-0"
                          onClick={() => !isEditMode && !editingFavorites && handleViewDetails(movie)}
                        >
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title} 
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Watched Badge */}
                          {movie.watched && !isEditMode && (
                            <div className="absolute bottom-2 left-2 z-10 bg-green-500 rounded-full p-1 shadow">
                              <Eye className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Movie Info */}
                        <div 
                          className="p-3 flex-1 flex flex-col relative"
                          onClick={() => !isEditMode && !editingFavorites && handleViewDetails(movie)}
                        >
                          <h3 className={`font-bold ${colorScheme.text} text-base leading-tight`}>
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
                          
                          {/* User Rating */}
                          {movie.userRating && (
                            <div className="mt-2 flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= movie.userRating
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Genre Tags */}
                          <div className="flex flex-wrap mt-2">
                            {movie.genre && movie.genre.slice(0, 2).map((genre, idx) => (
                              <span 
                                key={idx}
                                className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                          
                          {/* Action Buttons */}
                          {!isEditMode && !editingFavorites && (
                            <div className="flex justify-between mt-auto pt-2">
                              <button 
                                className={`px-3 py-1 rounded-full text-xs ${
                                  movie.watched
                                    ? 'bg-green-500 bg-opacity-20 text-green-500'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWatched(movie.id);
                                }}
                              >
                                {movie.watched ? (
                                  <span className="flex items-center">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Unwatched
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Watched
                                  </span>
                                )}
                              </button>
                              
                              <button
                                className="px-3 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(movie);
                                }}
                              >
                                <span className="flex items-center">
                                  <Info className="w-3 h-3 mr-1" />
                                  Details
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Add to Favorites Button */}
                {favoritesList.length < 5 && !isEditMode && !editingFavorites && (
                  <div 
                    className={`${colorScheme.card} rounded-lg shadow-md border border-dashed ${colorScheme.border} p-4 flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                    onClick={() => {
                      // Show the watchlist to add movies to favorites
                      setActiveLibraryTab('watchlist');
                      showToast("Select a movie to add to your Top 5");
                    }}
                  >
                    <Plus className={`w-8 h-8 ${colorScheme.textSecondary} mb-2`} />
                    <span className={`text-sm ${colorScheme.textSecondary}`}>
                      Add to your Top 5 ({favoritesList.length}/5)
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Watchlist and Watched - Grid View */}
            {(activeLibraryTab === 'watchlist' || activeLibraryTab === 'watched') && viewMode === 'grid' && (
              <div className="grid grid-cols-2 gap-4">
                {filteredList.map(movie => (
                  <div 
                    key={movie.id} 
                    className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transition-all transform hover:scale-[1.02] relative`}
                  >
                    {/* Favorite badge */}
                    {movie.favorite && (
                      <div className="absolute top-2 right-2 z-10 bg-yellow-500 rounded-full p-1">
                        <Trophy className="w-3 h-3 text-white" />
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
                      className={`relative h-48 ${isEditMode ? 'opacity-80' : ''}`}
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
                          {activeLibraryTab === 'watchlist' && (
                            <button 
                              className="w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWatched(movie.id);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          {activeLibraryTab === 'watched' && (
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
                          )}
                          
                          <button 
                            className={`w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-${movie.favorite ? 'yellow-400' : 'white'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToFavorites(movie);
                            }}
                          >
                            <Trophy className={`w-3.5 h-3.5 ${movie.favorite ? 'fill-current' : ''}`} />
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
                  </div>
                ))}
              </div>
            )}
            
            {/* Watchlist and Watched - List View */}
            {(activeLibraryTab === 'watchlist' || activeLibraryTab === 'watched') && viewMode === 'list' && (
              <div className="space-y-3">
                {filteredList.map(movie => (
                  <div 
                    key={movie.id} 
                    className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transform transition-all relative`}
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
                        className={`relative w-24 h-36 flex-shrink-0 ${isEditMode ? 'ml-4 opacity-80' : ''}`}
                        onClick={() => !isEditMode && handleViewDetails(movie)}
                      >
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title} 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                          {/* Favorite badge */}
                          {movie.favorite && (
                            <div className="bg-yellow-500 rounded-full p-1 shadow">
                              <Trophy className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          {/* Watched badge - only in watchlist view */}
                          {activeLibraryTab === 'watchlist' && movie.watched && (
                            <div className="bg-green-500 rounded-full p-1 shadow">
                              <Eye className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
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
                              {activeLibraryTab === 'watchlist' && (
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
                              )}
                              
                              {/* Rate button */}
                              {activeLibraryTab === 'watched' && (
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
                              )}
                              
                              {/* Favorite button */}
                              <button 
                                className={`text-xs flex items-center ${movie.favorite ? 'text-yellow-500' : colorScheme.textSecondary}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToFavorites(movie);
                                }}
                              >
                                <Trophy className="w-3 h-3 mr-1" />
                                {movie.favorite ? 'Unfavorite' : 'Favorite'}
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
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Empty State for each tab
          <>
            {/* Empty Watchlist */}
            {activeLibraryTab === 'watchlist' && (
              <div className={`flex flex-col items-center justify-center h-64 text-center ${colorScheme.textSecondary} mt-8`}>
                <div className="mb-6 relative">
                  <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  </div>
                  <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-300 dark:text-gray-600" />
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
            
            {/* Empty Watched List */}
            {activeLibraryTab === 'watched' && (
              <div className={`flex flex-col items-center justify-center h-64 text-center ${colorScheme.textSecondary} mt-8`}>
                <div className="mb-6 relative">
                  <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <Eye className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  </div>
                  <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Check className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium mb-2">No watched movies yet</h3>
                <p className="text-sm max-w-xs mb-6">
                  Mark movies as watched to keep track of everything you've seen
                </p>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => setActiveLibraryTab('watchlist')}
                >
                  Go to Watchlist
                </button>
              </div>
            )}
            
            {/* Empty Favorites */}
            {activeLibraryTab === 'favorites' && (
              <div className={`flex flex-col items-center justify-center h-64 text-center ${colorScheme.textSecondary} mt-8`}>
                <div className="mb-6 relative">
                  <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  </div>
                  <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium mb-2">Pick your top 5 favorites</h3>
                <p className="text-sm max-w-xs mb-6">
                  Select up to 5 movies from your library to showcase as your all-time favorites
                </p>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => setActiveLibraryTab('watchlist')}
                >
                  Choose Favorites
                </button>
              </div>
            )}
          </>
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
        
        /* Draggable items styling */
        .dragging {
          opacity: 0.5;
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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

export default MediaLibraryPage;