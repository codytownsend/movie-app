// src/modals/MovieDetailsModal.jsx
import React from 'react';
import { ChevronLeft, Share2, Bookmark, Play, Star, Clock, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MovieDetailsModal = ({ currentMovie, setShowDetails }) => {
  const { 
    colorScheme, 
    darkMode, 
    showToast, 
    watchlist, 
    setWatchlist, 
    handleSwipe 
  } = useAppContext();

  // Handle adding to watchlist
  const handleAddToWatchlist = (e) => {
    e.stopPropagation();
    
    // Check if already in watchlist
    const alreadyInWatchlist = watchlist.some(movie => movie.id === currentMovie.id);
    
    if (!alreadyInWatchlist) {
      setWatchlist(prev => [...prev, currentMovie]);
      handleSwipe(true);
      setShowDetails(false);
      showToast("Added to watchlist!");
    } else {
      showToast("Already in your watchlist");
    }
  };

  // Handle share
  const handleShare = (e) => {
    e.stopPropagation();
    showToast("Shared successfully!");
  };

  if (!currentMovie) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowDetails(false)}>
      <div
        className={`${colorScheme.card} rounded-t-2xl w-full h-4/5 overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden h-64">
            <img 
              src={currentMovie.posterUrl} 
              alt={currentMovie.title} 
              className="w-full object-cover blur-md opacity-30"
            />
          </div>
          <img 
            src={currentMovie.posterUrl} 
            alt={currentMovie.title} 
            className="w-full h-64 object-cover"
          />
          <button 
            onClick={() => setShowDetails(false)}
            className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="absolute top-4 right-4 flex space-x-2">
            <button 
              onClick={handleShare}
              className="bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-md"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAddToWatchlist}
              className="bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-md"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-0 right-0 m-4">
            <button 
              className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full p-3 flex items-center shadow-lg transform transition hover:scale-105 active:scale-95"
              onClick={() => showToast("Playing trailer...")}
            >
              <Play className="w-5 h-5" />
              <span className="ml-1 font-medium">Watch Trailer</span>
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-2xl font-bold ${colorScheme.text}`}>{currentMovie.title}</h2>
              <div className={`${colorScheme.textSecondary} text-sm`}>
                {currentMovie.director}
              </div>
            </div>
            <div className="flex items-center bg-yellow-400 rounded-lg px-2 py-1">
              <Star className="w-4 h-4 fill-current text-white" />
              <span className="ml-1 font-bold text-white">{currentMovie.rating}</span>
            </div>
          </div>
          <div className="flex items-center mt-4 flex-wrap">
            <div className={`flex items-center mr-4 ${colorScheme.textSecondary}`}>
              <Clock className="w-4 h-4" />
              <span className="ml-1 text-sm">{currentMovie.duration || "2h 0m"}</span>
            </div>
            <div className={`flex items-center mr-4 ${colorScheme.textSecondary}`}>
              <Calendar className="w-4 h-4" />
              <span className="ml-1 text-sm">{currentMovie.year}</span>
            </div>
          </div>
          <div className="flex flex-wrap mt-3">
            {currentMovie.genre && currentMovie.genre.map((g, i) => (
              <span 
                key={i} 
                className={`text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full px-3 py-1 mr-2 mb-2 ${colorScheme.text}`}
              >
                {g}
              </span>
            ))}
          </div>
          <div className="mt-5">
            <h3 className={`font-medium ${colorScheme.text}`}>Synopsis</h3>
            <p className={`${colorScheme.textSecondary} mt-2 leading-relaxed`}>
              {currentMovie.description}
            </p>
          </div>
          <div className="mt-5">
            <h3 className={`font-medium ${colorScheme.text}`}>Cast</h3>
            <div className="flex overflow-x-auto py-2 space-x-4">
              {currentMovie.cast && currentMovie.cast.map((actor, i) => (
                <div key={i} className="flex-shrink-0 w-16">
                  <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mb-1`}>
                    <span className="text-xs font-medium">{actor.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <p className={`text-xs text-center ${colorScheme.text} truncate`}>{actor}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <div className="flex justify-between items-center">
              <h3 className={`font-medium ${colorScheme.text}`}>Where to Watch</h3>
              <button 
                className={`text-xs text-purple-500`}
                onClick={() => showToast("Reminder set for this movie!")}
              >
                Get notified
              </button>
            </div>
            <div className="flex mt-2">
              {currentMovie.streamingOn && currentMovie.streamingOn.map((platform, i) => (
                <div key={i} className="mr-3">
                  <div className="h-12 w-12 bg-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium">{platform.charAt(0)}</span>
                  </div>
                  <div className="text-xs text-center mt-1">{platform}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;