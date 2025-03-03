// src/pages/WatchlistPage.js
import React from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Trash2, Star } from 'lucide-react';

const WatchlistPage = ({ watchlist, setWatchlist, colorScheme, setActiveTab, showToast, pendingRecommendations, darkMode }) => {
  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header colorScheme={colorScheme} setFilterOpen={() => {}} setNotificationsOpen={() => {}} />
      <header className={`${colorScheme.card} shadow-sm p-4 flex items-center`}>
        <button onClick={() => setActiveTab('discover')}>
          <span className="text-xl">←</span>
        </button>
        <h2 className={`flex-1 text-xl font-bold ${colorScheme.text}`}>Your Watchlist</h2>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {watchlist.length > 0 ? (
          watchlist.map(movie => (
            <div key={movie.id} className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden mb-4`}>
              <div className="w-16 h-20 bg-gray-300">
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 flex-1">
                <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                <p className={`text-xs ${colorScheme.textSecondary}`}>{movie.genre[0]} • {movie.year}</p>
                <div className="flex items-center mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setWatchlist(watchlist.filter(m => m.id !== movie.id));
                  showToast("Removed from watchlist");
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))
        ) : (
          <div className={`text-center py-8 ${colorScheme.textSecondary}`}>
            <p>Your watchlist is empty</p>
            <p className="text-sm mt-1">Swipe right on movies you want to watch later</p>
          </div>
        )}
      </div>
      <BottomNavigation activeTab="watchlist" setActiveTab={setActiveTab} pendingRecommendations={pendingRecommendations} colorScheme={colorScheme} />
    </div>
  );
};

export default WatchlistPage;
