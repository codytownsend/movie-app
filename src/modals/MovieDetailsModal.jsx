import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Check, Share2, Bookmark, BookmarkCheck, Play, Star, Clock, Calendar, 
  MessageCircle, Eye, EyeOff, X, ThumbsUp, Edit, Send, Trash2,
  ChevronDown, ChevronUp, Heart
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
  const [isFullDescription, setIsFullDescription] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [reviewDraft, setReviewDraft] = useState(userReview);
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const contentRef = useRef(null);
  const reviewInputRef = useRef(null);

  // Update states if watchlist changes
  useEffect(() => {
    setIsInWatchlist(watchlist.some(movie => movie.id === currentMovie.id));
    const watchlistMovie = watchlist.find(m => m.id === currentMovie.id);
    setIsWatched(watchlistMovie?.watched || false);
    setUserRating(watchlistMovie?.userRating || currentMovie.userRating || 0);
    setUserReview(watchlistMovie?.userReview || currentMovie.userReview || '');
    setReviewDraft(watchlistMovie?.userReview || currentMovie.userReview || '');
  }, [watchlist, currentMovie]);

  // Focus review input when opening review form
  useEffect(() => {
    if ((isWritingReview || editingReview) && reviewInputRef.current) {
      reviewInputRef.current.focus();
    }
  }, [isWritingReview, editingReview]);

  // Toggle watchlist status
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

  // Toggle watched status
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

  // Handle rating changes
  const handleRatingChange = (rating) => {
    // If clicking the same rating, clear it
    const newRating = rating === userRating ? 0 : rating;
    setUserRating(newRating);
    
    // Update the watchlist
    if (isInWatchlist) {
      setWatchlist(prev => 
        prev.map(movie => 
          movie.id === currentMovie.id 
            ? { ...movie, userRating: newRating, watched: newRating > 0 ? true : isWatched }
            : movie
        )
      );
    } else if (newRating > 0) {
      // Add to watchlist if there's a rating
      setWatchlist(prev => [...prev, { 
        ...currentMovie, 
        userRating: newRating,
        userReview,
        watched: true
      }]);
      setIsInWatchlist(true);
      setIsWatched(true);
    }
    
    if (newRating > 0) {
      showToast(`Rated ${newRating} stars`);
    } else {
      showToast("Rating removed");
    }
  };

  // Start writing a review
  const startWritingReview = () => {
    setIsWritingReview(true);
  };

  // Begin editing a review
  const startEditingReview = () => {
    setEditingReview(true);
    setReviewDraft(userReview);
  };

  // Submit a review
  const submitReview = () => {
    if (!reviewDraft.trim() && userRating === 0) {
      showToast("Please add a rating or review text");
      return;
    }
    
    // Local state update
    setUserReview(reviewDraft);
    
    // Update watchlist with review
    if (isInWatchlist) {
      setWatchlist(prev => 
        prev.map(movie => 
          movie.id === currentMovie.id 
            ? { 
                ...movie, 
                userReview: reviewDraft, 
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
        userReview: reviewDraft,
        userRating: userRating > 0 ? userRating : 0,
        watched: true
      }]);
      setIsInWatchlist(true);
      setIsWatched(true);
    }
    
    showToast("Review saved successfully!");
    setIsWritingReview(false);
    setEditingReview(false);
  };

  // Delete user review
  const deleteReview = () => {
    if (isInWatchlist) {
      setWatchlist(prev => 
        prev.map(movie => 
          movie.id === currentMovie.id 
            ? { ...movie, userReview: '' }
            : movie
        )
      );
    }
    setUserReview('');
    setReviewDraft('');
    setEditingReview(false);
    showToast("Review deleted");
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

  // Get the appropriate rating display text
  const getRatingText = (rating) => {
    if (rating >= 5) return "Excellent";
    if (rating >= 4) return "Very Good";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Fair";
    if (rating >= 1) return "Poor";
    return "Not Rated";
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end justify-center"
      onClick={() => setShowDetails(false)}
    >
      <div
        className={`${colorScheme.card} w-full max-w-md md:max-w-lg rounded-t-3xl overflow-hidden transition-all duration-300 shadow-2xl border border-gray-800/50`}
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull indicator */}
        <div className="w-full py-2 flex justify-center">
          <div className="w-10 h-1 bg-gray-500/40 rounded-full"></div>
        </div>
        
        <div className="h-[calc(92vh-10px)] overflow-y-auto scrollbar-hide" ref={contentRef}>
          {/* Movie Hero Section */}
          <div className="relative bg-gray-900">
            {/* Backdrop Image with Gradient Overlay */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={currentMovie.posterUrl} 
                alt="backdrop" 
                className="w-full h-full object-cover opacity-30" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/70"></div>
            </div>
            
            {/* Content with poster and details */}
            <div className="relative py-5 px-6 flex">
              {/* Movie Poster */}
              <div className="w-1/3 flex-shrink-0 mr-4">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg relative">
                  <img 
                    src={currentMovie.posterUrl} 
                    alt={currentMovie.title} 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Watch Status Badge */}
                  {isWatched && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Movie Details */}
              <div className="w-2/3 flex flex-col">
                <div className="flex justify-between items-start">
                  {/* Back button */}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-1.5 rounded-full bg-gray-800/90 hover:bg-gray-700/90 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-300" />
                  </button>
                  
                  {/* Action buttons */}
                  <div className="flex space-x-1.5">
                    <button
                      onClick={handleShare}
                      className="p-1.5 rounded-full bg-gray-800/90 hover:bg-gray-700/90 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                      onClick={toggleWatchlist}
                      className={`p-1.5 rounded-full ${isInWatchlist ? 'bg-purple-500 text-white' : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700/90'} transition-colors`}
                    >
                      {isInWatchlist ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Title and Year */}
                <div className="mt-2">
                  <h1 className="text-xl font-bold text-white leading-tight">{currentMovie.title}</h1>
                  <div className="flex items-center flex-wrap mt-1 mb-1.5">
                    <div className="flex items-center bg-yellow-500/90 rounded-md px-2 py-0.5 text-xs font-bold text-yellow-900">
                      <Star className="w-3 h-3 mr-0.5 fill-current" />
                      {currentMovie.rating}
                    </div>
                    
                    <span className="mx-2 text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{currentMovie.year}</span>
                    
                    {currentMovie.duration && (
                      <>
                        <span className="mx-2 text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{formatRuntime(currentMovie.duration)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Genre Pills */}
                {currentMovie.genre && currentMovie.genre.length > 0 && (
                  <div className="flex flex-wrap mb-2">
                    {currentMovie.genre.slice(0, 3).map((g, i) => (
                      <span 
                        key={i} 
                        className="text-[10px] bg-gray-800/90 text-gray-300 rounded-full px-2 py-0.5 mr-1 mb-1"
                      >
                        {g}
                      </span>
                    ))}
                    {currentMovie.genre.length > 3 && (
                      <span className="text-[10px] bg-gray-800/90 text-gray-300 rounded-full px-2 py-0.5 mb-1">
                        +{currentMovie.genre.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="mt-auto space-y-2">
                  <button
                    onClick={handlePlayTrailer}
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center shadow-sm transition-colors"
                  >
                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                    Watch Trailer
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleWatched}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                        isWatched 
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {isWatched ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Watched
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Mark Watched
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={startWritingReview}
                      className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-2 rounded-lg text-xs font-medium flex items-center justify-center transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
                      {userRating > 0 ? 'Edit Rating' : 'Rate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Review Summary (if exists) */}
          {(userRating > 0 || userReview) && (
            <div className="px-6 pt-4">
              <div className="bg-gray-800/60 rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex justify-between items-center border-b border-gray-700/20">
                  <h3 className="font-medium text-gray-200">Your Review</h3>
                  <button
                    onClick={startEditingReview}
                    className="text-purple-400 hover:text-purple-300 bg-purple-500/10 rounded-full p-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="p-4">
                  {/* Rating Stars */}
                  {userRating > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star}
                              className={`w-4 h-4 ${star <= userRating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs font-medium ${
                          userRating >= 4 ? 'text-green-400' : (userRating >= 3 ? 'text-yellow-400' : 'text-orange-400')
                        }`}>
                          {getRatingText(userRating)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Review Text or Prompt */}
                  {userReview ? (
                    <div className="bg-gray-700/40 p-3 rounded-lg">
                      <p className="text-gray-300 text-sm leading-relaxed">"{userReview}"</p>
                    </div>
                  ) : userRating > 0 ? (
                    <button
                      onClick={startWritingReview}
                      className="w-full text-center py-2 text-xs text-purple-400 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/5 transition-colors"
                    >
                      Add your thoughts about this movie
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
          
          {/* Tabs Navigation */}
          <div className="sticky top-0 z-10 px-4 border-b border-gray-800/30 bg-gray-900/95 backdrop-blur-md mt-4">
            <div className="flex">
              <TabButton 
                label="About" 
                active={activeTab === 'about'} 
                onClick={() => setActiveTab('about')}
              />
              <TabButton 
                label="Reviews" 
                active={activeTab === 'reviews'} 
                onClick={() => setActiveTab('reviews')}
              />
              <TabButton 
                label="Similar" 
                active={activeTab === 'similar'} 
                onClick={() => setActiveTab('similar')}
              />
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="px-6 py-5">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Synopsis */}
                <div className="bg-gray-800/60 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-300 mb-2">Synopsis</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {truncateText(currentMovie.description, 250)}
                    </p>
                  </div>
                </div>
                
                {/* Cast Section */}
                {currentMovie.cast && currentMovie.cast.length > 0 && (
                  <div className="bg-gray-800/60 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4">
                      <h3 className="font-medium text-gray-300 mb-3">Cast</h3>
                      
                      <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
                        {currentMovie.cast.map((actor, idx) => (
                          <div key={idx} className="flex-shrink-0 w-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center mb-2">
                              <span className="text-lg font-medium text-gray-200">
                                {actor.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-xs text-gray-300 line-clamp-2">{actor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Additional Details */}
                <div className="bg-gray-800/60 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-300 mb-3">Details</h3>
                    
                    <div className="space-y-3 text-sm">
                      {/* Director */}
                      {currentMovie.director && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Director</span>
                          <span className="text-gray-200 font-medium">{currentMovie.director}</span>
                        </div>
                      )}
                      
                      {/* Streaming Availability */}
                      {currentMovie.streamingOn && currentMovie.streamingOn.length > 0 && (
                        <div className="flex justify-between items-start">
                          <span className="text-gray-400">Available on</span>
                          <div className="flex flex-wrap justify-end max-w-[60%]">
                            {currentMovie.streamingOn.map((service, idx) => (
                              <div 
                                key={idx}
                                className="flex items-center bg-gray-700/80 rounded-full px-2 py-1 text-xs text-gray-200 ml-1 mb-1"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-400 mr-1.5"></span>
                                {service}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Runtime */}
                      {currentMovie.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Runtime</span>
                          <span className="text-gray-200 font-medium">{formatRuntime(currentMovie.duration)}</span>
                        </div>
                      )}
                      
                      {/* Year */}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Release Year</span>
                        <span className="text-gray-200 font-medium">{currentMovie.year}</span>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rating</span>
                        <div className="flex items-center">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current mr-1" />
                          <span className="text-gray-200 font-medium">{currentMovie.rating}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Write Review Button (if not reviewed yet) */}
                {!userRating && !userReview && (
                  <button
                    onClick={startWritingReview}
                    className="w-full bg-gray-800/60 hover:bg-gray-800/80 rounded-xl py-4 flex flex-col items-center justify-center transition-colors"
                  >
                    <div className="flex mb-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          className="w-5 h-5 text-gray-600"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-300">Write a Review</span>
                  </button>
                )}
                
                {/* Community Reviews */}
                <div className="bg-gray-800/60 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-700/20">
                    <h3 className="font-medium text-gray-300">Community Reviews</h3>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <ReviewCard 
                      avatar="J"
                      name="John Doe"
                      avatarGradient="from-purple-500 to-pink-500"
                      rating={4}
                      timeAgo="2 days ago"
                      review="This movie blew my mind. The plot twists keep you on the edge of your seat throughout!"
                      helpfulCount={14}
                    />
                    
                    <ReviewCard 
                      avatar="S"
                      name="Sarah Miller"
                      avatarGradient="from-cyan-500 to-blue-500"
                      rating={4}
                      timeAgo="1 week ago"
                      review="Great performances by the entire cast. The cinematography was beautiful though the pacing felt a bit slow at times."
                      helpfulCount={7}
                    />
                    
                    <button className="w-full mt-3 py-2 text-sm text-center text-purple-400 font-medium">
                      View all 24 reviews
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Similar Movies Tab */}
            {activeTab === 'similar' && (
              <div>
                {currentMovie.similarTo && currentMovie.similarTo.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
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
                        <div key={movieId} className="bg-gray-800/60 rounded-xl overflow-hidden shadow-sm">
                          <div className="aspect-[2/3] w-full">
                            <img 
                              src={similarMovie.posterUrl} 
                              alt={similarMovie.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-sm text-gray-300 truncate">{similarMovie.title}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400">{similarMovie.year}</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs ml-1 text-gray-400">{similarMovie.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-800/60 rounded-xl p-8 text-center">
                    <p className="text-gray-300 mb-2">No similar movies available</p>
                    <span className="text-sm text-gray-400">We couldn't find any similar titles at this time</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Review Modal */}
      {(isWritingReview || editingReview) && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center px-4 animate-fade-in"
          onClick={() => {
            setIsWritingReview(false);
            setEditingReview(false);
          }}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-700/50 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  {editingReview ? 'Edit Your Review' : 'Rate & Review'}
                </h3>
                <button 
                  onClick={() => {
                    setIsWritingReview(false);
                    setEditingReview(false);
                  }}
                  className="text-white/80 hover:text-white rounded-full bg-white/10 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Movie Quick Info */}
              <div className="flex items-center mt-3">
                <img 
                  src={currentMovie.posterUrl}
                  alt={currentMovie.title}
                  className="w-10 h-14 rounded-lg object-cover mr-3 shadow-md border border-white/20"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">{currentMovie.title}</h4>
                  <div className="flex items-center text-xs text-white/70">
                    <span>{currentMovie.year}</span>
                    {currentMovie.duration && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{formatRuntime(currentMovie.duration)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  How would you rate this?
                </label>
                <div className="flex justify-center">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button 
                        key={rating}
                        className="p-1.5 transition-all hover:scale-110 focus:outline-none"
                        onClick={() => handleRatingChange(rating)}
                        onMouseEnter={() => setHoveredRating(rating)}
                        onMouseLeave={() => setHoveredRating(0)}
                      >
                        <Star 
                          className={`w-10 h-10 ${
                            (hoveredRating ? rating <= hoveredRating : rating <= userRating) 
                              ? 'text-yellow-400 fill-current drop-shadow-md' 
                              : 'text-gray-600'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Rating Label */}
                <div className="text-center mt-2 h-6">
                  {(userRating > 0 || hoveredRating > 0) && (
                    <span className={`text-sm font-medium ${
                      (hoveredRating || userRating) >= 4 ? 'text-green-400' : 
                      (hoveredRating || userRating) >= 3 ? 'text-yellow-400' : 
                      'text-orange-400'
                    }`}>
                      {getRatingText(hoveredRating || userRating)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Review Text */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-200">
                    Share your thoughts (optional)
                  </label>
                  
                  {editingReview && userReview.trim() && (
                    <button
                      onClick={deleteReview}
                      className="text-red-400 hover:text-red-300 transition-colors text-xs flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </button>
                  )}
                </div>
                
                <div className="relative rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent overflow-hidden transition-all">
                  <textarea
                    ref={reviewInputRef}
                    className="w-full px-4 pt-3 pb-10 bg-transparent text-gray-200 focus:outline-none resize-none min-h-[120px]"
                    placeholder="What did you think about this movie?"
                    value={reviewDraft}
                    onChange={(e) => setReviewDraft(e.target.value)}
                    maxLength={500}
                  ></textarea>
                  
                  <div className="absolute bottom-2 right-2 flex items-center text-xs text-gray-500">
                    {reviewDraft.length}/500
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setIsWritingReview(false);
                    setEditingReview(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className={`px-5 py-2 rounded-lg text-sm font-medium flex items-center 
                    ${userRating > 0 || reviewDraft.trim() 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    } transition-all`}
                  onClick={submitReview}
                  disabled={!(userRating > 0 || reviewDraft.trim())}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {editingReview ? 'Update' : 'Submit'}
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
        
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ label, active, onClick }) => (
  <button
    className={`relative px-5 py-3 font-medium text-sm transition-colors focus:outline-none ${
      active ? 'text-gray-200' : 'text-gray-500 hover:text-gray-400'
    }`}
    onClick={onClick}
  >
    {label}
    <span 
      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-purple-500 transition-all duration-200 ${
        active ? 'w-8' : 'w-0'
      }`}
    ></span>
  </button>
);

// Review Card Component
const ReviewCard = ({ avatar, name, avatarGradient, rating, timeAgo, review, helpfulCount }) => (
  <div className="bg-gray-700/30 rounded-lg p-3">
    <div className="flex">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white mr-3 flex-shrink-0 shadow-sm`}>
        <span>{avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm text-gray-200">{name}</span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        
        <div className="flex mb-2">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
            />
          ))}
        </div>
        
        <p className="text-sm text-gray-300 leading-relaxed">
          "{review}"
        </p>
        
        <div className="flex items-center mt-2">
          <button className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-600/50 text-gray-300">
            <ThumbsUp className="w-3 h-3 mr-1" /> Helpful ({helpfulCount})
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default MovieDetailsModal;