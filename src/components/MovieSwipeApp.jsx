import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Heart, Info, ChevronLeft, Play, Star, Clock, Calendar, 
  /* Replace Filter with Sliders: */
  Sliders, 
  Bookmark, Home, Search, User, MessageCircle, Plus, Settings, 
  ArrowLeft, Trash2, Share2, Bell, Zap, TrendingUp, Users, ThumbsUp, 
  Send, AtSign, MoreHorizontal, Link as LinkIcon, Film, List, Award, Eye 
} from 'lucide-react';

// Sample user data
const sampleUsers = [
  {
    id: 1,
    name: "Alex Johnson",
    username: "alexj",
    avatar: "A",
    bio: "Movie Enthusiast | Sci-Fi Lover | Film Student",
    following: 124,
    followers: 186,
    favoriteGenres: ["Sci-Fi", "Thriller", "Drama", "Comedy"],
    streamingServices: ["Netflix", "Hulu", "Prime Video"],
    recentActivity: [
      { type: "liked", movieId: 1, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { type: "added", movieId: 3, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { type: "reviewed", movieId: 2, rating: 4.5, comment: "Amazing performance by Anya Taylor-Joy!", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    ]
  },
  {
    id: 2,
    name: "Sarah Miller",
    username: "sarahm",
    avatar: "S",
    bio: "Documentary Fanatic | Filmmaker | Coffee Addict",
    following: 215,
    followers: 342,
    favoriteGenres: ["Documentary", "Drama", "Indie"],
    streamingServices: ["Netflix", "HBO Max", "Disney+"],
    recentActivity: [
      { type: "added", movieId: 1, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      { type: "liked", movieId: 4, timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000) },
      { type: "reviewed", movieId: 3, rating: 5, comment: "A masterpiece! Bong Joon Ho deserved all the awards.", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) }
    ]
  },
  {
    id: 3,
    name: "Michael Chen",
    username: "mikechen",
    avatar: "M",
    bio: "Horror Buff | VFX Artist | Movie Marathon Expert",
    following: 98,
    followers: 156,
    favoriteGenres: ["Horror", "Sci-Fi", "Thriller"],
    streamingServices: ["Prime Video", "Shudder", "Netflix"],
    recentActivity: [
      { type: "reviewed", movieId: 4, rating: 5, comment: "Best sci-fi series ever made. Can't wait for the next season!", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { type: "added", movieId: 2, timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
      { type: "liked", movieId: 1, timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000) }
    ]
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    username: "emilyr",
    avatar: "E",
    bio: "Rom-Com Enthusiast | TV Critic | Always Binging Something",
    following: 172,
    followers: 243,
    favoriteGenres: ["Comedy", "Romance", "Drama"],
    streamingServices: ["Netflix", "Hulu", "Apple TV+"],
    recentActivity: [
      { type: "added", movieId: 4, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { type: "reviewed", movieId: 1, rating: 4, comment: "Mind-bending in the best way. Leo was incredible!", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      { type: "liked", movieId: 2, timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000) }
    ]
  }
];

// Sample movie lists
const sampleLists = [
  {
    id: 1,
    title: "Best Sci-Fi of the Decade",
    creator: 1, // Alex
    movies: [1, 4],
    likes: 243,
    public: true,
    description: "My collection of the most mind-bending sci-fi films released in the past 10 years."
  },
  {
    id: 2,
    title: "Oscar Winners Marathon",
    creator: 2, // Sarah
    movies: [3, 1],
    likes: 187,
    public: true,
    description: "All the best picture winners you need to see before the next Academy Awards."
  },
  {
    id: 3,
    title: "Perfect Date Night Movies",
    creator: 4, // Emily
    movies: [2, 1],
    likes: 329,
    public: true,
    description: "Guaranteed to impress your date - movies that everyone will enjoy!"
  },
  {
    id: 4,
    title: "Movies That Will Keep You Up at Night",
    creator: 3, // Michael
    movies: [1, 3],
    likes: 156,
    public: true,
    description: "Psychological thrillers and horror films that will haunt your dreams."
  }
];

// Sample friend recommendations
const friendRecommendations = [
  {
    userId: 2, // Sarah
    movieId: 3, // Parasite
    message: "You have to see this! Best film I've watched all year.",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    userId: 3, // Michael
    movieId: 1, // Inception
    message: "This reminded me of our conversation about dreams. Let me know what you think!",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    userId: 4, // Emily
    movieId: 2, // Queen's Gambit
    message: "Based on your watchlist, I think you'll love this series!",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

// Sample movie data
const sampleMovies = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    genre: ["Sci-Fi", "Action", "Thriller"],
    director: "Christopher Nolan",
    rating: 8.8,
    duration: "2h 28m",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterUrl: "https://placehold.co/500x750/png",
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    streamingOn: ["Netflix", "HBO Max"],
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page", "Tom Hardy"],
    similarTo: [2, 3]
  },
  {
    id: 2,
    title: "The Queen's Gambit",
    year: 2020,
    genre: ["Drama", "Sport"],
    director: "Scott Frank, Allan Scott",
    rating: 8.6,
    duration: "Limited Series",
    description: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA. But child stardom comes at a price.",
    posterUrl: "https://placehold.co/500x750/png",
    trailerUrl: "https://www.youtube.com/watch?v=CDrieqwSdgI",
    streamingOn: ["Netflix"],
    cast: ["Anya Taylor-Joy", "Bill Camp", "Moses Ingram", "Thomas Brodie-Sangster"],
    similarTo: [3, 4]
  },
  {
    id: 3,
    title: "Parasite",
    year: 2019,
    genre: ["Thriller", "Drama", "Comedy"],
    director: "Bong Joon Ho",
    rating: 8.5,
    duration: "2h 12m",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    posterUrl: "https://placehold.co/500x750/png",
    trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
    streamingOn: ["Hulu", "Prime Video"],
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    similarTo: [1, 4]
  },
  {
    id: 4,
    title: "Stranger Things",
    year: 2016,
    genre: ["Sci-Fi", "Horror", "Drama"],
    director: "The Duffer Brothers",
    rating: 8.7,
    duration: "Series",
    description: "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
    posterUrl: "https://placehold.co/500x750/png",
    trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
    streamingOn: ["Netflix"],
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
    similarTo: [1, 2]
  }
];

// Main App Component
const MovieSwipeApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [direction, setDirection] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Dark mode is now default
  const [activeTab, setActiveTab] = useState('discover');
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [similarMoviesOpen, setSimilarMoviesOpen] = useState(false);
  const [watchedHistory, setWatchedHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchScreen, setShowSearchScreen] = useState(false);
  const [showSocialScreen, setShowSocialScreen] = useState(false);
  const [currentUser, setCurrentUser] = useState(sampleUsers[0]); // Current logged in user
  const [userFriends, setUserFriends] = useState(sampleUsers.slice(1)); // Other users are friends
  const [socialView, setSocialView] = useState('feed'); // feed, friends, recommendations
  const [showUserProfile, setShowUserProfile] = useState(null); // Show another user's profile
  const [recommendMovieModal, setRecommendMovieModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [recommendationMessage, setRecommendationMessage] = useState('');
  const [movieToRecommend, setMovieToRecommend] = useState(null);
  const [pendingRecommendations, setPendingRecommendations] = useState(friendRecommendations);
  const [showCreateList, setShowCreateList] = useState(false);
  const [userLists, setUserLists] = useState(sampleLists);
  const [selectedList, setSelectedList] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [filterPreferences, setFilterPreferences] = useState({
    genres: [],
    services: [],
    minRating: 7,
    yearRange: [1970, 2025]
  });
  
  const cardRef = useRef(null);
  const initialTouchPosition = useRef(null);
  const currentSwipeDistance = useRef(0);
  
  const currentMovie = sampleMovies[currentIndex];
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Swipe gesture handling
  const handleTouchStart = (e) => {
    initialTouchPosition.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e) => {
    if (!initialTouchPosition.current) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - initialTouchPosition.current;
    
    // Limit the drag distance
    const maxDistance = window.innerWidth * 0.5;
    const limitedDiff = Math.max(Math.min(diff, maxDistance), -maxDistance);
    
    // Calculate rotation based on swipe distance
    const rotate = limitedDiff / 20;
    
    // Update card position and rotation
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${limitedDiff}px) rotate(${rotate}deg)`;
      
      // Show like/dislike based on direction
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
    
    // If swiped far enough, count as like/dislike
    if (currentSwipeDistance.current > threshold) {
      handleSwipe(true); // Like
    } else if (currentSwipeDistance.current < -threshold) {
      handleSwipe(false); // Dislike
    } else {
      // Reset card position if not swiped far enough
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0)';
        setDirection('');
      }
    }
    
    initialTouchPosition.current = null;
    currentSwipeDistance.current = 0;
  };
  
  // Handle mouse events for desktop swiping
  const handleMouseDown = (e) => {
    initialTouchPosition.current = e.clientX;
    
    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e) => {
    if (!initialTouchPosition.current) return;
    
    const currentMousePos = e.clientX;
    const diff = currentMousePos - initialTouchPosition.current;
    
    // Limit the drag distance
    const maxDistance = window.innerWidth * 0.5;
    const limitedDiff = Math.max(Math.min(diff, maxDistance), -maxDistance);
    
    // Calculate rotation based on swipe distance
    const rotate = limitedDiff / 20;
    
    // Update card position and rotation
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${limitedDiff}px) rotate(${rotate}deg)`;
      
      // Show like/dislike based on direction
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
    
    // If swiped far enough, count as like/dislike
    if (currentSwipeDistance.current > threshold) {
      handleSwipe(true); // Like
    } else if (currentSwipeDistance.current < -threshold) {
      handleSwipe(false); // Dislike
    } else {
      // Reset card position if not swiped far enough
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0)';
        setDirection('');
      }
    }
    
    initialTouchPosition.current = null;
    currentSwipeDistance.current = 0;
  };
  
  // Handle swipe actions
  const handleSwipe = (liked) => {
    setDirection(liked ? 'right' : 'left');
    
    // Add to watchlist if liked
    if (liked && currentMovie) {
      setWatchlist(prev => {
        if (!prev.find(item => item.id === currentMovie.id)) {
          return [...prev, currentMovie];
        }
        return prev;
      });
    }
    
    // Add to watch history
    if (currentMovie) {
      setWatchedHistory(prev => [...prev, {
        movie: currentMovie,
        timestamp: new Date(),
        action: liked ? 'liked' : 'disliked'
      }]);
    }
    
    // Reset animation and move to next card after animation completes
    setTimeout(() => {
      setDirection('');
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sampleMovies.length);
      
      // Reset card position
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0)';
      }
    }, 300);
  };
  
  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Simple search implementation
    const results = sampleMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.genre.some(g => g.toLowerCase().includes(query.toLowerCase())) ||
      movie.director.toLowerCase().includes(query.toLowerCase()) ||
      movie.cast.some(actor => actor.toLowerCase().includes(query.toLowerCase()))
    );
    
    setSearchResults(results);
  };
  
  // Filter functionality
  const toggleGenreFilter = (genre) => {
    setFilterPreferences(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };
  
  const toggleServiceFilter = (service) => {
    setFilterPreferences(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };
  
  const setRatingFilter = (rating) => {
    setFilterPreferences(prev => ({ ...prev, minRating: rating }));
  };
  
  const setYearRangeFilter = (range) => {
    setFilterPreferences(prev => ({ ...prev, yearRange: range }));
  };
  
  const applyFilters = () => {
    // In a real app, this would filter the recommendations
    setFilterOpen(false);
    
    // For demo, just show a toast notification
    showToast("Filters applied successfully!");
  };
  
  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '' });
  
  const showToast = (message) => {
    setToast({ show: true, message });
    
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };
  
  // Generate activity feed
  useEffect(() => {
    // Combine activities from all friends
    const allActivities = userFriends.flatMap(friend => 
      friend.recentActivity.map(activity => ({
        ...activity,
        userId: friend.id,
        userName: friend.name,
        userAvatar: friend.avatar
      }))
    );
    
    // Sort by timestamp, newest first
    const sortedActivities = allActivities.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    setActivityFeed(sortedActivities);
  }, [userFriends]);
  
  // Function to handle recommending a movie to friends
  const handleRecommendMovie = () => {
    if (selectedFriends.length === 0 || !movieToRecommend) return;
    
    // Create new recommendation
    const newRecommendation = {
      from: currentUser.id,
      to: selectedFriends,
      movieId: movieToRecommend.id,
      message: recommendationMessage || `Check out ${movieToRecommend.title}!`,
      timestamp: new Date()
    };
    
    // Add to user's sent recommendations
    // (In a real app, this would be sent to a server)
    showToast("Recommendation sent to friends!");
    
    // Reset recommendation form
    setSelectedFriends([]);
    setRecommendationMessage('');
    setMovieToRecommend(null);
    setRecommendMovieModal(false);
  };
  
  // Function to format time elapsed
  const formatTimeElapsed = (timestamp) => {
    const now = new Date();
    const elapsed = now - new Date(timestamp);
    
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };
  
  // Function to find a user by ID
  const findUserById = (userId) => {
    if (userId === currentUser.id) return currentUser;
    return userFriends.find(friend => friend.id === userId) || null;
  };
  
  // Function to find a movie by ID
  const findMovieById = (movieId) => {
    return sampleMovies.find(movie => movie.id === movieId) || null;
  };
  
  // Function to create a new list
  const handleCreateList = (listData) => {
    const newList = {
      id: userLists.length + 1,
      title: listData.title,
      creator: currentUser.id,
      movies: listData.movies || [],
      likes: 0,
      public: listData.public || true,
      description: listData.description || ""
    };
    
    setUserLists([...userLists, newList]);
    setShowCreateList(false);
    showToast("List created successfully!");
  };
  
  // Onboarding screens
  const onboardingScreens = [
    {
      title: "Discover Movies & Shows",
      description: "Swipe through personalized recommendations tailored just for you",
      icon: "🎬"
    },
    {
      title: "Find Your Favorites",
      description: "Like what you see? Swipe right to add to your watchlist",
      icon: "❤️"
    },
    {
      title: "Set Your Preferences",
      description: "Tell us what you like to get better recommendations",
      icon: "🎯"
    },
    {
      title: "Track Your Watch History",
      description: "Keep a record of what you've watched and your ratings",
      icon: "📊"
    },
    {
      title: "Connect With Friends",
      description: "Share recommendations and see what your friends are watching",
      icon: "👥"
    }
  ];
  
  // Handle onboarding progression
  const handleOnboardingNext = () => {
    if (onboardingStep < onboardingScreens.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setIsOnboarding(false);
    }
  };
  
  // Handle color scheme based on dark mode
  const colorScheme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-gray-100' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    accent: 'bg-gradient-to-r from-purple-500 to-pink-500'
  };
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className={`h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
        {/* Skeleton header */}
        <div className={`${colorScheme.card} p-4 flex justify-between items-center shadow-sm`}>
          <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
        </div>
        
        {/* Skeleton card */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className={`w-full max-w-sm rounded-2xl overflow-hidden ${colorScheme.card} shadow-lg`}>
            <div className="h-96 bg-gray-300 animate-pulse"></div>
            <div className="p-4">
              <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse mb-2"></div>
              <div className="flex space-x-2 mt-3">
                <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skeleton bottom nav */}
        <div className={`${colorScheme.card} shadow-lg px-6 py-4 flex justify-around`}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render onboarding screens
  if (isOnboarding) {
    const currentScreen = onboardingScreens[onboardingStep];
    
    return (
      <div className={`h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          {/* Progress indicator */}
          <div className="absolute top-8 left-0 right-0 flex justify-center space-x-2">
            {onboardingScreens.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  onboardingStep === index 
                    ? 'bg-purple-500 w-6' 
                    : onboardingStep > index 
                      ? 'bg-purple-300' 
                      : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
          
          <div className="text-6xl mb-6 transform transition-all duration-500 hover:scale-110">{currentScreen.icon}</div>
          <h1 className={`text-2xl font-bold mb-4 ${colorScheme.text}`}>{currentScreen.title}</h1>
          <p className={`${colorScheme.textSecondary} mb-12 text-lg`}>{currentScreen.description}</p>
          
          <button 
            onClick={handleOnboardingNext}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full px-8 py-3 shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            {onboardingStep < onboardingScreens.length - 1 ? 'Next' : 'Get Started'}
          </button>
          
          {onboardingStep < onboardingScreens.length - 1 && (
            <button 
              onClick={() => setIsOnboarding(false)}
              className={`mt-4 ${colorScheme.textSecondary}`}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Render Social Screen
  if (showSocialScreen) {
    return (
      <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
        {/* Header */}
        <header className={`${colorScheme.card} shadow-sm p-4 sticky top-0 z-10`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button 
                className="mr-3"
                onClick={() => setShowSocialScreen(false)}
              >
                <ArrowLeft className={`w-6 h-6 ${colorScheme.text}`} />
              </button>
              <h1 className={`text-xl font-bold ${colorScheme.text}`}>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">Social</span>
              </h1>
            </div>
            <div className="flex items-center">
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg} mr-2`}
                onClick={() => showToast("Notifications checked")}
              >
                <Bell className={`w-5 h-5 ${colorScheme.text}`} />
                {pendingRecommendations.length > 0 && (
                  <span className="absolute top-1 right-14 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg}`}
                onClick={() => setDarkMode(!darkMode)}
              >
                <span className="text-lg">
                  {darkMode ? '☀️' : '🌙'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Social Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-2 text-center ${
                socialView === 'feed' 
                  ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                  : colorScheme.textSecondary
              }`}
              onClick={() => setSocialView('feed')}
            >
              Activity
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                socialView === 'friends' 
                  ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                  : colorScheme.textSecondary
              }`}
              onClick={() => setSocialView('friends')}
            >
              Friends
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                socialView === 'recommendations' 
                  ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                  : colorScheme.textSecondary
              }`}
              onClick={() => setSocialView('recommendations')}
            >
              For You
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                socialView === 'lists' 
                  ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                  : colorScheme.textSecondary
              }`}
              onClick={() => setSocialView('lists')}
            >
              Lists
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-4 overflow-y-auto pb-20">
          {/* Activity Feed View */}
          {socialView === 'feed' && (
            <div className="space-y-4">
              {activityFeed.map((activity, index) => {
                const movie = findMovieById(activity.movieId);
                if (!movie) return null;
                
                return (
                  <div key={index} className={`${colorScheme.card} rounded-lg p-4 shadow`}>
                    <div className="flex items-start">
                      {/* User Avatar */}
                      <div 
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3 flex-shrink-0"
                        onClick={() => setShowUserProfile(findUserById(activity.userId))}
                      >
                        <span>{activity.userAvatar}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-medium ${colorScheme.text}`}>
                              {activity.userName}
                              <span className={`font-normal ${colorScheme.textSecondary}`}>
                                {activity.type === 'liked' && ' liked'}
                                {activity.type === 'added' && ' added to watchlist'}
                                {activity.type === 'reviewed' && ' reviewed'}
                              </span>
                            </p>
                          </div>
                          <span className={`text-xs ${colorScheme.textSecondary}`}>
                            {formatTimeElapsed(activity.timestamp)}
                          </span>
                        </div>
                        
                        {/* Movie Card */}
                        <div 
                          className={`mt-2 flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                          onClick={() => {
                            setCurrentIndex(sampleMovies.findIndex(m => m.id === movie.id));
                            setShowSocialScreen(false);
                          }}
                        >
                          <div className="w-16 h-20 bg-gray-300 flex-shrink-0">
                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-2">
                            <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                              <span className="mx-1">•</span>
                              <span className={`text-xs ${colorScheme.textSecondary}`}>{movie.year}</span>
                            </div>
                            
                            {activity.type === 'reviewed' && (
                              <div className="mt-1">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-3 h-3 ${i < Math.round(activity.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <p className={`text-xs mt-1 ${colorScheme.text} italic`}>"{activity.comment}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex mt-3">
                          <button className={`flex items-center mr-4 ${colorScheme.textSecondary} text-xs`}>
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Like
                          </button>
                          <button 
                            className={`flex items-center mr-4 ${colorScheme.textSecondary} text-xs`}
                            onClick={() => {
                              setMovieToRecommend(movie);
                              setRecommendMovieModal(true);
                            }}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </button>
                          <button 
                            className={`flex items-center ${colorScheme.textSecondary} text-xs`}
                            onClick={() => {
                              setWatchlist(prev => [...prev, movie]);
                              showToast("Added to watchlist!");
                            }}
                          >
                            <Bookmark className="w-4 h-4 mr-1" />
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Friends View */}
          {socialView === 'friends' && (
            <div>
              <div className={`${colorScheme.card} p-3 rounded-full mb-4 flex items-center shadow`}>
                <Search className={`w-5 h-5 ${colorScheme.textSecondary} mr-2`} />
                <input
                  type="text"
                  placeholder="Search friends..."
                  className={`w-full bg-transparent focus:outline-none ${colorScheme.text}`}
                />
              </div>
              
              <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Friends</h3>
              <div className="space-y-3">
                {userFriends.map(friend => (
                  <div 
                    key={friend.id} 
                    className={`${colorScheme.card} rounded-lg p-4 shadow flex items-center`}
                    onClick={() => setShowUserProfile(friend)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                      <span className="text-lg">{friend.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${colorScheme.text}`}>{friend.name}</h4>
                      <p className={`text-xs ${colorScheme.textSecondary}`}>@{friend.username}</p>
                      <div className="flex mt-1">
                        {friend.favoriteGenres.slice(0, 2).map((genre, i) => (
                          <span
                            key={i}
                            className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 mr-1"
                          >
                            {genre}
                          </span>
                        ))}
                        {friend.favoriteGenres.length > 2 && (
                          <span className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5">
                            +{friend.favoriteGenres.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      className={`${colorScheme.card} rounded-full p-2 shadow-md`}
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Messaged ${friend.name}`);
                      }}
                    >
                      <MessageCircle className="w-5 h-5 text-purple-500" />
                    </button>
                  </div>
                ))}
              </div>
              
              <h3 className={`font-medium mt-6 mb-3 ${colorScheme.text}`}>Friend Suggestions</h3>
              <div className="space-y-3">
                <div className={`${colorScheme.card} rounded-lg p-4 shadow flex items-center`}>
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <span className="text-lg">J</span>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${colorScheme.text}`}>Jane Smith</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>3 mutual friends</p>
                  </div>
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-3 py-1 text-sm"
                    onClick={() => showToast("Friend request sent!")}
                  >
                    Follow
                  </button>
                </div>
                
                <div className={`${colorScheme.card} rounded-lg p-4 shadow flex items-center`}>
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <span className="text-lg">R</span>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${colorScheme.text}`}>Robert Johnson</h4>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>Similar taste in Sci-Fi</p>
                  </div>
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-3 py-1 text-sm"
                    onClick={() => showToast("Friend request sent!")}
                  >
                    Follow
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Recommendations View */}
          {socialView === 'recommendations' && (
            <div>
              {pendingRecommendations.length > 0 && (
                <>
                  <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Recommendations From Friends</h3>
                  <div className="space-y-4 mb-6">
                    {pendingRecommendations.map((rec, index) => {
                      const friend = findUserById(rec.userId);
                      const movie = findMovieById(rec.movieId);
                      if (!friend || !movie) return null;
                      
                      return (
                        <div key={index} className={`${colorScheme.card} rounded-lg p-4 shadow`}>
                          <div className="flex items-start">
                            <div 
                              className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3"
                              onClick={() => setShowUserProfile(friend)}
                            >
                              <span>{friend.avatar}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className={`font-medium ${colorScheme.text}`}>
                                  {friend.name}
                                  <span className={`font-normal ${colorScheme.textSecondary}`}> recommended</span>
                                </p>
                                <span className={`text-xs ${colorScheme.textSecondary}`}>
                                  {formatTimeElapsed(rec.timestamp)}
                                </span>
                              </div>
                              
                              <p className={`text-sm my-2 ${colorScheme.text}`}>"{rec.message}"</p>
                              
                              <div 
                                className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                                onClick={() => {
                                  setCurrentIndex(sampleMovies.findIndex(m => m.id === movie.id));
                                  setShowSocialScreen(false);
                                }}
                              >
                                <div className="w-16 h-20 bg-gray-300">
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-2">
                                  <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                                    <span className="mx-1">•</span>
                                    <span className={`text-xs ${colorScheme.textSecondary}`}>{movie.year}</span>
                                  </div>
                                  <div className="flex flex-wrap mt-1">
                                    {movie.genre.slice(0, 2).map((g, i) => (
                                      <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1">
                                        {g}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex mt-3 justify-end">
                                <button 
                                  className={`flex items-center mr-3 px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${colorScheme.text} text-xs`}
                                  onClick={() => {
                                    setPendingRecommendations(pendingRecommendations.filter((_, i) => i !== index));
                                    showToast("Recommendation dismissed");
                                  }}
                                >
                                  Dismiss
                                </button>
                                <button 
                                  className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs"
                                  onClick={() => {
                                    setWatchlist(prev => [...prev, movie]);
                                    setPendingRecommendations(pendingRecommendations.filter((_, i) => i !== index));
                                    showToast("Added to watchlist!");
                                  }}
                                >
                                  Add to Watchlist
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              
              <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Similar Tastes</h3>
              <div className="space-y-3 mb-6">
                {userFriends.map(friend => (
                  <div key={friend.id} className={`${colorScheme.card} rounded-lg p-4 shadow`}>
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3"
                        onClick={() => setShowUserProfile(friend)}
                      >
                        <span className="text-lg">{friend.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${colorScheme.text}`}>{friend.name}</h4>
                        <p className={`text-xs ${colorScheme.textSecondary}`}>You both like {friend.favoriteGenres[0]} movies</p>
                      </div>
                      <button 
                        className={`${colorScheme.card} rounded-full p-2 shadow`}
                        onClick={() => showToast(`Viewing ${friend.name}'s watchlist`)}
                      >
                        <Eye className="w-5 h-5 text-purple-500" />
                      </button>
                    </div>
                    
                    <div className="mt-3">
                      <p className={`text-sm ${colorScheme.text} font-medium`}>Movies you might both enjoy:</p>
                      <div className="flex overflow-x-auto py-2 space-x-3 no-scrollbar">
                        {sampleMovies.slice(0, 3).map(movie => (
                          <div 
                            key={movie.id} 
                            className="flex-shrink-0 w-24"
                            onClick={() => {
                              setCurrentIndex(sampleMovies.findIndex(m => m.id === movie.id));
                              setShowSocialScreen(false);
                            }}
                          >
                            <div className="w-24 h-36 rounded-lg overflow-hidden mb-1">
                              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                            </div>
                            <p className={`text-xs ${colorScheme.text} truncate`}>{movie.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-2 flex items-center"
                  onClick={() => {
                    setMovieToRecommend(sampleMovies[currentIndex]);
                    setRecommendMovieModal(true);
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Recommend a Movie
                </button>
              </div>
            </div>
          )}
          
          {/* Lists View */}
          {socialView === 'lists' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-medium ${colorScheme.text}`}>Your Lists</h3>
                <button 
                  className="flex items-center text-purple-500 text-sm"
                  onClick={() => setShowCreateList(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New List
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                {userLists.filter(list => list.creator === currentUser.id).map(list => (
                  <div 
                    key={list.id} 
                    className={`${colorScheme.card} rounded-lg p-4 shadow`}
                    onClick={() => setSelectedList(list)}
                  >
                    <h4 className={`font-medium ${colorScheme.text}`}>{list.title}</h4>
                    <p className={`text-sm ${colorScheme.textSecondary} mt-1`}>
                      {list.movies.length} movies • {list.likes} likes
                    </p>
                    <div className="flex mt-2">
                      {list.movies.slice(0, 3).map(movieId => {
                        const movie = findMovieById(movieId);
                        return movie ? (
                          <div key={movieId} className="w-10 h-14 rounded overflow-hidden mr-1 relative">
                            <img 
                              src={movie.posterUrl} 
                              alt={movie.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : null;
                      })}
                      {list.movies.length > 3 && (
                        <div className="w-10 h-14 rounded bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-white">+{list.movies.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Featured Lists</h3>
              <div className="space-y-3">
                {userLists.filter(list => list.creator !== currentUser.id).map(list => {
                  const creator = findUserById(list.creator);
                  if (!creator) return null;
                  
                  return (
                    <div 
                      key={list.id} 
                      className={`${colorScheme.card} rounded-lg p-4 shadow`}
                      onClick={() => setSelectedList(list)}
                    >
                      <div className="flex justify-between">
                        <h4 className={`font-medium ${colorScheme.text}`}>{list.title}</h4>
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 text-purple-500 mr-1" />
                          <span className={`text-sm ${colorScheme.textSecondary}`}>{list.likes}</span>
                        </div>
                      </div>
                      
                      <div 
                        className="flex items-center mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUserProfile(creator);
                        }}
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs mr-1">
                          {creator.avatar}
                        </div>
                        <span className={`text-xs ${colorScheme.textSecondary}`}>by {creator.name}</span>
                      </div>
                      
                      <p className={`text-sm ${colorScheme.text} mt-2`}>{list.description}</p>
                      
                      <div className="flex mt-2">
                        {list.movies.slice(0, 3).map(movieId => {
                          const movie = findMovieById(movieId);
                          return movie ? (
                            <div key={movieId} className="w-10 h-14 rounded overflow-hidden mr-1 relative">
                              <img 
                                src={movie.posterUrl} 
                                alt={movie.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : null;
                        })}
                        {list.movies.length > 3 && (
                          <div className="w-10 h-14 rounded bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-white">+{list.movies.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Tab Navigation */}
        <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${colorScheme.card} shadow-lg px-4 py-5 flex justify-around border-t ${colorScheme.border}`}>
          <button 
            className={`flex flex-col items-center ${activeTab === 'discover' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => {
              setActiveTab('discover');
              setShowSocialScreen(false);
            }}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Discover</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === 'search' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => {
              setShowSocialScreen(false);
              setShowSearchScreen(true);
            }}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === 'social' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => setActiveTab('social')}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs mt-1">Social</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === 'watchlist' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => {
              setActiveTab('watchlist');
              setShowSocialScreen(false);
              setProfileOpen(true);
            }}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-xs mt-1">Watchlist</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => {
              setShowSocialScreen(false);
              setProfileOpen(true);
            }}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
        
        {/* User Profile Modal */}
        {showUserProfile && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setShowUserProfile(null)}>
            <div 
              className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-32 bg-gradient-to-r from-purple-500 to-pink-500">
                <button 
                  className="absolute top-4 left-4 bg-black bg-opacity-30 rounded-full p-2 text-white"
                  onClick={() => setShowUserProfile(null)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="px-4 pb-6">
                <div className="flex justify-between items-end -mt-12 mb-4">
                  <div className="flex items-end">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl border-4 border-white dark:border-gray-800">
                      {showUserProfile.avatar}
                    </div>
                    <div className="ml-3 mb-2">
                      <h2 className={`text-xl font-bold ${colorScheme.text}`}>{showUserProfile.name}</h2>
                      <p className={`text-sm ${colorScheme.textSecondary}`}>@{showUserProfile.username}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-1 text-sm"
                    onClick={() => showToast(`Message sent to ${showUserProfile.name}`)}
                  >
                    Message
                  </button>
                </div>
                
                <p className={`${colorScheme.text} mb-4`}>{showUserProfile.bio}</p>
                
                <div className="flex mb-6">
                  <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-lg mr-2 text-center`}>
                    <p className={`text-xl font-bold ${colorScheme.text}`}>{showUserProfile.following}</p>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>Following</p>
                  </div>
                  <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-lg text-center`}>
                    <p className={`text-xl font-bold ${colorScheme.text}`}>{showUserProfile.followers}</p>
                    <p className={`text-xs ${colorScheme.textSecondary}`}>Followers</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className={`font-medium mb-2 ${colorScheme.text}`}>Favorite Genres</h3>
                  <div className="flex flex-wrap">
                    {showUserProfile.favoriteGenres.map(genre => (
                      <span key={genre} className="text-xs bg-purple-100 text-purple-800 rounded-full px-3 py-1 mr-2 mb-2">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className={`font-medium mb-2 ${colorScheme.text}`}>Streaming Services</h3>
                  <div className="flex flex-wrap">
                    {showUserProfile.streamingServices.map(service => (
                      <span key={service} className="text-xs bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2 mb-2">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Recent Activity</h3>
                <div className="space-y-3">
                  {showUserProfile.recentActivity.map((activity, index) => {
                    const movie = findMovieById(activity.movieId);
                    if (!movie) return null;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg overflow-hidden`}
                        onClick={() => {
                          setCurrentIndex(sampleMovies.findIndex(m => m.id === movie.id));
                          setShowUserProfile(null);
                          setShowSocialScreen(false);
                        }}
                      >
                        <div className="w-16 h-20 bg-gray-300">
                          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 flex-1">
                          <div className="flex justify-between">
                            <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                            <span className={`text-xs ${colorScheme.textSecondary}`}>
                              {formatTimeElapsed(activity.timestamp)}
                            </span>
                          </div>
                          <p className={`text-xs ${colorScheme.textSecondary}`}>
                            {activity.type === 'liked' && 'Liked this movie'}
                            {activity.type === 'added' && 'Added to watchlist'}
                            {activity.type === 'reviewed' && 'Reviewed'}
                          </p>
                          
                          {activity.type === 'reviewed' && (
                            <div className="mt-1">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < Math.round(activity.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              {activity.comment && (
                                <p className={`text-xs mt-1 ${colorScheme.text} italic`}>"{activity.comment}"</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recommend Movie Modal */}
        {recommendMovieModal && movieToRecommend && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setRecommendMovieModal(false)}>
            <div 
              className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-lg font-bold ${colorScheme.text}`}>Recommend to Friends</h2>
                  <button onClick={() => setRecommendMovieModal(false)}>
                    <X className={`w-6 h-6 ${colorScheme.text}`} />
                  </button>
                </div>
                
                <div className="flex mb-4">
                  <div className="w-20 h-28 bg-gray-300 rounded overflow-hidden mr-3">
                    <img src={movieToRecommend.posterUrl} alt={movieToRecommend.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className={`font-medium ${colorScheme.text}`}>{movieToRecommend.title}</h3>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movieToRecommend.rating}</span>
                      <span className="mx-1">•</span>
                      <span className={`text-xs ${colorScheme.textSecondary}`}>{movieToRecommend.year}</span>
                    </div>
                    <div className="flex flex-wrap mt-1">
                      {movieToRecommend.genre.slice(0, 2).map((g, i) => (
                        <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                    Add a message
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 rounded-lg border ${colorScheme.border} bg-transparent ${colorScheme.text}`}
                    rows="3"
                    placeholder="Tell your friends why they should watch this..."
                    value={recommendationMessage}
                    onChange={(e) => setRecommendationMessage(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                    Select friends
                  </label>
                  <div className="space-y-2">
                    {userFriends.map(friend => (
                      <div 
                        key={friend.id} 
                        className={`flex items-center p-2 rounded-lg ${selectedFriends.includes(friend.id) ? 'bg-purple-100 dark:bg-purple-900' : ''}`}
                      >
                        <input
                          type="checkbox"
                          id={`friend-${friend.id}`}
                          checked={selectedFriends.includes(friend.id)}
                          onChange={() => {
                            if (selectedFriends.includes(friend.id)) {
                              setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                            } else {
                              setSelectedFriends([...selectedFriends, friend.id]);
                            }
                          }}
                          className="mr-3"
                        />
                        <label htmlFor={`friend-${friend.id}`} className="flex items-center cursor-pointer flex-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-2">
                            <span>{friend.avatar}</span>
                          </div>
                          <span className={colorScheme.text}>{friend.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    className="mr-3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                    onClick={() => setRecommendMovieModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white ${
                      selectedFriends.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleRecommendMovie}
                    disabled={selectedFriends.length === 0}
                  >
                    Send Recommendation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Create List Modal */}
        {showCreateList && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setShowCreateList(false)}>
            <div 
              className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-lg font-bold ${colorScheme.text}`}>Create New List</h2>
                  <button onClick={() => setShowCreateList(false)}>
                    <X className={`w-6 h-6 ${colorScheme.text}`} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                    List Title
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-lg border ${colorScheme.border} bg-transparent ${colorScheme.text}`}
                    placeholder="e.g., My Favorite Sci-Fi Movies"
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                    Description
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 rounded-lg border ${colorScheme.border} bg-transparent ${colorScheme.text}`}
                    rows="3"
                    placeholder="What's this list about?"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input type="checkbox" id="public-list" className="mr-2" defaultChecked />
                    <label htmlFor="public-list" className={colorScheme.text}>Make this list public</label>
                  </div>
                  <p className={`text-xs ${colorScheme.textSecondary} mt-1`}>
                    Public lists can be seen by your friends and followers
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>
                    Add Movies
                  </label>
                  <p className={`text-xs ${colorScheme.textSecondary} mb-2`}>
                    You can add more movies later
                  </p>
                  
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-lg flex justify-center items-center h-24`}>
                    <button 
                      className={`flex flex-col items-center ${colorScheme.textSecondary}`}
                      onClick={() => showToast("Movie selection would open here")}
                    >
                      <Plus className="w-8 h-8 mb-1" />
                      <span className="text-sm">Add movies from your watchlist</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    className="mr-3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                    onClick={() => setShowCreateList(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    onClick={() => {
                      handleCreateList({
                        title: "My Favorite Movies",
                        description: "A collection of movies I love",
                        movies: [1, 2],
                        public: true
                      });
                    }}
                  >
                    Create List
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* View List Modal */}
        {selectedList && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setSelectedList(null)}>
            <div 
              className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Film className="w-16 h-16 text-white opacity-30" />
                </div>
                <button 
                  className="absolute top-4 left-4 bg-black bg-opacity-30 rounded-full p-2 text-white"
                  onClick={() => setSelectedList(null)}
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  className="absolute top-4 right-4 bg-black bg-opacity-30 rounded-full p-2 text-white"
                  onClick={() => {
                    setSelectedList(null);
                    showToast("List shared!");
                  }}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${colorScheme.text}`}>{selectedList.title}</h2>
                  <div className="flex items-center">
                    <ThumbsUp className="w-4 h-4 text-purple-500 mr-1" />
                    <span className={`text-sm ${colorScheme.text}`}>{selectedList.likes}</span>
                  </div>
                </div>
                
                {(() => {
                  const creator = findUserById(selectedList.creator);
                  return creator ? (
                    <div 
                      className="flex items-center mt-1"
                      onClick={() => {
                        setSelectedList(null);
                        setShowUserProfile(creator);
                      }}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs mr-1">
                        {creator.avatar}
                      </div>
                      <span className={`text-xs ${colorScheme.textSecondary}`}>by {creator.name}</span>
                    </div>
                  ) : null;
                })()}
                
                <p className={`mt-3 ${colorScheme.text}`}>{selectedList.description}</p>
                
                <div className="mt-4 space-y-3">
                  {selectedList.movies.map(movieId => {
                    const movie = findMovieById(movieId);
                    return movie ? (
                      <div 
                        key={movieId} 
                        className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg overflow-hidden`}
                        onClick={() => {
                          setCurrentIndex(sampleMovies.findIndex(m => m.id === movieId));
                          setSelectedList(null);
                          setShowSocialScreen(false);
                        }}
                      >
                        <div className="w-16 h-20 bg-gray-300">
                          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 flex-1">
                          <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                            <span className="mx-1">•</span>
                            <span className={`text-xs ${colorScheme.textSecondary}`}>{movie.year}</span>
                          </div>
                          <div className="flex flex-wrap mt-1">
                            {movie.genre.slice(0, 2).map((g, i) => (
                              <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
                
                {selectedList.creator === currentUser.id && (
                  <div className="mt-6 flex justify-center">
                    <button 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-2 flex items-center"
                      onClick={() => showToast("Edit mode would open here")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add More Movies
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render search screen
  if (showSearchScreen) {
    return (
      <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
        {/* Header */}
        <header className={`${colorScheme.card} shadow-sm p-4 flex items-center z-10`}>
          <button 
            className="mr-3"
            onClick={() => setShowSearchScreen(false)}
          >
            <ArrowLeft className={`w-6 h-6 ${colorScheme.text}`} />
          </button>
          <div className={`flex-1 flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-4 py-2`}>
            <Search className={`w-5 h-5 ${colorScheme.textSecondary} mr-2`} />
            <input 
              type="text"
              placeholder="Search movies, genres, actors..."
              className={`w-full bg-transparent focus:outline-none ${colorScheme.text}`}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => handleSearch('')}
                className={`${colorScheme.textSecondary}`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>
        
        <div className="flex-1 p-4">
          {searchQuery === '' ? (
            <div>
              <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Recently Viewed</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {sampleMovies.slice(0, 4).map(movie => (
                  <div 
                    key={movie.id} 
                    className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md`}
                    onClick={() => {
                      setCurrentIndex(sampleMovies.findIndex(m => m.id === movie.id));
                      setShowSearchScreen(false);
                    }}
                  >
                    <div className="h-40 bg-gray-300">
                      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2">
                      <h4 className={`font-medium text-sm truncate ${colorScheme.text}`}>{movie.title}</h4>
                      <p className={`text-xs ${colorScheme.textSecondary}`}>{movie.year}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className={`font-medium mb-4 ${colorScheme.text}`}>Trending Categories</h3>
              <div className="flex flex-wrap">
                {["Action", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance", "Fantasy"].map(genre => (
                  <div 
                    key={genre} 
                    className={`${colorScheme.card} rounded-full px-4 py-2 mr-2 mb-2 flex items-center ${colorScheme.text}`}
                    onClick={() => handleSearch(genre)}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {genre}
                  </div>
                ))}
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(movie => (
                <div 
                  key={movie.id} 
                  className={`${colorScheme.card} rounded-lg overflow-hidden shadow flex`}
                  onClick={() => {
                    setCurrentIndex(sampleMovies.findIndex(m => m.id === movie.id));
                    setShowSearchScreen(false);
                  }}
                >
                  <div className="w-20 h-28 bg-gray-300">
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 flex-1">
                    <h4 className={`font-medium ${colorScheme.text}`}>{movie.title}</h4>
                    <p className={`text-xs ${colorScheme.textSecondary} mb-1`}>{movie.year} • {movie.duration}</p>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                    </div>
                    <div className="flex flex-wrap mt-1">
                      {movie.genre.slice(0, 2).map((g, i) => (
                        <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1">
                          {g}
                        </span>
                      ))}
                      {movie.genre.length > 2 && (
                        <span className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5">
                          +{movie.genre.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Search className={`w-12 h-12 ${colorScheme.textSecondary} mb-4 opacity-40`} />
              <p className={`${colorScheme.textSecondary}`}>No results found for "{searchQuery}"</p>
              <p className={`text-sm ${colorScheme.textSecondary} mt-2`}>Try different keywords or check for typos</p>
            </div>
          )}
        </div>
        
        {/* Bottom Tab Navigation */}
        <div className={`${colorScheme.card} shadow-lg px-4 py-4 flex justify-around border-t ${colorScheme.border}`}>
          <button 
            className={`flex flex-col items-center ${activeTab === 'discover' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => {
              setActiveTab('discover');
              setShowSearchScreen(false);
            }}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Discover</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === 'search' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => setActiveTab('search')}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === 'social' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => {
              setShowSearchScreen(false);
              setShowSocialScreen(true);
            }}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs mt-1">Social</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === 'watchlist' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => {
              setActiveTab('watchlist');
              setShowSearchScreen(false);
              setProfileOpen(true);
            }}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-xs mt-1">Watchlist</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-purple-500' : colorScheme.textSecondary}`}
            onClick={() => {
              setShowSearchScreen(false);
              setProfileOpen(true);
            }}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative h-screen ${colorScheme.bg} max-w-md mx-auto overflow-hidden`}>
      {/* Header */}
      <header className={`${colorScheme.card} shadow-sm p-4 flex justify-between items-center z-10`}>
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setFilterOpen(true)}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg}`}>
            <Sliders className={`w-5 h-5 ${colorScheme.text}`} />
          </div>
        </div>
        <h1 className={`text-xl font-bold ${colorScheme.text}`}>
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">MovieMatch</span>
        </h1>
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg} cursor-pointer relative`}
          onClick={() => setNotificationsOpen(true)}
        >
          <Bell className={`w-5 h-5 ${colorScheme.text}`} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
      </header>
      
      {/* Main content area with fixed height */}
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {/* Empty state when no cards */}
        {!currentMovie && (
          <div className={`flex-grow flex items-center justify-center text-center ${colorScheme.textSecondary} p-8`}>
            <div>
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-medium mb-2">No more recommendations</h3>
              <p className="mb-4">We're finding more great matches for you</p>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2">
                Refresh
              </button>
            </div>
          </div>
        )}
        
        {/* Card Stack Container */}
        <div className="relative flex-grow flex items-center justify-center overflow-hidden">
          {/* Card stack effect - showing next card behind */}
          {currentIndex + 1 < sampleMovies.length && direction === '' && (
            <div className={`absolute w-[90%] max-w-sm ${colorScheme.card} rounded-xl shadow-md overflow-hidden transform scale-95 -translate-y-4 opacity-70`}>
              <img 
                src={sampleMovies[currentIndex + 1].posterUrl} 
                alt="Next movie" 
                className="w-full h-[65vh] object-cover opacity-90"
              />
            </div>
          )}
          
          {/* Current movie card */}
          {currentMovie && (
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
                
                {/* Like/Dislike indicators that appear during swipe */}
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
                
                {/* Movie info on card */}
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
                    
                    {/* Streaming platforms */}
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
                  
                  {/* Short description */}
                  <p className="mt-3 text-sm text-white line-clamp-2 leading-snug">
                    {currentMovie.description}
                  </p>
                </div>
                
                {/* Info button */}
                <button 
                  onClick={() => setShowDetails(true)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-lg transform transition hover:scale-110"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons - positioned at bottom of content area */}
        <div className="mt-auto flex justify-center space-x-8 py-4">
          <button 
            onClick={() => handleSwipe(false)}
            className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
          >
            <X className="w-6 h-6 text-red-500" />
          </button>
          <button 
            onClick={() => {
              if (currentMovie) {
                setWatchlist(prev => {
                  if (!prev.find(item => item.id === currentMovie.id)) {
                    showToast("Added to watchlist!");
                    return [...prev, currentMovie];
                  }
                  return prev;
                });
              }
            }}
            className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
          >
            <Bookmark className="w-6 h-6 text-yellow-500" />
          </button>
          <button 
            onClick={() => handleSwipe(true)}
            className={`${colorScheme.card} rounded-full p-4 shadow-lg transform transition hover:scale-110 hover:shadow-xl active:scale-95`}
          >
            <Heart className="w-6 h-6 text-pink-500" />
          </button>
        </div>
      </div>
      
      {/* Bottom Tab Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${colorScheme.card} shadow-lg px-4 py-4 flex justify-around border-t ${colorScheme.border}`}>
        <button 
          className={`flex flex-col items-center ${activeTab === 'discover' ? 'text-purple-500' : colorScheme.textSecondary}`}
          onClick={() => setActiveTab('discover')}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Discover</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'search' ? 'text-purple-500' : colorScheme.textSecondary}`}
          onClick={() => setShowSearchScreen(true)}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-1">Search</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'social' ? 'text-purple-500' : colorScheme.textSecondary}`}
          onClick={() => setShowSocialScreen(true)}
        >
          <Users className="w-5 h-5" />
          {pendingRecommendations.length > 0 && (
            <span className="absolute top-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          <span className="text-xs mt-1">Social</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'watchlist' ? 'text-purple-500' : colorScheme.textSecondary}`}
          onClick={() => {
            setActiveTab('watchlist');
            setProfileOpen(true);
          }}
        >
          <Bookmark className="w-5 h-5" />
          {watchlist.length > 0 && (
            <span className="absolute top-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          <span className="text-xs mt-1">Watchlist</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-purple-500' : colorScheme.textSecondary}`}
          onClick={() => setProfileOpen(true)}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
      
      {/* Movie Details Modal */}
      {showDetails && currentMovie && (
        <div className={`fixed inset-0 z-50 flex items-end`} onClick={() => setShowDetails(false)}>
          <div
            className={`${colorScheme.card} rounded-t-2xl w-full h-4/5 overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Blurred background image for header */}
              <div className="absolute inset-0 overflow-hidden h-64">
                <img 
                  src={currentMovie.posterUrl} 
                  alt={currentMovie.title} 
                  className="w-full object-cover blur-md opacity-30"
                />
              </div>
              
              <img 
                src={currentMovie.posterUrl} 
                alt={currentMovie.title} 
                className="w-full h-64 object-cover"
              />
              <button 
                onClick={() => setShowDetails(false)}
                className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Shared successfully!");
                  }}
                  className="bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-md"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe(true);
                    setShowDetails(false);
                    showToast("Added to watchlist!");
                  }}
                  className="bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 text-white shadow-md"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute bottom-0 right-0 m-4">
                <button className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full p-3 flex items-center shadow-lg transform transition hover:scale-105 active:scale-95">
                  <Play className="w-5 h-5 fill-current" />
                  <span className="ml-1 font-medium">Watch Trailer</span>
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className={`text-2xl font-bold ${colorScheme.text}`}>{currentMovie.title}</h2>
                  <div className={`${colorScheme.textSecondary} text-sm`}>
                    {currentMovie.director}
                  </div>
                </div>
                
                <div className="flex items-center bg-yellow-400 rounded-lg px-2 py-1">
                  <Star className="w-4 h-4 fill-current text-white" />
                  <span className="ml-1 font-bold text-white">{currentMovie.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center mt-4 flex-wrap">
                <div className={`flex items-center mr-4 ${colorScheme.textSecondary}`}>
                  <Clock className="w-4 h-4" />
                  <span className="ml-1 text-sm">{currentMovie.duration}</span>
                </div>
                <div className={`flex items-center mr-4 ${colorScheme.textSecondary}`}>
                  <Calendar className="w-4 h-4" />
                  <span className="ml-1 text-sm">{currentMovie.year}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap mt-3">
                {currentMovie.genre.map((g, i) => (
                  <span 
                    key={i} 
                    className={`text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full px-3 py-1 mr-2 mb-2 ${colorScheme.text}`}
                  >
                    {g}
                  </span>
                ))}
              </div>
              
              <div className="mt-5">
                <h3 className={`font-medium ${colorScheme.text}`}>Synopsis</h3>
                <p className={`${colorScheme.textSecondary} mt-2 leading-relaxed`}>
                  {currentMovie.description}
                </p>
              </div>
              
              <div className="mt-5">
                <h3 className={`font-medium ${colorScheme.text}`}>Cast</h3>
                <div className="flex overflow-x-auto py-2 space-x-4 no-scrollbar">
                  {currentMovie.cast.map((actor, i) => (
                    <div key={i} className="flex-shrink-0 w-16">
                      <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mb-1`}>
                        <span className="text-xs font-medium">{actor.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <p className={`text-xs text-center ${colorScheme.text} truncate`}>{actor}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-5">
                <div className="flex justify-between items-center">
                  <h3 className={`font-medium ${colorScheme.text}`}>Where to Watch</h3>
                  <button 
                    className={`text-xs text-purple-500`}
                    onClick={() => showToast("Reminder set for this movie!")}
                  >
                    Get notified
                  </button>
                </div>
                <div className="flex mt-2">
                  {currentMovie.streamingOn.map((platform, i) => (
                    <div key={i} className="mr-3">
                      <div className="h-12 w-12 bg-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium">{platform.charAt(0)}</span>
                      </div>
                      <div className="text-xs text-center mt-1">{platform}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-5">
                <div className="flex justify-between items-center">
                  <h3 className={`font-medium ${colorScheme.text}`}>Similar Titles</h3>
                  <button 
                    className={`text-xs text-purple-500`}
                    onClick={() => setSimilarMoviesOpen(true)}
                  >
                    View all
                  </button>
                </div>
                <div className="flex overflow-x-auto py-2 space-x-3 no-scrollbar mt-2">
                  {currentMovie.similarTo.map((id) => {
                    const similarMovie = sampleMovies.find(m => m.id === id);
                    if (!similarMovie) return null;
                    
                    return (
                      <div 
                        key={id} 
                        className="flex-shrink-0 w-28"
                        onClick={() => {
                          setCurrentIndex(sampleMovies.findIndex(m => m.id === id));
                          setShowDetails(false);
                        }}
                      >
                        <div className="w-28 h-40 rounded-lg overflow-hidden mb-1">
                          <img 
                            src={similarMovie.posterUrl} 
                            alt={similarMovie.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className={`text-xs ${colorScheme.text} font-medium truncate`}>{similarMovie.title}</p>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{similarMovie.rating}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Comment section */}
              <div className="mt-6">
                <h3 className={`font-medium ${colorScheme.text}`}>Community Reviews</h3>
                <div className={`mt-2 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-purple-700">JD</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className={`font-medium ${colorScheme.text}`}>John Doe</span>
                        <div className="flex ml-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className="w-3 h-3 fill-current text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className={`text-sm ${colorScheme.textSecondary} mt-1`}>"This movie blew my mind. The plot twists keep you on the edge of your seat!"</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mt-3">
                  <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full p-2 px-4 flex items-center`}>
                    <MessageCircle className={`w-4 h-4 ${colorScheme.textSecondary} mr-2`} />
                    <span className={`text-sm ${colorScheme.textSecondary}`}>Add your review...</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pb-6 flex justify-center space-x-4">
                <button 
                  onClick={() => {
                    setShowDetails(false);
                    handleSwipe(false);
                  }}
                  className={`border ${colorScheme.border} ${colorScheme.text} font-medium rounded-full px-6 py-3 flex items-center`}
                >
                  <X className="w-5 h-5 mr-1" />
                  Not Interested
                </button>
                <button 
                  onClick={() => {
                    setShowDetails(false);
                    handleSwipe(true);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full px-6 py-3 shadow-lg transform transition hover:scale-105 active:scale-95"
                >
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Similar Movies Modal */}
      {similarMoviesOpen && currentMovie && (
        <div className={`fixed inset-0 z-50 ${colorScheme.bg}`}>
          <div className="h-full overflow-y-auto pb-20">
            <header className={`${colorScheme.card} shadow-sm p-4 sticky top-0 z-10 flex items-center`}>
              <button 
                className="mr-3"
                onClick={() => setSimilarMoviesOpen(false)}
              >
                <ArrowLeft className={`w-6 h-6 ${colorScheme.text}`} />
              </button>
              <h2 className={`text-lg font-bold ${colorScheme.text}`}>Similar to {currentMovie.title}</h2>
            </header>
            
            <div className="p-4 grid grid-cols-2 gap-4">
              {sampleMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md`}
                  onClick={() => {
                    setCurrentIndex(sampleMovies.findIndex(m => m.id === movie.id));
                    setSimilarMoviesOpen(false);
                  }}
                >
                  <div className="h-48 bg-gray-300">
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <h4 className={`font-medium ${colorScheme.text}`}>{movie.title}</h4>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                      <span className="mx-1">•</span>
                      <span className={`text-xs ${colorScheme.textSecondary}`}>{movie.year}</span>
                    </div>
                    <div className="flex flex-wrap mt-1">
                      {movie.genre.slice(0, 2).map((g, i) => (
                        <span key={i} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 mr-1 mb-1">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Panel */}
      {notificationsOpen && (
        <div className={`fixed inset-0 z-50 ${colorScheme.bg}`}>
          <div className="h-full overflow-y-auto pb-20">
            <header className={`${colorScheme.card} shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between`}>
              <div className="flex items-center">
                <button 
                  className="mr-3"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <ArrowLeft className={`w-6 h-6 ${colorScheme.text}`} />
                </button>
                <h2 className={`text-lg font-bold ${colorScheme.text}`}>Notifications</h2>
              </div>
              <button 
                className={colorScheme.textSecondary}
                onClick={() => showToast("All notifications marked as read")}
              >
                Mark all as read
              </button>
            </header>
            
            <div className="p-4">
              <div className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md mb-4`}>
                <div className="p-4 border-l-4 border-purple-500">
                  <div className="flex items-center mb-2">
                    <Zap className="w-5 h-5 text-purple-500 mr-2" />
                    <h4 className={`font-medium ${colorScheme.text}`}>New Recommendation!</h4>
                  </div>
                  <p className={`text-sm ${colorScheme.textSecondary}`}>We found a new title that matches your preferences.</p>
                  <p className={`text-sm font-medium ${colorScheme.text} mt-1`}>"Inception" is now available on Netflix</p>
                  <div className="flex justify-end mt-2">
                    <button 
                      className="text-purple-500 text-sm"
                      onClick={() => {
                        setNotificationsOpen(false);
                        setCurrentIndex(0);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md mb-4 opacity-60`}>
                <div className="p-4 border-l-4 border-blue-500">
                  <div className="flex items-center mb-2">
                    <Bell className="w-5 h-5 text-blue-500 mr-2" />
                    <h4 className={`font-medium ${colorScheme.text}`}>Price Drop Alert</h4>
                  </div>
                  <p className={`text-sm ${colorScheme.textSecondary}`}>"Parasite" is now available to rent for $2.99</p>
                  <div className="flex justify-end mt-2">
                    <button className="text-blue-500 text-sm">View Offer</button>
                  </div>
                </div>
              </div>
              
              <div className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md mb-4 opacity-60`}>
                <div className="p-4 border-l-4 border-green-500">
                  <div className="flex items-center mb-2">
                    <Bookmark className="w-5 h-5 text-green-500 mr-2" />
                    <h4 className={`font-medium ${colorScheme.text}`}>New on Your Watchlist</h4>
                  </div>
                  <p className={`text-sm ${colorScheme.textSecondary}`}>"Stranger Things" Season 4 is now available on Netflix</p>
                  <div className="flex justify-end mt-2">
                    <button className="text-green-500 text-sm">Watch Now</button>
                  </div>
                </div>
              </div>
              
              <h3 className={`font-medium mt-6 mb-3 ${colorScheme.text}`}>Earlier</h3>
              
              <div className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md mb-4 opacity-60`}>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <h4 className={`font-medium ${colorScheme.text}`}>Rate Your Watch</h4>
                  </div>
                  <p className={`text-sm ${colorScheme.textSecondary}`}>How would you rate "The Queen's Gambit"?</p>
                  <div className="flex mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setFilterOpen(false)}>
          <div 
            className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className={`text-xl font-bold ${colorScheme.text}`}>Refine Your Matches</h2>
                <button onClick={() => setFilterOpen(false)}>
                  <X className={`w-6 h-6 ${colorScheme.text}`} />
                </button>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Genres</h3>
                <div className="flex flex-wrap">
                  {["Action", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"].map((genre) => (
                    <div key={genre} className="mr-2 mb-2">
                      <input 
                        type="checkbox" 
                        id={genre} 
                        className="sr-only peer" 
                        checked={filterPreferences.genres.includes(genre)}
                        onChange={() => toggleGenreFilter(genre)}
                      />
                      <label 
                        htmlFor={genre} 
                        className={`cursor-pointer px-3 py-2 rounded-full ${
                          darkMode 
                            ? filterPreferences.genres.includes(genre) ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300' 
                            : filterPreferences.genres.includes(genre) ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'
                        } transition-colors`}
                      >
                        {genre}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Streaming Services</h3>
                <div className="flex flex-wrap">
                  {["Netflix", "Hulu", "Prime Video", "Disney+", "HBO Max", "Apple TV+"].map((service) => (
                    <div key={service} className="mr-2 mb-2">
                      <input 
                        type="checkbox" 
                        id={service} 
                        className="sr-only peer" 
                        checked={filterPreferences.services.includes(service)}
                        onChange={() => toggleServiceFilter(service)}
                      />
                      <label 
                        htmlFor={service} 
                        className={`cursor-pointer px-3 py-2 rounded-full ${
                          darkMode 
                            ? filterPreferences.services.includes(service) ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300' 
                            : filterPreferences.services.includes(service) ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'
                        } transition-colors`}
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Release Year</h3>
                <div className="px-2">
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${colorScheme.text}`}>{filterPreferences.yearRange[0]}</span>
                    <span className={`text-sm ${colorScheme.text}`}>{filterPreferences.yearRange[1]}</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="1970" 
                    max="2025" 
                    className="w-full accent-purple-500"
                    value={filterPreferences.yearRange[0]}
                    onChange={(e) => setYearRangeFilter([parseInt(e.target.value), filterPreferences.yearRange[1]])}
                  />
                  <input 
                    type="range" 
                    min="1970" 
                    max="2025" 
                    className="w-full accent-purple-500"
                    value={filterPreferences.yearRange[1]}
                    onChange={(e) => setYearRangeFilter([filterPreferences.yearRange[0], parseInt(e.target.value)])}
                  />
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Minimum Rating</h3>
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-8 h-8 cursor-pointer ${
                          star <= Math.ceil(filterPreferences.minRating / 2) 
                            ? 'text-yellow-400 fill-current' 
                            : colorScheme.textSecondary
                        }`}
                        onClick={() => setRatingFilter(star * 2)}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-yellow-500 font-medium">{filterPreferences.minRating}+</span>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-8">
                <button 
                  className={`flex-1 border ${colorScheme.border} ${colorScheme.text} py-3 rounded-lg font-medium`}
                  onClick={() => {
                    setFilterPreferences({
                      genres: [],
                      services: [],
                      minRating: 7,
                      yearRange: [1970, 2025]
                    });
                  }}
                >
                  Reset
                </button>
                <button 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium"
                  onClick={applyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Sidebar */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex" onClick={() => setProfileOpen(false)}>
          <div 
            className={`${colorScheme.card} w-full md:w-4/5 h-full overflow-y-auto transform transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className={`text-xl font-bold ${colorScheme.text}`}>Your Profile</h2>
                <button onClick={() => setProfileOpen(false)}>
                  <X className={`w-6 h-6 ${colorScheme.text}`} />
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 flex items-center justify-center text-white">
                  <span className="text-3xl">A</span>
                </div>
                <h3 className={`text-lg font-medium ${colorScheme.text}`}>Alex Johnson</h3>
                <p className={colorScheme.textSecondary}>Movie Enthusiast</p>
                <button className={`mt-4 text-sm border ${colorScheme.border} rounded-full px-4 py-1 ${colorScheme.text}`}>
                  Edit Profile
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Your Preferences</h3>
                
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4 mb-4`}>
                  <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Favorite Genres</h4>
                  <div className="flex flex-wrap">
                    {["Sci-Fi", "Thriller", "Drama", "Comedy"].map(genre => (
                      <span 
                        key={genre} 
                        className="text-xs bg-purple-100 text-purple-800 rounded-full px-3 py-1 mr-2 mb-2"
                      >
                        {genre}
                      </span>
                    ))}
                    <button className="text-xs bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4`}>
                  <h4 className={`text-sm font-medium ${colorScheme.text} mb-2`}>Streaming Services</h4>
                  <div className="flex flex-wrap">
                    {["Netflix", "Hulu", "Prime Video"].map(service => (
                      <span 
                        key={service} 
                        className="text-xs bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2 mb-2"
                      >
                        {service}
                      </span>
                    ))}
                    <button className="text-xs bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-medium ${colorScheme.text}`}>Your Watchlist</h3>
                  <button className="text-xs text-purple-500">See All</button>
                </div>
                
                <div className="space-y-3">
                  {watchlist.length > 0 ? (
                    watchlist.map(movie => (
                      <div 
                        key={movie.id} 
                        className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden group`}
                      >
                        <div className="w-16 h-20 bg-gray-300">
                          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 flex-1">
                          <h4 className={`font-medium text-sm ${colorScheme.text}`}>{movie.title}</h4>
                          <p className={`text-xs ${colorScheme.textSecondary}`}>{movie.genre[0]} • {movie.year}</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>{movie.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center pr-3">
                          <button 
                            className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}
                            onClick={() => {
                              setCurrentIndex(sampleMovies.findIndex(m => m.id === movie.id));
                              setProfileOpen(false);
                            }}
                          >
                            <Play className="w-4 h-4 text-purple-500" />
                          </button>
                          <button 
                            className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ml-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                            onClick={() => {
                              setWatchlist(watchlist.filter(m => m.id !== movie.id));
                              showToast("Removed from watchlist");
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${colorScheme.textSecondary}`}>
                      <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Your watchlist is empty</p>
                      <p className="text-sm mt-1">Swipe right on movies you want to watch later</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-medium ${colorScheme.text}`}>Watch History</h3>
                  <button 
                    className="text-xs text-purple-500"
                    onClick={() => {
                      setWatchedHistory([]);
                      showToast("Watch history cleared");
                    }}
                  >
                    Clear History
                  </button>
                </div>
                
                <div className="space-y-2">
                  {watchedHistory.length > 0 ? (
                    watchedHistory.slice(-3).reverse().map((item, index) => (
                      <div 
                        key={index} 
                        className={`flex ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden p-2`}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img src={item.movie.posterUrl} alt={item.movie.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className={`text-sm font-medium ${colorScheme.text}`}>{item.movie.title}</h4>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              item.action === 'liked' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.action === 'liked' ? 'Liked' : 'Disliked'}
                            </span>
                          </div>
                          <p className={`text-xs ${colorScheme.textSecondary}`}>
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${colorScheme.textSecondary}`}>
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No watch history yet</p>
                      <p className="text-sm mt-1">Your interaction history will appear here</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Account Settings</h3>
                <ul className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden divide-y ${colorScheme.border}`}>
                  {[
                    { label: "Notifications", icon: <Bell className="w-5 h-5 mr-3" /> },
                    { label: "Privacy", icon: <User className="w-5 h-5 mr-3" /> },
                    { label: "Connected Accounts", icon: <Link className="w-5 h-5 mr-3" /> },
                    { label: "Help & Support", icon: <MessageCircle className="w-5 h-5 mr-3" /> },
                    { label: "App Settings", icon: <Settings className="w-5 h-5 mr-3" /> }
                  ].map(item => (
                    <li key={item.label} className="px-4 py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        {item.icon}
                        <span className={colorScheme.text}>{item.label}</span>
                      </div>
                      <span className="text-gray-400">›</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="w-full mt-8 py-3 text-red-500 font-medium rounded-lg border border-red-200">
                Sign Out
              </button>
            </div>
          </div>
          <div 
            className="flex-1" 
            onClick={() => setProfileOpen(false)}
          ></div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center z-50 pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full shadow-lg">
            {toast.message}
          </div>
        </div>
      )}
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setShowSettingsModal(false)}>
          <div 
            className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className={`text-xl font-bold ${colorScheme.text}`}>Appearance Settings</h2>
                <button onClick={() => setShowSettingsModal(false)}>
                  <X className={`w-6 h-6 ${colorScheme.text}`} />
                </button>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Theme</h3>
                <div className="flex flex-col space-y-4">
                  <div 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    onClick={() => setDarkMode(true)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-lg">🌙</span>
                      </div>
                      <div>
                        <h4 className={`font-medium ${colorScheme.text}`}>Dark Mode</h4>
                        <p className={`text-xs ${colorScheme.textSecondary}`}>Easier on the eyes in low light</p>
                      </div>
                    </div>
                    {darkMode && <div className="w-5 h-5 rounded-full bg-purple-500"></div>}
                  </div>
                  
                  <div 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${!darkMode ? 'bg-gray-200' : 'bg-gray-700'}`}
                    onClick={() => setDarkMode(false)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-lg">☀️</span>
                      </div>
                      <div>
                        <h4 className={`font-medium ${colorScheme.text}`}>Light Mode</h4>
                        <p className={`text-xs ${colorScheme.textSecondary}`}>Better visibility in bright light</p>
                      </div>
                    </div>
                    {!darkMode && <div className="w-5 h-5 rounded-full bg-purple-500"></div>}
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Text Size</h3>
                <div className="px-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1" 
                    defaultValue="3"
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className={colorScheme.textSecondary}>A</span>
                    <span className={colorScheme.textSecondary}>AA</span>
                    <span className={colorScheme.textSecondary}>AAA</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-medium mb-3 ${colorScheme.text}`}>Animations</h3>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-3 rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${colorScheme.text}`}>Enable animations</h4>
                      <p className={`text-xs ${colorScheme.textSecondary}`}>Card swipes, transitions, and effects</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" id="animations" defaultChecked />
                      <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg py-3"
                  onClick={() => {
                    setShowSettingsModal(false);
                    showToast("Settings saved");
                  }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieSwipeApp;