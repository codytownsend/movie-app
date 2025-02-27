// components/RevampedRecommendation.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaInfo, 
  FaBookmark, 
  FaRegBookmark, 
  FaUndo, 
  FaChevronDown, 
  FaChevronUp,
  FaPlay,
  FaImdb,
  FaList
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { addToWatchlist, addMovieRating } from '../utils/firebase';

const RecommendationSwiper = ({ movies, onLike, onDislike, onLoadMore }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('');
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipedCards, setSwipedCards] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [similarMoviesVisible, setSimilarMoviesVisible] = useState(false);
  const cardRef = useRef(null);
  const { currentUser } = useAuth();
  const router = useRouter();
  
  // Reset when movies change
  useEffect(() => {
    setCurrentIndex(0);
    setSwipedCards([]);
    setDetailsExpanded(false);
    setSimilarMoviesVisible(false);
  }, [movies]);
  
  // Check if we need to load more movies
  useEffect(() => {
    if (currentIndex >= movies.length - 2 && onLoadMore) {
      onLoadMore();
    }
  }, [currentIndex, movies.length, onLoadMore]);
  
  // Handle touch/mouse start
  const handleStart = (clientX) => {
    if (isAnimating) return;
    setStartX(clientX);
    setIsSwiping(true);
  };
  
  // Handle touch/mouse move
  const handleMove = (clientX) => {
    if (!isSwiping || isAnimating || detailsExpanded) return;
    const diff = clientX - startX;
    setOffsetX(diff);
    
    // Determine direction of swipe
    if (diff > 50) {
      setDirection('right');
    } else if (diff < -50) {
      setDirection('left');
    } else {
      setDirection('');
    }
  };
  
  // Handle touch/mouse end
  const handleEnd = () => {
    if (!isSwiping || isAnimating || detailsExpanded) return;
    
    if (direction === 'right') {
      handleLike();
    } else if (direction === 'left') {
      handleDislike();
    } else {
      // Reset if not swiped far enough
      setOffsetX(0);
    }
    
    setIsSwiping(false);
  };
  
  // Touch event handlers
  const handleTouchStart = (e) => handleStart(e.touches[0].clientX);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleEnd();
  
  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (detailsExpanded) return;
    e.preventDefault();
    handleStart(e.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e) => {
    e.preventDefault();
    handleMove(e.clientX);
  };
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    handleEnd();
  };
  
  // Handle like action
  const handleLike = async () => {
    if (isAnimating || currentIndex >= movies.length) return;
    
    setIsAnimating(true);
    setDirection('right');
    setOffsetX(window.innerWidth);
    
    const currentMovie = movies[currentIndex];
    setSwipedCards([...swipedCards, { ...currentMovie, action: 'like' }]);
    
    // Call the like callback
    if (onLike) onLike(currentMovie);
    
    // Add rating to Firebase
    if (currentUser) {
      try {
        await addMovieRating(currentUser.uid, currentMovie.id, 5);
      } catch (error) {
        console.error('Error adding rating:', error);
      }
    }
    
    // Animate card off screen then reset
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setDirection('');
      setOffsetX(0);
      setIsAnimating(false);
      setDetailsExpanded(false);
      setSimilarMoviesVisible(false);
    }, 300);
  };
  
  // Handle dislike action
  const handleDislike = async () => {
    if (isAnimating || currentIndex >= movies.length) return;
    
    setIsAnimating(true);
    setDirection('left');
    setOffsetX(-window.innerWidth);
    
    const currentMovie = movies[currentIndex];
    setSwipedCards([...swipedCards, { ...currentMovie, action: 'dislike' }]);
    
    // Call the dislike callback
    if (onDislike) onDislike(currentMovie);
    
    // Add rating to Firebase (low rating for dislike)
    if (currentUser) {
      try {
        await addMovieRating(currentUser.uid, currentMovie.id, 1);
      } catch (error) {
        console.error('Error adding rating:', error);
      }
    }
    
    // Animate card off screen then reset
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setDirection('');
      setOffsetX(0);
      setIsAnimating(false);
      setDetailsExpanded(false);
      setSimilarMoviesVisible(false);
    }, 300);
  };
  
  // Handle undo action
  const handleUndo = () => {
    if (swipedCards.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    
    // Get the last swiped card
    const lastCard = swipedCards[swipedCards.length - 1];
    
    // Decrease current index
    setCurrentIndex(currentIndex - 1);
    
    // Remove the last card from swiped cards
    setSwipedCards(swipedCards.slice(0, -1));
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };
  
  // Handle adding to watchlist
  const handleWatchlist = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    const currentMovie = movies[currentIndex];
    setIsBookmarked(!isBookmarked);
    
    try {
      await addToWatchlist(currentUser.uid, currentMovie.id, currentMovie);
    } catch (error) {
      console.error('Error updating watchlist:', error);
      setIsBookmarked(isBookmarked); // Revert state if error
    }
  };
  
  // Handle view details
  const handleViewDetails = () => {
    if (currentIndex >= movies.length) return;
    router.push(`/movie/${movies[currentIndex].id}`);
  };
  
  // Toggle movie details panel
  const toggleDetails = (e) => {
    e.stopPropagation();
    setDetailsExpanded(!detailsExpanded);
  };
  
  // Toggle similar movies panel
  const toggleSimilarMovies = (e) => {
    e.stopPropagation();
    setSimilarMoviesVisible(!similarMoviesVisible);
  };
  
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-secondary/40 backdrop-blur-md rounded-xl p-8">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-center">Finding your perfect movies...</p>
      </div>
    );
  }
  
  if (currentIndex >= movies.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-secondary/40 backdrop-blur-md rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-4">That's all for now!</h3>
        <p className="text-white/80 text-center mb-6">
          We're curating more recommendations based on your preferences.
        </p>
        <button
          onClick={() => {
            if (onLoadMore) onLoadMore();
            setCurrentIndex(0);
          }}
          className="px-6 py-3 bg-primary text-background font-medium rounded-lg hover:bg-primary-dark transition transform hover:scale-105"
        >
          Discover More
        </button>
      </div>
    );
  }
  
  const currentMovie = movies[currentIndex];
  const backdropUrl = `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`;
  
  // Format movie runtime from minutes to hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Generate mock similar movies (in a real app, these would come from the API)
  const similarMovies = movies
    .filter(movie => movie.id !== currentMovie.id)
    .slice(0, 4);
  
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Progress indicator */}
      <div className="w-full flex space-x-1 mb-4">
        {movies.slice(0, Math.min(movies.length, 10)).map((_, index) => (
          <div 
            key={index} 
            className={`h-1 flex-1 rounded-full ${
              index < currentIndex ? 'bg-primary' : 
              index === currentIndex ? 'bg-primary/50' : 'bg-white/20'
            }`}
          ></div>
        ))}
      </div>
      
      {/* Main card container */}
      <div className="relative w-full h-[70vh] max-h-[600px] rounded-2xl overflow-hidden shadow-xl bg-secondary/20 backdrop-blur-md">
        {/* Swipeable card */}
        <motion.div 
          ref={cardRef}
          className={`absolute inset-0 ${detailsExpanded ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
          style={{
            x: offsetX,
            rotate: detailsExpanded ? 0 : offsetX / 20,
            transition: isSwiping ? 'none' : 'all 0.3s ease-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="relative w-full h-full overflow-hidden bg-background rounded-2xl">
            {/* Movie backdrop/poster */}
            <div className="absolute inset-0 transition-all duration-500 ease-in-out" style={{
              height: detailsExpanded ? '40%' : '100%'
            }}>
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out hover:scale-110" 
                style={{ backgroundImage: `url(${backdropUrl})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
            </div>
            
            {/* Like/Dislike indicators (only visible when swiping) */}
            <AnimatePresence>
              {direction === 'right' && (
                <motion.div 
                  className="absolute top-10 right-10 bg-green-500/80 text-white text-2xl font-bold py-2 px-4 rounded-lg transform rotate-12 backdrop-blur-sm z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  LIKE
                </motion.div>
              )}
              
              {direction === 'left' && (
                <motion.div 
                  className="absolute top-10 left-10 bg-red-500/80 text-white text-2xl font-bold py-2 px-4 rounded-lg transform -rotate-12 backdrop-blur-sm z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  SKIP
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Main content container */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              {/* Basic movie info (always visible) */}
              <div>
                <div className="flex items-end mb-4">
                  <div className={`w-28 h-40 rounded-lg overflow-hidden shadow-lg flex-shrink-0 mr-4 border-2 border-white/20 transition-all duration-500 ${detailsExpanded ? 'opacity-0' : 'opacity-100'}`}>
                    <img 
                      src={posterUrl} 
                      alt={currentMovie.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{currentMovie.title}</h2>
                    <div className="flex items-center text-sm text-white/80 mt-1 mb-2">
                      <span>{new Date(currentMovie.release_date).getFullYear()}</span>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{currentMovie.vote_average?.toFixed(1)}</span>
                      </div>
                      {currentMovie.runtime && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{formatRuntime(currentMovie.runtime)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {currentMovie.genres?.slice(0, 3).map((genre, index) => (
                        <span 
                          key={index} 
                          className="inline-block px-2 py-0.5 text-xs bg-primary/30 text-white backdrop-blur-md rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Brief overview (truncated when details not expanded) */}
                <div className={`relative overflow-hidden transition-all duration-300 ease-in-out ${detailsExpanded ? '' : 'max-h-16'}`}>
                  <p className="text-sm text-white/90">
                    {currentMovie.overview}
                  </p>
                </div>
                
                {/* Toggle details button */}
                <button 
                  onClick={toggleDetails}
                  className="mt-2 flex items-center text-xs text-primary hover:text-primary-light transition-colors"
                >
                  {detailsExpanded ? (
                    <>Show less <FaChevronUp className="ml-1" /></>
                  ) : (
                    <>Show more <FaChevronDown className="ml-1" /></>
                  )}
                </button>
              </div>
              
              {/* Expanded details section */}
              <AnimatePresence>
                {detailsExpanded && (
                  <motion.div 
                    className="mt-4 bg-secondary/60 backdrop-blur-sm rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {currentMovie.director && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400">Director</h4>
                          <p className="text-sm text-white">{currentMovie.director}</p>
                        </div>
                      )}
                      
                      {currentMovie.cast && currentMovie.cast[0] && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400">Starring</h4>
                          <p className="text-sm text-white">{currentMovie.cast.slice(0, 2).join(', ')}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* External links */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentMovie.title + ' trailer')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaPlay className="mr-1" />
                        Trailer
                      </a>
                      
                      <a 
                        href={`https://www.imdb.com/find?q=${encodeURIComponent(currentMovie.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaImdb className="mr-1" />
                        IMDb
                      </a>
                      
                      <button 
                        onClick={toggleSimilarMovies}
                        className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs"
                      >
                        <FaList className="mr-1" />
                        Similar
                      </button>
                    </div>
                    
                    {/* Similar movies section */}
                    <AnimatePresence>
                      {similarMoviesVisible && (
                        <motion.div 
                          className="mt-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4 className="text-sm font-semibold text-white mb-2">Similar Movies</h4>
                          <div className="flex overflow-x-auto pb-2 -mx-2 px-2">
                            {similarMovies.map((movie) => (
                              <div key={movie.id} className="flex-shrink-0 w-24 mr-2">
                                <div className="bg-secondary rounded-md overflow-hidden">
                                  <img 
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                                    alt={movie.title} 
                                    className="w-full h-36 object-cover"
                                  />
                                  <div className="p-1">
                                    <p className="text-xs text-white truncate">{movie.title}</p>
                                    <div className="flex items-center text-xs">
                                      <span className="text-yellow-500 mr-0.5">★</span>
                                      <span className="text-gray-400">{movie.vote_average?.toFixed(1)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Action buttons - fixed at bottom, separate from the card */}
      <div className="mt-6 flex justify-center items-center space-x-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDislike}
          disabled={isAnimating}
          className="w-14 h-14 rounded-full bg-background border-2 border-red-500 text-red-500 flex items-center justify-center text-xl shadow-lg transform transition hover:scale-110 hover:bg-red-500 hover:text-white disabled:opacity-50"
          aria-label="Skip"
        >
          <FaThumbsDown />
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleUndo}
          disabled={isAnimating || swipedCards.length === 0}
          className={`w-10 h-10 rounded-full bg-background/80 border border-blue-400 text-blue-400 flex items-center justify-center shadow-lg transform transition hover:scale-110 hover:bg-blue-400 hover:text-white ${
            swipedCards.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Undo"
        >
          <FaUndo />
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleViewDetails}
          disabled={isAnimating}
          className="w-10 h-10 rounded-full bg-background/80 border border-primary text-primary flex items-center justify-center shadow-lg transform transition hover:scale-110 hover:bg-primary hover:text-background"
          aria-label="View Details"
        >
          <FaInfo />
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleWatchlist}
          disabled={isAnimating}
          className="w-10 h-10 rounded-full bg-background/80 border border-yellow-400 text-yellow-400 flex items-center justify-center shadow-lg transform transition hover:scale-110 hover:bg-yellow-400 hover:text-background"
          aria-label={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          disabled={isAnimating}
          className="w-14 h-14 rounded-full bg-background border-2 border-green-500 text-green-500 flex items-center justify-center text-xl shadow-lg transform transition hover:scale-110 hover:bg-green-500 hover:text-white disabled:opacity-50"
          aria-label="Like"
        >
          <FaThumbsUp />
        </motion.button>
      </div>
      
      {/* Instructions */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-400">
          Swipe right to like, left to skip, or tap "Show more" for details
        </p>
      </div>
    </div>
  );
};

export default RecommendationSwiper;