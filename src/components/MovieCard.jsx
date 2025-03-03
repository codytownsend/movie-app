// src/components/MovieCard.js
import React, { useRef, useState } from 'react';
import { Info, Star } from 'lucide-react';

const MovieCard = ({ currentMovie, handleSwipe, setShowDetails, colorScheme, showToast, darkMode }) => {
  const cardRef = useRef(null);
  const initialTouchPosition = useRef(null);
  const currentSwipeDistance = useRef(0);
  const [direction, setDirection] = useState('');

  const handleTouchStart = (e) => {
    initialTouchPosition.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!initialTouchPosition.current) return;
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - initialTouchPosition.current;
    const maxDistance = window.innerWidth * 0.5;
    const limitedDiff = Math.max(Math.min(diff, maxDistance), -maxDistance);
    const rotate = limitedDiff / 20;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${limitedDiff}px) rotate(${rotate}deg)`;
      if (limitedDiff > 50) {
        setDirection('right');
      } else if (limitedDiff < -50) {
        setDirection('left');
      } else {
        setDirection('');
      }
    }
    currentSwipeDistance.current = limitedDiff;
  };

  const handleTouchEnd = () => {
    if (!initialTouchPosition.current) return;
    const threshold = window.innerWidth * 0.2;
    if (currentSwipeDistance.current > threshold) {
      handleSwipe(true);
    } else if (currentSwipeDistance.current < -threshold) {
      handleSwipe(false);
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0)';
        setDirection('');
      }
    }
    initialTouchPosition.current = null;
    currentSwipeDistance.current = 0;
  };

  const handleMouseDown = (e) => {
    initialTouchPosition.current = e.clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!initialTouchPosition.current) return;
    const diff = e.clientX - initialTouchPosition.current;
    const maxDistance = window.innerWidth * 0.5;
    const limitedDiff = Math.max(Math.min(diff, maxDistance), -maxDistance);
    const rotate = limitedDiff / 20;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${limitedDiff}px) rotate(${rotate}deg)`;
      if (limitedDiff > 50) {
        setDirection('right');
      } else if (limitedDiff < -50) {
        setDirection('left');
      } else {
        setDirection('');
      }
    }
    currentSwipeDistance.current = limitedDiff;
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    const threshold = window.innerWidth * 0.2;
    if (currentSwipeDistance.current > threshold) {
      handleSwipe(true);
    } else if (currentSwipeDistance.current < -threshold) {
      handleSwipe(false);
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0)';
        setDirection('');
      }
    }
    initialTouchPosition.current = null;
    currentSwipeDistance.current = 0;
  };

  return (
    <div 
      ref={cardRef}
      className={`absolute w-[90%] max-w-sm ${colorScheme.card} rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 cursor-grab active:cursor-grabbing ${
        direction === 'left' ? 'translate-x-[-150%] rotate-[-20deg]' : 
        direction === 'right' ? 'translate-x-[150%] rotate-[20deg]' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="relative">
        <img 
          src={currentMovie.posterUrl} 
          alt={currentMovie.title} 
          className="w-full h-[65vh] object-cover"
          draggable="false"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80"></div>
        {direction === 'right' && (
          <div className="absolute top-6 left-6 bg-green-500 bg-opacity-90 text-white rounded-lg px-4 py-2 transform -rotate-12 border-2 border-white">
            <span className="font-bold text-xl">LIKE</span>
          </div>
        )}
        {direction === 'left' && (
          <div className="absolute top-6 right-6 bg-red-500 bg-opacity-90 text-white rounded-lg px-4 py-2 transform rotate-12 border-2 border-white">
            <span className="font-bold text-xl">NOPE</span>
          </div>
        )}
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
            <div className="flex">
              {currentMovie.streamingOn.map((platform, i) => (
                <span 
                  key={i} 
                  className="ml-1 text-xs bg-gray-800 bg-opacity-80 rounded-md px-2 py-1"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap mt-2">
            {currentMovie.genre.map((g, i) => (
              <span 
                key={i} 
                className="text-xs bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1 mr-1 mt-1"
              >
                {g}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-white line-clamp-2 leading-snug">
            {currentMovie.description}
          </p>
        </div>
        <button 
          onClick={() => setShowDetails(true)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-lg transform transition hover:scale-110"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
