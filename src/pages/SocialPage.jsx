// src/pages/SocialPage.jsx
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Bookmark } from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAppContext } from '../context/AppContext';
import { sampleUsers, friendRecommendations } from '../data/sampleData';

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
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);
  
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
  }, []);
  
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
  
  // Add to watchlist
  const addToWatchlist = (movie) => {
    if (!watchlist.find(m => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
      showToast("Added to watchlist");
    } else {
      showToast("Already in your watchlist");
    }
  };

  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header 
        setNotificationsOpen={setNotificationsOpen}
      />
      
      <div className="p-4 pb-2 flex items-center">
        <h2 className={`text-xl font-bold ${colorScheme.text}`}>Social Feed</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {/* Friend Recommendations */}
        {friendRecommendations.length > 0 && (
          <div className="mb-6">
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Recommendations from Friends</h3>
            <div className="space-y-4">
              {friendRecommendations.map((rec, index) => {
                const friend = sampleUsers.find(user => user.id === rec.userId);
                const movie = findMovieById(rec.movieId);
                
                if (!friend || !movie) return null;
                
                return (
                  <div key={index} className={`${colorScheme.card} rounded-lg p-4 shadow`}>
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
                        <span>{friend.avatar}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className={`font-medium ${colorScheme.text}`}>
                            {friend.name}
                            <span className={`font-normal ${colorScheme.textSecondary}`}> recommended</span>
                          </p>
                          <span className={`text-xs ${colorScheme.textSecondary}`}>
                            {formatTimeElapsed(rec.timestamp)}
                          </span>
                        </div>
                        
                        <p className={`text-sm my-2 ${colorScheme.text}`}>"{rec.message}"</p>
                        
                        <div 
                          className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} cursor-pointer`}
                          onClick={() => {
                            setActiveTab('discover');
                            showToast(`Selected: ${movie.title}`);
                          }}
                        >
                          <div className="w-16 h-20 bg-gray-300">
                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-2">
                            <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                              <span className="mx-1">•</span>
                              <span className={`text-xs ${colorScheme.textSecondary}`}>{movie.year}</span>
                            </div>
                            <div className="flex flex-wrap mt-1">
                              {movie.genre && movie.genre.slice(0, 2).map((g, i) => (
                                <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex mt-3 justify-end">
                          <button 
                            className={`mr-3 px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text} text-xs`}
                            onClick={() => showToast("Recommendation dismissed")}
                          >
                            Dismiss
                          </button>
                          <button 
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs"
                            onClick={() => addToWatchlist(movie)}
                          >
                            Add to Watchlist
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Activity Feed */}
        <div>
          <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Activity Feed</h3>
          <div className="space-y-4">
            {activityFeed.map((activity, index) => {
              const movie = findMovieById(activity.movieId);
              if (!movie) return null;
              
              return (
                <div key={index} className={`${colorScheme.card} rounded-lg p-4 shadow`}>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
                      <span>{activity.userAvatar}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-medium ${colorScheme.text}`}>
                            {activity.userName}
                            <span className={`font-normal ${colorScheme.textSecondary}`}>
                              {activity.type === 'liked' && ' liked'}
                              {activity.type === 'added' && ' added to watchlist'}
                              {activity.type === 'reviewed' && ' reviewed'}
                            </span>
                          </p>
                        </div>
                        <span className={`text-xs ${colorScheme.textSecondary}`}>
                          {formatTimeElapsed(activity.timestamp)}
                        </span>
                      </div>
                      
                      <div 
                        className={`mt-2 flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} cursor-pointer`}
                        onClick={() => {
                          setActiveTab('discover');
                          showToast(`Selected: ${movie.title}`);
                        }}
                      >
                        <div className="w-16 h-20 bg-gray-300 flex-shrink-0">
                          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                          <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                            <span className="mx-1">•</span>
                            <span className={`text-xs ${colorScheme.textSecondary}`}>{movie.year}</span>
                          </div>
                          
                          {activity.type === 'reviewed' && activity.comment && (
                            <div className="mt-1">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < Math.round(activity.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <p className={`text-xs mt-1 ${colorScheme.text} italic`}>"{activity.comment}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex mt-3">
                        <button 
                          className={`flex items-center mr-4 ${colorScheme.textSecondary} text-xs`}
                          onClick={() => showToast("Liked!")}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Like
                        </button>
                        <button 
                          className={`flex items-center mr-4 ${colorScheme.textSecondary} text-xs`}
                          onClick={() => showToast("Shared!")}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Comment
                        </button>
                        <button 
                          className={`flex items-center ${colorScheme.textSecondary} text-xs`}
                          onClick={() => addToWatchlist(movie)}
                        >
                          <Bookmark className="w-4 h-4 mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default SocialPage;