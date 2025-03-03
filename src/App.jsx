// src/App.js
import React, { useState } from 'react';
import DiscoverPage from './pages/DiscoverPage';
import SearchPage from './pages/SearchPage';
import SocialPage from './pages/SocialPage';
import WatchlistPage from './pages/WatchlistPage';
import ProfilePage from './pages/ProfilePage';
import { sampleUsers } from './data/sampleData';

function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [darkMode, setDarkMode] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  
  // Define color scheme based on dark mode.
  const colorScheme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-gray-100' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    accent: 'bg-gradient-to-r from-purple-500 to-pink-500'
  };

  return (
    <>
      {activeTab === 'discover' && (
        <DiscoverPage 
          setActiveTab={setActiveTab} 
          colorScheme={colorScheme} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
        />
      )}
      {activeTab === 'search' && (
        <SearchPage 
          setActiveTab={setActiveTab} 
          colorScheme={colorScheme} 
          darkMode={darkMode}
        />
      )}
      {activeTab === 'social' && (
        <SocialPage 
          setActiveTab={setActiveTab} 
          colorScheme={colorScheme} 
          darkMode={darkMode}
          showToast={(msg) => console.log(msg)}
        />
      )}
      {activeTab === 'watchlist' && (
        <WatchlistPage 
          watchlist={watchlist} 
          setWatchlist={setWatchlist} 
          colorScheme={colorScheme} 
          setActiveTab={setActiveTab}
          showToast={(msg) => console.log(msg)}
          pendingRecommendations={[]}
          darkMode={darkMode}
        />
      )}
      {activeTab === 'profile' && (
        <ProfilePage 
          currentUser={sampleUsers[0]} 
          watchlist={watchlist} 
          setWatchlist={setWatchlist} 
          colorScheme={colorScheme} 
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          showToast={(msg) => console.log(msg)}
        />
      )}
    </>
  );
}

export default App;
