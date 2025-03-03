// src/components/BottomNavigation.js
import React from 'react';
import { Home, Search, Users, Bookmark, User } from 'lucide-react';

const BottomNavigation = ({ activeTab, setActiveTab, pendingRecommendations, colorScheme }) => (
  <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${colorScheme.card} shadow-lg px-4 py-4 flex justify-around border-t ${colorScheme.border}`}>
    <button 
      className={`flex flex-col items-center ${activeTab === 'discover' ? 'text-purple-500' : colorScheme.textSecondary}`}
      onClick={() => setActiveTab('discover')}
    >
      <Home className="w-5 h-5" />
      <span className="text-xs mt-1">Discover</span>
    </button>
    <button 
      className={`flex flex-col items-center ${activeTab === 'search' ? 'text-purple-500' : colorScheme.textSecondary}`}
      onClick={() => setActiveTab('search')}
    >
      <Search className="w-5 h-5" />
      <span className="text-xs mt-1">Search</span>
    </button>
    <button 
      className={`flex flex-col items-center ${activeTab === 'social' ? 'text-purple-500' : colorScheme.textSecondary}`}
      onClick={() => setActiveTab('social')}
    >
      <Users className="w-5 h-5" />
      {pendingRecommendations && pendingRecommendations.length > 0 && (
        <span className="absolute top-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
      <span className="text-xs mt-1">Social</span>
    </button>
    <button 
      className={`flex flex-col items-center ${activeTab === 'watchlist' ? 'text-purple-500' : colorScheme.textSecondary}`}
      onClick={() => setActiveTab('watchlist')}
    >
      <Bookmark className="w-5 h-5" />
      <span className="text-xs mt-1">Watchlist</span>
    </button>
    <button 
      className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-purple-500' : colorScheme.textSecondary}`}
      onClick={() => setActiveTab('profile')}
    >
      <User className="w-5 h-5" />
      <span className="text-xs mt-1">Profile</span>
    </button>
  </div>
);

export default BottomNavigation;
