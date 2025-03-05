// src/modals/RateMovieModal.jsx
import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const RateMovieModal = ({ movieToRate, setShowRateModal, onRateSubmit }) => {
  const { colorScheme, darkMode } = useAppContext();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!movieToRate) return null;

  const handleSubmit = () => {
    if (rating > 0) {
      onRateSubmit(movieToRate.id, rating, comment);
      setShowRateModal(false);
    }
  };

  const ratingLabels = [
    'Select a rating',
    'Poor',
    'Fair',
    'Good',
    'Very Good',
    'Excellent'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowRateModal(false)}>
      <div 
        className={`${colorScheme.card} w-11/12 max-w-md rounded-xl overflow-hidden shadow-xl transform transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Blurred background header */}
          <div className="absolute inset-x-0 top-0 h-32 overflow-hidden">
            <img 
              src={movieToRate.posterUrl}
              alt="background" 
              className="w-full h-full object-cover blur-sm opacity-30"
            />
            <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-b from-gray-900' : 'bg-gradient-to-b from-white'}`}></div>
          </div>
          
          <div className="relative px-6 pt-6 pb-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className={`text-xl font-bold ${colorScheme.text}`}>Rate this movie</h2>
              <button 
                onClick={() => setShowRateModal(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                <X className={`w-5 h-5 ${colorScheme.text}`} />
              </button>
            </div>
            
            <div className="flex mb-6">
              <div className="w-24 h-36 bg-gray-300 rounded-lg overflow-hidden mr-4 shadow-md">
                <img 
                  src={movieToRate.posterUrl} 
                  alt={movieToRate.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${colorScheme.text} mb-1.5`}>{movieToRate.title}</h3>
                <div className="flex items-center mb-2">
                  <div className="bg-yellow-400 text-yellow-900 rounded-md px-2 py-0.5 text-xs font-bold flex items-center shadow-sm">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {movieToRate.rating}
                  </div>
                  <span className={`mx-2 text-xs ${colorScheme.textSecondary}`}>•</span>
                  <span className={`text-sm ${colorScheme.textSecondary}`}>{movieToRate.year}</span>
                </div>
                <div className="flex flex-wrap">
                  {movieToRate.genre && movieToRate.genre.slice(0, 3).map((g, i) => (
                    <span key={i} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-2 py-0.5 mr-1 mb-1 shadow-sm">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className={`text-base font-semibold ${colorScheme.text}`}>Your Rating</p>
                {rating > 0 && (
                  <span className={`text-sm font-medium ${
                    rating >= 4 ? 'text-green-500' : (rating >= 3 ? 'text-yellow-500' : 'text-red-500')
                  }`}>
                    {ratingLabels[rating]}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-center p-4 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className={`focus:outline-none transition-all duration-200 transform ${
                        (hoveredRating ? star <= hoveredRating : star <= rating)
                          ? 'scale-110'
                          : 'scale-100'
                      }`}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          (hoveredRating ? star <= hoveredRating : star <= rating)
                            ? 'text-yellow-400 fill-current drop-shadow-lg'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className={`block text-sm font-semibold ${colorScheme.text} mb-2`}>
                Your Review <span className="font-normal text-xs">(Optional)</span>
              </label>
              <textarea
                className={`w-full px-4 py-3 rounded-lg border ${colorScheme.border} bg-transparent ${colorScheme.text} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                rows="3"
                placeholder="Share your thoughts about this movie..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className={`px-5 py-2.5 rounded-lg border ${colorScheme.border} ${colorScheme.text} font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                onClick={() => setShowRateModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md hover:shadow-lg transition-all ${
                  rating === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:translate-y-[-1px]'
                }`}
                onClick={handleSubmit}
                disabled={rating === 0}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateMovieModal;