import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FaHeart, FaTimes, FaBookmark, FaFilter, FaStar, FaPlay, FaInfoCircle, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import { getAllMovies, filterMovies } from '../utils/movieService';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { addToWatchlist } from '../utils/firebase';

// Mood options with friendly labels and icons
const moodOptions = [
  { id: 'feelgood', label: 'Feel-Good', icon: '😊', description: 'Uplifting and light-hearted films' },
  { id: 'date', label: 'Date Night', icon: '💕', description: 'Perfect for a romantic evening' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Films everyone can enjoy together' },
  { id: 'classics', label: 'Classics', icon: '🏆', description: 'Timeless masterpieces' },
  { id: 'recent', label: 'New Releases', icon: '🆕', description: 'The latest films' },
  { id: 'decades', label: 'By Decade', icon: '🕰️', description: 'Films from specific time periods' },
];

// Decade options for the decade selection step
const decadeOptions = [
  { id: '2020s', label: '2020s', icon: '📱', description: 'Films from the current decade' },
  { id: '2010s', label: '2010s', icon: '🤳', description: 'Films from the 2010s' },
  { id: '2000s', label: '2000s', icon: '💿', description: 'Films from the 2000s' },
  { id: '1990s', label: '1990s', icon: '📼', description: 'Films from the 1990s' },
  { id: '1980s', label: '1980s', icon: '📟', description: 'Films from the 1980s' },
  { id: '1970s', label: '1970s', icon: '🕰️', description: 'Films from the 1970s' },
  { id: 'older', label: 'Classic Era', icon: '🎞️', description: 'Films from before 1970' },
];

// Quick filter options
const quickFilters = [
  { id: 'action', label: 'Action', icon: '💥' },
  { id: '90s', label: '90s', icon: '📼' },
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'scifi', label: 'Sci-Fi', icon: '🚀' },
  { id: 'christmas', label: 'Holiday', icon: '🎄' },
  { id: 'international', label: 'International', icon: '🌍' },
];

// Movie card component with swipe functionality
const MovieCard = ({ movie, onLike, onDislike, onBookmark, onViewDetails, isActive }) => {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);

  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const backdropUrl = `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`;
  
  // Format runtime from minutes to hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 
      ? `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`
      : `${remainingMinutes}m`;
  };
  
  // Reset on movie change
  useEffect(() => {
    setIsExpanded(false);
    setOffsetX(0);
    setDirection(null);
  }, [movie]);

  // Handle card click to expand/collapse
  const handleCardClick = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(false);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!isActive) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;
    
    // Determine if this is a horizontal swipe or vertical scroll
    if (!isDragging) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        setIsDragging(true);
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        return; // This is a scroll, not a swipe
      }
    }
    
    if (isDragging) {
      setOffsetX(deltaX);
      
      // Determine swipe direction for visual feedback
      if (deltaX > 50) {
        setDirection('right');
      } else if (deltaX < -50) {
        setDirection('left');
      } else {
        setDirection(null);
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isActive || !isDragging) return;
    
    if (offsetX > 100) {
      // Swipe right - like
      onLike(movie);
    } else if (offsetX < -100) {
      // Swipe left - dislike
      onDislike(movie);
    }
    
    // Reset
    setOffsetX(0);
    setIsDragging(false);
    setDirection(null);
  };

  // Calculate card style based on swipe and active state
  const getCardStyle = () => {
    if (!isActive) {
      return {
        transform: 'scale(0.95) translateY(10px)',
        opacity: 0.7, 
        filter: 'blur(1px)',
        pointerEvents: 'none'
      };
    }
    
    if (isDragging) {
      const rotate = offsetX * 0.05;
      const scale = 1 - Math.abs(offsetX) * 0.001;
      return {
        transform: `translateX(${offsetX}px) rotate(${rotate}deg) scale(${scale})`,
        transition: 'none'
      };
    }
    
    return {
      transform: 'translateX(0) rotate(0) scale(1)',
      transition: 'transform 0.3s ease-out'
    };
  };

  // Generate swipe direction overlay styles
  const getOverlayStyle = () => {
    if (direction === 'right') {
      return {
        background: 'linear-gradient(to right, rgba(16, 185, 129, 0.2), transparent)'
      };
    } else if (direction === 'left') {
      return {
        background: 'linear-gradient(to left, rgba(239, 68, 68, 0.2), transparent)'
      };
    }
    return { background: 'none' };
  };

  return (
    <motion.div 
      className={`relative w-full rounded-xl overflow-hidden bg-secondary shadow-xl ${
        isExpanded ? 'h-auto max-h-[85vh] overflow-y-auto' : 'aspect-[3/4.5]'
      }`}
      style={getCardStyle()}
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCardClick}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      {/* Swipe direction indicator overlay */}
      {direction && (
        <div 
          className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
          style={getOverlayStyle()}
        >
          {direction === 'right' && (
            <div className="bg-green-500 rounded-full p-4 bg-opacity-80">
              <FaHeart className="text-white text-3xl" />
            </div>
          )}
          {direction === 'left' && (
            <div className="bg-red-500 rounded-full p-4 bg-opacity-80">
              <FaTimes className="text-white text-3xl" />
            </div>
          )}
        </div>
      )}

      {/* Card background */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${movie.backdrop_path ? backdropUrl : posterUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent"></div>
      </div>

      {/* Card content */}
      <div className="relative h-full flex flex-col">
        {/* Top part with poster and basic info */}
        <div className="flex items-start p-4">
          <div className="w-1/3 max-w-[120px] rounded-lg overflow-hidden shadow-lg">
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
            
            <div className="flex items-center mt-1 mb-2 text-sm text-white/80">
              <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
              {movie.runtime && (
                <>
                  <span className="mx-2">•</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </>
              )}
            </div>
            
            {/* Rating */}
            <div className="inline-flex items-center px-2 py-1 bg-accent/20 rounded-md">
              <FaStar className="text-yellow-400 mr-1" />
              <span className="font-medium text-white">{movie.vote_average?.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        {/* Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 3).map((genre, index) => (
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
        
        {/* Overview - expandable */}
        <div className="px-4 flex-grow overflow-hidden">
          <p className={`text-white/80 text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
            {movie.overview}
          </p>
          
          {/* Expand indicator */}
          {!isExpanded && movie.overview && movie.overview.length > 150 && (
            <div className="text-center mt-1 text-primary text-xs font-medium">
              Tap for more
            </div>
          )}
          
          {/* Additional details when expanded */}
          {isExpanded && (
            <div className="mt-4 space-y-3">
              {movie.director && (
                <div>
                  <h4 className="text-sm font-medium text-white/90">Director</h4>
                  <p className="text-sm text-white/70">{movie.director}</p>
                </div>
              )}
              
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white/90">Cast</h4>
                  <p className="text-sm text-white/70">{movie.cast.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="p-4 flex justify-between items-center mt-auto">
          <div className="flex space-x-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(movie);
              }}
              className="relative overflow-hidden bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
              aria-label="View details"
            >
              <div className="relative z-10">
                <FaInfoCircle />
              </div>
            </button>
            
            <Link
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
              className="relative overflow-hidden bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              aria-label="Watch trailer"
            >
              <div className="relative z-10">
                <FaPlay />
              </div>
            </Link>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(movie);
              }}
              className="relative overflow-hidden bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
              aria-label="Save to watchlist"
            >
              <div className="relative z-10">
                <FaBookmark />
              </div>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDislike(movie);
              }}
              className="relative overflow-hidden bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center w-12 h-12 transition transform hover:scale-105 shadow-lg"
              aria-label="Skip movie"
            >
              <FaTimes className="text-lg" />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onLike(movie);
              }}
              className="relative overflow-hidden bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center w-12 h-12 transition transform hover:scale-105 shadow-lg"
              aria-label="Like movie"
            >
              <FaHeart className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function MobileDiscoverPage() {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionStep, setSelectionStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedDecade, setSelectedDecade] = useState(null);
  const [showSelectionScreen, setShowSelectionScreen] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const [isWatchlistUpdating, setIsWatchlistUpdating] = useState(false);
  
  // Get current movie
  const currentMovie = movies[currentIndex];
  
  // Initialize from query parameters
  useEffect(() => {
    if (!router.isReady) return;
    
    const { mood, decade, filters } = router.query;
    
    if (mood) {
      const validMood = moodOptions.find(m => m.id === mood);
      if (validMood) {
        setSelectedMood(validMood);
        
        if (mood === 'decades' && decade) {
          const validDecade = decadeOptions.find(d => d.id === decade);
          if (validDecade) {
            setSelectedDecade(validDecade);
            setShowSelectionScreen(false);
          } else {
            setSelectionStep(3); // Show decade selection
          }
        } else {
          setShowSelectionScreen(false);
        }
      }
    }
    
    if (filters) {
      try {
        const parsedFilters = filters.split(',');
        setActiveFilters(parsedFilters);
      } catch (error) {
        console.error('Error parsing filters:', error);
      }
    }
  }, [router.isReady, router.query]);
  
  // Fetch movies based on criteria
  useEffect(() => {
    const fetchMovies = async () => {
      if (showSelectionScreen) return; // Don't fetch if we're still on selection screen
      
      setIsLoading(true);
      
      try {
        // Convert mood and filters to API parameters
        const params = {};
        
        // Apply mood parameters
        if (selectedMood) {
          switch (selectedMood.id) {
            case 'feelgood':
              params.genres = ['Comedy', 'Family', 'Adventure'];
              params.mood = 'Feel-Good';
              break;
            case 'date':
              params.genres = ['Romance', 'Drama', 'Comedy'];
              break;
            case 'family':
              params.genres = ['Family', 'Animation', 'Adventure'];
              break;
            case 'classics':
              params.voteAverageGte = 8;
              params.decades = ['1990s', '1980s', '1970s', 'Older'];
              break;
            case 'recent':
              params.releaseYearGte = new Date().getFullYear() - 1;
              break;
            case 'decades':
              // Apply selected decade
              if (selectedDecade) {
                params.decades = [selectedDecade.id];
              }
              break;
          }
        } else {
          // Use user profile preferences if available (for "For You" selection)
          if (userProfile?.preferences) {
            params.genres = userProfile.preferences.genres || [];
            params.decades = userProfile.preferences.decades || [];
            params.moods = userProfile.preferences.moods || [];
          }
        }
        
        // Apply quick filters
        if (activeFilters.includes('action')) {
          params.genres = [...(params.genres || []), 'Action'];
        }
        if (activeFilters.includes('comedy')) {
          params.genres = [...(params.genres || []), 'Comedy'];
        }
        if (activeFilters.includes('scifi')) {
          params.genres = [...(params.genres || []), 'Science Fiction'];
        }
        if (activeFilters.includes('90s')) {
          params.decades = [...(params.decades || []), '1990s'];
        }
        if (activeFilters.includes('christmas')) {
          params.keywords = [...(params.keywords || []), 'christmas', 'holiday'];
        }
        if (activeFilters.includes('international')) {
          params.includeInternational = true;
        }
        
        // Fetch movies with params
        let moviesData;
        if (Object.keys(params).length > 0) {
          moviesData = await filterMovies(params);
        } else {
          moviesData = await getAllMovies();
        }
        
        setMovies(moviesData);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, [selectedMood, selectedDecade, activeFilters, userProfile, showSelectionScreen]);
  
  // Handle movie like
  const handleLike = useCallback((movie) => {
    if (currentIndex < movies.length - 1) {
      // In a real application, you would log this like to the recommendation engine
      // to improve future recommendations
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of current batch, load more
      setMovies([]);
      setIsLoading(true);
      getAllMovies().then(newMovies => {
        setMovies(newMovies);
        setCurrentIndex(0);
        setIsLoading(false);
      });
    }
  }, [currentIndex, movies]);
  
  // Handle movie dislike
  const handleDislike = useCallback((movie) => {
    if (currentIndex < movies.length - 1) {
      // In a real application, you would log this dislike to the recommendation engine
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of current batch, load more
      setMovies([]);
      setIsLoading(true);
      getAllMovies().then(newMovies => {
        setMovies(newMovies);
        setCurrentIndex(0);
        setIsLoading(false);
      });
    }
  }, [currentIndex, movies]);
  
  // Handle adding movie to watchlist
  const handleBookmark = useCallback(async (movie) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    if (isWatchlistUpdating) return;
    
    try {
      setIsWatchlistUpdating(true);
      await addToWatchlist(currentUser.uid, movie.id, movie);
      
      // Show feedback toast (in a real app)
      // toast.success(`Added ${movie.title} to your watchlist`);
      
    } catch (error) {
      console.error('Error updating watchlist:', error);
      // toast.error('Failed to update watchlist');
    } finally {
      setIsWatchlistUpdating(false);
    }
  }, [currentUser, router, isWatchlistUpdating]);
  
  // Handle viewing movie details
  const handleViewDetails = useCallback((movie) => {
    router.push(`/movie/${movie.id}`);
  }, [router]);
  
  // Choose "For You" option
  const selectForYou = () => {
    setSelectedMood(null);
    setShowSelectionScreen(false);
    
    router.push({
      pathname: '/discover',
    }, undefined, { shallow: true });
  };
  
  // Go to mood selection
  const goToMoodSelection = () => {
    setSelectionStep(2);
  };
  
  // Select a specific mood
  const selectMood = (mood) => {
    setSelectedMood(mood);
    
    // If "By Decade" is selected, show decade selection step
    if (mood.id === 'decades') {
      setSelectionStep(3);
    } else {
      setShowSelectionScreen(false);
      
      router.push({
        pathname: '/discover',
        query: { mood: mood.id }
      }, undefined, { shallow: true });
    }
  };
  
  // Select a specific decade
  const selectDecade = (decade) => {
    setSelectedDecade(decade);
    setShowSelectionScreen(false);
    
    router.push({
      pathname: '/discover',
      query: { mood: 'decades', decade: decade.id }
    }, undefined, { shallow: true });
  };
  
  // Back to selection screen from swiper
  const backToSelection = () => {
    setShowSelectionScreen(true);
    setSelectionStep(1);
  };
  
  // Back from mood selection to initial choice
  const backToInitialStep = () => {
    setSelectionStep(1);
  };
  
  // Back from decade selection to mood selection
  const backToMoodSelection = () => {
    setSelectionStep(2);
    setSelectedDecade(null);
  };
  
  // Toggle a quick filter
  const toggleQuickFilter = (filterId) => {
    setActiveFilters(prev => {
      const newFilters = prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId];
      
      // Update URL
      const query = { ...router.query };
      if (newFilters.length > 0) {
        query.filters = newFilters.join(',');
      } else {
        delete query.filters;
      }
      
      router.push({
        pathname: '/discover',
        query
      }, undefined, { shallow: true });
      
      return newFilters;
    });
  };
  
  return (
    <Layout>
      {/* Main container with extra space for mobile navbar */}
      <div className="pb-20 md:pb-8">
        {/* Selection Screen */}
        {showSelectionScreen ? (
          <div className="min-h-[calc(100vh-200px)] flex flex-col">
            {selectionStep === 1 ? (
            <div className="flex-grow flex flex-col items-center pt-6 px-4">
              <div className="mb-6 text-center">
                <h1 className="text-white text-2xl font-bold mb-2">Discover Movies</h1>
                <p className="text-gray-400 text-sm">What would you like to watch today?</p>
              </div>
              
              <div className="w-full max-w-md space-y-6">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={selectForYou}
                  className="w-full bg-gradient-to-r from-primary to-accent p-6 rounded-2xl transition-all transform shadow-lg hover:shadow-glow-primary"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                      <div className="text-3xl">👤</div>
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl font-bold text-black mb-1">For You</h2>
                      <p className="text-black/80 text-sm">Personalized recommendations based on your preferences and viewing history</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goToMoodSelection}
                  className="w-full bg-secondary hover:bg-secondary-light p-6 rounded-2xl transition-all transform shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 backdrop-blur-sm p-4 rounded-full">
                      <div className="text-3xl">🎭</div>
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl font-bold text-white mb-1">By Mood</h2>
                      <p className="text-gray-300 text-sm">Find the perfect movie for your current mood or occasion</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : selectionStep === 2 ? (
              /* Mood Selection */
              <div className="flex-grow flex flex-col px-4 pt-4">
                <div className="mb-6">
                  <button 
                    onClick={backToInitialStep}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <FaArrowLeft className="mr-2" />
                    <span>Back</span>
                  </button>
                </div>
                
                <h2 className="text-white text-xl font-bold mb-6">What are you in the mood for?</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {moodOptions.map((mood) => (
                    <motion.button
                      key={mood.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectMood(mood)}
                      className="bg-secondary hover:bg-secondary-light text-white p-3 rounded-xl transition shadow-md hover:shadow-lg flex flex-col items-center justify-center text-center h-32"
                    >
                      <div className="text-3xl mb-2">{mood.icon}</div>
                      <div className="font-medium">{mood.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{mood.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              /* Decade Selection */
              <div className="flex-grow flex flex-col px-4 pt-4">
                <div className="mb-6">
                  <button 
                    onClick={backToMoodSelection}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <FaArrowLeft className="mr-2" />
                    <span>Back to Moods</span>
                  </button>
                </div>
                
                <h2 className="text-white text-xl font-bold mb-6">Select a Decade</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {decadeOptions.map((decade) => (
                    <motion.button
                      key={decade.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectDecade(decade)}
                      className="bg-secondary hover:bg-secondary-light text-white p-3 rounded-xl transition shadow-md hover:shadow-lg flex flex-col items-center justify-center text-center h-32"
                    >
                      <div className="text-3xl mb-2">{decade.icon}</div>
                      <div className="font-medium">{decade.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{decade.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Movie Discovery Screen */
          <div className="h-[calc(100vh-140px)] flex flex-col">
            {/* Top bar with back button and filters */}
            <div className="flex justify-between items-center py-3 px-4">
              <button 
                onClick={backToSelection}
                className="text-gray-400 hover:text-white p-2 -ml-2 flex items-center transition-colors"
                aria-label="Go back to selection"
              >
                <FaArrowLeft className="mr-2" />
                <span className="text-sm font-medium">
                  {selectedDecade 
                    ? `${selectedDecade.label}`
                    : selectedMood 
                      ? selectedMood.label 
                      : 'For You'}
                </span>
              </button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowQuickFilters(!showQuickFilters)}
                className="text-gray-400 hover:text-white p-2 flex items-center transition-colors relative"
                aria-label="Toggle filters"
              >
                <FaFilter className={activeFilters.length > 0 ? 'text-primary' : ''} />
                {activeFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-primary text-black text-xs rounded-full">
                    {activeFilters.length}
                  </span>
                )}
              </motion.button>
            </div>
            
            {/* Quick filters */}
            <AnimatePresence>
              {showQuickFilters && (
                <motion.div 
                  className="overflow-x-auto px-4 pb-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex space-x-2 py-2">
                    {quickFilters.map(filter => (
                      <motion.button
                        key={filter.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleQuickFilter(filter.id)}
                        className={`flex items-center px-3 py-1.5 rounded-full whitespace-nowrap transition shadow-sm ${
                          activeFilters.includes(filter.id)
                            ? 'bg-primary text-black'
                            : 'bg-secondary text-white hover:bg-secondary-light'
                        }`}
                      >
                        <span className="mr-1.5">{filter.icon}</span>
                        <span className="text-sm">{filter.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Movie card container */}
            <div className="flex-grow relative px-4 py-2">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/50 backdrop-blur-sm rounded-xl">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-white text-sm">Finding your perfect match...</p>
                </div>
              ) : movies.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="text-3xl mb-4">😕</div>
                  <h3 className="text-lg font-medium text-white mb-2">No movies found</h3>
                  <p className="text-gray-400 text-sm mb-6">Try changing your filters or select a different mood</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={backToSelection}
                    className="px-4 py-2 bg-primary text-black rounded-full text-sm font-medium"
                  >
                    Change Selection
                  </motion.button>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Stack of cards */}
                  <div className="w-full h-full relative">
                    {/* Next card (background) */}
                    {currentIndex < movies.length - 1 && (
                      <div className="absolute inset-0 z-0">
                        <MovieCard 
                          movie={movies[currentIndex + 1]}
                          onLike={() => {}}
                          onDislike={() => {}}
                          onBookmark={() => {}}
                          onViewDetails={() => {}}
                          isActive={false}
                        />
                      </div>
                    )}
                    
                    {/* Current card */}
                    {currentMovie && (
                      <div className="absolute inset-0 z-10">
                        <AnimatePresence mode="wait">
                          <MovieCard 
                            key={currentMovie.id}
                            movie={currentMovie}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onBookmark={handleBookmark}
                            onViewDetails={handleViewDetails}
                            isActive={true}
                          />
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-secondary/70 backdrop-blur-sm rounded-full py-1 px-2 flex items-center space-x-1">
                      {movies.slice(0, Math.min(5, movies.length)).map((_, index) => (
                        <div 
                          key={index} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            index === currentIndex % 5 ? 'bg-primary' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                      {movies.length > 5 && (
                        <div className="text-gray-300 text-xs ml-1">
                          {currentIndex + 1}/{movies.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}