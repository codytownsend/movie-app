// src/components/BottomNavigation.jsx
import React from 'react';
import { Home, Search, Users, Bookmark, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BottomNavigation = () => {
  const { 
    activeTab, 
    setActiveTab, 
    colorScheme, 
    pendingRecommendations,
    watchlist
  } = useAppContext();

  return (
    <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${colorScheme.card} shadow-lg px-4 py-4 flex justify-around border-t ${colorScheme.border} z-10 transition-colors duration-300`}>
      <TabButton 
        icon={<Home className="w-5 h-5" />}
        label="Discover"
        isActive={activeTab === 'discover'}
        onClick={() => setActiveTab('discover')}
        colorScheme={colorScheme}
      />
      
      <TabButton 
        icon={<Search className="w-5 h-5" />}
        label="Search"
        isActive={activeTab === 'search'}
        onClick={() => setActiveTab('search')}
        colorScheme={colorScheme}
      />
      
      <TabButton 
        icon={<Users className="w-5 h-5" />}
        label="Social"
        isActive={activeTab === 'social'}
        onClick={() => setActiveTab('social')}
        colorScheme={colorScheme}
        badge={pendingRecommendations?.length > 0}
      />
      
      <TabButton 
        icon={<Bookmark className="w-5 h-5" />}
        label="Watchlist"
        isActive={activeTab === 'watchlist'}
        onClick={() => setActiveTab('watchlist')}
        colorScheme={colorScheme}
        badge={watchlist?.length > 0}
        badgeCount={watchlist?.length}
      />
      
      <TabButton 
        icon={<User className="w-5 h-5" />}
        label="Profile"
        isActive={activeTab === 'profile'}
        onClick={() => setActiveTab('profile')}
        colorScheme={colorScheme}
      />
    </div>
  );
};

// Extracted Tab Button component for cleaner code
const TabButton = ({ icon, label, isActive, onClick, colorScheme, badge, badgeCount }) => (
  <button 
    className={`flex flex-col items-center relative ${
      isActive 
        ? 'text-purple-500' 
        : colorScheme.textSecondary
    }`}
    onClick={onClick}
  >
    <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
      {icon}
    </div>
    <span className={`text-xs mt-1 transition-all ${isActive ? 'font-medium' : 'opacity-80'}`}>
      {label}
    </span>
    
    {/* Notification badge with optional count */}
    {badge && (
      <span className={`absolute -top-0.5 -right-1 flex items-center justify-center ${badgeCount ? 'w-4 h-4 text-[10px] font-bold' : 'w-2 h-2'} bg-red-500 ${badgeCount ? 'rounded-full text-white' : 'rounded-full'}`}>
        {badgeCount > 0 && badgeCount < 10 ? badgeCount : badgeCount >= 10 ? '9+' : ''}
      </span>
    )}
    
    {/* Animated indicator dot for active tab */}
    {isActive && (
      <span className="absolute -bottom-2 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
    )}
  </button>
);

export default BottomNavigation;