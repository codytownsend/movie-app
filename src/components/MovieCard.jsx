// src/components/MovieCard.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Info, Star, Sliders } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MovieCard = ({ 
  currentMovie, 
  handleSwipe, 
  setShowDetails, 
  direction, 
  setDirection,
  setFilterOpen 
}) => {
  const { 
    colorScheme, 
    darkMode,
    watchlist,
    setWatchlist,
    showToast
  } = useAppContext();
  
  const cardRef = useRef(null);
  const initialTouchPosition = useRef(null);
  const currentSwipeDistance = useRef(0);
  const animationRef = useRef(null);
  
  // Reset card position when movie changes
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0) rotate(0)';
      setDirection('');
    }
  }, [currentMovie, setDirection]);

  // Touch/swipe handling
  const handleTouchStart = (e) => {
    initialTouchPosition.current = e.touches[0].clientX;
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Other handlers (handleTouchMove, handleTouchEnd, etc.) remain the same
  // ...

  if (!currentMovie) return null;

  return (
    <div 
      ref={cardRef}
      className={`absolute w-[90%] max-w-sm ${colorScheme.card} rounded-xl shadow-xl overflow-hidden transform transition-shadow duration-300 cursor-grab active:cursor-grabbing ${direction ? 'shadow-2xl' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Filter button - added to top-left of card */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setFilterOpen(true);
        }}
        className="absolute top-4 left-4 z-20 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-lg transform transition hover:scale-110"
      >
        <Sliders className="w-5 h-5" />
      </button>
      
      {/* Movie poster */}
      <div className="relative">
        <img 
          src={currentMovie.posterUrl} 
          alt={currentMovie.title} 
          className="w-full h-[65vh] object-cover"
          draggable="false"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80"></div>
        
        {/* Like/Dislike badges */}
        {direction === 'right' && (
          <div className="absolute top-6 left-6 bg-green-500 bg-opacity-90 text-white rounded-lg px-4 py-2 transform -rotate-12 border-2 border-white scale-in-center">
            <span className="font-bold text-xl">LIKE</span>
          </div>
        )}
        
        {direction === 'left' && (
          <div className="absolute top-6 right-6 bg-red-500 bg-opacity-90 text-white rounded-lg px-4 py-2 transform rotate-12 border-2 border-white scale-in-center">
            <span className="font-bold text-xl">NOPE</span>
          </div>
        )}
        
        {/* Movie info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold">{currentMovie.title}</h2>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="ml-1 text-sm">{currentMovie.rating}/10</span>
                <span className="mx-2">•</span>
                <span className="text-sm">{currentMovie.year}</span>
              </div>
            </div>
            
            {/* Streaming services */}
            <div className="flex">
              {currentMovie.streamingOn?.map((platform, i) => (
                <span 
                  key={i} 
                  className="ml-1 text-xs bg-gray-800 bg-opacity-80 rounded-md px-2 py-1"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
          
          {/* Genres */}
          <div className="flex flex-wrap mt-2">
            {currentMovie.genre?.map((g, i) => (
              <span 
                key={i} 
                className="text-xs bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1 mr-1 mt-1"
              >
                {g}
              </span>
            ))}
          </div>
          
          {/* Description */}
          <p className="mt-3 text-sm text-white line-clamp-2 leading-snug">
            {currentMovie.description}
          </p>
        </div>
        
        {/* Details button */}
        <button 
          onClick={() => setShowDetails(true)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-lg transform transition hover:scale-110"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
      
      {/* Custom animation styles */}
      <style>
        {`
          .scale-in-center {
            animation: scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          }
          
          @keyframes scale-in-center {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            100% {
              transform: scale(1) rotate(${direction === 'right' ? '-12deg' : '12deg'});
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MovieCard;