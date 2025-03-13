// src/modals/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ userProfile, setShowEditProfileModal }) => {
  const { colorScheme, showToast } = useAppContext();
  const { updateProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [favoriteGenres, setFavoriteGenres] = useState(userProfile?.favoriteGenres || []);
  const [streamingServices, setStreamingServices] = useState(userProfile?.streamingServices || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Available genres and streaming services
  const availableGenres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", 
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", 
    "Romance", "Science Fiction", "Thriller", "War", "Western"
  ];
  
  const availableStreamingServices = [
    "Netflix", "Hulu", "Prime Video", "Disney+", "HBO Max", "Apple TV+", 
    "Peacock", "Paramount+", "Crunchyroll", "Mubi", "Shudder"
  ];
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (bio.length > 150) {
      newErrors.bio = 'Bio must be less than 150 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Toggle a genre in the selection
  const toggleGenre = (genre) => {
    setFavoriteGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };
  
  // Toggle a streaming service in the selection
  const toggleStreamingService = (service) => {
    setStreamingServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Only update fields that have changed
      const updates = {};
      
      if (displayName !== userProfile?.displayName) {
        updates.displayName = displayName;
      }
      
      if (username !== userProfile?.username) {
        updates.username = username;
      }
      
      if (bio !== userProfile?.bio) {
        updates.bio = bio;
      }
      
      // Check if arrays have changed (simple comparison)
      const genresChanged = JSON.stringify(favoriteGenres) !== JSON.stringify(userProfile?.favoriteGenres || []);
      const servicesChanged = JSON.stringify(streamingServices) !== JSON.stringify(userProfile?.streamingServices || []);
      
      if (genresChanged) {
        updates.favoriteGenres = favoriteGenres;
      }
      
      if (servicesChanged) {
        updates.streamingServices = streamingServices;
      }
      
      // Only make the API call if there are changes
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        showToast('Profile updated successfully!');
      }
      
      setShowEditProfileModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: error.message || 'Error updating profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={() => setShowEditProfileModal(false)}
    >
      <div 
        className={`${colorScheme.card} w-full max-w-lg rounded-2xl overflow-hidden shadow-xl`}
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${colorScheme.text}`}>Edit Profile</h2>
            <button 
              onClick={() => setShowEditProfileModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className={`w-5 h-5 ${colorScheme.text}`} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
            {/* General Error */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}
            
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className={`block text-sm font-medium ${colorScheme.text} mb-1`}>
                Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full px-3 py-2 ${colorScheme.bg} border ${errors.displayName ? 'border-red-500' : colorScheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${colorScheme.text}`}
                placeholder="Your name"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>
            
            {/* Username */}
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${colorScheme.text} mb-1`}>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-3 py-2 ${colorScheme.bg} border ${errors.username ? 'border-red-500' : colorScheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${colorScheme.text}`}
                placeholder="username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
              <p className={`mt-1 text-xs ${colorScheme.textSecondary}`}>
                Your username is how friends can find you
              </p>
            </div>
            
            {/* Bio */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="bio" className={`block text-sm font-medium ${colorScheme.text}`}>
                  Bio
                </label>
                <span className={`text-xs ${colorScheme.textSecondary} ${bio.length > 150 ? 'text-red-500' : ''}`}>
                  {bio.length}/150
                </span>
              </div>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`w-full px-3 py-2 ${colorScheme.bg} border ${errors.bio ? 'border-red-500' : colorScheme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${colorScheme.text} min-h-[80px] resize-none`}
                placeholder="Tell us about your movie taste..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
              )}
            </div>
            
            {/* Favorite Genres */}
            <div>
              <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                Favorite Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      favoriteGenres.includes(genre)
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-xs ${colorScheme.textSecondary}`}>
                Select up to 5 genres to improve your recommendations
              </p>
              {favoriteGenres.length > 5 && (
                <p className="mt-1 text-sm text-yellow-500">
                  Consider selecting 5 or fewer genres for better recommendations
                </p>
              )}
            </div>
            
            {/* Streaming Services */}
            <div>
              <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                Your Streaming Services
              </label>
              <div className="flex flex-wrap gap-2">
                {availableStreamingServices.map(service => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleStreamingService(service)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      streamingServices.includes(service)
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-xs ${colorScheme.textSecondary}`}>
                Select the streaming services you use to get better recommendations
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end pt-2 space-x-3">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${colorScheme.border} ${colorScheme.text}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm hover:shadow-md transition-all flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;