// components/RecommendationSwiper.js
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaTimes, FaInfoCircle, FaBookmark } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { addToWatchlist } from '../utils/firebase';

// Movie Card Component - Tinder Style
const MovieCard = ({ movie, onLike, onDislike, onBookmark, onShowDetails, isActive }) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const cardRef = useRef(null);

  // Handle touch events for swipe functionality
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - touchStart.x;
    const deltaY = e.touches[0].clientY - touchStart.y;
    
    // Determine if this is a horizontal swipe (not a scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) * 2) {
      e.preventDefault();
      setOffset({ x: deltaX, y: 0 });
      
      // Set direction for visual feedback
      if (deltaX > 50) setSwipeDirection('right');
      else if (deltaX < -50) setSwipeDirection('left');
      else setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (offset.x > 100) {
      onLike(movie);
    } else if (offset.x < -100) {
      onDislike(movie);
    }
    
    // Reset position
    setOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  // Calculate card style based on swipe
  const getCardStyle = () => {
    const rotateAngle = offset.x * 0.05;
    return {
      transform: `translateX(${offset.x}px) rotate(${rotateAngle}deg)`,
      transition: offset.x !== 0 ? 'none' : 'transform 0.5s ease'
    };
  };

  // Get poster URL
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <motion.div
      className="relative w-full rounded-xl overflow-hidden aspect-[3/4] shadow-lg"
      ref={cardRef}
      style={getCardStyle()}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe direction indicator */}
      {swipeDirection === 'right' && (
        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10">
          <div className="bg-green-500 rounded-full p-4">
            <FaHeart className="text-white text-3xl" />
          </div>
        </div>
      )}
      
      {swipeDirection === 'left' && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10">
          <div className="bg-red-500 rounded-full p-4">
            <FaTimes className="text-white text-3xl" />
          </div>
        </div>
      )}

      {/* Movie Poster as full background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterUrl})` }}
      />
      
      {/* Gradient overlay at bottom for text visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black to-transparent" />
      
      {/* Movie information at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex justify-between items-end">
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-white">
              {movie.title}
              <span className="text-white/80 text-sm ml-1">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
              </span>
            </h2>
            {movie.genres && movie.genres.length > 0 && (
              <p className="text-white/80 text-sm line-clamp-1">
                {movie.genres.join(', ')}
              </p>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails(movie);
            }}
            className="text-white ml-2"
            aria-label="Show movie details"
          >
            <FaInfoCircle className="text-xl" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Movie Details Popup Component
const MovieDetailsPopup = ({ movie, onClose }) => {
  if (!movie) return null;
  
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  
  // Format runtime from minutes to hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 
      ? `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`
      : `${remainingMinutes}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      
      {/* Movie details card */}
      <div className="relative w-full max-w-lg bg-background rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto z-10">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 z-20 bg-black/50 p-2 rounded-full"
          onClick={onClose}
        >
          <FaTimes className="text-white" />
        </button>
        
        {/* Movie poster */}
        <div className="w-full h-64 relative">
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        {/* Content area */}
        <div className="p-4">
          <h2 className="text-2xl font-bold text-white mb-2">{movie.title}</h2>
          
          <div className="flex items-center text-sm text-gray-300 mb-4">
            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
            {movie.runtime && (
              <>
                <span className="mx-2">•</span>
                <span>{formatRuntime(movie.runtime)}</span>
              </>
            )}
          </div>
          
          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="text-xs bg-secondary-light text-gray-300 px-2 py-1 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Overview */}
          <div className="mb-4">
            <h3 className="text-white font-medium mb-2">Overview</h3>
            <p className="text-gray-300 text-sm">{movie.overview}</p>
          </div>
          
          {/* Cast and additional details */}
          {movie.director && (
            <div className="mb-4">
              <h3 className="text-white font-medium mb-1">Director</h3>
              <p className="text-gray-300 text-sm">{movie.director}</p>
            </div>
          )}
            
          {movie.cast && movie.cast.length > 0 && (
            <div className="mb-4">
              <h3 className="text-white font-medium mb-1">Cast</h3>
              <p className="text-gray-300 text-sm">{movie.cast.join(', ')}</p>
            </div>
          )}
          
          {/* Back button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="bg-primary text-black px-6 py-2 rounded-full font-medium"
            >
              Back to Swiping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main RecommendationSwiper Component
export default function RecommendationSwiper({ movies, onLike, onDislike, onLoadMore }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { currentUser } = useAuth();
  
  // Handle adding to watchlist
  const handleBookmark = async (movie) => {
    if (!currentUser) return;
    
    try {
      await addToWatchlist(currentUser.uid, movie.id, movie);
      // Could add toast notification here
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
    
    // Move to next movie after bookmarking
    nextMovie();
  };
  
  // Go to next movie
  const nextMovie = () => {
    if (currentIndex >= movies.length - 1) {
      // We're at the end - load more movies
      if (onLoadMore) onLoadMore();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Handle like
  const handleLike = (movie) => {
    if (onLike) onLike(movie);
    nextMovie();
  };
  
  // Handle dislike
  const handleDislike = (movie) => {
    if (onDislike) onDislike(movie);
    nextMovie();
  };
  
  // Show movie details
  const handleShowDetails = (movie) => {
    setSelectedMovie(movie);
    setShowDetails(true);
  };
  
  // Close movie details
  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  // Loading state
  if (!movies || movies.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-secondary/50 rounded-xl flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full mx-auto max-w-md">
      {/* Movie cards stack */}
      <div className="relative aspect-[3/4]">
        <AnimatePresence>
          {movies.slice(currentIndex, currentIndex + 3).map((movie, index) => (
            <div 
              key={movie.id} 
              className="absolute inset-0"
              style={{ 
                zIndex: movies.length - index,
                transform: `translateY(${index * 10}px) scale(${1 - index * 0.05})`
              }}
            >
              <MovieCard
                movie={movie}
                onLike={handleLike}
                onDislike={handleDislike}
                onBookmark={handleBookmark}
                onShowDetails={handleShowDetails}
                isActive={index === 0}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile toolbar with action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md py-4 px-4 z-30 border-t border-gray-800 shadow-lg">
        <div className="container mx-auto flex justify-center items-center space-x-6 max-w-md">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            onClick={() => handleDislike(movies[currentIndex])}
          >
            <FaTimes className="text-white text-2xl" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            onClick={() => handleBookmark(movies[currentIndex])}
          >
            <FaBookmark className="text-white text-xl" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            onClick={() => handleLike(movies[currentIndex])}
          >
            <FaHeart className="text-white text-2xl" />
          </motion.button>
        </div>
      </div>
      
      {/* Movie Details Popup */}
      {showDetails && (
        <MovieDetailsPopup 
          movie={selectedMovie}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}