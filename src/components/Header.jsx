// src/components/Header.jsx
import React from 'react';
import { Sliders, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Header = ({ setNotificationsOpen }) => {
  const { 
    colorScheme, 
    pendingRecommendations,
    activeTab,
    setFilterOpen
  } = useAppContext();

  return (
    <header className={`${colorScheme.card} shadow-sm p-4 flex justify-between items-center z-10`}>
      {/* Filters button - only shown on discover page */}
      {activeTab === 'discover' && (
        <div 
          className={`flex items-center cursor-pointer transform transition hover:scale-105`}
          onClick={() => setFilterOpen(true)}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg}`}>
            <Sliders className={`w-5 h-5 ${colorScheme.text}`} />
          </div>
        </div>
      )}
      
      {/* Empty div for spacing when filters aren't shown */}
      {activeTab !== 'discover' && <div className="w-10"></div>}
      
      <h1 className={`text-xl font-bold ${colorScheme.text} relative group`}>
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          MovieMatch
        </span>
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
      </h1>
      
      {/* Notifications button - shown on all pages */}
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg} cursor-pointer relative transform transition hover:scale-105`}
        onClick={() => setNotificationsOpen(true)}
      >
        <Bell className={`w-5 h-5 ${colorScheme.text}`} />
        {pendingRecommendations?.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </div>
    </header>
  );
};

export default Header;