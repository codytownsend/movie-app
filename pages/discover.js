import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FaHeart, FaTimes, FaBookmark, FaFilter, FaStar, FaChevronDown, FaPlay, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import { getAllMovies, filterMovies } from '../utils/movieService';
import Link from 'next/link';

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

// Movie card that can be swiped
const SwipeableCard = ({ movie, onSwipeLeft, onSwipeRight, onBookmark, onShowDetails }) => {
  const startX = useRef(0);
  const currentX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [showOverlay, setShowOverlay] = useState(false);
  const cardRef = useRef(null);
  const backdropUrl = `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  
  // Reset position when new movie is provided
  useEffect(() => {
    setOffset(0);
    setRotation(0);
    setOpacity(1);
    setShowOverlay(false);
  }, [movie]);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
  };

  const handleTouchMove = (e) => {
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    setOffset(diff);
    
    // Add some rotation for a more natural feel
    setRotation(diff / 20);
    
    // Change opacity based on swipe distance
    const absOffset = Math.abs(diff);
    if (absOffset > 20) {
      setShowOverlay(true);
      if (diff < 0) {
        // Swiping left - dislike
        setOpacity(1 - Math.min(absOffset / 200, 0.5));
      } else {
        // Swiping right - like
        setOpacity(1 - Math.min(absOffset / 200, 0.5));
      }
    } else {
      setShowOverlay(false);
    }
  };

  const handleTouchEnd = () => {
    const diff = currentX.current - startX.current;
    const threshold = window.innerWidth * 0.3; // 30% of screen width
    
    if (diff < -threshold) {
      // Swiped left - dislike
      onSwipeLeft();
    } else if (diff > threshold) {
      // Swiped right - like
      onSwipeRight();
    } else {
      // Reset position if not swiped enough
      setOffset(0);
      setRotation(0);
      setOpacity(1);
      setShowOverlay(false);
    }
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
  
  return (
    <div 
      ref={cardRef}
      className="absolute inset-0 touch-none transition-all duration-300 ease-out will-change-transform"
      style={{ 
        transform: `translateX(${offset}px) rotate(${rotation}deg)`,
        opacity: opacity
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full overflow-hidden rounded-xl bg-secondary shadow-xl">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backdropUrl || posterUrl})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
        
        {/* Left/right swipe overlays */}
        {showOverlay && offset < 0 && (
          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
            <div className="bg-red-500 rounded-full p-4">
              <FaTimes className="text-white text-4xl" />
            </div>
          </div>
        )}
        
        {showOverlay && offset > 0 && (
          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
            <div className="bg-green-500 rounded-full p-4">
              <FaHeart className="text-white text-4xl" />
            </div>
          </div>
        )}
        
        {/* Movie poster */}
        <div className="absolute top-4 left-4 w-1/3 max-w-[150px] rounded-lg overflow-hidden shadow-2xl">
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
        
        {/* Movie rating */}
        <div className="absolute top-4 right-4 bg-accent/90 rounded-full py-1 px-3 flex items-center">
          <FaStar className="text-yellow-400 mr-1" />
          <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
        </div>
        
        {/* Movie info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
          
          <div className="flex items-center mb-4 text-sm text-white/80">
            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
            {movie.runtime && (
              <>
                <span className="mx-2">•</span>
                <span>{formatRuntime(movie.runtime)}</span>
              </>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>{movie.genres.slice(0, 3).join(', ')}</span>
              </>
            )}
          </div>
          
          <p className="text-white/90 mb-6 line-clamp-3">{movie.overview}</p>
          
          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDetails();
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition"
                aria-label="View movie details"
              >
                <FaInfoCircle />
              </button>
              <Link
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                aria-label="Watch trailer"
              >
                <FaPlay />
              </Link>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark();
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition"
                aria-label="Add to watchlist"
              >
                <FaBookmark />
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={onSwipeLeft}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition transform hover:scale-105"
                aria-label="Skip movie"
              >
                <FaTimes className="text-xl" />
              </button>
              <button 
                onClick={onSwipeRight}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition transform hover:scale-105"
                aria-label="Like movie"
              >
                <FaHeart className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Discover() {
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
  
  // Fetch movies based on mood, decade and filters
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
  
  // Handle swipe left (dislike)
  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < movies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // In a real app, you'd log this dislike to the user's preferences
    } else {
      // End of movies, could fetch more or show a message
      setMovies([]);
      setIsLoading(true);
      // Fetch more movies
      setTimeout(() => {
        // This would be a real API call in production
        getAllMovies().then(newMovies => {
          setMovies(newMovies);
          setCurrentIndex(0);
          setIsLoading(false);
        });
      }, 1000);
    }
  }, [currentIndex, movies]);
  
  // Handle swipe right (like)
  const handleSwipeRight = useCallback(() => {
    if (currentIndex < movies.length - 1) {
      // In a real app, you'd log this like to the user's preferences
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of movies, could fetch more or show a message
      setMovies([]);
      setIsLoading(true);
      // Fetch more movies
      setTimeout(() => {
        // This would be a real API call in production
        getAllMovies().then(newMovies => {
          setMovies(newMovies);
          setCurrentIndex(0);
          setIsLoading(false);
        });
      }, 1000);
    }
  }, [currentIndex, movies]);
  
  // Handle bookmark
  const handleBookmark = useCallback(() => {
    // In a real app, you'd add this movie to the user's watchlist
    // For now, just show feedback
    alert(`Added ${currentMovie.title} to your watchlist!`);
  }, [currentMovie]);
  
  // Handle view details
  const handleViewDetails = useCallback(() => {
    if (!currentMovie) return;
    router.push(`/movie/${currentMovie.id}`);
  }, [currentMovie, router]);
  
  // Choose "For You" option (profile-based)
  const selectForYou = () => {
    setSelectedMood(null); // No specific mood
    setShowSelectionScreen(false);
    
    // Update URL
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
      
      // Update URL
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
    
    // Update URL
    router.push({
      pathname: '/discover',
      query: { mood: 'decades', decade: decade.id }
    }, undefined, { shallow: true });
  };
  
  // Back from decade selection to mood selection
  const backToMoodSelection = () => {
    setSelectionStep(2);
    setSelectedDecade(null);
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
      <div className="mb-20 md:mb-10"> {/* Add margin at bottom for mobile navigation */}
        {/* Selection Screen */}
        {showSelectionScreen ? (
          <div className="h-[calc(100vh-180px)] flex flex-col">
            {selectionStep === 1 ? (
              /* Step 1: Initial Choice */
              <div className="flex-grow flex flex-col pt-8 px-4">
                <div className="mb-8">
                  <h1 className="text-white text-2xl font-medium mb-2">How would you like to discover?</h1>
                  <p className="text-gray-400 text-sm">Select an option to get personalized recommendations</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-w-sm w-full">
                  <button
                    onClick={selectForYou}
                    className="bg-primary text-black p-4 rounded-lg transition-all transform hover:scale-[1.02] flex items-center"
                  >
                    <div className="text-2xl mr-3">👤</div>
                    <div className="text-left">
                      <div className="font-medium">For You</div>
                      <div className="text-xs opacity-70">Based on your preferences and history</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={goToMoodSelection}
                    className="bg-secondary hover:bg-secondary-light text-white p-4 rounded-lg transition-all transform hover:scale-[1.02] flex items-center"
                  >
                    <div className="text-2xl mr-3">🎭</div>
                    <div className="text-left">
                      <div className="font-medium">By Mood</div>
                      <div className="text-xs opacity-70">Find movies for a specific mood or occasion</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : selectionStep === 2 ? (
              /* Step 2: Mood Selection */
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
                
                <h2 className="text-white text-xl font-medium mb-6">What are you in the mood for?</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => selectMood(mood)}
                      className="bg-secondary hover:bg-secondary-light text-white p-3 rounded-lg transition-all transform hover:scale-[1.02] flex flex-col items-center justify-center text-center h-32"
                    >
                      <div className="text-3xl mb-2">{mood.icon}</div>
                      <div className="font-medium">{mood.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{mood.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Step 3: Decade Selection */
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
                
                <h2 className="text-white text-xl font-medium mb-6">Select a Decade</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {decadeOptions.map((decade) => (
                    <button
                      key={decade.id}
                      onClick={() => selectDecade(decade)}
                      className="bg-secondary hover:bg-secondary-light text-white p-3 rounded-lg transition-all transform hover:scale-[1.02] flex flex-col items-center justify-center text-center h-32"
                    >
                      <div className="text-3xl mb-2">{decade.icon}</div>
                      <div className="font-medium">{decade.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{decade.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Swiper Screen */
          <div className="flex flex-col h-[calc(100vh-180px)]">
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
              
              <button
                onClick={() => setShowQuickFilters(!showQuickFilters)}
                className="text-gray-400 hover:text-white p-2 flex items-center transition-colors"
                aria-label="Toggle filters"
              >
                <FaFilter className={`${activeFilters.length > 0 ? 'text-primary' : ''}`} />
                {activeFilters.length > 0 && (
                  <span className="ml-1 text-xs bg-primary text-black rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>
            
            {/* Quick filters - slide down when active */}
            {showQuickFilters && (
              <div className="overflow-x-auto pb-2 px-4 transition-all">
                <div className="flex space-x-2 pb-2">
                  {quickFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => toggleQuickFilter(filter.id)}
                      className={`flex items-center px-3 py-1.5 rounded-full whitespace-nowrap transition ${
                        activeFilters.includes(filter.id)
                          ? 'bg-primary text-black'
                          : 'bg-secondary text-white hover:bg-secondary-light'
                      }`}
                    >
                      <span className="mr-1.5">{filter.icon}</span>
                      <span className="text-sm">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Swiper container */}
            <div className="flex-grow relative px-4 pb-4 mt-2">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/50 backdrop-blur-sm rounded-xl">
                  <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-white text-sm">Finding your perfect match...</p>
                </div>
              ) : movies.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary rounded-xl p-6 text-center">
                  <div className="text-3xl mb-4">😕</div>
                  <h3 className="text-lg font-medium text-white mb-2">No movies found</h3>
                  <p className="text-gray-400 text-sm mb-6">Try changing your filters or select a different mood</p>
                  <button
                    onClick={backToSelection}
                    className="px-4 py-2 bg-primary text-black rounded-full text-sm font-medium"
                  >
                    Change Selection
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Show current movie and next one if available */}
                  {currentMovie && (
                    <SwipeableCard 
                      movie={currentMovie}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onBookmark={handleBookmark}
                      onShowDetails={handleViewDetails}
                    />
                  )}
                  
                  {/* Show progress dots */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <div className="flex space-x-1 items-center">
                      {movies.slice(0, Math.min(5, movies.length)).map((_, index) => (
                        <div 
                          key={index} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            index === currentIndex % 5 ? 'bg-white' : 'bg-white/30'
                          }`}
                        ></div>
                      ))}
                      {movies.length > 5 && (
                        <div className="text-white/50 text-xs ml-2">
                          {currentIndex + 1}/{movies.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bottom action buttons - only on larger screens */}
            <div className="hidden md:flex justify-center space-x-6 p-4">
              <button 
                onClick={handleSwipeLeft}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-5 shadow-lg transition transform hover:scale-105"
                aria-label="Skip movie"
              >
                <FaTimes className="text-2xl" />
              </button>
              <button 
                onClick={handleBookmark}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-5 shadow-lg transition transform hover:scale-105"
                aria-label="Add to watchlist"
              >
                <FaBookmark className="text-2xl" />
              </button>
              <button 
                onClick={handleViewDetails}
                className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-5 shadow-lg transition transform hover:scale-105"
                aria-label="View movie details"
              >
                <FaInfoCircle className="text-2xl" />
              </button>
              <button 
                onClick={handleSwipeRight}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-5 shadow-lg transition transform hover:scale-105"
                aria-label="Like movie"
              >
                <FaHeart className="text-2xl" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}