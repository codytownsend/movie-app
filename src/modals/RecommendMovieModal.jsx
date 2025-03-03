// src/modals/RecommendMovieModal.js
import React from 'react';
import { X, Share2, Plus } from 'lucide-react';

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
  if (!movieToRecommend) return null;
  return (
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
                <Share2 className="w-3 h-3 text-yellow-400 fill-current" />
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
              className={`px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white ${selectedFriends.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleRecommendMovie}
              disabled={selectedFriends.length === 0}
            >
              Send Recommendation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendMovieModal;
