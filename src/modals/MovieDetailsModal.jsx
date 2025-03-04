import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, Clock, Play, Bookmark, MessageCircle, ChevronDown, Check, Search, Send } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MovieDetailsModal = ({ currentMovie, setShowDetails }) => {
  const { 
    colorScheme, 
    darkMode, 
    showToast, 
    watchlist, 
    setWatchlist
  } = useAppContext();
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showRecommendView, setShowRecommendView] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [recommendationMessage, setRecommendationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample friends data - in a real app this would come from context or API
  const [friends, setFriends] = useState([
    { id: 1, name: "Sarah Miller", avatar: "S", username: "sarahm" },
    { id: 2, name: "Michael Chen", avatar: "M", username: "mikechen" },
    { id: 3, name: "Emily Rodriguez", avatar: "E", username: "emilyr" },
    { id: 4, name: "David Johnson", avatar: "D", username: "davej" },
    { id: 5, name: "Lisa Taylor", avatar: "L", username: "lisat" }
  ]);
  
  // Handle toggling a friend selection
  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };
  
  // Handle sending recommendation
  const handleSendRecommendation = () => {
    if (selectedFriends.length === 0) {
      showToast("Please select at least one friend");
      return;
    }
    
    // In a real app, you would send this data to your API
    const recommendation = {
      movieId: currentMovie.id,
      movieTitle: currentMovie.title,
      friendIds: selectedFriends,
      message: recommendationMessage || `Check out ${currentMovie.title}!`
    };
    
    console.log("Sending recommendation:", recommendation);
    
    // Show success message
    showToast(`Recommendation sent to ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}!`);
    
    // Reset and close recommend view
    setSelectedFriends([]);
    setRecommendationMessage('');
    setShowRecommendView(false);
  };
  
  // Filter friends based on search
  const filteredFriends = searchQuery
    ? friends.filter(friend => 
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;
  
  // Handle adding to watchlist
  const handleAddToWatchlist = () => {
    if (!currentMovie) return;
    
    // Check if already in watchlist
    const alreadyInWatchlist = watchlist.some(movie => movie.id === currentMovie.id);
    
    if (!alreadyInWatchlist) {
      setWatchlist(prev => [...prev, currentMovie]);
      showToast("Added to watchlist!");
    } else {
      showToast("Already in your watchlist");
    }
  };
  
  // Get watchlist status
  const isInWatchlist = watchlist.some(movie => movie && currentMovie && movie.id === currentMovie.id);
  
  if (!currentMovie) return null;
  
  // Extract year from movie date if it exists
  const yearLabel = currentMovie.year || 
    (currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : "Unknown");
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col animate-fade-in">
      {showRecommendView ? (
        // Recommendation View
        <div className="flex flex-col h-full">
          <div className={`${colorScheme.card} p-4 flex items-center justify-between shadow-md z-10`}>
            <div className="flex items-center">
              <button 
                onClick={() => setShowRecommendView(false)}
                className="mr-3"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
              <h2 className={`text-lg font-bold ${colorScheme.text}`}>
                Recommend to Friends
              </h2>
            </div>
            
            <button 
              className={`px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium ${
                selectedFriends.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSendRecommendation}
              disabled={selectedFriends.length === 0}
            >
              Send
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Movie preview */}
            <div className={`${colorScheme.card} p-4 mb-4 flex items-center`}>
              <div className="w-16 h-24 bg-gray-800 rounded overflow-hidden mr-3">
                <img src={currentMovie.posterUrl} alt={currentMovie.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${colorScheme.text}`}>{currentMovie.title}</h3>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{currentMovie.rating}</span>
                  <span className="mx-1">•</span>
                  <span className={`text-xs ${colorScheme.textSecondary}`}>{currentMovie.year}</span>
                </div>
                <div className="flex flex-wrap mt-1">
                  {currentMovie.genre && currentMovie.genre.slice(0, 2).map((g, i) => (
                    <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1 dark:bg-gray-700 dark:text-gray-200">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Message field */}
            <div className={`${colorScheme.card} p-4 mb-4`}>
              <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                Add a message (optional)
              </label>
              <textarea
                className={`w-full px-3 py-2 rounded-lg border ${colorScheme.border} ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} ${colorScheme.text}`}
                rows="3"
                placeholder="Tell your friends why they should watch this..."
                value={recommendationMessage}
                onChange={(e) => setRecommendationMessage(e.target.value)}
              ></textarea>
            </div>
            
            {/* Friends list */}
            <div className={`${colorScheme.card} p-4`}>
              <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                Select friends
              </label>
              
              {/* Search bar */}
              <div className={`flex items-center mb-4 px-3 py-2 rounded-lg border ${colorScheme.border} ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Search className={`w-5 h-5 ${colorScheme.textSecondary}`} />
                <input 
                  type="text"
                  className={`ml-2 flex-1 bg-transparent border-none focus:outline-none ${colorScheme.text}`}
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X className={`w-5 h-5 ${colorScheme.textSecondary}`} />
                  </button>
                )}
              </div>
              
              {/* Friends list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map(friend => (
                    <div 
                      key={friend.id} 
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${
                        selectedFriends.includes(friend.id) 
                          ? 'bg-purple-100 dark:bg-purple-900' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => toggleFriendSelection(friend.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                        <span>{friend.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${colorScheme.text}`}>{friend.name}</h4>
                        <p className={`text-xs ${colorScheme.textSecondary}`}>@{friend.username}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full ${
                        selectedFriends.includes(friend.id) 
                          ? 'bg-purple-500' 
                          : 'border border-gray-300 dark:border-gray-600'
                      } flex items-center justify-center`}>
                        {selectedFriends.includes(friend.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className={colorScheme.textSecondary}>No friends found</p>
                  </div>
                )}
              </div>
              
              {selectedFriends.length > 0 && (
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={`text-sm ${colorScheme.text}`}>
                      {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected
                    </span>
                    <button 
                      className="text-sm text-purple-500"
                      onClick={() => setSelectedFriends([])}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Movie Details View
        <>
          {/* Header with movie title - visible when scrolled */}
          <div 
            className={`sticky top-0 z-10 flex items-center justify-between p-4 transition-all duration-300 ${
              scrolled 
                ? `${colorScheme.card} shadow-md` 
                : 'bg-transparent'
            }`}
          >
            <h2 
              className={`text-lg font-bold transition-opacity duration-300 ${
                scrolled ? 'opacity-100' : 'opacity-0'
              } ${colorScheme.text}`}
            >
              {currentMovie.title}
            </h2>
            <button 
              onClick={() => setShowDetails(false)}
              className="z-10 bg-black bg-opacity-50 rounded-full p-2 text-white shadow-md transition transform hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div 
            id="modal-content"
            className="flex-1 overflow-y-auto overscroll-contain"
          >
            {/* Hero section with backdrop image */}
            <div className="relative">
              <div className="w-full h-80 bg-gray-900">
                <img 
                  src={currentMovie.posterUrl} 
                  alt={currentMovie.title} 
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-start">
                  {/* Movie poster */}
                  <div className="w-28 h-40 rounded-lg shadow-lg overflow-hidden flex-shrink-0 border border-gray-600">
                    <img 
                      src={currentMovie.posterUrl} 
                      alt={currentMovie.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* Movie info */}
                  <div className="ml-4 flex-1">
                    <h1 className="text-2xl font-bold leading-tight">{currentMovie.title}</h1>
                    
                    <div className="flex items-center mt-1">
                      {/* Rating */}
                      <div className="flex items-center bg-black bg-opacity-50 rounded-lg px-2 py-1 mr-3">
                        <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                        <span className="font-bold">{currentMovie.rating}</span>
                      </div>
                      
                      {/* Year */}
                      <div className="flex items-center mr-3">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm">{yearLabel}</span>
                      </div>
                      
                      {/* Duration */}
                      {currentMovie.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm">{currentMovie.duration}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Genres */}
                    {currentMovie.genre && currentMovie.genre.length > 0 && (
                      <div className="flex flex-wrap mt-3">
                        {currentMovie.genre.map((g, i) => (
                          <span 
                            key={i} 
                            className="text-xs bg-white bg-opacity-20 rounded-full px-3 py-1 mr-2 mb-2"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex p-4 space-x-2 border-b border-gray-800">
              <button 
                className="flex-1 flex justify-center items-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg py-3 text-white font-medium shadow-sm"
                onClick={() => showToast("Playing trailer...")}
              >
                <Play className="w-5 h-5 fill-current mr-2" />
                Watch Trailer
              </button>
              
              <button 
                className={`flex-1 flex justify-center items-center ${
                  isInWatchlist 
                    ? 'bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700' 
                    : 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20'
                } rounded-lg py-3 font-medium text-white`}
                onClick={handleAddToWatchlist}
              >
                <Bookmark className={`w-5 h-5 mr-2 ${isInWatchlist ? 'fill-current' : ''}`} />
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
            
            {/* Movie details */}
            <div className={`p-5 ${colorScheme.card}`}>
              {/* Synopsis */}
              <div className="mb-6">
                <h2 className={`text-lg font-bold mb-2 ${colorScheme.text}`}>Synopsis</h2>
                <p className={`${colorScheme.textSecondary} ${showFullDescription ? '' : 'line-clamp-4'}`}>
                  {currentMovie.description}
                </p>
                {currentMovie.description && currentMovie.description.length > 180 && (
                  <button 
                    className="text-blue-500 text-sm mt-2 flex items-center"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                    <ChevronDown className={`w-4 h-4 ml-1 transform transition ${showFullDescription ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              
              {/* Cast */}
              {currentMovie.cast && currentMovie.cast.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold mb-3 ${colorScheme.text}`}>Cast</h2>
                  <div className="flex overflow-x-auto space-x-4 pb-2 -mx-5 px-5">
                    {currentMovie.cast.map((actor, i) => (
                      <div key={i} className="flex-shrink-0 w-20">
                        <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mb-2`}>
                          <span className="text-lg font-medium">{actor.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <p className={`text-xs text-center ${colorScheme.text} truncate`}>{actor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Director */}
              {currentMovie.director && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold mb-2 ${colorScheme.text}`}>Director</h2>
                  <p className={colorScheme.textSecondary}>{currentMovie.director}</p>
                </div>
              )}
              
              {/* Where to Watch */}
              {currentMovie.streamingOn && currentMovie.streamingOn.length > 0 && (
                <div className="mb-6">
                  <h2 className={`text-lg font-bold mb-3 ${colorScheme.text}`}>Where to Watch</h2>
                  <div className="flex flex-wrap">
                    {currentMovie.streamingOn.map((platform, i) => (
                      <div key={i} className="mr-4 mb-3 flex flex-col items-center">
                        <div className="h-14 w-14 bg-gray-700 rounded-lg flex items-center justify-center mb-1">
                          <span className="text-lg font-bold text-white">{platform.charAt(0)}</span>
                        </div>
                        <span className={`text-xs ${colorScheme.textSecondary}`}>{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Similar Movies */}
              {currentMovie.similarTo && currentMovie.similarTo.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className={`text-lg font-bold ${colorScheme.text}`}>You Might Also Like</h2>
                    <button className="text-blue-500 text-sm">View All</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="rounded-lg overflow-hidden">
                        <div className="h-40 bg-gray-700">
                          {/* Would fetch and display actual similar movie poster */}
                          <div className="w-full h-full flex items-center justify-center text-white text-opacity-30">
                            Similar Movie
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommend button */}
              <button 
                className="w-full flex justify-center items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-lg py-3 text-white font-medium mt-4 border border-white border-opacity-20"
                onClick={() => setShowRecommendView(true)}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Recommend to Friends
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Animation style */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default MovieDetailsModal;