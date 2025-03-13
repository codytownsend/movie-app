// src/pages/MediaLibraryPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, Star, Play, Calendar, Clock, Filter, 
  Eye, EyeOff, Info, ChevronRight, Check, Heart,
  ArrowUpDown, Search, Plus, X, Bookmark, Film, 
  List, Grid, Trophy, Menu, GripVertical, Save
} from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MovieDetailsModal from '../modals/MovieDetailsModal';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { reorderFavorites } from '../services/firebase';

// Check if it's a touch device
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend;


const handleOfflineMode = () => {
  if (!navigator.onLine) {
    showToast("You're offline. Some features may be limited.");
    // Load data from localStorage if available
    const cachedWatchlist = localStorage.getItem('cachedWatchlist');
    if (cachedWatchlist) {
      try {
        setWatchlist(JSON.parse(cachedWatchlist));
      } catch (e) {
        console.error('Error parsing cached watchlist', e);
      }
    }
  }
};

// Call this in useEffect
useEffect(() => {
  handleOfflineMode();
  window.addEventListener('online', () => showToast("You're back online!"));
  window.addEventListener('offline', handleOfflineMode);
  
  return () => {
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', handleOfflineMode);
  };
}, []);

// Draggable favorite item component
const DraggableFavoriteItem = ({ movie, index, moveItem, editingFavorites, handleViewDetails }) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'favorite',
    item: { id: movie.id, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => editingFavorites,
  }));
  
  const [, drop] = useDrop({
    accept: 'favorite',
    hover: (draggedItem, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Move the item
      moveItem(dragIndex, hoverIndex);
      
      // Update the dragged item's index
      draggedItem.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref}
      className={`relative rounded-lg overflow-hidden shadow-md transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${editingFavorites ? 'cursor-move' : ''}`}
      style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
    >
      {/* Favorite Rank Badge */}
      <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-7 h-7 flex items-center justify-center text-white font-bold text-sm shadow-md">
        {index + 1}
      </div>
      
      {/* Drag handle */}
      {editingFavorites && (
        <div className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-md">
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="flex" onClick={() => !editingFavorites && handleViewDetails(movie)}>
        {/* Movie Poster */}
        <div className="w-1/3 aspect-[2/3] flex-shrink-0">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Movie Info */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">
            {movie.title}
          </h3>
          
          <div className="flex items-center mt-1 text-xs text-gray-300">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{movie.year}</span>
          </div>
          
          {/* User Rating */}
          {movie.userRating > 0 && (
            <div className="mt-2 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`w-4 h-4 ${
                    star <= movie.userRating
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-500'
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
                className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 mr-1 mb-1"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaLibraryPage = () => {
  const { 
    colorScheme, 
    darkMode, 
    watchlist,
    watchedHistory,
    favoritesList,
    showToast,
    addToWatchlist,
    removeFromWatchlist,
    markMovieAsWatched,
    rateMovie,
    toggleFavorite,
    updateFavoriteOrder
  } = useAppContext();
  
  const { currentUser } = useAuth();
  
  // Local state
  const [activeLibraryTab, setActiveLibraryTab] = useState('watchlist'); // 'watchlist', 'watched', 'favorites'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showQuickRate, setShowQuickRate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('added'); // 'added', 'rating', 'title', 'year'
  const [editingFavorites, setEditingFavorites] = useState(false);
  const [items, setItems] = useState([]);
  
  // Update items when activeLibraryTab or lists change
  useEffect(() => {
    if (activeLibraryTab === 'watchlist') {
      setItems(watchlist);
    } else if (activeLibraryTab === 'watched') {
      setItems(watchedHistory);
    } else if (activeLibraryTab === 'favorites') {
      setItems(favoritesList);
    }
  }, [activeLibraryTab, watchlist, watchedHistory, favoritesList]);

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

  // Handle quick rating
  const handleQuickRate = (movieId, rating) => {
    rateMovie(movieId, rating);
    setShowQuickRate(null);
  };

  // Batch delete selected movies
  const deleteSelected = () => {
    if (selectedMovies.length === 0) return;
    
    // Delete each selected movie
    selectedMovies.forEach(movieId => {
      removeFromWatchlist(movieId);
    });
    
    setSelectedMovies([]);
    setIsEditMode(false);
    showToast(`Removed ${selectedMovies.length} movies`);
  };
  
  // Move item in favorites list (for drag and drop)
  const moveItem = (dragIndex, hoverIndex) => {
    if (activeLibraryTab !== 'favorites') return;
    
    const draggedItem = items[dragIndex];
    if (!draggedItem) return;
    
    const newItems = [...items];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    
    setItems(newItems);
  };
  
  // Save reordered favorites
  const saveFavoriteOrder = async () => {
    try {
      // Extract movie IDs in new order
      const orderIds = items.map(item => item.id.toString());
      
      // Update in Firebase (this will update local state via AppContext)
      await updateFavoriteOrder(orderIds);
      
      setEditingFavorites(false);
    } catch (error) {
      console.error('Error saving favorite order:', error);
      showToast('Error saving favorites order');
    }
  };
  
  // Apply filters and sorting
  const getFilteredList = () => {
    return items
      .filter(movie => {
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
            // Default to newest first based on added timestamp
            const dateA = a.addedAt ? new Date(a.addedAt.seconds * 1000) : new Date(0);
            const dateB = b.addedAt ? new Date(b.addedAt.seconds * 1000) : new Date(0);
            return dateB - dateA;
        }
      });
  };
  
  // Get filtered list
  const filteredList = getFilteredList();
  
  // Not logged in message
  if (!currentUser) {
    return (
      <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
        <Header />
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 flex items-center justify-center">
            <Film className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${colorScheme.text}`}>Sign in to View Your Library</h2>
          <p className={`mb-6 ${colorScheme.textSecondary}`}>
            Create an account to keep track of movies you want to watch and have watched
          </p>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('profile')}
          >
            Sign In / Register
          </button>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

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
                        onClick={saveFavoriteOrder}
                        className={`px-3 py-1 rounded-full text-sm bg-purple-500 text-white`}
                      >
                        Save Order
                      </button>
                    ) : (
                      <button 
                        onClick={() => setEditingFavorites(true)}
                        className={`px-3 py-1 rounded-full text-sm ${colorScheme.text} border ${colorScheme.border}`}
                        disabled={favoritesList.length <= 1}
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
                <Grid className="w-4 h-4" />
              </button>
              <button 
                className={`px-2 py-1 ${viewMode === 'list' 
                  ? 'bg-purple-500 text-white' 
                  : `${colorScheme.card} ${colorScheme.text}`}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
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
              <DndProvider backend={dndBackend}>
                <div className="space-y-3">
                  {items.map((movie, index) => (
                    <DraggableFavoriteItem
                      key={movie.id}
                      movie={movie}
                      index={index}
                      moveItem={moveItem}
                      editingFavorites={editingFavorites}
                      handleViewDetails={handleViewDetails}
                    />
                  ))}
                  
                  {/* Add to Favorites Button */}
                  {favoritesList.length < 5 && !isEditMode && !editingFavorites && (
                    <div 
                      className="rounded-lg shadow-md border border-dashed border-gray-700 p-4 flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-800 transition-colors"
                      style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
                      onClick={() => {
                        // Show the watchlist to add movies to favorites
                        setActiveLibraryTab('watchlist');
                        showToast("Select a movie to add to your Top 5");
                      }}
                    >
                      <Plus className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-sm text-gray-400">
                        Add to your Top 5 ({favoritesList.length}/5)
                      </span>
                    </div>
                  )}
                </div>
              </DndProvider>
            )}
            
            {/* Watchlist and Watched - Grid View */}
            {(activeLibraryTab === 'watchlist' || activeLibraryTab === 'watched') && viewMode === 'grid' && (
              <div className="grid grid-cols-2 gap-4">
                {filteredList.map(movie => (
                  <div 
                    key={movie.id} 
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all transform hover:scale-[1.02] relative"
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
                      {movie.userRating > 0 && (
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
                                markMovieAsWatched(movie.id, true);
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
                              toggleFavorite(movie.id);
                            }}
                          >
                            <Heart className={`w-3.5 h-3.5 ${movie.favorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Movie Info */}
                    <div className="p-3">
                      <h3 
                        className="font-bold text-white text-sm leading-tight line-clamp-1"
                        onClick={() => !isEditMode && handleViewDetails(movie)}
                      >
                        {movie.title}
                      </h3>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
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
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-md transform transition-all relative"
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm leading-tight">
                              {movie.title}
                            </h3>
                            <div className="flex items-center mt-1 text-xs text-gray-400">
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
                                  <span className="text-xs font-medium ml-1 text-yellow-400">
                                    {movie.userRating}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center bg-gray-700 rounded-full px-2 py-0.5">
                                  <Star className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs ml-1 text-gray-400">
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
                              className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 mr-1 mb-1"
                            >
                              {genre}
                            </span>
                          ))}
                          {movie.genre && movie.genre.length > 2 && (
                            <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 mr-1 mb-1">
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
                                  className={`text-xs flex items-center ${movie.watched ? 'text-green-500' : 'text-gray-400'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markMovieAsWatched(movie.id, !movie.watched);
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
                                className={`text-xs flex items-center ${movie.favorite ? 'text-yellow-500' : 'text-gray-400'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(movie.id);
                                }}
                              >
                                <Heart className="w-3 h-3 mr-1" />
                                {movie.favorite ? 'Unfavorite' : 'Favorite'}
                              </button>
                            </div>
                            
                            <button
                              className="text-xs flex items-center text-gray-400"
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
                        <div className="bg-gray-900 flex flex-col justify-center px-2">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
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
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 mt-8">
                <div className="mb-6 relative">
                  <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-700 flex items-center justify-center">
                    <Bookmark className="w-16 h-16 text-gray-700" />
                  </div>
                  <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium mb-2 text-white">Your watchlist is empty</h3>
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
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 mt-8">
                <div className="mb-6 relative">
                  <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-700 flex items-center justify-center">
                    <Eye className="w-16 h-16 text-gray-700" />
                  </div>
                  <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <Check className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium mb-2 text-white">No watched movies yet</h3>
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
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 mt-8">
                <div className="mb-6 relative">
                  <div className="w-32 h-40 rounded-md border-2 border-dashed border-gray-700 flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-gray-700" />
                  </div>
                  <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                
                <h3 className="text-xl font-medium mb-2 text-white">Pick your top 5 favorites</h3>
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