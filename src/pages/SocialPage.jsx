// src/pages/SocialPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, X, UserPlus, User, Check, Clock, UserX, 
  MessageSquare, Star, Eye, Bookmark, ChevronRight,
  Film, Users, Bell, Settings, Heart, Trash2, 
  Calendar, Download, Repeat
} from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MovieDetailsModal from '../modals/MovieDetailsModal';
import RateMovieModal from '../modals/RateMovieModal';
import NotificationsModal from '../modals/NotificationsModal';
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getUserFriends,
  getFriendRequests,
  getRecommendations,
  recommendMovie,
  markRecommendationAsRead
} from '../services/firebase';

const SocialPage = () => {
  const { 
    colorScheme, 
    darkMode, 
    showToast, 
    movies, 
    setActiveTab, 
    watchlist,
    addToWatchlist,
    markMovieAsWatched,
    rateMovie
  } = useAppContext();
  
  const { currentUser, userProfile } = useAuth();
  
  // Local state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('recommendations');
  const [recommendations, setRecommendations] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({ pending: [], sent: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieDetails, setShowMovieDetails] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [movieToRate, setMovieToRate] = useState(null);
  
  // Load data
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);
  
  // Load user data
  const loadUserData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Fetch all data in parallel
      const [friendsData, requestsData, recommendationsData] = await Promise.all([
        getUserFriends(currentUser.uid),
        getFriendRequests(currentUser.uid),
        getRecommendations(currentUser.uid)
      ]);
      
      setUserFriends(friendsData);
      setFriendRequests(requestsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast('Error loading social data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle user search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    
    try {
      const results = await searchUsers(query);
      
      // Remove current user from results
      const filteredResults = results.filter(user => user.uid !== currentUser?.uid);
      
      // Add relationship status to each result
      const resultsWithStatus = filteredResults.map(user => {
        let status = 'none';
        
        // Check if already friends
        if (userFriends.some(friend => friend.uid === user.uid)) {
          status = 'friend';
        }
        // Check if request is pending
        else if (friendRequests.pending.some(pending => pending.uid === user.uid)) {
          status = 'incoming';
        }
        // Check if request was sent
        else if (friendRequests.sent.some(sent => sent.uid === user.uid)) {
          status = 'sent';
        }
        
        return {
          ...user,
          status
        };
      });
      
      setSearchResults(resultsWithStatus);
    } catch (error) {
      console.error('Error searching users:', error);
      showToast('Error searching users');
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Handle friend request actions
  const handleSendFriendRequest = async (userId) => {
    if (!currentUser) {
      showToast('Please log in to send friend requests');
      return;
    }
    
    try {
      // Check if we're trying to add ourselves
      if (userId === currentUser.uid) {
        showToast('You cannot add yourself as a friend');
        return;
      }
      
      await sendFriendRequest(currentUser.uid, userId);
      
      // Update UI
      setSearchResults(prev => 
        prev.map(user => 
          user.uid === userId 
            ? { ...user, status: 'sent' } 
            : user
        )
      );
      
      // Update friend requests
      const updatedRequests = { ...friendRequests };
      const userToAdd = searchResults.find(user => user.uid === userId);
      
      if (userToAdd && !updatedRequests.sent.some(req => req.uid === userId)) {
        updatedRequests.sent.push(userToAdd);
        setFriendRequests(updatedRequests);
      }
      
      showToast('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      showToast('Error sending friend request');
    }
  };
  
  const handleAcceptFriendRequest = async (userId) => {
    try {
      await acceptFriendRequest(currentUser.uid, userId);
      
      // Update UI - move from pending to friends
      const userToAccept = friendRequests.pending.find(user => user.uid === userId);
      
      setFriendRequests(prev => ({
        ...prev,
        pending: prev.pending.filter(user => user.uid !== userId)
      }));
      
      setUserFriends(prev => [...prev, userToAccept]);
      
      showToast('Friend request accepted!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      showToast('Error accepting friend request');
    }
  };
  
  const handleDeclineFriendRequest = async (userId) => {
    try {
      await declineFriendRequest(currentUser.uid, userId);
      
      // Update UI
      setFriendRequests(prev => ({
        ...prev,
        pending: prev.pending.filter(user => user.uid !== userId)
      }));
      
      showToast('Friend request declined');
    } catch (error) {
      console.error('Error declining friend request:', error);
      showToast('Error declining friend request');
    }
  };
  
  const handleRemoveFriend = async (userId) => {
    try {
      await removeFriend(currentUser.uid, userId);
      
      // Update UI
      setUserFriends(prev => prev.filter(friend => friend.uid !== userId));
      
      // Update search results if present
      setSearchResults(prev => 
        prev.map(user => 
          user.uid === userId 
            ? { ...user, status: 'none' } 
            : user
        )
      );
      
      showToast('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      showToast('Error removing friend');
    }
  };
  
  // Movie actions
  const handleViewMovieDetails = (movie) => {
    setSelectedMovie(movie);
    setShowMovieDetails(true);
  };
  
  const handleRateMovie = (movie) => {
    setMovieToRate(movie);
    setShowRateModal(true);
  };
  
  // Recommendation actions
  const handleMarkRecommendationAsRead = async (recommendationId) => {
    try {
      await markRecommendationAsRead(currentUser.uid, recommendationId);
      
      // Update UI
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, read: true } 
            : rec
        )
      );
    } catch (error) {
      console.error('Error marking recommendation as read:', error);
      // No need to show toast for this action
    }
  };
  
  // Format time elapsed
  const formatTimeElapsed = (timestamp) => {
    const now = new Date();
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate(); // Handle Firestore timestamps
    const elapsed = now - date;
    
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };
  
  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className={`min-h-screen ${colorScheme.bg} flex flex-col max-w-md mx-auto overflow-hidden`}>
        <Header />
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 flex items-center justify-center">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${colorScheme.text}`}>Sign in to Connect</h2>
          <p className={`mb-6 ${colorScheme.textSecondary}`}>
            Create an account to connect with friends and share movie recommendations
          </p>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setActiveTab('profile')}
          >
            Sign In / Register
          </button>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col max-w-md mx-auto overflow-hidden">
      {/* App header */}
      <Header />
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <div className="flex w-full px-4">
          <button
            className={`flex-1 py-3 text-center relative ${
              activeSection === 'recommendations' 
                ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                : 'text-gray-400'
            }`}
            onClick={() => setActiveSection('recommendations')}
          >
            <div className="relative inline-block">
              Recommendations
              {recommendations.some(rec => !rec.read) && (
                <span className="absolute -right-6 top-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-center ${
              activeSection === 'friends' 
                ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                : 'text-gray-400'
            }`}
            onClick={() => setActiveSection('friends')}
          >
            <div className="relative inline-block">
              Friends
              {friendRequests.pending.length > 0 && (
                <span className="absolute -right-6 top-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-center ${
              activeSection === 'search' 
                ? 'text-purple-500 border-b-2 border-purple-500 font-medium' 
                : 'text-gray-400'
            }`}
            onClick={() => setActiveSection('search')}
          >
            Find People
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
        
        {/* Recommendations Section */}
        {!isLoading && activeSection === 'recommendations' && (
          <div>
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => {
                  const movie = rec.movie;
                  
                  return (
                    <div key={rec.id} className={`relative p-4 ${!rec.read ? 'bg-purple-900/20 border-l-4 border-purple-500' : 'bg-gray-800'} rounded-lg mb-4`}>
                      {/* Mark as read when viewing */}
                      {!rec.read && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                          New
                        </div>
                      )}
                      
                      {/* User info and timestamp */}
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                          <span className="text-sm font-medium">{rec.sender.displayName?.[0] || rec.sender.username?.[0] || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{rec.sender.displayName}</p>
                          <p className="text-xs text-gray-400">recommended a movie • {formatTimeElapsed(rec.timestamp)}</p>
                        </div>
                      </div>
                      
                      {/* Recommendation message */}
                      {rec.message && (
                        <div className="mb-4 px-4 py-3 bg-gray-800/60 rounded-lg">
                          <p className="text-sm text-gray-300">"{rec.message}"</p>
                        </div>
                      )}
                      
                      {/* Movie card */}
                      <div 
                        className="bg-gray-800/80 rounded-lg overflow-hidden mb-3"
                        onClick={() => {
                          handleViewMovieDetails(movie);
                          if (!rec.read) {
                            handleMarkRecommendationAsRead(rec.id);
                          }
                        }}
                      >
                        <div className="flex p-3">
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title} 
                            className="w-20 h-28 object-cover rounded-md"
                          />
                          <div className="ml-3">
                            <h4 className="font-medium text-white">{movie.title}</h4>
                            <div className="flex items-center mt-1 mb-2">
                              <div className="bg-yellow-500 rounded px-2 py-0.5 text-xs font-bold text-black flex items-center">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                {movie.rating}
                              </div>
                              <span className="mx-2 text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">{movie.year}</span>
                            </div>
                            <div className="flex flex-wrap">
                              {movie.genre && movie.genre.slice(0, 2).map((g, i) => (
                                <span key={i} className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 mr-1 mb-1">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex">
                        <button 
                          className="flex-1 flex items-center justify-center py-2 bg-gray-800/80 text-gray-300 rounded-lg mr-2"
                          onClick={() => {
                            handleViewMovieDetails(movie);
                            if (!rec.read) {
                              handleMarkRecommendationAsRead(rec.id);
                            }
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2 text-blue-400" />
                          View
                        </button>
                        <button 
                          className="flex-1 flex items-center justify-center py-2 bg-gray-800/80 text-gray-300 rounded-lg mr-2"
                          onClick={() => {
                            addToWatchlist(movie);
                            if (!rec.read) {
                              handleMarkRecommendationAsRead(rec.id);
                            }
                          }}
                        >
                          <Bookmark 
                            className="w-4 h-4 mr-2 text-green-400" 
                          />
                          Watchlist
                        </button>
                        <button 
                          className="flex-1 flex items-center justify-center py-2 bg-gray-800/80 text-gray-300 rounded-lg"
                          onClick={() => {
                            if (!rec.read) {
                              handleMarkRecommendationAsRead(rec.id);
                            }
                            handleRateMovie(movie);
                          }}
                        >
                          <Star className="w-4 h-4 mr-2 text-yellow-400" />
                          Rate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Film className="w-8 h-8 text-gray-500" />
                </div>
                <p className="mb-2 text-gray-300">No recommendations yet</p>
                <p className="text-sm text-gray-500 max-w-xs">
                  Your friends haven't sent you any movie recommendations yet
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Friends Section */}
        {!isLoading && activeSection === 'friends' && (
          <div>
            {/* Friend Requests Section - if any */}
            {friendRequests.pending.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Friend Requests</h3>
                <div className="space-y-3">
                  {friendRequests.pending.map(user => (
                    <div key={user.uid} className="bg-gray-800 rounded-lg p-3 flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                        <span className="text-lg font-medium">{user.displayName?.[0] || user.username?.[0] || '?'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white">{user.displayName}</h4>
                        <p className="text-xs text-gray-400">@{user.username}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 rounded-full bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-300 transition-colors"
                          onClick={() => handleDeclineFriendRequest(user.uid)}
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-2 rounded-full bg-gray-700 hover:bg-green-900/50 text-gray-300 hover:text-green-300 transition-colors"
                          onClick={() => handleAcceptFriendRequest(user.uid)}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sent Requests Section - if any */}
            {friendRequests.sent.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Sent Requests</h3>
                <div className="space-y-3">
                  {friendRequests.sent.map(user => (
                    <div key={user.uid} className="bg-gray-800 rounded-lg p-3 flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white mr-3">
                        <span className="text-lg font-medium">{user.displayName?.[0] || user.username?.[0] || '?'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white">{user.displayName}</h4>
                        <p className="text-xs text-gray-400">@{user.username}</p>
                      </div>
                      <div className="flex items-center text-gray-400 ml-2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs">Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Friends List */}
            <div>
              <h3 className="text-white font-medium mb-3">Your Friends</h3>
              {userFriends.length > 0 ? (
                <div className="space-y-3">
                  {userFriends.map(friend => (
                    <div key={friend.uid} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                          <span className="text-lg font-medium">{friend.displayName?.[0] || friend.username?.[0] || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white">{friend.displayName}</h4>
                          <p className="text-xs text-gray-400">@{friend.username}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                            onClick={() => {
                              // In a real app, navigate to friend's profile
                              showToast('View profile coming soon');
                            }}
                          >
                            <User className="w-5 h-5" />
                          </button>
                          <button 
                            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                            onClick={() => {
                              // In a real app, open chat or send recommendation
                              showToast('Send message coming soon');
                            }}
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Friend's favorite genres */}
                      {friend.favoriteGenres?.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-700">
                          <p className="text-xs text-gray-400 mb-2">Favorite Genres</p>
                          <div className="flex flex-wrap">
                            {friend.favoriteGenres.map((genre, idx) => (
                              <span 
                                key={idx} 
                                className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 mr-1 mb-1"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Options button */}
                      <div className="mt-3 pt-2 border-t border-gray-700 flex justify-end">
                        <button 
                          className="text-xs text-red-400 hover:text-red-300 flex items-center"
                          onClick={() => handleRemoveFriend(friend.uid)}
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" />
                          Remove Friend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-300 mb-2">No friends yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Find friends to share movie recommendations
                  </p>
                  <button 
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setActiveSection('search')}
                  >
                    Find Friends
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Search Section */}
        {!isLoading && activeSection === 'search' && (
          <div>
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-800 text-white placeholder-gray-400 rounded-full py-3 pl-10 pr-4 block w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Search for friends by username..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  </button>
                )}
              </div>
            </div>
            
            {searchLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
            
            {/* Search Results */}
            {!searchLoading && searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-white font-medium mb-2">Search Results</h3>
                {searchResults.map(user => (
                  <div key={user.uid} className="bg-gray-800 rounded-lg p-3 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                      <span className="text-lg font-medium">{user.displayName?.[0] || user.username?.[0] || '?'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white">{user.displayName}</h4>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                      {user.bio && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{user.bio}</p>
                      )}
                    </div>
                    <div>
                      {user.status === 'none' && (
                        <button 
                          className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-xs font-medium transition-colors flex items-center"
                          onClick={() => handleSendFriendRequest(user.uid)}
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                          Follow
                        </button>
                      )}
                      {user.status === 'sent' && (
                        <div className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-full text-xs font-medium flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          Pending
                        </div>
                      )}
                      {user.status === 'incoming' && (
                        <button 
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-medium transition-colors flex items-center"
                          onClick={() => handleAcceptFriendRequest(user.uid)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Accept
                        </button>
                      )}
                      {user.status === 'friend' && (
                        <div className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Friends
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Empty State or Initial State */}
            {!searchLoading && searchQuery.length >= 3 && searchResults.length === 0 && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-300 mb-1">No users found</p>
                <p className="text-sm text-gray-500">
                  Try a different username or check spelling
                </p>
              </div>
            )}
            
            {!searchLoading && searchQuery.length < 3 && (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-300 mb-1">Search for friends</p>
                <p className="text-sm text-gray-500">
                  Type at least 3 characters to search
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <BottomNavigation />
      
      {/* Modals */}
      {notificationsOpen && (
        <NotificationsModal 
          setNotificationsOpen={setNotificationsOpen}
        />
      )}

      {/* Movie Details Modal */}
      {showMovieDetails && selectedMovie && (
        <MovieDetailsModal 
          currentMovie={selectedMovie}
          setShowDetails={setShowMovieDetails}
        />
      )}

      {/* Rate Movie Modal */}
      {showRateModal && movieToRate && (
        <RateMovieModal 
          movieToRate={movieToRate}
          setShowRateModal={setShowRateModal}
          onRateSubmit={(movieId, rating, comment) => {
            rateMovie(movieId, rating, comment);
            setShowRateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default SocialPage;