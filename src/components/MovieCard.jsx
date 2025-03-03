// src/components/MovieCard.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Info, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MovieCard = ({ 
  currentMovie, 
  handleSwipe, 
  setShowDetails, 
  direction, 
  setDirection 
}) => {
  const { colorScheme, darkMode } = useAppContext();
  
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

  const handleTouchMove = (e) => {
    if (!initialTouchPosition.current) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - initialTouchPosition.current;
    animateCard(diff);
  };

  const handleTouchEnd = () => {
    if (!initialTouchPosition.current) return;
    
    const threshold = window.innerWidth * 0.2;
    
    if (currentSwipeDistance.current > threshold) {
      // Complete the swipe right animation and call handler
      animateCardAway('right', () => handleSwipe(true));
    } else if (currentSwipeDistance.current < -threshold) {
      // Complete the swipe left animation and call handler
      animateCardAway('left', () => handleSwipe(false));
    } else {
      // Return card to center if not swiped far enough
      animateCardReturn();
    }
    
    initialTouchPosition.current = null;
  };

  // Mouse handling for desktop
  const handleMouseDown = (e) => {
    initialTouchPosition.current = e.clientX;
    
    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMouseMove = (e) => {
    if (!initialTouchPosition.current) return;
    
    const diff = e.clientX - initialTouchPosition.current;
    animateCard(diff);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (!initialTouchPosition.current) return;
    
    const threshold = window.innerWidth * 0.2;
    
    if (currentSwipeDistance.current > threshold) {
      // Complete the swipe right animation and call handler
      animateCardAway('right', () => handleSwipe(true));
    } else if (currentSwipeDistance.current < -threshold) {
      // Complete the swipe left animation and call handler
      animateCardAway('left', () => handleSwipe(false));
    } else {
      // Return card to center if not swiped far enough
      animateCardReturn();
    }
    
    initialTouchPosition.current = null;
  };

  // Animation functions
  const animateCard = (diff) => {
    const maxDistance = window.innerWidth * 0.5;
    const limitedDiff = Math.max(Math.min(diff, maxDistance), -maxDistance);
    
    // Calculate rotation based on swipe distance - more natural feel
    const rotate = (limitedDiff / 20) * Math.min(Math.abs(limitedDiff) / 100, 1);
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${limitedDiff}px) rotate(${rotate}deg)`;
      
      // Update the direction state for UI feedback
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

  const animateCardAway = (direction, callback) => {
    const targetX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    const targetRotation = direction === 'right' ? 30 : -30;
    const startX = currentSwipeDistance.current;
    const startRotation = (startX / 20) * Math.min(Math.abs(startX) / 100, 1);
    const startTime = performance.now();
    const duration = 300;
    
    setDirection(direction);
    
    const animateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      const currentX = startX + (targetX - startX) * easeProgress;
      const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress;
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${currentX}px) rotate(${currentRotation}deg)`;
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        // Animation completed
        setTimeout(callback, 100);
      }
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  };

  const animateCardReturn = () => {
    const startX = currentSwipeDistance.current;
    const startRotation = (startX / 20) * Math.min(Math.abs(startX) / 100, 1);
    const startTime = performance.now();
    const duration = 300;
    
    setDirection('');
    
    const animateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 2); // Quadratic ease out
      
      const currentX = startX * (1 - easeProgress);
      const currentRotation = startRotation * (1 - easeProgress);
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${currentX}px) rotate(${currentRotation}deg)`;
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        // Reset when animation completes
        currentSwipeDistance.current = 0;
      }
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  };

  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
      
      {/* Add custom animation classes */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default MovieCard;