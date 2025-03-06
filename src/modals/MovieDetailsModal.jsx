import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Share2, Bookmark, BookmarkCheck, Play, Star, Clock, Calendar, 
  MessageCircle, Eye, EyeOff, X, Plus, Send, Edit, ArrowRight, 
  Check, ChevronDown, ChevronUp, Camera, ThumbsUp
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MovieDetailsModal = ({ currentMovie, setShowDetails }) => {
  const { 
    colorScheme, 
    darkMode, 
    showToast, 
    watchlist, 
    setWatchlist
  } = useAppContext();

  // Local state
  const [activeTab, setActiveTab] = useState('about');
  const [userRating, setUserRating] = useState(
    currentMovie.userRating || (watchlist.find(m => m.id === currentMovie.id)?.userRating || 0)
  );
  const [userReview, setUserReview] = useState(
    currentMovie.userReview || (watchlist.find(m => m.id === currentMovie.id)?.userReview || '')
  );
  const [isInWatchlist, setIsInWatchlist] = useState(
    watchlist.some(movie => movie.id === currentMovie.id)
  );
  const [isWatched, setIsWatched] = useState(
    watchlist.find(m => m.id === currentMovie.id)?.watched || false
  );
  const [showRatingPanel, setShowRatingPanel] = useState(false);
  const [isFullDescription, setIsFullDescription] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [showReviewTab, setShowReviewTab] = useState(false);
  
  // Set modal to full height
  const modalHeight = 'calc(100vh - 60px)';
  
  const contentRef = useRef(null);
  const reviewInputRef = useRef(null);

  // Update states if watchlist changes
  useEffect(() => {
    setIsInWatchlist(watchlist.some(movie => movie.id === currentMovie.id));
    const watchlistMovie = watchlist.find(m => m.id === currentMovie.id);
    setIsWatched(watchlistMovie?.watched || false);
    setUserRating(watchlistMovie?.userRating || currentMovie.userRating || 0);
    setUserReview(watchlistMovie?.userReview || currentMovie.userReview || '');
  }, [watchlist, currentMovie]);

  // Focus review input when opening review form
  useEffect(() => {
    if (isWritingReview && reviewInputRef.current) {
      reviewInputRef.current.focus();
    }
  }, [isWritingReview]);

  // Handle adding/removing from watchlist
  const toggleWatchlist = () => {
    if (isInWatchlist) {
      setWatchlist(prev => prev.filter(movie => movie.id !== currentMovie.id));
      showToast("Removed from watchlist");
      setIsInWatchlist(false);
    } else {
      setWatchlist(prev => [...prev, { 
        ...currentMovie, 
        userRating,
        userReview,
        watched: isWatched
      }]);
      showToast("Added to watchlist");
      setIsInWatchlist(true);
    }
  };

  // Handle watched toggle
  const toggleWatched = () => {
    const newWatchedState = !isWatched;
    setIsWatched(newWatchedState);
    
    if (isInWatchlist) {
      setWatchlist(prev => 
        prev.map(movie => 
          movie.id === currentMovie.id 
            ? { ...movie, watched: newWatchedState }
            : movie
        )
      );
    } else {
      // Add to watchlist if not already in it
      setWatchlist(prev => [...prev, { 
        ...currentMovie, 
        userRating,
        userReview,
        watched: newWatchedState
      }]);
      setIsInWatchlist(true);
    }
    
    showToast(`Marked as ${newWatchedState ? 'watched' : 'unwatched'}`);
  };

  // Handle rating
  const handleRate = (rating) => {
    setUserRating(rating);
    
    if (isInWatchlist) {
      setWatchlist(prev => 
        prev.map(movie => 
          movie.id === currentMovie.id 
            ? { ...movie, userRating: rating, watched: true }
            : movie
        )
      );
    } else {
      // Add to watchlist if not already in it and set as watched
      setWatchlist(prev => [...prev, { 
        ...currentMovie, 
        userRating: rating,
        watched: true
      }]);
      setIsInWatchlist(true);
      setIsWatched(true);
    }
    
    showToast(`Rated ${rating} stars`);
  };

  // Handle submitting a review
  const handleSubmitReview = () => {
    if (!userReview.trim() && userRating === 0) {
      showToast("Please add a rating or review text");
      return;
    }
    
    // Update watchlist with review
    if (isInWatchlist) {
      setWatchlist(prev => 
        prev.map(movie => 
          movie.id === currentMovie.id 
            ? { 
                ...movie, 
                userReview, 
                userRating: userRating > 0 ? userRating : movie.userRating,
                watched: true
              }
            : movie
        )
      );
    } else {
      // Add to watchlist if not already in it
      setWatchlist(prev => [...prev, { 
        ...currentMovie, 
        userReview,
        userRating: userRating > 0 ? userRating : 0,
        watched: true
      }]);
      setIsInWatchlist(true);
      setIsWatched(true);
    }
    
    showToast("Review saved successfully!");
    setIsWritingReview(false);
    setShowReviewTab(false);
  };

  // Handle share
  const handleShare = () => {
    showToast("Share functionality coming soon!");
  };

  // Handle play trailer
  const handlePlayTrailer = () => {
    showToast("Opening trailer...");
    // In a real app, this would open the trailer URL
    if (currentMovie.trailerUrl) {
      window.open(currentMovie.trailerUrl, '_blank');
    }
  };

  // Format runtime to hours and minutes
  const formatRuntime = (runtime) => {
    if (!runtime) return currentMovie.duration || "N/A";
    
    // If runtime is already formatted (e.g., "2h 30m"), return as is
    if (typeof runtime === 'string' && runtime.includes('h')) {
      return runtime;
    }
    
    // Otherwise, format from minutes
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`.trim();
  };

  // Truncate text with "Read more"
  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    
    if (isFullDescription) return text;
    
    return (
      <>
        {text.substring(0, maxLength)}...
        <button 
          className="text-purple-500 font-medium ml-1"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullDescription(true);
          }}
        >
          Read more
        </button>
      </>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-75 backdrop-blur-sm flex items-end justify-center transition-all duration-300"
      onClick={() => setShowDetails(false)}
    >
      <div
        className={`${colorScheme.card} w-full max-w-md rounded-t-2xl shadow-2xl overflow-hidden transition-transform duration-300`}
        style={{ height: modalHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Draggable Header Bar */}
        <div className="w-full px-4 py-3">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto"></div>
        </div>
        
        <div className="relative h-full overflow-y-auto pb-8" ref={contentRef}>
          {/* Poster Backdrop with Gradient Overlay */}
          <div className={`relative h-56 md:h-64 overflow-hidden`}>
            <img 
              src={currentMovie.posterUrl} 
              alt={currentMovie.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90"></div>
            
            {/* Back Button and Actions */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
              <button 
                className="bg-black bg-opacity-60 backdrop-blur-sm rounded-full p-2 text-white"
                onClick={() => setShowDetails(false)}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex space-x-2">
                <button 
                  className="bg-black bg-opacity-60 backdrop-blur-sm rounded-full p-2 text-white"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                <button 
                  className={`rounded-full p-2 ${isInWatchlist ? 'bg-purple-500' : 'bg-black bg-opacity-60 backdrop-blur-sm'}`}
                  onClick={toggleWatchlist}
                >
                  {isInWatchlist ? (
                    <BookmarkCheck className="w-5 h-5 text-white" />
                  ) : (
                    <Bookmark className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Title and Play Button Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{currentMovie.title}</h2>
                <div className="flex items-center text-gray-300 text-sm">
                  <span>{currentMovie.year}</span>
                  {currentMovie.duration && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{formatRuntime(currentMovie.duration)}</span>
                    </>
                  )}
                </div>
              </div>
              
              <button 
                className="bg-red-600 rounded-full p-3 flex items-center justify-center shadow-lg transform transition hover:scale-105"
                onClick={handlePlayTrailer}
              >
                <Play className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Your Review Section - Prominent placement before tabs */}
          <div className="px-4 pt-4 pb-2">
            {userRating > 0 || userReview ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-xl relative overflow-hidden`}>
                <div className="absolute top-2 right-2 z-10">
                  <button
                    className="bg-gray-200 dark:bg-gray-700 rounded-full p-1"
                    onClick={() => setIsWritingReview(true)}
                  >
                    <Edit className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                <div className="mb-1">
                  <div className="flex items-center">
                    <span className={`font-medium ${colorScheme.text}`}>Your Review</span>
                    {userRating > 0 && (
                      <div className="flex ml-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${
                              star <= userRating
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300 dark:text-gray-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {userReview ? (
                    <p className={`mt-2 text-sm ${colorScheme.text}`}>
                      "{userReview}"
                    </p>
                  ) : (
                    <p className={`mt-1 text-sm ${colorScheme.textSecondary} italic`}>
                      You rated this {userRating}/5 stars
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <button
                className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-xl flex items-center justify-center text-sm font-medium text-purple-500 hover:bg-opacity-90 transition-colors`}
                onClick={() => setIsWritingReview(true)}
              >
                <Star className="w-4 h-4 mr-2" />
                Rate & Review
              </button>
            )}
          </div>
          
          {/* Content Tabs */}
          <div className="px-4 border-b border-gray-200 dark:border-gray-700 mt-2">
            <div className="flex -mb-px">
              <TabButton 
                label="About" 
                active={activeTab === 'about'} 
                onClick={() => setActiveTab('about')}
                colorScheme={colorScheme}
              />
              <TabButton 
                label="Cast" 
                active={activeTab === 'cast'} 
                onClick={() => setActiveTab('cast')}
                colorScheme={colorScheme}
              />
              <TabButton 
                label="Similar" 
                active={activeTab === 'similar'} 
                onClick={() => setActiveTab('similar')}
                colorScheme={colorScheme}
              />
              <TabButton 
                label="Watch" 
                active={activeTab === 'watch'} 
                onClick={() => setActiveTab('watch')}
                colorScheme={colorScheme}
              />
            </div>
          </div>
          
          {/* Action Buttons - Modern floating action buttons */}
          <div className="flex justify-center space-x-6 my-4">
            <ActionButton 
              icon={isWatched ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              label={isWatched ? "Unwatched" : "Watched"}
              onClick={toggleWatched}
              color={isWatched ? "green" : "default"}
              colorScheme={colorScheme}
              darkMode={darkMode}
            />
            
            <ActionButton 
              icon={<Star className="w-5 h-5" />}
              label="Rate"
              onClick={() => setIsWritingReview(true)}
              color={userRating > 0 ? "yellow" : "default"}
              colorScheme={colorScheme}
              darkMode={darkMode}
            />
          </div>
          
          {/* Tab Content */}
          <div className="px-4">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                {/* Ratings */}
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-2 mr-3`}>
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className={`text-xl font-bold ${colorScheme.text}`}>{currentMovie.rating}</span>
                        <span className={`text-sm ml-1 ${colorScheme.textSecondary}`}>/10</span>
                      </div>
                      <span className={`text-xs ${colorScheme.textSecondary}`}>IMDb Rating</span>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-xl`}>
                  <p className={`${colorScheme.text} text-sm leading-relaxed`}>
                    {truncateText(currentMovie.description, 200)}
                  </p>
                </div>
                
                {/* Details */}
                <div className="space-y-3">
                  {/* Director */}
                  {currentMovie.director && (
                    <DetailItem 
                      label="Director" 
                      value={currentMovie.director}
                      colorScheme={colorScheme}
                    />
                  )}
                  
                  {/* Genre */}
                  {currentMovie.genre && currentMovie.genre.length > 0 && (
                    <div>
                      <span className={`text-xs ${colorScheme.textSecondary}`}>Genres</span>
                      <div className="flex flex-wrap mt-1">
                        {currentMovie.genre.map((genre, idx) => (
                          <span 
                            key={idx}
                            className={`text-xs ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full px-3 py-1 mr-1 mb-1 ${colorScheme.text}`}
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Streaming Availability */}
                  {currentMovie.streamingOn && currentMovie.streamingOn.length > 0 && (
                    <div>
                      <span className={`text-xs ${colorScheme.textSecondary}`}>Available on</span>
                      <div className="flex flex-wrap mt-1">
                        {currentMovie.streamingOn.map((service, idx) => (
                          <span 
                            key={idx}
                            className={`text-xs ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full px-3 py-1 mr-1 mb-1 ${colorScheme.text}`}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Cast Tab */}
            {activeTab === 'cast' && (
              <div className="py-2">
                {currentMovie.cast && currentMovie.cast.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {currentMovie.cast.map((actor, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center mb-2`}>
                          <span className={`text-xl font-medium ${colorScheme.textSecondary}`}>
                            {actor.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className={`text-xs font-medium ${colorScheme.text} line-clamp-1`}>{actor}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-6 ${colorScheme.textSecondary}`}>
                    <p className="text-sm">Cast information not available</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Similar Movies Tab */}
            {activeTab === 'similar' && (
              <div className="py-2">
                {currentMovie.similarTo && currentMovie.similarTo.length > 0 ? (
                  <div className="space-y-3">
                    {/* This would use actual similar movies data */}
                    {currentMovie.similarTo.map((movieId) => {
                      // For this example, let's just use some placeholder data
                      const similarMovie = {
                        id: movieId,
                        title: `Similar Movie ${movieId}`,
                        year: 2020,
                        rating: 8.0 + (movieId % 10) / 10,
                        posterUrl: "https://placehold.co/500x750/png"
                      };
                      
                      return (
                        <div key={movieId} className="flex items-center">
                          <div className="w-16 h-24 rounded-md overflow-hidden mr-3">
                            <img 
                              src={similarMovie.posterUrl} 
                              alt={similarMovie.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${colorScheme.text}`}>{similarMovie.title}</h4>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{similarMovie.rating}</span>
                              <span className="mx-1">•</span>
                              <span className={`text-xs ${colorScheme.textSecondary}`}>{similarMovie.year}</span>
                            </div>
                          </div>
                          <button className={`${colorScheme.textSecondary} p-2`}>
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                    
                    <button className="w-full py-2 mt-2 flex items-center justify-center text-purple-500 font-medium">
                      <span>View More</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                ) : (
                  <div className={`text-center py-6 ${colorScheme.textSecondary}`}>
                    <p className="text-sm">No similar movies available</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Where to Watch Tab */}
            {activeTab === 'watch' && (
              <div className="py-2">
                {currentMovie.streamingOn && currentMovie.streamingOn.length > 0 ? (
                  <div className="space-y-4">
                    {/* Subscription Services */}
                    <div>
                      <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Subscription</h4>
                      {currentMovie.streamingOn.map((service, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between mb-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-lg`}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded bg-gray-300 flex items-center justify-center mr-3">
                              <span className="font-bold">{service.charAt(0)}</span>
                            </div>
                            <span className={colorScheme.text}>{service}</span>
                          </div>
                          <button className="text-purple-500 font-medium text-sm">Watch</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`text-center py-6 ${colorScheme.textSecondary}`}>
                    <p className="text-sm">No streaming information available</p>
                    <button className="mt-3 text-purple-500">Check for updates</button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Community Reviews Section */}
          <div className="mt-8 px-4">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setShowReviewTab(!showReviewTab)}
            >
              <h3 className={`font-medium ${colorScheme.text}`}>Community Reviews</h3>
              <div className={`p-1 ${colorScheme.textSecondary}`}>
                {showReviewTab ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            
            {showReviewTab && (
              <div className="mt-3 space-y-3 animate-fade-in">
                {/* Community reviews */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-xl mb-1`}>
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mr-2 flex-shrink-0">
                      <span>J</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className={`font-medium text-sm ${colorScheme.text}`}>John Doe</span>
                        <div className="flex ml-2">
                          {[1, 2, 3, 4, 5].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.round(4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${colorScheme.text}`}>
                        "This movie blew my mind. The plot twists keep you on the edge of your seat throughout!"
                      </p>
                      
                      <div className="flex items-center mt-2">
                        <button className="flex items-center text-xs text-purple-500">
                          <ThumbsUp className="w-3 h-3 mr-1" /> Helpful (14)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Example of another review */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-xl mb-1`}>
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white mr-2 flex-shrink-0">
                      <span>S</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className={`font-medium text-sm ${colorScheme.text}`}>Sarah Miller</span>
                        <div className="flex ml-2">
                          {[1, 2, 3, 4].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${colorScheme.text}`}>
                        "Great performances by the entire cast. The cinematography was beautiful though the pacing felt a bit slow at times."
                      </p>
                      
                      <div className="flex items-center mt-2">
                        <button className="flex items-center text-xs text-purple-500">
                          <ThumbsUp className="w-3 h-3 mr-1" /> Helpful (7)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-2 text-sm text-center text-purple-500 font-medium">
                  View all 24 reviews
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Review Modal - Appears on top when writing a review */}
      {isWritingReview && (
        <div 
          className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsWritingReview(false)}
        >
          <div 
            className={`${colorScheme.card} w-full max-w-md rounded-2xl shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${colorScheme.text}`}>Rate & Review</h3>
                <button onClick={() => setIsWritingReview(false)}>
                  <X className={`w-5 h-5 ${colorScheme.text}`} />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-col items-center">
                  <h4 className={`${colorScheme.text} mb-2`}>{currentMovie.title}</h4>
                  <div className="flex items-center justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button 
                        key={rating}
                        className="p-1 mx-1 transition-transform hover:scale-110"
                        onClick={() => setUserRating(rating)}
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            rating <= userRating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className={`text-sm ${colorScheme.textSecondary} mb-4`}>
                    {userRating > 0 
                      ? `You rated this ${userRating} out of 5 stars` 
                      : 'Tap a star to rate'}
                  </span>
                </div>
                
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-3`}>
                  <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                    Share your thoughts (optional)
                  </label>
                  <textarea
                    ref={reviewInputRef}
                    className={`w-full px-3 py-2 rounded-lg border ${colorScheme.border} bg-transparent ${colorScheme.text}`}
                    rows="4"
                    placeholder="What did you think about the movie?"
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className={`px-4 py-2 rounded-lg border ${colorScheme.border}`}
                  onClick={() => setIsWritingReview(false)}
                >
                  Cancel
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg ${
                    userRating > 0 || userReview.trim() 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={handleSubmitReview}
                  disabled={!(userRating > 0 || userReview.trim())}
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease forwards;
        }
        
        /* Hide scrollbar but allow scrolling */
        .overflow-y-auto {
          scrollbar-width: none; /* Firefox */
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          display: none; /* Chrome/Safari/Opera */
        }
      `}</style>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ label, active, onClick, colorScheme }) => (
  <button
    className={`px-4 py-2 font-medium text-sm relative ${
      active ? colorScheme.text : colorScheme.textSecondary
    }`}
    onClick={onClick}
  >
    {label}
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></span>
    )}
  </button>
);

// Action Button Component
const ActionButton = ({ icon, label, onClick, color = "default", colorScheme, darkMode }) => {
  let colorClasses = "";
  
  switch (color) {
    case "green":
      colorClasses = "text-green-500";
      break;
    case "yellow":
      colorClasses = "text-yellow-500";
      break;
    case "purple":
      colorClasses = "text-purple-500";
      break;
    default:
      colorClasses = colorScheme.text;
  }
  
  return (
    <button 
      className={`flex flex-col items-center px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
      onClick={onClick}
    >
      <div className={colorClasses}>{icon}</div>
      <span className={`text-xs mt-1 ${colorClasses}`}>{label}</span>
    </button>
  );
};

// Detail Item Component
const DetailItem = ({ label, value, colorScheme }) => (
  <div>
    <span className={`text-xs ${colorScheme.textSecondary}`}>{label}</span>
    <p className={`${colorScheme.text}`}>{value}</p>
  </div>
);

export default MovieDetailsModal;