// src/components/LoadingScreen.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';

const LoadingScreen = () => {
  const { colorScheme } = useAppContext();

  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col items-center justify-center`}>
      <div className="w-20 h-20 relative">
        <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-r-2 border-l-2 border-pink-500 animate-spin animate-delay-500"></div>
      </div>
      
      <h1 className={`text-2xl font-bold mt-8 mb-2 ${colorScheme.text}`}>
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          MovieMatch
        </span>
      </h1>
      
      <p className={`${colorScheme.textSecondary}`}>Finding perfect matches for you...</p>
    </div>
  );
};

export default LoadingScreen;