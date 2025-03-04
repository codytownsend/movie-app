// src/components/SwipeActions.jsx
import React from 'react';
import { X, Heart, Bookmark } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SwipeActions = ({ onSwipeNegative, onSwipePositive, currentMovie }) => {
  const { colorScheme, watchlist, setWatchlist, showToast } = useAppContext();

  // Handle bookmark action
  const handleBookmark = () => {
    if (!currentMovie) return;
    
    // Check if already in watchlist
    const alreadyInWatchlist = watchlist.some(movie => movie.id === currentMovie.id);
    
    if (!alreadyInWatchlist) {
      // Add to watchlist
      setWatchlist(prev => [...prev, currentMovie]);
      showToast("Added to watchlist!");
    } else {
      showToast("Already in your watchlist");
    }
  };

  return (
    <div className="mt-auto flex justify-center space-x-8 py-4">
      <button 
        onClick={onSwipeNegative}
        className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
        aria-label="Not interested"
      >
        <X className="w-6 h-6 text-red-500" />
      </button>
      <button 
        onClick={handleBookmark}
        className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
        aria-label="Add to watchlist"
      >
        <Bookmark className="w-6 h-6 text-yellow-500" />
      </button>
      <button 
        onClick={onSwipePositive}
        className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
        aria-label="Like"
      >
        <Heart className="w-6 h-6 text-pink-500" />
      </button>
    </div>
  );
};

export default SwipeActions;