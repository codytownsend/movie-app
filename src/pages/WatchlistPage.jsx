// src/pages/WatchlistPage.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Trash2, Star, Play, Calendar, Clock, ArrowRight, Bookmark } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import NotificationsModal from '../modals/NotificationsModal';

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
      
      {/* Watchlist Header */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${colorScheme.text}`}>Your Watchlist</h2>
          
          {watchlist.length > 0 && (
            <div className="flex items-center">
              <span className={`mr-4 text-sm font-medium ${colorScheme.textSecondary}`}>
                {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'}
              </span>
              
              {/* View toggle buttons */}
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
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 px-4 py-2 overflow-y-auto pb-20">
        {watchlist.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-2 gap-4">
              {watchlist.map(movie => (
                <div 
                  key={movie.id} 
                  className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transition-transform hover:scale-[1.02] relative`}
                >
                  {/* Poster Image */}
                  <div className="relative">
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-md px-2 py-1 text-xs font-bold text-white flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {movie.rating}
                    </div>
                    
                    {/* Remove Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWatchlist(movie.id);
                      }}
                      className="absolute top-2 left-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    {/* Play Button */}
                    <button 
                      onClick={() => {
                        setActiveTab('discover');
                        showToast(`Opening: ${movie.title}`);
                      }}
                      className="absolute bottom-2 right-2 bg-purple-500 rounded-full p-2 text-white"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  
                  {/* Movie Info */}
                  <div className="p-3">
                    <h3 className={`font-bold text-base ${colorScheme.text} leading-tight`}>{movie.title}</h3>
                    <div className={`flex items-center mt-1 text-xs ${colorScheme.textSecondary}`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{movie.year}</span>
                      <span className="mx-1">•</span>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{movie.duration || "2h 0m"}</span>
                    </div>
                    
                    {/* Genre Tags */}
                    <div className="flex flex-wrap mt-2">
                      {movie.genre && movie.genre.slice(0, 2).map((genre, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 mr-1 mb-1"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    
                    {/* Streaming Services */}
                    {movie.streamingOn && movie.streamingOn.length > 0 && (
                      <div className="mt-2 flex">
                        {movie.streamingOn.slice(0, 2).map((service, idx) => (
                          <span 
                            key={idx}
                            className="mr-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded"
                          >
                            {service}
                          </span>
                        ))}
                        {movie.streamingOn.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{movie.streamingOn.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {watchlist.map(movie => (
                <div 
                  key={movie.id} 
                  className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transition-transform hover:scale-[1.01] flex`}
                >
                  {/* Poster Image */}
                  <div className="relative w-1/3 flex-shrink-0">
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-md px-2 py-1 text-xs font-bold text-white flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {movie.rating}
                    </div>
                  </div>
                  
                  {/* Movie Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-lg ${colorScheme.text} leading-tight`}>{movie.title}</h3>
                        <button 
                          onClick={() => handleRemoveFromWatchlist(movie.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className={`flex items-center mt-1 text-sm ${colorScheme.textSecondary}`}>
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{movie.year}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{movie.duration || "2h 0m"}</span>
                      </div>
                      
                      {/* Description */}
                      <p className={`mt-2 text-sm ${colorScheme.textSecondary} line-clamp-2`}>
                        {movie.description || "No description available."}
                      </p>
                      
                      {/* Genre Tags */}
                      <div className="flex flex-wrap mt-2">
                        {movie.genre && movie.genre.map((genre, idx) => (
                          <span 
                            key={idx}
                            className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 mr-1 mb-1"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      {/* Streaming Services */}
                      <div className="flex">
                        {movie.streamingOn && movie.streamingOn.slice(0, 2).map((service, idx) => (
                          <span 
                            key={idx}
                            className="mr-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                      
                      {/* Watch Button */}
                      <button 
                        onClick={() => {
                          setActiveTab('discover');
                          showToast(`Opening: ${movie.title}`);
                        }}
                        className="text-purple-500 hover:text-purple-700 text-sm font-medium flex items-center"
                      >
                        Watch Now
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Empty State
          <div className={`flex flex-col items-center justify-center h-64 text-center ${colorScheme.textSecondary}`}>
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-gray-400" />
            </div>
            <p className="mb-2 text-lg font-medium">Your watchlist is empty</p>
            <p className="text-sm max-w-xs mb-6">
              Swipe right on movies you want to watch later, or use the bookmark button to add them to your watchlist
            </p>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab('discover')}
            >
              Discover Movies
            </button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
      
      {/* Modals */}
      {notificationsOpen && (
        <NotificationsModal 
          setNotificationsOpen={setNotificationsOpen}
        />
      )}
    </div>
  );
};

export default WatchlistPage;