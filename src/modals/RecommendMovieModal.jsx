// src/modals/RecommendMovieModal.jsx
import React, { useState } from 'react';
import { X, Star, Send, MessageSquare, Users, ChevronRight } from 'lucide-react';

const RecommendMovieModal = ({
  movieToRecommend,
  recommendationMessage,
  setRecommendationMessage,
  userFriends,
  selectedFriends,
  setSelectedFriends,
  handleRecommendMovie,
  colorScheme,
  setRecommendMovieModal
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Movie info, 2: Friends selection

  if (!movieToRecommend) return null;

  const handleSubmit = () => {
    setSubmitting(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      handleRecommendMovie();
      setSubmitting(false);
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={() => setRecommendMovieModal(false)}
    >
      <div 
        className={`${colorScheme.card} w-full max-w-md rounded-2xl overflow-hidden shadow-xl transition-all`}
        style={{ maxHeight: "calc(100vh - 40px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section with Progress Indicator */}
        <div className="relative">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"
          ></div>

          <div className="relative px-5 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Share with Friends</h2>
            <button 
              onClick={() => setRecommendMovieModal(false)}
              className="rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="relative flex px-5 pb-3">
            <button 
              className={`flex-1 flex flex-col items-center ${activeStep >= 1 ? 'text-white' : 'text-white/50'}`}
              onClick={() => setActiveStep(1)}
            >
              <span className="text-xs uppercase tracking-wider font-medium">About</span>
              <div className={`w-full h-1 mt-2 rounded-full ${activeStep >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
            </button>
            <button 
              className={`flex-1 flex flex-col items-center ${activeStep >= 2 ? 'text-white' : 'text-white/50'}`}
              onClick={() => activeStep === 2 ? null : setActiveStep(2)}
            >
              <span className="text-xs uppercase tracking-wider font-medium">Friends</span>
              <div className={`w-full h-1 mt-2 rounded-full ${activeStep >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 150px)" }}>
          {activeStep === 1 && (
            <div className="p-5">
              {/* Movie info section with enhanced visual design */}
              <div className="flex mb-5">
                <div className="w-24 h-36 rounded-lg overflow-hidden shadow-md flex-shrink-0 mr-4">
                  <img 
                    src={movieToRecommend.posterUrl} 
                    alt={movieToRecommend.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${colorScheme.text}`}>{movieToRecommend.title}</h3>
                  <div className="flex items-center mt-1 mb-2">
                    <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded-md px-2 py-0.5 flex items-center">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span className={`text-xs ml-1 font-medium text-yellow-700 dark:text-yellow-400`}>
                        {movieToRecommend.rating}
                      </span>
                    </div>
                    <span className={`mx-2 text-xs ${colorScheme.textSecondary}`}>•</span>
                    <span className={`text-xs ${colorScheme.textSecondary}`}>{movieToRecommend.year}</span>
                  </div>
                  <div className="flex flex-wrap">
                    {movieToRecommend.genre.slice(0, 3).map((g, i) => (
                      <span 
                        key={i} 
                        className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 mr-1.5 mb-1.5"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message input with enhanced design */}
              <div className="mb-5">
                <label className={`flex items-center text-sm font-medium ${colorScheme.text} mb-2`}>
                  <MessageSquare className="w-4 h-4 mr-2 text-purple-500" />
                  Why are you recommending this?
                </label>
                <div className={`relative rounded-xl border ${colorScheme.border} overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all`}>
                  <textarea
                    className={`w-full px-4 py-3 bg-transparent ${colorScheme.text} focus:outline-none resize-none`}
                    rows="4"
                    placeholder="This movie reminds me of our conversation about..."
                    value={recommendationMessage}
                    onChange={(e) => setRecommendationMessage(e.target.value)}
                  ></textarea>
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {recommendationMessage.length}/200
                  </div>
                </div>
              </div>

              {/* Continue button */}
              <div className="flex justify-end">
                <button 
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-sm hover:shadow-md transition-all flex items-center"
                  onClick={() => setActiveStep(2)}
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="p-5">
              {/* Friends selection with modern design */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-4">
                  <label className={`flex items-center text-sm font-medium ${colorScheme.text}`}>
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    Select friends
                  </label>
                  <span className={`text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium ${selectedFriends.length === 0 ? 'opacity-0' : ''}`}>
                    {selectedFriends.length} selected
                  </span>
                </div>

                <div className="space-y-2">
                  {userFriends.map(friend => (
                    <div 
                      key={friend.id} 
                      className={`flex items-center p-3 rounded-xl transition-all ${
                        selectedFriends.includes(friend.id) 
                          ? 'bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800' 
                          : `border ${colorScheme.border}`
                      }`}
                      onClick={() => {
                        if (selectedFriends.includes(friend.id)) {
                          setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                        } else {
                          setSelectedFriends([...selectedFriends, friend.id]);
                        }
                      }}
                    >
                      <div 
                        className={`relative w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3 shadow-sm`}
                      >
                        <span className="text-sm font-medium">{friend.avatar}</span>
                        {selectedFriends.includes(friend.id) && (
                          <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${colorScheme.text} truncate`}>{friend.name}</div>
                        <div className={`text-xs ${colorScheme.textSecondary} truncate`}>@{friend.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                <button 
                  className={`px-4 py-2.5 rounded-xl border ${colorScheme.border} ${colorScheme.text} font-medium`}
                  onClick={() => setActiveStep(1)}
                >
                  Back
                </button>
                <button 
                  className={`px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center ${
                    selectedFriends.length > 0
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-md'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={selectedFriends.length > 0 ? handleSubmit : undefined}
                  disabled={selectedFriends.length === 0 || submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Share Recommendation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendMovieModal;