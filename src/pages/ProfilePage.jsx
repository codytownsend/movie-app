// src/pages/ProfilePage.js
import React from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Trash2, Star, Plus } from 'lucide-react';

const ProfilePage = ({ currentUser, watchlist, setWatchlist, colorScheme, setActiveTab, darkMode, showToast }) => {
  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header colorScheme={colorScheme} setFilterOpen={() => {}} setNotificationsOpen={() => {}} />
      <header className={`${colorScheme.card} shadow-sm p-4 flex items-center`}>
        <button onClick={() => setActiveTab('discover')}>
          <span className="text-xl">←</span>
        </button>
        <h2 className={`flex-1 text-xl font-bold ${colorScheme.text}`}>Your Profile</h2>
      </header>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 flex items-center justify-center text-white">
            <span className="text-3xl">{currentUser.avatar}</span>
          </div>
          <h3 className={`text-lg font-medium ${colorScheme.text}`}>{currentUser.name}</h3>
          <p className={colorScheme.textSecondary}>{currentUser.bio}</p>
          <button className={`mt-4 text-sm border ${colorScheme.border} rounded-full px-4 py-1 ${colorScheme.text}`}>
            Edit Profile
          </button>
        </div>
        <div className="mb-8">
          <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Your Preferences</h3>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4 mb-4`}>
            <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Favorite Genres</h4>
            <div className="flex flex-wrap">
              {currentUser.favoriteGenres.map(genre => (
                <span key={genre} className="text-xs bg-purple-100 text-purple-800 rounded-full px-3 py-1 mr-2 mb-2">
                  {genre}
                </span>
              ))}
              <button className="text-xs bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4`}>
            <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Streaming Services</h4>
            <div className="flex flex-wrap">
              {currentUser.streamingServices.map(service => (
                <span key={service} className="text-xs bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2 mb-2">
                  {service}
                </span>
              ))}
              <button className="text-xs bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Your Watchlist</h3>
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
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  onClick={() => {
                    setWatchlist(watchlist.filter(m => m.id !== movie.id));
                    showToast("Removed from watchlist");
                  }}
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
        <button className="w-full mt-8 py-3 text-red-500 font-medium rounded-lg border border-red-200">
          Sign Out
        </button>
      </div>
      <BottomNavigation activeTab="profile" setActiveTab={setActiveTab} pendingRecommendations={[]} colorScheme={colorScheme} />
    </div>
  );
};

export default ProfilePage;
