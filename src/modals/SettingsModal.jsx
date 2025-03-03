// src/modals/SettingsModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SettingsModal = ({ setShowSettingsModal }) => {
  const { 
    colorScheme, 
    darkMode, 
    setDarkMode, 
    showToast 
  } = useAppContext();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setShowSettingsModal(false)}>
      <div 
        className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className={`text-xl font-bold ${colorScheme.text}`}>Appearance Settings</h2>
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className={`w-6 h-6 ${colorScheme.text}`} />
            </button>
          </div>
          
          <div className="mb-5">
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Theme</h3>
            <div className="flex flex-col space-y-4">
              <div 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                onClick={() => setDarkMode(true)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg">🌙</span>
                  </div>
                  <div>
                    <h4 className={`font-medium ${colorScheme.text}`}>Dark Mode</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>Easier on the eyes in low light</p>
                  </div>
                </div>
                {darkMode && <div className="w-5 h-5 rounded-full bg-purple-500"></div>}
              </div>
              
              <div 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${!darkMode ? 'bg-gray-200' : 'bg-gray-700'}`}
                onClick={() => setDarkMode(false)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">☀️</span>
                  </div>
                  <div>
                    <h4 className={`font-medium ${colorScheme.text}`}>Light Mode</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>Better visibility in bright light</p>
                  </div>
                </div>
                {!darkMode && <div className="w-5 h-5 rounded-full bg-purple-500"></div>}
              </div>
            </div>
          </div>
          
          <div className="mb-5">
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Text Size</h3>
            <div className="px-2">
              <input 
                type="range" 
                min="1" 
                max="5" 
                step="1" 
                defaultValue="3"
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={colorScheme.textSecondary}>A</span>
                <span className={colorScheme.textSecondary}>AA</span>
                <span className={colorScheme.textSecondary}>AAA</span>
              </div>
            </div>
          </div>
          
          <div className="mb-5">
            <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Animations</h3>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-3 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${colorScheme.text}`}>Enable animations</h4>
                  <p className={`text-xs ${colorScheme.textSecondary}`}>Card swipes, transitions, and effects</p>
                </div>
                <div className="relative">
                  <input type="checkbox" id="animations" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg py-3 transition transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                setShowSettingsModal(false);
                showToast("Settings saved");
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;