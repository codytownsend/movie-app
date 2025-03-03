// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Trash2, Star, Plus, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import SettingsModal from '../modals/SettingsModal';

const ProfilePage = () => {
  const { 
    colorScheme, 
    watchlist, 
    setWatchlist, 
    showToast,
    darkMode,
    setDarkMode
  } = useAppContext();
  
  const { currentUser, logout } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Handle watchlist item removal
  const handleRemoveFromWatchlist = (movieId) => {
    setWatchlist(watchlist.filter(movie => movie.id !== movieId));
    showToast("Removed from watchlist");
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    showToast("You have been logged out");
  };

  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header 
        setNotificationsOpen={setNotificationsOpen}
      />
      
      <div className="p-6 flex-1 overflow-y-auto pb-20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 flex items-center justify-center text-white">
            <span className="text-3xl">{currentUser?.avatar || 'U'}</span>
          </div>
          <h3 className={`text-lg font-medium ${colorScheme.text}`}>{currentUser?.name || 'User'}</h3>
          <p className={colorScheme.textSecondary}>{currentUser?.bio || 'Movie Enthusiast'}</p>
          <button className={`mt-4 text-sm border ${colorScheme.border} rounded-full px-4 py-1 ${colorScheme.text}`}>
            Edit Profile
          </button>
        </div>
        
        <div className="mb-8">
          <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Your Preferences</h3>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4 mb-4`}>
            <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Favorite Genres</h4>
            <div className="flex flex-wrap">
              {currentUser?.favoriteGenres?.map(genre => (
                <span key={genre} className="text-xs bg-purple-100 text-purple-800 rounded-full px-3 py-1 mr-2 mb-2">
                  {genre}
                </span>
              )) || <span className={`text-xs ${colorScheme.textSecondary}`}>No genres selected</span>}
              <button className="text-xs bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4`}>
            <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Streaming Services</h4>
            <div className="flex flex-wrap">
              {currentUser?.streamingServices?.map(service => (
                <span key={service} className="text-xs bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2 mb-2">
                  {service}
                </span>
              )) || <span className={`text-xs ${colorScheme.textSecondary}`}>No services selected</span>}
              <button className="text-xs bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-medium ${colorScheme.text}`}>Your Watchlist</h3>
            {watchlist.length > 0 && (
              <button className="text-xs text-purple-500">See All</button>
            )}
          </div>
          
          <div className="space-y-3">
            {watchlist.length > 0 ? (
              watchlist.slice(0, 3).map(movie => (
                <div 
                  key={movie.id} 
                  className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden`}
                >
                  <div className="w-16 h-20 bg-gray-300">
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex-1">
                    <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>
                      {movie.genre && movie.genre[0]} • {movie.year}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromWatchlist(movie.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-2 self-center"
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
            
            {watchlist.length > 3 && (
              <div className="text-center">
                <button className="text-purple-500 text-sm">View all {watchlist.length} movies</button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Settings</h3>
          <ul className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden divide-y ${colorScheme.border}`}>
            <li 
              className="px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={() => setShowSettingsModal(true)}
            >
              <div className="flex items-center">
                <Settings className={`w-5 h-5 mr-3 ${colorScheme.text}`} />
                <span className={colorScheme.text}>Appearance</span>
              </div>
              <span className="text-gray-400">›</span>
            </li>
            <li className="px-4 py-3 flex justify-between items-center cursor-pointer">
              <div className="flex items-center">
                <span className={`w-5 h-5 mr-3 flex items-center justify-center ${colorScheme.text}`}>🔔</span>
                <span className={colorScheme.text}>Notifications</span>
              </div>
              <span className="text-gray-400">›</span>
            </li>
            <li className="px-4 py-3 flex justify-between items-center cursor-pointer">
              <div className="flex items-center">
                <span className={`w-5 h-5 mr-3 flex items-center justify-center ${colorScheme.text}`}>🔒</span>
                <span className={colorScheme.text}>Privacy</span>
              </div>
              <span className="text-gray-400">›</span>
            </li>
            <li className="px-4 py-3 flex justify-between items-center cursor-pointer">
              <div className="flex items-center">
                <span className={`w-5 h-5 mr-3 flex items-center justify-center ${colorScheme.text}`}>🔗</span>
                <span className={colorScheme.text}>Connected Accounts</span>
              </div>
              <span className="text-gray-400">›</span>
            </li>
            <li className="px-4 py-3 flex justify-between items-center cursor-pointer">
              <div className="flex items-center">
                <span className={`w-5 h-5 mr-3 flex items-center justify-center ${colorScheme.text}`}>❓</span>
                <span className={colorScheme.text}>Help & Support</span>
              </div>
              <span className="text-gray-400">›</span>
            </li>
          </ul>
        </div>
        
        <button 
          className="w-full mt-8 py-3 text-red-500 font-medium rounded-lg border border-red-200"
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
      
      <BottomNavigation />
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal 
          setShowSettingsModal={setShowSettingsModal}
        />
      )}
    </div>
  );
};

export default ProfilePage;