// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserMovieLists,
  addToWatchlist as addToWatchlistService,
  removeMovie,
  markAsWatched,
  rateMovie as rateMovieService,
  toggleFavorite as toggleFavoriteService,
  reorderFavorites,
  getPersonalizedRecommendations,
  updateUserSettings
} from '../services/firebase';

// Create context
const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  
  // App state
  const [activeTab, setActiveTab] = useState('discover');
  const [darkMode, setDarkMode] = useState(() => {
    // Try to get the saved theme preference from localStorage
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });
  
  // Movies state
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchlist, setWatchlist] = useState([]);
  const [watchedHistory, setWatchedHistory] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [pendingRecommendations, setPendingRecommendations] = useState([]);
  
  // Filter preferences
  const [filterPreferences, setFilterPreferences] = useState(() => {
    const savedFilters = localStorage.getItem('filterPreferences');
    return savedFilters ? JSON.parse(savedFilters) : {
      genres: [],
      services: [],
      minRating: 7,
      yearRange: [1970, new Date().getFullYear()]
    };
  });

  // Define color scheme based on dark mode
  const colorScheme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-gray-100' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    accent: 'bg-gradient-to-r from-purple-500 to-pink-500'
  };

  // Load user movie lists when user changes
  useEffect(() => {
    async function loadUserMovieLists() {
      if (currentUser) {
        setIsLoading(true);
        try {
          const lists = await getUserMovieLists(currentUser.uid);
          setWatchlist(lists.watchlist);
          setWatchedHistory(lists.watched);
          setFavoritesList(lists.favorites);
        } catch (error) {
          console.error('Error loading user movie lists:', error);
          showToast('Error loading your movie lists');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset lists if not logged in
        setWatchlist([]);
        setWatchedHistory([]);
        setFavoritesList([]);
      }
    }
    
    loadUserMovieLists();
  }, [currentUser]);
  
  // Load recommendations when user profile changes
  useEffect(() => {
    async function loadRecommendations() {
      if (currentUser) {
        try {
          const recommendations = await getPersonalizedRecommendations(
            currentUser.uid, 
            filterPreferences
          );
          setMovies(recommendations);
        } catch (error) {
          console.error('Error loading recommendations:', error);
          // Fall back to sample data
          import('../data/sampleData').then(module => {
            setMovies(module.sampleMovies);
          });
        }
      } else {
        // Load sample data if not logged in
        import('../data/sampleData').then(module => {
          setMovies(module.sampleMovies);
        });
      }
    }
    
    loadRecommendations();
  }, [currentUser, userProfile, filterPreferences]);

  // Show toast notifications
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Handle movie swiping
  const handleSwipe = async (liked) => {
    // Get current movie
    const currentMovie = movies[currentIndex];
    
    if (!currentMovie) return;
    
    // Add to watchlist if liked
    if (liked && currentUser) {
      try {
        await addToWatchlistService(currentUser.uid, currentMovie);
        showToast("Added to watchlist!");
        
        // Update local watchlist
        setWatchlist(prev => {
          if (!prev.find(item => item.id === currentMovie.id)) {
            return [...prev, { ...currentMovie, listType: 'watchlist', addedAt: new Date() }];
          }
          return prev;
        });
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        showToast('Error adding to watchlist');
      }
    }
    
    // Add to watch history
    setWatchedHistory(prev => [
      ...prev, 
      {
        movie: currentMovie,
        timestamp: new Date(),
        action: liked ? 'liked' : 'disliked'
      }
    ]);
    
    // Move to the next movie
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
  };

  // Add to watchlist function
  const addToWatchlist = async (movie) => {
    if (!currentUser) {
      showToast('Please log in to add to watchlist');
      return;
    }
    
    try {
      await addToWatchlistService(currentUser.uid, movie);
      showToast("Added to watchlist!");
      
      // Update local watchlist
      setWatchlist(prev => {
        if (!prev.find(item => item.id === movie.id)) {
          return [...prev, { ...movie, listType: 'watchlist', addedAt: new Date() }];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      showToast('Error adding to watchlist');
    }
  };
  
  // Remove from watchlist function
  const removeFromWatchlist = async (movieId) => {
    if (!currentUser) return;
    
    try {
      await removeMovie(currentUser.uid, movieId);
      showToast("Removed from watchlist");
      
      // Update local state
      setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
      setWatchedHistory(prev => prev.filter(movie => movie.id !== movieId));
      setFavoritesList(prev => prev.filter(movie => movie.id !== movieId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      showToast('Error removing from watchlist');
    }
  };
  
  // Mark movie as watched
  const markMovieAsWatched = async (movieId, watched = true) => {
    if (!currentUser) return;
    
    try {
      await markAsWatched(currentUser.uid, movieId, watched);
      showToast(`Marked as ${watched ? 'watched' : 'unwatched'}`);
      
      // Update local state
      if (watched) {
        // Move from watchlist to watched
        const movie = watchlist.find(m => m.id === movieId);
        if (movie) {
          setWatchlist(prev => prev.filter(m => m.id !== movieId));
          setWatchedHistory(prev => [...prev, { ...movie, watched: true, listType: 'watched' }]);
        }
      } else {
        // Move from watched to watchlist
        const movie = watchedHistory.find(m => m.id === movieId);
        if (movie) {
          setWatchedHistory(prev => prev.filter(m => m.id !== movieId));
          setWatchlist(prev => [...prev, { ...movie, watched: false, listType: 'watchlist' }]);
        }
      }
    } catch (error) {
      console.error('Error marking as watched:', error);
      showToast('Error updating watch status');
    }
  };
  
  // Rate a movie
  const rateMovie = async (movieId, rating, review = '') => {
    if (!currentUser) return;
    
    try {
      await rateMovieService(currentUser.uid, movieId, rating, review);
      showToast(`Rated ${rating} stars`);
      
      // Find the movie in any list
      let movie = watchlist.find(m => m.id === movieId) ||
        watchedHistory.find(m => m.id === movieId) ||
        favoritesList.find(m => m.id === movieId);
      
      if (movie) {
        // Create updated movie object
        const updatedMovie = {
          ...movie,
          userRating: rating,
          userReview: review,
          watched: true,
          listType: 'watched'
        };
        
        // Update watchedHistory
        setWatchedHistory(prev => {
          const exists = prev.some(m => m.id === movieId);
          if (exists) {
            return prev.map(m => m.id === movieId ? updatedMovie : m);
          } else {
            return [...prev, updatedMovie];
          }
        });
        
        // Remove from watchlist if it's there
        setWatchlist(prev => prev.filter(m => m.id !== movieId));
        
        // Update in favorites if it's there
        setFavoritesList(prev => 
          prev.map(m => m.id === movieId ? updatedMovie : m)
        );
      }
    } catch (error) {
      console.error('Error rating movie:', error);
      showToast('Error rating movie');
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = async (movieId) => {
    if (!currentUser) return;
    
    try {
      const newFavoriteStatus = await toggleFavoriteService(currentUser.uid, movieId);
      showToast(newFavoriteStatus ? "Added to favorites" : "Removed from favorites");
      
      // Find the movie in any list
      let movie = watchlist.find(m => m.id === movieId) ||
        watchedHistory.find(m => m.id === movieId) ||
        favoritesList.find(m => m.id === movieId);
      
      if (movie) {
        // Create updated movie object
        const updatedMovie = {
          ...movie,
          favorite: newFavoriteStatus,
          favoriteRank: newFavoriteStatus ? (favoritesList.length + 1) : null
        };
        
        // Update in all lists
        setWatchlist(prev => 
          prev.map(m => m.id === movieId ? updatedMovie : m)
        );
        
        setWatchedHistory(prev => 
          prev.map(m => m.id === movieId ? updatedMovie : m)
        );
        
        // Update favorites list
        if (newFavoriteStatus) {
          setFavoritesList(prev => [...prev, updatedMovie]);
        } else {
          setFavoritesList(prev => prev.filter(m => m.id !== movieId));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Error updating favorites');
    }
  };
  
  // Reorder favorites
  const updateFavoriteOrder = async (orderedIds) => {
    if (!currentUser) return;
    
    try {
      await reorderFavorites(currentUser.uid, orderedIds);
      
      // Update local state with new order
      const updatedFavorites = [...favoritesList];
      orderedIds.forEach((id, index) => {
        const movieIndex = updatedFavorites.findIndex(m => m.id === id);
        if (movieIndex !== -1) {
          updatedFavorites[movieIndex] = {
            ...updatedFavorites[movieIndex],
            favoriteRank: index + 1
          };
        }
      });
      
      // Sort by new rank
      updatedFavorites.sort((a, b) => a.favoriteRank - b.favoriteRank);
      setFavoritesList(updatedFavorites);
      
      showToast('Favorites reordered');
    } catch (error) {
      console.error('Error reordering favorites:', error);
      showToast('Error reordering favorites');
    }
  };

  // Filter toggling functions
  const toggleGenreFilter = (genre) => {
    setFilterPreferences(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };
  
  const toggleServiceFilter = (service) => {
    setFilterPreferences(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };
  
  const setRatingFilter = (rating) => {
    setFilterPreferences(prev => ({ ...prev, minRating: rating }));
  };
  
  const setYearRangeFilter = (range) => {
    setFilterPreferences(prev => ({ ...prev, yearRange: range }));
  };

  // Apply filters to movies
  const applyFilters = async () => {
    setIsLoading(true);
    
    try {
      if (currentUser) {
        // Get personalized recommendations with filters
        const recommendations = await getPersonalizedRecommendations(
          currentUser.uid, 
          filterPreferences
        );
        setMovies(recommendations);
        setCurrentIndex(0);
      } else {
        // Apply filters to sample data if not logged in
        const { sampleMovies } = await import('../data/sampleData');
        let filteredMovies = [...sampleMovies];
        
        // Apply genre filter
        if (filterPreferences.genres.length > 0) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.genre.some(g => filterPreferences.genres.includes(g))
          );
        }
        
        // Apply streaming service filter
        if (filterPreferences.services.length > 0) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.streamingOn.some(s => filterPreferences.services.includes(s))
          );
        }
        
        // Apply rating filter
        if (filterPreferences.minRating > 0) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.rating >= filterPreferences.minRating
          );
        }
        
        // Apply year range filter
        filteredMovies = filteredMovies.filter(movie => 
          movie.year >= filterPreferences.yearRange[0] && 
          movie.year <= filterPreferences.yearRange[1]
        );
        
        setMovies(filteredMovies);
        setCurrentIndex(0);
      }
      
      showToast("Filters applied successfully!");
    } catch (error) {
      console.error('Error applying filters:', error);
      showToast('Error applying filters');
    } finally {
      setIsLoading(false);
    }
  };

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Update user settings in Firestore if logged in
    if (currentUser && userProfile?.settings) {
      const updatedSettings = {
        ...userProfile.settings,
        darkMode
      };
      
      updateUserSettings(currentUser.uid, updatedSettings).catch(error => {
        console.error('Error updating dark mode setting:', error);
      });
    }
  }, [darkMode, currentUser, userProfile]);

  useEffect(() => {
    localStorage.setItem('filterPreferences', JSON.stringify(filterPreferences));
  }, [filterPreferences]);

  // Value to be provided by the context
  const contextValue = {
    // Navigation state
    activeTab,
    setActiveTab,
    
    // Theme state
    darkMode,
    setDarkMode,
    colorScheme,
    
    // Movies state
    movies,
    setMovies,
    currentIndex,
    setCurrentIndex,
    watchlist,
    watchedHistory,
    favoritesList,
    
    // UI state
    isLoading,
    setIsLoading,
    toast,
    showToast,
    pendingRecommendations,
    setPendingRecommendations,
    
    // Filter state
    filterPreferences,
    toggleGenreFilter,
    toggleServiceFilter,
    setRatingFilter,
    setYearRangeFilter,
    applyFilters,
    
    // Functions
    handleSwipe,
    addToWatchlist,
    removeFromWatchlist,
    markMovieAsWatched,
    rateMovie,
    toggleFavorite,
    updateFavoriteOrder
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};