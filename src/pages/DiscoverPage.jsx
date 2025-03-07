// src/pages/DiscoverPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Info, Star, Bookmark, Sliders } from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import FilterModal from '../modals/FilterModal';
import MovieDetailsModal from '../modals/MovieDetailsModal';
import SwipeGuideAnimation from '../components/SwipeGuideAnimation';
import { useAppContext } from '../context/AppContext';

const DiscoverPage = () => {
  // Get values and functions from context
  const { 
    movies, 
    currentIndex, 
    setCurrentIndex,
    colorScheme, 
    darkMode, 
    showToast, 
    handleSwipe,
    isLoading,
    watchlist,
    setWatchlist
  } = useAppContext();
  
  // Local state
  const [showDetails, setShowDetails] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [direction, setDirection] = useState('');
  const [pullDown, setPullDown] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false); // Default to false
  
  const currentMovie = movies[currentIndex];
  const cardRef = useRef(null);
  const initialTouchPosition = useRef({ x: 0, y: 0 });
  const currentSwipeDistance = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const swipeThreshold = window.innerWidth * 0.25;
  const pullThreshold = 80; // Pixels needed to pull down to add to watchlist

  // Check localStorage for first visit
  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem('movieMatch_hasSeenInstructions');
    if (hasSeenInstructions) {
      setShowInstructions(false);
    } else {
      setShowInstructions(true);
    }
  }, []);

  // Handle animation completion
  const handleInstructionsComplete = () => {
    // Save to localStorage that user has seen the instructions
    localStorage.setItem('movieMatch_hasSeenInstructions', 'true');
    setShowInstructions(false);
  };

  // Skip instructions and mark as seen
  const handleSkipInstructions = () => {
    localStorage.setItem('movieMatch_hasSeenInstructions', 'true');
    setShowInstructions(false);
  };

  // Touch/swipe handling
  const handleTouchStart = (e) => {
    initialTouchPosition.current = { 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    };
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsPulling(false);
  };

  const handleTouchMove = (e) => {
    if (!initialTouchPosition.current.x) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchX - initialTouchPosition.current.x;
    const diffY = touchY - initialTouchPosition.current.y;
    
    // Determine if this is a horizontal swipe or vertical pull
    const isHorizontal = Math.abs(diffX) > Math.abs(diffY);
    
    if (isHorizontal) {
      // Handle horizontal swipe
      animateCardHorizontal(diffX);
      setPullDown(0);
      setIsPulling(false);
    } else if (diffY > 0) {
      // Handle downward pull only
      const limitedDiffY = Math.min(diffY, 150); // Limit max pull distance
      setPullDown(limitedDiffY);
      setIsPulling(true);
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translateY(${limitedDiffY}px)`;
      }
      
      currentSwipeDistance.current.y = limitedDiffY;
    }
  };

  const handleTouchEnd = () => {
    if (isPulling && pullDown >= pullThreshold) {
      // Complete the pull down action - add to watchlist
      handleAddToWatchlist();
      animateCardVerticalReturn();
    } else if (currentSwipeDistance.current.x > swipeThreshold) {
      // Complete the swipe right animation and call handler
      animateCardAway('right', () => handleSwipe(true));
    } else if (currentSwipeDistance.current.x < -swipeThreshold) {
      // Complete the swipe left animation and call handler
      animateCardAway('left', () => handleSwipe(false));
    } else {
      // Return card to center if not swiped far enough
      animateCardHorizontalReturn();
      animateCardVerticalReturn();
    }
    
    initialTouchPosition.current = { x: 0, y: 0 };
    setIsPulling(false);
  };

  // Mouse handling for desktop
  const handleMouseDown = (e) => {
    initialTouchPosition.current = { x: e.clientX, y: e.clientY };
    
    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsPulling(false);
  };

  const handleMouseMove = (e) => {
    if (!initialTouchPosition.current.x) return;
    
    const diffX = e.clientX - initialTouchPosition.current.x;
    const diffY = e.clientY - initialTouchPosition.current.y;
    
    // Determine if this is a horizontal swipe or vertical pull
    const isHorizontal = Math.abs(diffX) > Math.abs(diffY);
    
    if (isHorizontal) {
      // Handle horizontal swipe
      animateCardHorizontal(diffX);
      setPullDown(0);
      setIsPulling(false);
    } else if (diffY > 0) {
      // Handle downward pull only
      const limitedDiffY = Math.min(diffY, 150); // Limit max pull distance
      setPullDown(limitedDiffY);
      setIsPulling(true);
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translateY(${limitedDiffY}px)`;
      }
      
      currentSwipeDistance.current.y = limitedDiffY;
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (isPulling && pullDown >= pullThreshold) {
      // Complete the pull down action - add to watchlist
      handleAddToWatchlist();
      animateCardVerticalReturn();
    } else if (currentSwipeDistance.current.x > swipeThreshold) {
      // Complete the swipe right animation and call handler
      animateCardAway('right', () => handleSwipe(true));
    } else if (currentSwipeDistance.current.x < -swipeThreshold) {
      // Complete the swipe left animation and call handler
      animateCardAway('left', () => handleSwipe(false));
    } else {
      // Return card to center if not swiped far enough
      animateCardHorizontalReturn();
      animateCardVerticalReturn();
    }
    
    initialTouchPosition.current = { x: 0, y: 0 };
    setIsPulling(false);
  };

  // Add to watchlist handler
  const handleAddToWatchlist = () => {
    if (!currentMovie) return;
    
    const alreadyInWatchlist = watchlist.some(movie => movie.id === currentMovie.id);
    
    if (!alreadyInWatchlist) {
      setWatchlist(prev => [...prev, currentMovie]);
      showToast("Added to watchlist!");
    } else {
      showToast("Already in your watchlist");
    }
  };

  // Animation functions
  const animateCardHorizontal = (diff) => {
    const maxDistance = window.innerWidth * 0.6;
    const limitedDiff = Math.max(Math.min(diff, maxDistance), -maxDistance);
    
    // Calculate rotation based on swipe distance - more natural feel
    const rotate = (limitedDiff / 25) * Math.min(Math.abs(limitedDiff) / 100, 1);
    
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
    
    currentSwipeDistance.current.x = limitedDiff;
    currentSwipeDistance.current.y = 0;
  };

  const animateCardAway = (direction, callback) => {
    const targetX = direction === 'right' ? window.innerWidth + 100 : -window.innerWidth - 100;
    const targetRotation = direction === 'right' ? 30 : -30;
    const startX = currentSwipeDistance.current.x;
    const startRotation = (startX / 25) * Math.min(Math.abs(startX) / 100, 1);
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

  const animateCardHorizontalReturn = () => {
    const startX = currentSwipeDistance.current.x;
    const startRotation = (startX / 25) * Math.min(Math.abs(startX) / 100, 1);
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
        currentSwipeDistance.current.x = 0;
      }
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  };

  const animateCardVerticalReturn = () => {
    const startY = currentSwipeDistance.current.y;
    const startTime = performance.now();
    const duration = 300;
    
    const animateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 2); // Quadratic ease out
      
      const currentY = startY * (1 - easeProgress);
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translateY(${currentY}px)`;
      }
      
      setPullDown(currentY);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        // Reset when animation completes
        currentSwipeDistance.current.y = 0;
        setPullDown(0);
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

  if (isLoading) {
    return (
      <div className={`h-screen ${colorScheme.bg} flex items-center justify-center`}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className={`${colorScheme.text}`}>Finding perfect movies for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-screen ${colorScheme.bg} max-w-md mx-auto overflow-hidden`}>
      {/* Simplified Header - no filter or notifications */}
      <Header />

      {/* Main content area with fixed height */}
      <div className="h-[calc(100vh-140px)] flex flex-col">
        {/* Empty state when no cards */}
        {!currentMovie && (
          <div className={`flex-grow flex items-center justify-center text-center ${colorScheme.textSecondary} p-8`}>
            <div>
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-medium mb-2">No more recommendations</h3>
              <p className="mb-4">We're finding more great matches for you</p>
              <button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition transform hover:scale-105"
                onClick={() => {
                  setCurrentIndex(0);
                  showToast("Finding new recommendations");
                }}
              >
                Refresh Recommendations
              </button>
            </div>
          </div>
        )}
        
        {/* Card Container */}
        {currentMovie && (
          <div className="relative flex-grow flex items-center justify-center overflow-hidden">
            {/* Pull-down indicator */}
            {isPulling && pullDown > 0 && (
              <div className="absolute top-4 left-0 right-0 z-20 flex justify-center">
                <div className={`px-4 py-2 rounded-full bg-black bg-opacity-70 text-white flex items-center ${pullDown >= pullThreshold ? 'bg-green-500 bg-opacity-90' : ''}`}>
                  <Bookmark className={`w-4 h-4 mr-2 ${pullDown >= pullThreshold ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">
                    {pullDown >= pullThreshold ? 'Release to add to watchlist' : 'Pull down to add to watchlist'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Card stack effect - showing next card behind - full screen version */}
            {currentIndex + 1 < movies.length && direction === '' && !isPulling && (
              <div className={`absolute inset-0 ${colorScheme.card} overflow-hidden transform scale-95 opacity-70`}>
                <img 
                  src={movies[currentIndex + 1].posterUrl} 
                  alt="Next movie" 
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            )}
            
            {/* Current movie card */}
            <div 
              ref={cardRef}
              className={`absolute inset-0 ${colorScheme.card} overflow-hidden transform transition-shadow duration-300 cursor-grab active:cursor-grabbing ${
                direction === 'left' ? 'translate-x-[-150%] rotate-[-20deg]' : 
                direction === 'right' ? 'translate-x-[150%] rotate-[20deg]' : ''
              }`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
            >
              {/* Filter button - Added to top-left corner of card */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterOpen(true);
                }}
                className="absolute top-6 left-6 z-20 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-3 text-white shadow-lg hover:bg-opacity-70 transition"
              >
                <Sliders className="w-5 h-5" />
              </button>
              
              {/* Movie poster */}
              <div className="relative h-full">
                <img 
                  src={currentMovie.posterUrl} 
                  alt={currentMovie.title} 
                  className="w-full h-full object-cover"
                  draggable="false"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90"></div>
                
                {/* Like/Dislike indicators that appear during swipe */}
                {direction === 'right' && (
                  <div className="absolute top-6 left-6 bg-green-500 bg-opacity-90 text-white rounded-lg px-4 py-2 transform -rotate-12 border-2 border-white animate-scale-in">
                    <span className="font-bold text-xl">LIKE</span>
                  </div>
                )}
                
                {direction === 'left' && (
                  <div className="absolute top-6 right-6 bg-red-500 bg-opacity-90 text-white rounded-lg px-4 py-2 transform rotate-12 border-2 border-white animate-scale-in">
                    <span className="font-bold text-xl">NOPE</span>
                  </div>
                )}
                
                {/* Simplified Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5 text-white flex flex-col">
                  {/* Title and Rating on the same line */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold">{currentMovie.title}</h2>
                    <div className="flex items-center bg-black bg-opacity-50 rounded-lg px-2 py-1">
                      <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                      <span className="font-bold">{currentMovie.rating}</span>
                    </div>
                  </div>
                  
                  {/* Year/Duration and Info button on the same line */}
                  <div className="flex items-center justify-between text-sm text-gray-200 mb-4">
                    <div className="flex items-center">
                      <span>{currentMovie.year}</span>
                      {currentMovie.duration && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{currentMovie.duration}</span>
                        </>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setShowDetails(true)}
                      className="bg-black bg-opacity-50 rounded-lg p-2"
                    >
                      <Info className="w-5 h-5 text-blue-400" />
                    </button>
                  </div>
                  
                  {/* Genres as subtle pills */}
                  {currentMovie.genre && currentMovie.genre.length > 0 && (
                    <div className="flex flex-wrap mb-8">
                      {currentMovie.genre.map((g, i) => (
                        <span 
                          key={i} 
                          className="text-xs bg-white bg-opacity-20 rounded-full px-3 py-1 mr-2 mb-2"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex items-center justify-center space-x-8 mt-auto">
                    <button 
                      onClick={() => animateCardAway('left', () => handleSwipe(false))}
                      className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:bg-opacity-20 active:scale-95"
                      aria-label="Not interested"
                    >
                      <X className="w-8 h-8 text-red-500" />
                    </button>
                    
                    <button 
                      onClick={handleAddToWatchlist}
                      className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:bg-opacity-20 active:scale-95"
                      aria-label="Add to watchlist"
                    >
                      <Bookmark className="w-8 h-8 text-yellow-500" />
                    </button>
                    
                    <button 
                      onClick={() => animateCardAway('right', () => handleSwipe(true))}
                      className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:bg-opacity-20 active:scale-95"
                      aria-label="Like"
                    >
                      <Heart className="w-8 h-8 text-pink-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Tab Navigation */}
      <BottomNavigation />
      
      {/* Swipe Guide Animation Overlay */}
      {currentMovie && showInstructions && (
        <SwipeGuideAnimation 
          onComplete={handleInstructionsComplete} 
          onSkip={handleSkipInstructions}
        />
      )}
      
      {/* Modals */}
      {showDetails && currentMovie && (
        <MovieDetailsModal 
          currentMovie={currentMovie}
          setShowDetails={setShowDetails}
        />
      )}
      
      {filterOpen && (
        <FilterModal 
          setFilterOpen={setFilterOpen}
        />
      )}
      
      {/* Custom animations styles (preserved for other animations) */}
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(${direction === 'right' ? '-12deg' : '12deg'});
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default DiscoverPage;