// src/pages/SocialPage.js
import React, { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle, Star } from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { sampleMovies, sampleUsers, friendRecommendations } from '../data/sampleData';

const SocialPage = ({ setActiveTab, colorScheme, darkMode, showToast }) => {
  const [activityFeed, setActivityFeed] = useState([]);
  const [userFriends, setUserFriends] = useState(sampleUsers.slice(1));
  
  useEffect(() => {
    const allActivities = userFriends.flatMap(friend =>
      friend.recentActivity.map(activity => ({
        ...activity,
        userId: friend.id,
        userName: friend.name,
        userAvatar: friend.avatar
      }))
    );
    const sortedActivities = allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setActivityFeed(sortedActivities);
  }, [userFriends]);

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

  const findMovieById = (movieId) => sampleMovies.find(movie => movie.id === movieId);
  const findUserById = (userId) => sampleUsers.find(user => user.id === userId);

  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header colorScheme={colorScheme} setFilterOpen={() => {}} setNotificationsOpen={() => {}} />
      <header className={`${colorScheme.card} shadow-sm p-4 flex items-center mb-4`}>
        <button onClick={() => setActiveTab('discover')}>
          <ArrowLeft className={`w-6 h-6 ${colorScheme.text}`} />
        </button>
        <h1 className={`flex-1 text-xl font-bold ${colorScheme.text}`}>Social</h1>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Activity Feed</h3>
        <div className="space-y-4">
          {activityFeed.map((activity, index) => {
            const movie = findMovieById(activity.movieId);
            if (!movie) return null;
            return (
              <div key={index} className={`${colorScheme.card} rounded-lg p-4 shadow`}>
                <div className="flex items-start">
                  <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3"
                  >
                    {activity.userAvatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className={`font-medium ${colorScheme.text}`}>
                        {activity.userName}
                        <span className={`font-normal ${colorScheme.textSecondary}`}>
                          {activity.type === 'liked' && ' liked'}
                          {activity.type === 'added' && ' added to watchlist'}
                          {activity.type === 'reviewed' && ' reviewed'}
                        </span>
                      </p>
                      <span className={`text-xs ${colorScheme.textSecondary}`}>
                        {formatTimeElapsed(activity.timestamp)}
                      </span>
                    </div>
                    <div className={`mt-2 flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
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
                      </div>
                    </div>
                    <div className="flex mt-3">
                      <button className={`flex items-center mr-4 ${colorScheme.textSecondary} text-xs`} onClick={() => showToast("Liked!")}>
                        <Star className="w-4 h-4 mr-1" />
                        Like
                      </button>
                      <button className={`flex items-center mr-4 ${colorScheme.textSecondary} text-xs`} onClick={() => showToast("Shared!")}>
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Share
                      </button>
                      <button className={`flex items-center ${colorScheme.textSecondary} text-xs`} onClick={() => showToast("Saved!")}>
                        <Star className="w-4 h-4 mr-1" />
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
      <BottomNavigation activeTab="social" setActiveTab={setActiveTab} pendingRecommendations={friendRecommendations} colorScheme={colorScheme} />
    </div>
  );
};

export default SocialPage;
