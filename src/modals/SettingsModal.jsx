// src/modals/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Bell, Eye, EyeOff, Save, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { updateUserSettings } from '../services/firebase';

const SettingsModal = ({ setShowSettingsModal }) => {
  const { 
    colorScheme, 
    darkMode, 
    setDarkMode, 
    showToast 
  } = useAppContext();
  
  const { currentUser, userProfile } = useAuth();
  
  // Local settings state
  const [settings, setSettings] = useState({
    darkMode: darkMode,
    notifications: true,
    emailNotifications: true,
    textSize: 'medium',
    animations: true,
    recentActivityPrivacy: 'friends',
    recommendationsPrivacy: 'friends'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update local settings from user profile when it changes
  useEffect(() => {
    if (userProfile?.settings) {
      setSettings(prev => ({
        ...prev,
        ...userProfile.settings,
        darkMode // Always use the current app darkMode state
      }));
    }
  }, [userProfile, darkMode]);
  
  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // For dark mode, update the app state immediately for preview
    if (setting === 'darkMode') {
      setDarkMode(value);
    }
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    if (!currentUser) {
      showToast('Please log in to save settings');
      setShowSettingsModal(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateUserSettings(currentUser.uid, settings);
      showToast('Settings saved successfully');
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error saving settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end justify-center"
      onClick={() => setShowSettingsModal(false)}
    >
      <div
        className={`${colorScheme.card} w-full max-w-md md:max-w-lg rounded-t-3xl overflow-hidden transition-all duration-300 shadow-2xl`}
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull indicator */}
        <div className="w-full py-2 flex justify-center">
          <div className="w-10 h-1 bg-gray-500/40 rounded-full"></div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${colorScheme.text}`}>Settings</h2>
            <button 
              onClick={() => setShowSettingsModal(false)}
              className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              <X className={`w-5 h-5 ${colorScheme.text}`} />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Theme Setting */}
            <div>
              <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors ${
                    settings.darkMode 
                      ? 'bg-gray-800 border-2 border-purple-500' 
                      : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent'
                  }`}
                  onClick={() => handleSettingChange('darkMode', true)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    <Moon className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${colorScheme.text}`}>Dark</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>Easier on the eyes</p>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors ${
                    !settings.darkMode 
                      ? 'bg-white border-2 border-purple-500' 
                      : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent'
                  }`}
                  onClick={() => handleSettingChange('darkMode', false)}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Sun className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${colorScheme.text}`}>Light</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>For brighter environments</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notifications Settings */}
            <div>
              <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Notifications</h3>
              <div className={`${colorScheme.bg} border ${colorScheme.border} rounded-xl overflow-hidden`}>
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className={`font-medium ${colorScheme.text}`}>App Notifications</h4>
                    <p className={`text-xs ${colorScheme.textSecondary} mt-1`}>
                      Recommendations, friend requests, etc.
                    </p>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id="app-notifications" 
                      className="sr-only peer" 
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-400 rounded-full peer dark:bg-gray-700 peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${colorScheme.text}`}>Email Notifications</h4>
                    <p className={`text-xs ${colorScheme.textSecondary} mt-1`}>
                      Weekly digest and important updates
                    </p>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id="email-notifications" 
                      className="sr-only peer" 
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-400 rounded-full peer dark:bg-gray-700 peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Text Size Setting */}
            <div>
              <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Text Size</h3>
              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs ${colorScheme.textSecondary}`}>Small</span>
                  <span className={`text-xs ${colorScheme.textSecondary}`}>Large</span>
                </div>
                <div className="relative">
                  <div className={`h-1 w-full ${colorScheme.border} rounded-full`}></div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    value={settings.textSize === 'small' ? 0 : settings.textSize === 'medium' ? 1 : 2}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleSettingChange('textSize', value === 0 ? 'small' : value === 1 ? 'medium' : 'large');
                    }}
                    className="absolute top-0 w-full h-1 opacity-0 cursor-pointer"
                  />
                  <div 
                    className="absolute top-[-3px] w-3 h-3 bg-purple-500 rounded-full"
                    style={{ 
                      left: `${settings.textSize === 'small' ? 0 : settings.textSize === 'medium' ? 50 : 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  ></div>
                </div>
                <div className="flex justify-center mt-1">
                  <span className={`text-sm font-medium ${colorScheme.text}`}>
                    {settings.textSize === 'small' ? 'Small' : settings.textSize === 'medium' ? 'Medium' : 'Large'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Animation Settings */}
            <div>
              <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Animations</h3>
              <div className={`${colorScheme.bg} border ${colorScheme.border} rounded-xl overflow-hidden`}>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${colorScheme.text}`}>Enable Animations</h4>
                    <p className={`text-xs ${colorScheme.textSecondary} mt-1`}>
                      Card swipes, transitions, and effects
                    </p>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id="animations" 
                      className="sr-only peer" 
                      checked={settings.animations}
                      onChange={(e) => handleSettingChange('animations', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-400 rounded-full peer dark:bg-gray-700 peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Privacy Settings */}
            <div>
              <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Privacy</h3>
              <div className={`${colorScheme.bg} border ${colorScheme.border} rounded-xl overflow-hidden`}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <h4 className={`font-medium ${colorScheme.text} mb-2`}>Recent Activity Privacy</h4>
                  <p className={`text-xs ${colorScheme.textSecondary} mb-3`}>
                    Who can see your recently watched and liked movies
                  </p>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="activity-privacy" 
                        value="public"
                        checked={settings.recentActivityPrivacy === 'public'}
                        onChange={() => handleSettingChange('recentActivityPrivacy', 'public')}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mr-2 peer-checked:border-purple-500 peer-checked:border-4"></div>
                      <span className={colorScheme.text}>Public</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="activity-privacy" 
                        value="friends"
                        checked={settings.recentActivityPrivacy === 'friends'}
                        onChange={() => handleSettingChange('recentActivityPrivacy', 'friends')}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mr-2 peer-checked:border-purple-500 peer-checked:border-4"></div>
                      <span className={colorScheme.text}>Friends Only</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="activity-privacy" 
                        value="private"
                        checked={settings.recentActivityPrivacy === 'private'}
                        onChange={() => handleSettingChange('recentActivityPrivacy', 'private')}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mr-2 peer-checked:border-purple-500 peer-checked:border-4"></div>
                      <span className={colorScheme.text}>Private</span>
                    </label>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className={`font-medium ${colorScheme.text} mb-2`}>Recommendations Privacy</h4>
                  <p className={`text-xs ${colorScheme.textSecondary} mb-3`}>
                    Who can send you movie recommendations
                  </p>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="recommendation-privacy" 
                        value="public"
                        checked={settings.recommendationsPrivacy === 'public'}
                        onChange={() => handleSettingChange('recommendationsPrivacy', 'public')}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mr-2 peer-checked:border-purple-500 peer-checked:border-4"></div>
                      <span className={colorScheme.text}>Everyone</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="recommendation-privacy" 
                        value="friends"
                        checked={settings.recommendationsPrivacy === 'friends'}
                        onChange={() => handleSettingChange('recommendationsPrivacy', 'friends')}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mr-2 peer-checked:border-purple-500 peer-checked:border-4"></div>
                      <span className={colorScheme.text}>Friends Only</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="recommendation-privacy" 
                        value="private"
                        checked={settings.recommendationsPrivacy === 'private'}
                        onChange={() => handleSettingChange('recommendationsPrivacy', 'private')}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mr-2 peer-checked:border-purple-500 peer-checked:border-4"></div>
                      <span className={colorScheme.text}>Nobody</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <button
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center"
              onClick={handleSaveSettings}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;