// src/pages/SocialPage.jsx
import React, { useState, useEffect } from 'react';
import { Star, Eye, Bookmark, Film, Search, X, UserPlus, User } from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAppContext } from '../context/AppContext';
import { sampleUsers, friendRecommendations } from '../data/sampleData';
import NotificationsModal from '../modals/NotificationsModal';
import MovieDetailsModal from '../modals/MovieDetailsModal';
import RateMovieModal from '../modals/RateMovieModal';

const SocialPage = () => {
  const { 
    colorScheme, 
    darkMode, 
    showToast, 
    movies, 
    setActiveTab, 
    setWatchlist,
    watchlist
  } = useAppContext();
  
  // Local state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);
  const [socialTabView, setSocialTabView] = useState('recommendations');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieDetails, setShowMovieDetails] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [movieToRate, setMovieToRate] = useState(null);
  const [userRatings, setUserRatings] = useState({}); // Store user ratings by movieId
  const [unseenRecommendations, setUnseenRecommendations] = useState(true); // Track unread recommendations
  
  // Setup activity feed
  useEffect(() => {
    // Get user friends (normally this would come from API)
    const userFriends = sampleUsers.slice(1);
    
    // Combine activities from all friends
    const allActivities = userFriends.flatMap(friend => 
      friend.recentActivity.map(activity => ({
        ...activity,
        userId: friend.id,
        userName: friend.name,
        userAvatar: friend.avatar
      }))
    );
    
    // Sort by timestamp, newest first
    const sortedActivities = allActivities.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    setActivityFeed(sortedActivities);
    
    // Mock some user ratings (in a real app, this would come from the API)
    setUserRatings({
      2: 4, // Movie ID 2 rated 4 stars
      5: 3  // Movie ID 5 rated 3 stars
    });
    
    // In a real app, you would check if there are new recommendations since the user's last visit
    // For this demo, we'll just set it to true initially
    setUnseenRecommendations(true);
  }, []);
  
  // Handle tab change and mark recommendations as seen when viewing that tab
  const handleTabChange = (tab) => {
    setSocialTabView(tab);
    
    // If switching to recommendations tab, mark them as seen
    if (tab === 'recommendations') {
      setUnseenRecommendations(false);
    }
  };
  
  // Format time elapsed (e.g., "2h ago")
  const formatTimeElapsed = (timestamp) => {
    const now = new Date();
    const elapsed = now - new Date(timestamp);
    
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };
  
  // Helper to find movie by ID
  const findMovieById = (movieId) => {
    return movies.find(movie => movie.id === movieId);
  };
  
  // Check if movie is in watchlist
  const isInWatchlist = (movieId) => {
    return watchlist.some(movie => movie.id === movieId);
  };
  
  // Check if user has rated this movie
  const hasRated = (movieId) => {
    return userRatings.hasOwnProperty(movieId);
  };
  
  // Add to watchlist
  const addToWatchlist = (movie) => {
    if (!isInWatchlist(movie.id)) {
      setWatchlist([...watchlist, movie]);
      showToast("Added to watchlist");
    } else {
      // Remove from watchlist
      setWatchlist(watchlist.filter(m => m.id !== movie.id));
      showToast("Removed from watchlist");
    }
  };

  // Open movie details
  const handleViewMovie = (movie) => {
    setSelectedMovie(movie);
    setShowMovieDetails(true);
  };

  // Open rate movie modal
  const handleRateMovie = (movie) => {
    setMovieToRate(movie);
    setShowRateModal(true);
  };

  // Handle rating submission
  const handleRateSubmit = (movieId, rating, comment) => {
    // Update user ratings state
    setUserRatings({
      ...userRatings,
      [movieId]: rating
    });
    
    showToast(`Rated ${rating} stars!`);
  };

  const filteredFriends = friendSearchQuery 
    ? sampleUsers.slice(1).filter(friend => 
        friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(friendSearchQuery.toLowerCase())
      )
    : sampleUsers.slice(1);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col max-w-md mx-auto overflow-hidden">
      {/* App header */}
      <Header />
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <div className="flex w-full px-4">
          <button
            className={`flex-1 py-3 text-center relative ${
              socialTabView === 'recommendations' 
                ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                : 'text-gray-400'
            }`}
            onClick={() => handleTabChange('recommendations')}
          >
            <div className="relative inline-block">
              Recommendations
              {unseenRecommendations && (
                <span className="absolute -right-6 top-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-center ${
              socialTabView === 'reviews' 
                ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                : 'text-gray-400'
            }`}
            onClick={() => handleTabChange('reviews')}
          >
            Reviews
          </button>
          <button
            className={`flex-1 py-3 text-center ${
              socialTabView === 'friends' 
                ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                : 'text-gray-400'
            }`}
            onClick={() => handleTabChange('friends')}
          >
            Friends
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* Recommendations Tab */}
        {socialTabView === 'recommendations' && (
          friendRecommendations.length > 0 ? (
            <div>
              {friendRecommendations.map((rec, index) => {
                const friend = sampleUsers.find(user => user.id === rec.userId);
                const movie = findMovieById(rec.movieId);
                
                if (!friend || !movie) return null;
                
                return (
                  <div key={index} className="relative px-5 pt-4 pb-3 border-l-4 border-purple-500">
                    {/* User info and timestamp */}
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        <span className="text-xl font-medium">{friend.avatar}</span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-white">{friend.name}</p>
                        <p className="text-xs text-gray-400">recommended a movie</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs text-gray-400">
                          {formatTimeElapsed(rec.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Recommendation message */}
                    {rec.message && (
                      <div className="mb-4 px-4 py-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-300">"{rec.message}"</p>
                      </div>
                    )}
                    
                    {/* Movie card */}
                    <div className="bg-gray-800 rounded-lg overflow-hidden mb-3">
                      <div className="flex p-3">
                        <img 
                          src={movie.posterUrl} 
                          alt={movie.title} 
                          className="w-20 h-28 object-cover rounded-md"
                        />
                        <div className="ml-3">
                          <h4 className="font-medium text-white">{movie.title}</h4>
                          <div className="flex items-center mt-1 mb-2">
                            <div className="bg-yellow-500 rounded px-2 py-0.5 text-xs font-bold text-black flex items-center">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {movie.rating}
                            </div>
                            <span className="mx-2 text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">{movie.year}</span>
                          </div>
                          <div className="flex flex-wrap">
                            {movie.genre && movie.genre.slice(0, 2).map((g, i) => (
                              <span key={i} className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 mr-1 mb-1">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex">
                      <button 
                        className="flex-1 flex items-center justify-center py-2 bg-gray-800 text-gray-300 rounded-lg mr-2"
                        onClick={() => handleViewMovie(movie)}
                      >
                        <Eye className="w-4 h-4 mr-2 text-blue-400" />
                        View
                      </button>
                      <button 
                        className="flex-1 flex items-center justify-center py-2 bg-gray-800 text-gray-300 rounded-lg mr-2"
                        onClick={() => addToWatchlist(movie)}
                      >
                        <Bookmark 
                          className={`w-4 h-4 mr-2 ${isInWatchlist(movie.id) ? 'text-green-400 fill-current' : 'text-green-400'}`} 
                        />
                        Bookmark
                      </button>
                      <button 
                        className="flex-1 flex items-center justify-center py-2 bg-gray-800 text-gray-300 rounded-lg"
                        onClick={() => handleRateMovie(movie)}
                      >
                        <Star 
                          className={`w-4 h-4 mr-2 ${hasRated(movie.id) ? 'text-yellow-400 fill-current' : 'text-yellow-400'}`} 
                        />
                        Rate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Film className="w-8 h-8 text-gray-500" />
              </div>
              <p className="mb-2 text-gray-300">No recommendations yet</p>
              <p className="text-sm text-gray-500 max-w-xs">
                Your friends haven't sent you any movie recommendations yet
              </p>
            </div>
          )
        )}
        
        {/* Reviews Tab */}
        {socialTabView === 'reviews' && (
          <div>
            {activityFeed.filter(activity => activity.type === 'reviewed').map((activity, index) => {
              const movie = findMovieById(activity.movieId);
              if (!movie) return null;
              
              return (
                <div key={index} className="relative px-5 pt-4 pb-3 border-l-4 border-blue-500">
                  {/* User info and timestamp */}
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                      <span className="text-xl font-medium">{activity.userAvatar}</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-white">{activity.userName}</p>
                      <p className="text-xs text-gray-400">wrote a review</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs text-gray-400">
                        {formatTimeElapsed(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Movie card */}
                  <div className="bg-gray-800 rounded-lg overflow-hidden mb-3">
                    <div className="flex p-3">
                      <img 
                        src={movie.posterUrl} 
                        alt={movie.title} 
                        className="w-20 h-28 object-cover rounded-md"
                      />
                      <div className="ml-3">
                        <h4 className="font-medium text-white">{movie.title}</h4>
                        <div className="flex items-center mt-1 mb-2">
                          <div className="bg-yellow-500 rounded px-2 py-0.5 text-xs font-bold text-black flex items-center">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {movie.rating}
                          </div>
                          <span className="mx-2 text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{movie.year}</span>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.round(activity.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Review comment */}
                  {activity.comment && (
                    <div className="mb-4 px-4 py-3 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-300 italic">"{activity.comment}"</p>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex">
                    <button 
                      className="flex-1 flex items-center justify-center py-2 bg-gray-800 text-gray-300 rounded-lg mr-2"
                      onClick={() => handleViewMovie(movie)}
                    >
                      <Eye className="w-4 h-4 mr-2 text-blue-400" />
                      View
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center py-2 bg-gray-800 text-gray-300 rounded-lg mr-2"
                      onClick={() => addToWatchlist(movie)}
                    >
                      <Bookmark 
                        className={`w-4 h-4 mr-2 ${isInWatchlist(movie.id) ? 'text-green-400 fill-current' : 'text-green-400'}`} 
                      />
                      Bookmark
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center py-2 bg-gray-800 text-gray-300 rounded-lg"
                      onClick={() => handleRateMovie(movie)}
                    >
                      <Star 
                        className={`w-4 h-4 mr-2 ${hasRated(movie.id) ? 'text-yellow-400 fill-current' : 'text-yellow-400'}`} 
                      />
                      Rate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Friends Tab - Empty template */}
        {socialTabView === 'friends' && (
          <div>
            {/* Search Friends Input */}
            <div className={`${colorScheme.card} p-3 rounded-full mb-4 flex items-center shadow`}>
              <Search className={`w-5 h-5 ${colorScheme.textSecondary} mr-2`} />
              <input
                type="text"
                placeholder="Search for friends..."
                className={`w-full bg-transparent focus:outline-none ${colorScheme.text}`}
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
              />
              {friendSearchQuery && (
                <button 
                  className={`${colorScheme.textSecondary} ml-2`}
                  onClick={() => setFriendSearchQuery('')}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Add Friends Button */}
            <button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-3 mb-6 flex items-center justify-center"
              onClick={() => showToast("Find friends feature coming soon!")}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Find New Friends
            </button>
            
            {/* Friend Suggestions */}
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Suggested Friends</h3>
            <div className="space-y-3 mb-6">
              {[
                { id: 5, name: "Jane Smith", avatar: "J", mutualCount: 3 },
                { id: 6, name: "Tom Wilson", avatar: "T", mutualCount: 2 },
                { id: 7, name: "Ryan Lee", avatar: "R", mutualCount: 4 }
              ]
              .filter(suggestion => 
                friendSearchQuery === '' || 
                suggestion.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
              )
              .map(suggestion => (
                <div key={suggestion.id} className={`${colorScheme.card} rounded-lg p-4 shadow flex items-center`}>
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <span className="text-lg text-gray-600">{suggestion.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${colorScheme.text}`}>{suggestion.name}</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>{suggestion.mutualCount} mutual friends</p>
                  </div>
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-3 py-1 text-sm"
                    onClick={() => showToast(`Friend request sent to ${suggestion.name}!`)}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
            
            {/* Your Friends */}
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Your Friends</h3>
            <div className="space-y-3">
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => (
                  <div 
                    key={friend.id} 
                    className={`${colorScheme.card} rounded-lg p-4 shadow flex items-center`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                      <span className="text-lg">{friend.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${colorScheme.text}`}>{friend.name}</h4>
                      <p className={`text-xs ${colorScheme.textSecondary}`}>@{friend.username}</p>
                    </div>
                    <div className="flex">
                      <button 
                        className={`${colorScheme.card} rounded-full p-2 shadow-md mr-2`}
                        onClick={() => showToast(`Viewing ${friend.name}'s profile`)}
                      >
                        <User className="w-5 h-5 text-blue-500" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${colorScheme.textSecondary}`}>
                  <p>No friends found matching "{friendSearchQuery}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )}
            </div>
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

      {/* Movie Details Modal */}
      {showMovieDetails && selectedMovie && (
        <MovieDetailsModal 
          currentMovie={selectedMovie}
          setShowDetails={setShowMovieDetails}
        />
      )}

      {/* Rate Movie Modal */}
      {showRateModal && movieToRate && (
        <RateMovieModal 
          movieToRate={movieToRate}
          setShowRateModal={setShowRateModal}
          onRateSubmit={handleRateSubmit}
        />
      )}
    </div>
  );
};

export default SocialPage;