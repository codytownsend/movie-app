// src/pages/WatchlistPage.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Trash2, Star, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const WatchlistPage = () => {
  const { 
    colorScheme, 
    darkMode, 
    watchlist, 
    setWatchlist, 
    showToast, 
    setActiveTab
  } = useAppContext();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Handle remove from watchlist
  const handleRemoveFromWatchlist = (movieId) => {
    setWatchlist(watchlist.filter(movie => movie.id !== movieId));
    showToast("Removed from watchlist");
  };

  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header 
        setNotificationsOpen={setNotificationsOpen} 
      />
      
      <div className="p-4 pb-2 flex items-center">
        <h2 className={`text-xl font-bold ${colorScheme.text}`}>Your Watchlist</h2>
        <div className="ml-auto text-sm">
          {watchlist.length > 0 && (
            <span className={colorScheme.textSecondary}>{watchlist.length} movies</span>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {watchlist.length > 0 ? (
          <div className="space-y-4">
            {watchlist.map(movie => (
              <div 
                key={movie.id} 
                className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden transform transition-all hover:scale-[1.01] hover:shadow-md`}
              >
                <div className="w-20 h-28 bg-gray-300 flex-shrink-0">
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="p-3 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-medium ${colorScheme.text}`}>{movie.title}</h4>
                      <p className={`text-xs ${colorScheme.textSecondary} mb-1`}>
                        {movie.year} • {movie.duration || '2h 0m'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromWatchlist(movie.id)}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                  </div>
                  
                  <div className="flex flex-wrap mt-1">
                    {movie.genre && movie.genre.slice(0, 2).map((g, i) => (
                      <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1">
                        {g}
                      </span>
                    ))}
                  </div>
                  
                  {/* Streaming services */}
                  {movie.streamingOn && movie.streamingOn.length > 0 && (
                    <div className="flex mt-2">
                      {movie.streamingOn.map((service, i) => (
                        <span 
                          key={i} 
                          className="text-xs bg-blue-100 text-blue-800 rounded-md px-2 py-0.5 mr-1"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Watch Button */}
                  <button 
                    className="mt-2 text-xs flex items-center text-purple-500"
                    onClick={() => {
                      setActiveTab('discover');
                      showToast(`Opening: ${movie.title}`);
                    }}
                  >
                    <Play className="w-3 h-3 mr-1 fill-current" />
                    Watch now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center h-64 text-center ${colorScheme.textSecondary}`}>
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="mb-2">Your watchlist is empty</p>
            <p className="text-sm max-w-xs">
              Swipe right on movies you want to watch later, or use the heart button to add them to your watchlist
            </p>
            <button 
              className="mt-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
              onClick={() => setActiveTab('discover')}
            >
              Discover Movies
            </button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default WatchlistPage;