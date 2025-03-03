// src/components/SwipeActions.js
import React from 'react';
import { X, Heart, Bookmark } from 'lucide-react';

const SwipeActions = ({ onSwipeNegative, onBookmark, onSwipePositive, colorScheme }) => {
  return (
    <div className="mt-auto flex justify-center space-x-8 py-4">
      <button 
        onClick={onSwipeNegative}
        className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
      >
        <X className="w-6 h-6 text-red-500" />
      </button>
      <button 
        onClick={onBookmark}
        className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
      >
        <Bookmark className="w-6 h-6 text-yellow-500" />
      </button>
      <button 
        onClick={onSwipePositive}
        className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
      >
        <Heart className="w-6 h-6 text-pink-500" />
      </button>
    </div>
  );
};

export default SwipeActions;
