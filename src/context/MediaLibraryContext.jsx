// src/context/MediaLibraryContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppContext } from './AppContext';

const MediaLibraryContext = createContext();

export const useMediaLibrary = () => useContext(MediaLibraryContext);

export const MediaLibraryProvider = ({ children }) => {
  const { 
    watchlist: originalWatchlist, 
    setWatchlist: setOriginalWatchlist, 
    showToast
  } = useAppContext();
  
  // Extended state for media library
  const [activeLibraryTab, setActiveLibraryTab] = useState('watchlist'); // 'watchlist', 'watched', 'favorites'
  const [watchlist, setWatchlist] = useState([]);
  const [watchedList, setWatchedList] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);
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
  
  // Split watchlist into separate lists
  useEffect(() => {
    setWatchlist(originalWatchlist.filter(movie => !movie.watched));
    setWatchedList(originalWatchlist.filter(movie => movie.watched));
    
    const favs = originalWatchlist
      .filter(movie => movie.favorite)
      .sort((a, b) => (a.favoriteRank || 999) - (b.favoriteRank || 999))
      .slice(0, 5);
    
    setFavoritesList(favs);
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
    if (watchlist.length || watchedList.length || favoritesList.length) {
      updateMainWatchlist();
    }
  }, [watchlist, watchedList, favoritesList]);
  
  // Toggle watch status of a movie
  const toggleWatched = (movieId) => {
    // Find which list the movie is in
    let movie;
    let source;
    
    if (watchlist.some(m => m.id === movieId)) {
      movie = watchlist.find(m => m.id === movieId);
      source = 'watchlist';
    } else if (watchedList.some(m => m.id === movieId)) {
      movie = watchedList.find(m => m.id === movieId);
      source = 'watched';
    } else if (favoritesList.some(m => m.id === movieId)) {
      movie = favoritesList.find(m => m.id === movieId);
      source = 'favorites';
    }
    
    if (!movie) return;
    
    // Toggle the watched status
    const newWatchedState = !movie.watched;
    
    // Move the movie between lists
    if (newWatchedState) {
      // Remove from watchlist (if there) and add to watched list
      setWatchlist(prev => prev.filter(m => m.id !== movieId));
      setWatchedList(prev => [...prev, {...movie, watched: true}]);
    } else {
      // Remove from watched list (if there) and add to watchlist
      setWatchedList(prev => prev.filter(m => m.id !== movieId));
      setWatchlist(prev => [...prev, {...movie, watched: false}]);
    }
    
    // If the movie is in favorites, update its status there too
    if (favoritesList.some(m => m.id === movieId)) {
      setFavoritesList(prev => 
        prev.map(m => m.id === movieId ? {...m, watched: newWatchedState} : m)
      );
    }
    
    showToast(`Marked as ${newWatchedState ? 'watched' : 'unwatched'}`);
  };
  
  // Add/remove movie from favorites
  const toggleFavorite = (movie) => {
    // Check if already in favorites
    const isAlreadyFavorite = favoritesList.some(m => m.id === movie.id);
    
    if (isAlreadyFavorite) {
      // Remove from favorites
      setFavoritesList(prev => prev.filter(m => m.id !== movie.id));
      
      // Update movie in other lists
      setWatchlist(prev => 
        prev.map(m => m.id === movie.id ? {...m, favorite: false, favoriteRank: null} : m)
      );
      
      setWatchedList(prev => 
        prev.map(m => m.id === movie.id ? {...m, favorite: false, favoriteRank: null} : m)
      );
      
      showToast("Removed from favorites");
    } else {
      // Check if favorites list is full
      if (favoritesList.length >= 5) {
        showToast("Top 5 is full! Remove a movie first");
        return;
      }
      
      // Add to favorites with next rank
      const updatedMovie = {
        ...movie, 
        favorite: true, 
        favoriteRank: favoritesList.length + 1
      };
      
      setFavoritesList(prev => [...prev, updatedMovie]);
      
      // Update movie in other lists
      setWatchlist(prev => 
        prev.map(m => m.id === movie.id ? updatedMovie : m)
      );
      
      setWatchedList(prev => 
        prev.map(m => m.id === movie.id ? updatedMovie : m)
      );
      
      showToast("Added to favorites");
    }
  };
  
  // Rate a movie
  const rateMovie = (movieId, rating) => {
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
          setWatchlist(prev => prev.filter(m => m.id !== movieId));
          setWatchedList(prev => [...prev, updatedList[movieIndex]]);
        }
      }
    });
    
    showToast(`Rated ${rating} stars`);
  };
  
  // Delete movie(s) from library
  const deleteMovies = (movieIds) => {
    if (!Array.isArray(movieIds)) {
      movieIds = [movieIds];
    }
    
    // Remove from all lists
    setWatchlist(prev => prev.filter(movie => !movieIds.includes(movie.id)));
    setWatchedList(prev => prev.filter(movie => !movieIds.includes(movie.id)));
    setFavoritesList(prev => prev.filter(movie => !movieIds.includes(movie.id)));
    
    // Update favoriteRank for remaining favorites
    setFavoritesList(prev => {
      return prev.map((movie, index) => ({
        ...movie,
        favoriteRank: index + 1
      }));
    });
    
    showToast(`Removed ${movieIds.length} ${movieIds.length === 1 ? 'movie' : 'movies'}`);
  };
  
  // Reorder favorites
  const reorderFavorites = (favorites) => {
    // Update ranks
    const rerankedFavorites = favorites.map((movie, idx) => ({
      ...movie,
      favoriteRank: idx + 1
    }));
    
    setFavoritesList(rerankedFavorites);
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
  
  const contextValue = {
    // Lists
    watchlist,
    watchedList,
    favoritesList,
    
    // Tab and view state
    activeLibraryTab,
    setActiveLibraryTab,
    viewMode,
    setViewMode,
    
    // UI state
    isEditMode,
    setIsEditMode,
    selectedMovies,
    setSelectedMovies,
    showDetailsModal,
    setShowDetailsModal,
    selectedMovie,
    setSelectedMovie,
    showQuickRate,
    setShowQuickRate,
    showFilters,
    setShowFilters,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    editingFavorites,
    setEditingFavorites,
    
    // Actions
    toggleWatched,
    toggleFavorite,
    rateMovie,
    deleteMovies,
    reorderFavorites,
    getActiveList,
    getFilteredList,
    updateMainWatchlist
  };
  
  return (
    <MediaLibraryContext.Provider value={contextValue}>
      {children}
    </MediaLibraryContext.Provider>
  );
};

export default MediaLibraryProvider;