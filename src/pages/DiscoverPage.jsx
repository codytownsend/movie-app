// src/pages/DiscoverPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import MovieCard from '../components/MovieCard';
import SwipeActions from '../components/SwipeActions';
import Toast from '../components/Toast';
import MovieDetailsModal from '../modals/MovieDetailsModal';
import { sampleMovies } from '../data/sampleData';

const DiscoverPage = ({ setActiveTab, colorScheme, darkMode, setDarkMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  const currentMovie = sampleMovies[currentIndex];

  // Simulate loading
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleSwipe = (liked) => {
    if (liked && currentMovie) {
      // (Watchlist addition logic can be handled via bookmark button)
      showToast("Movie liked!");
    }
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sampleMovies.length);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className={`h-screen ${colorScheme.bg} flex items-center justify-center`}>
        <p className={`${colorScheme.text}`}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`relative h-screen ${colorScheme.bg} max-w-md mx-auto overflow-hidden`}>
      <Header colorScheme={colorScheme} setFilterOpen={() => {}} setNotificationsOpen={() => {}} />
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {!currentMovie ? (
          <div className={`flex-grow flex items-center justify-center text-center ${colorScheme.textSecondary} p-8`}>
            <div>
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-medium mb-2">No more recommendations</h3>
              <p className="mb-4">We're finding more great matches for you</p>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2">
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex-grow flex items-center justify-center overflow-hidden">
            <MovieCard 
              currentMovie={currentMovie}
              handleSwipe={handleSwipe}
              setShowDetails={setShowDetails}
              colorScheme={colorScheme}
              showToast={showToast}
              darkMode={darkMode}
            />
          </div>
        )}
        <SwipeActions 
          onSwipeNegative={() => handleSwipe(false)}
          onBookmark={() => showToast("Added to watchlist!")}
          onSwipePositive={() => handleSwipe(true)}
          colorScheme={colorScheme}
        />
      </div>
      <BottomNavigation activeTab="discover" setActiveTab={setActiveTab} pendingRecommendations={[]} colorScheme={colorScheme} />
      {showDetails && (
        <MovieDetailsModal 
          currentMovie={currentMovie}
          colorScheme={colorScheme}
          setShowDetails={setShowDetails}
          handleSwipe={handleSwipe}
          showToast={showToast}
          darkMode={darkMode}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
};

export default DiscoverPage;
