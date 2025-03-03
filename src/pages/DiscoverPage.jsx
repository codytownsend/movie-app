// src/pages/DiscoverPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import MovieCard from '../components/MovieCard';
import SwipeActions from '../components/SwipeActions';
import MovieDetailsModal from '../modals/MovieDetailsModal';
import FilterModal from '../modals/FilterModal';
import NotificationsModal from '../modals/NotificationsModal';
import SettingsModal from '../modals/SettingsModal';
import { useAppContext } from '../context/AppContext';

const DiscoverPage = () => {
  // Get values and functions from context
  const { 
    movies, 
    currentIndex, 
    colorScheme, 
    darkMode, 
    showToast, 
    handleSwipe,
    isLoading,
    setIsLoading
  } = useAppContext();
  
  // Local state
  const [showDetails, setShowDetails] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [direction, setDirection] = useState('');
  
  const currentMovie = movies[currentIndex];

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    // In a real app, this would fetch new recommendations
    setTimeout(() => {
      setIsLoading(false);
      showToast("New recommendations loaded!");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className={`h-screen ${colorScheme.bg} flex items-center justify-center`}>
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`relative h-screen ${colorScheme.bg} max-w-md mx-auto overflow-hidden`}>
      {/* Header */}
      <Header 
        setFilterOpen={setFilterOpen} 
        setNotificationsOpen={setNotificationsOpen}
      />

      {/* Main content */}
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {!currentMovie ? (
          <div className={`flex-grow flex items-center justify-center text-center ${colorScheme.textSecondary} p-8`}>
            <div>
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-medium mb-2">No more recommendations</h3>
              <p className="mb-4">We're finding more great matches for you</p>
              <button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2"
                onClick={handleRefresh}
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex-grow flex items-center justify-center overflow-hidden">
            {/* Next movie preview (shown behind current card) */}
            {currentIndex + 1 < movies.length && direction === '' && (
              <div className={`absolute w-[90%] max-w-sm ${colorScheme.card} rounded-xl shadow-md overflow-hidden transform scale-95 -translate-y-4 opacity-70`}>
                <img 
                  src={movies[currentIndex + 1].posterUrl} 
                  alt="Next movie" 
                  className="w-full h-[65vh] object-cover opacity-90"
                />
              </div>
            )}
            
            <MovieCard 
              currentMovie={currentMovie}
              handleSwipe={handleSwipe}
              setShowDetails={setShowDetails}
              colorScheme={colorScheme}
              showToast={showToast}
              darkMode={darkMode}
              direction={direction}
              setDirection={setDirection}
            />
          </div>
        )}

        {/* Swipe action buttons */}
        <SwipeActions 
          onSwipeNegative={() => {
            setDirection('left');
            setTimeout(() => {
              handleSwipe(false);
              setDirection('');
            }, 300);
          }}
          onBookmark={() => {
            if (currentMovie) {
              showToast("Added to watchlist!");
            }
          }}
          onSwipePositive={() => {
            setDirection('right');
            setTimeout(() => {
              handleSwipe(true);
              setDirection('');
            }, 300);
          }}
          colorScheme={colorScheme}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Modals */}
      {showDetails && currentMovie && (
        <MovieDetailsModal 
          currentMovie={currentMovie}
          setShowDetails={setShowDetails}
        />
      )}
      
      {filterOpen && (
        <FilterModal 
          setFilterOpen={setFilterOpen}
        />
      )}
      
      {notificationsOpen && (
        <NotificationsModal 
          setNotificationsOpen={setNotificationsOpen}
        />
      )}
      
      {showSettingsModal && (
        <SettingsModal 
          setShowSettingsModal={setShowSettingsModal}
        />
      )}
    </div>
  );
};

export default DiscoverPage;