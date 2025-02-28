import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaTimes, FaBookmark, FaInfoCircle, FaPlay } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { addToWatchlist } from '../utils/firebase';

const MovieCard = ({ movie, onLike, onDislike, onShowDetails, isVisible }) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();
  const cardRef = useRef(null);

  // Handle adding to watchlist
  const handleAddToWatchlist = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    try {
      await addToWatchlist(currentUser.uid, movie.id, movie);
      // Could add toast notification here
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  // Touch handlers for swipe gestures
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
  
  // Format runtime from minutes to hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 
      ? `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`
      : `${remainingMinutes}m`;
  };

  // Calculate card style based on swipe
  const getCardStyle = () => {
    const rotateAngle = offset.x * 0.05;
    return {
      transform: `translateX(${offset.x}px) rotate(${rotateAngle}deg)`,
      transition: offset.x !== 0 ? 'none' : 'transform 0.5s ease'
    };
  };

  // Get poster and backdrop URLs
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const backdropUrl = movie.backdrop_path ? 
    `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : 
    posterUrl;

  return (
    <motion.div
      className={`relative w-full overflow-hidden bg-secondary rounded-xl shadow-lg ${
        expanded ? 'h-auto' : 'aspect-[2/3]'
      }`}
      ref={cardRef}
      style={getCardStyle()}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => setExpanded(!expanded)}
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

      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backdropUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>
      
      <div className="relative z-2 h-full flex flex-col">
        {/* Movie poster and title */}
        <div className="p-4 flex">
          <div className="w-1/3 rounded-lg overflow-hidden shadow-lg">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-poster.jpg';
              }}
            />
          </div>
          
          <div className="ml-3 flex-grow">
            <h2 className="text-xl font-bold text-white line-clamp-2">{movie.title}</h2>
            
            <div className="flex items-center mt-1 text-sm text-gray-300">
              <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
              
              {movie.runtime && (
                <>
                  <span className="mx-2">•</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </>
              )}
            </div>
            
            <div className="mt-2 flex items-center bg-accent/30 w-fit px-2 py-1 rounded-md">
              <FaHeart className="text-red-500 mr-1 text-xs" />
              <span className="text-white text-sm">{movie.vote_average?.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        {/* Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="px-4 -mt-1">
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="text-xs bg-secondary-light/50 backdrop-blur-sm text-gray-300 px-2 py-0.5 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Movie description */}
        <div className="px-4 pt-2 flex-grow">
          <p className={`text-gray-300 text-sm ${expanded ? '' : 'line-clamp-3'}`}>
            {movie.overview}
          </p>
          
          {!expanded && movie.overview && movie.overview.length > 150 && (
            <button 
              className="text-primary text-xs mt-1"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
            >
              Show more
            </button>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              className="bg-secondary-light w-8 h-8 rounded-full flex items-center justify-center text-white"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(movie);
              }}
            >
              <FaInfoCircle />
            </button>
            
            <Link
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary-light w-8 h-8 rounded-full flex items-center justify-center text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <FaPlay />
            </Link>
            
            <button
              className="bg-secondary-light w-8 h-8 rounded-full flex items-center justify-center text-white"
              onClick={handleAddToWatchlist}
            >
              <FaBookmark />
            </button>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDislike(movie);
              }}
            >
              <FaTimes className="text-white text-xl" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onLike(movie);
              }}
            >
              <FaHeart className="text-white text-xl" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function RecommendationSwiper({ movies, onLike, onDislike, onLoadMore }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  
  // Go to movie details
  const handleShowDetails = (movie) => {
    router.push(`/movie/${movie.id}`);
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
  
  // Go to next movie
  const nextMovie = () => {
    if (currentIndex >= movies.length - 1) {
      // We're at the end - load more movies
      if (onLoadMore) onLoadMore();
      
      // Reset index if we're at the end
      setCurrentIndex(0);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Loading state
  if (!movies || movies.length === 0) {
    return (
      <div className="w-full aspect-[2/3] bg-secondary/50 rounded-xl flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full mx-auto max-w-md">
      <div className="relative aspect-[2/3]">
        {/* Display multiple cards stacked */}
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
                onShowDetails={handleShowDetails}
                isVisible={index === 0}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile action buttons - only shown on smaller screens */}
      <div className="flex justify-center mt-6 md:hidden">
        <div className="flex space-x-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            onClick={() => handleDislike(movies[currentIndex])}
          >
            <FaTimes className="text-white text-2xl" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-secondary-light w-12 h-12 rounded-full flex items-center justify-center shadow-lg mt-2"
            onClick={() => handleShowDetails(movies[currentIndex])}
          >
            <FaInfoCircle className="text-white text-xl" />
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
      
      {/* Progress indicator */}
      <div className="mt-6 flex justify-center">
        <div className="flex space-x-1">
          {movies.slice(0, Math.min(movies.length, 10)).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx === currentIndex % 10 ? 'bg-primary' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}