// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sampleMovies as initialMovies, friendRecommendations as initialRecommendations } from '../data/sampleData';

// Create context
const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // App state
  const [activeTab, setActiveTab] = useState('discover');
  const [darkMode, setDarkMode] = useState(() => {
    // Try to get the saved theme preference from localStorage
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });
  
  // Movies state
  const [movies, setMovies] = useState(initialMovies);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchlist, setWatchlist] = useState(() => {
    // Try to get the saved watchlist from localStorage
    const savedWatchlist = localStorage.getItem('watchlist');
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });
  const [watchedHistory, setWatchedHistory] = useState(() => {
    const savedHistory = localStorage.getItem('watchedHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [pendingRecommendations, setPendingRecommendations] = useState(initialRecommendations);
  
  // Filter preferences
  const [filterPreferences, setFilterPreferences] = useState(() => {
    const savedFilters = localStorage.getItem('filterPreferences');
    return savedFilters ? JSON.parse(savedFilters) : {
      genres: [],
      services: [],
      minRating: 7,
      yearRange: [1970, 2025]
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

  // Show toast notifications
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Handle movie swiping
  const handleSwipe = (liked) => {
    // Get current movie
    const currentMovie = movies[currentIndex];
    
    // Add to watchlist if liked
    if (liked && currentMovie) {
      setWatchlist(prev => {
        if (!prev.find(item => item.id === currentMovie.id)) {
          return [...prev, currentMovie];
        }
        return prev;
      });
    }
    
    // Add to watch history
    if (currentMovie) {
      setWatchedHistory(prev => [
        ...prev, 
        {
          movie: currentMovie,
          timestamp: new Date(),
          action: liked ? 'liked' : 'disliked'
        }
      ]);
    }
    
    // Move to the next movie
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
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
  const applyFilters = () => {
    setIsLoading(true);
    
    // In a real app, this would call an API with the filter parameters
    // For now, we'll simulate a delay and filtering the sample data
    setTimeout(() => {
      setIsLoading(false);
      showToast("Filters applied successfully!");
    }, 1000);
  };

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('watchedHistory', JSON.stringify(watchedHistory));
  }, [watchedHistory]);

  useEffect(() => {
    localStorage.setItem('filterPreferences', JSON.stringify(filterPreferences));
  }, [filterPreferences]);

  // Search functionality
  const handleSearch = (query) => {
    if (query.trim() === '') {
      return [];
    }
    
    // Filter movies based on search query
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.genre.some(g => g.toLowerCase().includes(query.toLowerCase())) ||
      movie.director.toLowerCase().includes(query.toLowerCase()) ||
      movie.cast.some(actor => actor.toLowerCase().includes(query.toLowerCase()))
    );
  };

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
    setWatchlist,
    watchedHistory,
    setWatchedHistory,
    
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
    handleSearch
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};