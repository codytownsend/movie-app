// src/App.jsx
import React, { useState, useEffect } from 'react';
import DiscoverPage from './pages/DiscoverPage';
import SearchPage from './pages/SearchPage';
import SocialPage from './pages/SocialPage';
import WatchlistPage from './pages/WatchlistPage';
import ProfilePage from './pages/ProfilePage';
import LoadingScreen from './components/LoadingScreen';
import Toast from './components/Toast';
import { AppProvider, useAppContext } from './context/AppContext';
import * as movieService from './services/movieService';

function AppContent() {
  const { 
    activeTab, 
    isLoading, 
    setIsLoading, 
    toast, 
    setMovies
  } = useAppContext();

  // Fetch initial movie data
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        // For simplicity, we'll just use sample data for now
        // In a real app, you'd use the API
        const sampleMovies = await movieService.useSampleMovies();
        
        // Add mock streaming information if needed
        const moviesWithStreaming = sampleMovies.map(movie => ({
          ...movie,
          streamingOn: movie.streamingOn || movieService.getStreamingServices(movie.id)
        }));
        
        setMovies(moviesWithStreaming);
      } catch (error) {
        console.error("Error fetching initial movies:", error);
        // Fallback to sample data
        const sampleMovies = await movieService.useSampleMovies();
        setMovies(sampleMovies);
      } finally {
        // Short timeout to allow UI to render smoothly
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    fetchMovies();
  }, [setIsLoading, setMovies]);

  // Show loading screen while fetching initial data
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render the active tab/page
  const renderActivePage = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoverPage />;
      case 'search':
        return <SearchPage />;
      case 'social':
        return <SocialPage />;
      case 'watchlist':
        return <WatchlistPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DiscoverPage />;
    }
  };

  return (
    <>
      {renderActivePage()}
      
      {/* Toast notification for app-wide messages */}
      <Toast toast={toast} />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;