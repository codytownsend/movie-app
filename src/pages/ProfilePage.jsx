// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { 
  Trash2, Star, Plus, Settings, User, Edit, Save, 
  Camera, ChevronRight, LogOut, Film, Eye, Heart
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import SettingsModal from '../modals/SettingsModal';
import EditProfileModal from '../modals/EditProfileModal';
import { uploadProfilePicture } from '../services/firebase';

const ProfilePage = () => {
  const { 
    colorScheme, 
    watchlist, 
    watchedHistory,
    favoritesList,
    showToast,
    darkMode,
    setDarkMode
  } = useAppContext();
  
  const { currentUser, userProfile, logout, updateProfile } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const fileInputRef = React.useRef(null);
  
  // Set profile image when user profile changes
  useEffect(() => {
    if (userProfile?.photoURL) {
      setProfileImageUrl(userProfile.photoURL);
    } else if (currentUser?.photoURL) {
      setProfileImageUrl(currentUser.photoURL);
    } else {
      setProfileImageUrl(null);
    }
  }, [userProfile, currentUser]);

  // Handle profile photo change
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a JPEG, PNG, or WebP image');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      showToast('Image size must be less than 5MB');
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Upload to Firebase Storage
      const downloadUrl = await uploadProfilePicture(currentUser.uid, file);
      
      // Update profile state
      setProfileImageUrl(downloadUrl);
      
      showToast('Profile photo updated');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      showToast('Error updating profile photo');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      showToast("You have been logged out");
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Error logging out');
    }
  };
  
  // Calculate profile stats
  const profileStats = {
    moviesWatched: watchedHistory.length,
    moviesRated: watchedHistory.filter(movie => movie.userRating > 0).length,
    inWatchlist: watchlist.length,
    favorites: favoritesList.length
  };

  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
      <Header 
        setNotificationsOpen={setNotificationsOpen}
      />
      
      <div className="p-6 flex-1 overflow-y-auto pb-20">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          {/* Profile Photo with Upload Capability */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              {profileImageUrl ? (
                <img 
                  src={profileImageUrl} 
                  alt={userProfile?.displayName || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">{userProfile?.displayName?.[0] || currentUser?.displayName?.[0] || 'U'}</span>
              )}
            </div>
            
            <button 
              className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-1.5 shadow-md border-2 border-white dark:border-gray-900"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdating}
            >
              <Camera className="w-4 h-4 text-white" />
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleProfilePhotoChange}
                disabled={isUpdating}
              />
            </button>
          </div>
          
          <h3 className={`text-lg font-bold ${colorScheme.text}`}>
            {userProfile?.displayName || currentUser?.displayName || 'User'}
          </h3>
          
          <p className={`text-sm ${colorScheme.textSecondary} mb-1`}>
            @{userProfile?.username || 'username'}
          </p>
          
          <p className={`text-sm ${colorScheme.textSecondary} max-w-xs text-center`}>
            {userProfile?.bio || 'Movie enthusiast'}
          </p>
          
          <button 
            className={`mt-4 text-sm border ${colorScheme.border} rounded-full px-4 py-1 ${colorScheme.text} flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            onClick={() => setShowEditProfileModal(true)}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </button>
        </div>
        
        {/* Profile Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className={`${colorScheme.card} rounded-xl p-4 text-center shadow-sm`}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${colorScheme.text}`}>{profileStats.moviesWatched}</p>
            <p className={`text-xs ${colorScheme.textSecondary}`}>Movies Watched</p>
          </div>
          
          <div className={`${colorScheme.card} rounded-xl p-4 text-center shadow-sm`}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className={`text-2xl font-bold ${colorScheme.text}`}>{profileStats.moviesRated}</p>
            <p className={`text-xs ${colorScheme.textSecondary}`}>Movies Rated</p>
          </div>
          
          <div className={`${colorScheme.card} rounded-xl p-4 text-center shadow-sm`}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
              <Film className="w-5 h-5 text-purple-500" />
            </div>
            <p className={`text-2xl font-bold ${colorScheme.text}`}>{profileStats.inWatchlist}</p>
            <p className={`text-xs ${colorScheme.textSecondary}`}>In Watchlist</p>
          </div>
          
          <div className={`${colorScheme.card} rounded-xl p-4 text-center shadow-sm`}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-2">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <p className={`text-2xl font-bold ${colorScheme.text}`}>{profileStats.favorites}</p>
            <p className={`text-xs ${colorScheme.textSecondary}`}>Favorites</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Your Preferences</h3>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4 mb-4`}>
            <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Favorite Genres</h4>
            <div className="flex flex-wrap">
              {userProfile?.favoriteGenres?.length > 0 ? (
                userProfile.favoriteGenres.map(genre => (
                  <span key={genre} className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1 mr-2 mb-2">
                    {genre}
                  </span>
                ))
              ) : (
                <span className={`text-xs ${colorScheme.textSecondary}`}>No genres selected</span>
              )}
              <button 
                className="text-xs bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowEditProfileModal(true)}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4`}>
            <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Streaming Services</h4>
            <div className="flex flex-wrap">
              {userProfile?.streamingServices?.length > 0 ? (
                userProfile.streamingServices.map(service => (
                  <span key={service} className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full px-3 py-1 mr-2 mb-2">
                    {service}
                  </span>
                ))
              ) : (
                <span className={`text-xs ${colorScheme.textSecondary}`}>No services selected</span>
              )}
              <button 
                className="text-xs bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowEditProfileModal(true)}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Settings</h3>
          <ul className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden divide-y ${colorScheme.border}`}>
            <li 
              className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowSettingsModal(true)}
            >
              <div className="flex items-center">
                <Settings className={`w-5 h-5 mr-3 ${colorScheme.text}`} />
                <span className={colorScheme.text}>Appearance</span>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </li>
            <li className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <span className={`w-5 h-5 mr-3 flex items-center justify-center ${colorScheme.text}`}>🔔</span>
                <span className={colorScheme.text}>Notifications</span>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </li>
            <li className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <span className={`w-5 h-5 mr-3 flex items-center justify-center ${colorScheme.text}`}>🔒</span>
                <span className={colorScheme.text}>Privacy</span>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </li>
            <li className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <span className={`w-5 h-5 mr-3 flex items-center justify-center ${colorScheme.text}`}>🔗</span>
                <span className={colorScheme.text}>Connected Accounts</span>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </li>
            <li className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <span className={`w-5 h-5 mr-3 flex items-center justify-center ${colorScheme.text}`}>❓</span>
                <span className={colorScheme.text}>Help & Support</span>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </li>
          </ul>
        </div>
        
        <button 
          className="w-full mt-8 py-3 text-red-500 font-medium rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
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
      
      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          userProfile={userProfile}
          setShowEditProfileModal={setShowEditProfileModal}
        />
      )}
    </div>
  );
};

export default ProfilePage;