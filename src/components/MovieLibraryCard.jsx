// src/components/MovieLibraryCard.jsx
import React, { useRef } from 'react';
import { Star, Eye, Trophy, Check, EyeOff, Info, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MovieLibraryCard = ({ 
  movie, 
  viewMode, 
  isEditMode, 
  selectedMovies, 
  toggleSelection, 
  showQuickRate, 
  setShowQuickRate, 
  handleQuickRate, 
  toggleWatched, 
  addToFavorites, 
  handleViewDetails 
}) => {
  const { colorScheme } = useAppContext();
  const itemRef = useRef(null);
  
  // Grid view
  if (viewMode === 'grid') {
    return (
      <div 
        ref={itemRef}
        className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transition-all transform hover:scale-[1.02] relative`}
      >
        {/* Favorite badge */}
        {movie.favorite && (
          <div className="absolute top-2 right-2 z-10 bg-yellow-500 rounded-full p-1">
            <Trophy className="w-3 h-3 text-white" />
          </div>
        )}
        
        {/* Selection checkbox for edit mode */}
        {isEditMode && (
          <div className="absolute top-2 left-2 z-10">
            <div 
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedMovies.includes(movie.id)
                  ? 'bg-purple-500 text-white'
                  : 'bg-black bg-opacity-50 border border-white'
              }`}
              onClick={() => toggleSelection(movie.id)}
            >
              {selectedMovies.includes(movie.id) && (
                <Check className="w-3 h-3" />
              )}
            </div>
          </div>
        )}
        
        {/* Poster Image */}
        <div 
          className={`relative h-48 ${isEditMode ? 'opacity-80' : ''}`}
          onClick={() => !isEditMode && handleViewDetails(movie)}
        >
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent h-16 opacity-80"></div>
          
          {/* User Rating */}
          {movie.userRating && (
            <div className="absolute bottom-2 left-2 flex items-center bg-black bg-opacity-70 rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-white ml-1">
                {movie.userRating}
              </span>
            </div>
          )}
          
          {/* Quick Actions */}
          {!isEditMode && (
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <button 
                className="w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatched(movie.id);
                }}
              >
                {movie.watched ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
              
              <button 
                className="w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  if (showQuickRate === movie.id) {
                    setShowQuickRate(null);
                  } else {
                    setShowQuickRate(movie.id);
                  }
                }}
              >
                <Star className="w-3.5 h-3.5" />
              </button>
              
              <button 
                className={`w-7 h-7 rounded-full bg-black bg-opacity-70 flex items-center justify-center text-${movie.favorite ? 'yellow-400' : 'white'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  addToFavorites(movie);
                }}
              >
                <Trophy className={`w-3.5 h-3.5 ${movie.favorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}
        </div>
        
        {/* Movie Info */}
        <div className="p-3">
          <h3 
            className={`font-bold text-base ${colorScheme.text} leading-tight line-clamp-1`}
            onClick={() => !isEditMode && handleViewDetails(movie)}
          >
            {movie.title}
          </h3>
          <div className={`flex items-center mt-1 text-xs ${colorScheme.textSecondary}`}>
            <span>{movie.year}</span>
            {movie.duration && (
              <>
                <span className="mx-1">•</span>
                <span>{movie.duration}</span>
              </>
            )}
          </div>
          
          {/* Quick Rate - Star selector */}
          {showQuickRate === movie.id && (
            <div className="mt-2 p-2 bg-black bg-opacity-70 rounded-lg animate-fade-in">
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button 
                    key={rating}
                    className="p-1.5 rounded-full hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickRate(movie.id, rating);
                    }}
                  >
                    <Star 
                      className={`w-4 h-4 ${
                        (movie.userRating && rating <= movie.userRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // List view
  return (
    <div 
      ref={itemRef}
      className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transform transition-all relative`}
    >
      <div className="flex">
        {/* Selection checkbox for edit mode */}
        {isEditMode && (
          <div className="absolute top-3 left-3 z-10">
            <div 
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedMovies.includes(movie.id)
                  ? 'bg-purple-500 text-white'
                  : 'bg-black bg-opacity-50 border border-white'
              }`}
              onClick={() => toggleSelection(movie.id)}
            >
              {selectedMovies.includes(movie.id) && (
                <Check className="w-3 h-3" />
              )}
            </div>
          </div>
        )}
      
        {/* Poster Image */}
        <div 
          className={`relative w-24 h-36 flex-shrink-0 ${isEditMode ? 'ml-4 opacity-80' : ''}`}
          onClick={() => !isEditMode && handleViewDetails(movie)}
        >
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
            {/* Favorite badge */}
            {movie.favorite && (
              <div className="bg-yellow-500 rounded-full p-1 shadow">
                <Trophy className="w-3 h-3 text-white" />
              </div>
            )}
            
            {/* Watched badge */}
            {movie.watched && (
              <div className="bg-green-500 rounded-full p-1 shadow">
                <Eye className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Movie Info */}
        <div 
          className="p-3 flex-1 flex flex-col" 
          onClick={() => !isEditMode && handleViewDetails(movie)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={`font-bold text-base ${colorScheme.text} leading-tight`}>
                {movie.title}
              </h3>
              <div className={`flex items-center mt-1 text-xs ${colorScheme.textSecondary}`}>
                <span>{movie.year}</span>
                {movie.duration && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{movie.duration}</span>
                  </>
                )}
              </div>
            </div>
            
            {!isEditMode && (
              <div className="flex">
                {movie.userRating ? (
                  <div className="flex items-center bg-yellow-400 bg-opacity-20 rounded-full px-2 py-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className={`text-xs font-medium ml-1 text-yellow-600 dark:text-yellow-400`}>
                      {movie.userRating}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                    <Star className="w-3 h-3 text-gray-400" />
                    <span className={`text-xs ml-1 ${colorScheme.textSecondary}`}>
                      {movie.rating}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Genre Tags */}
          <div className="flex flex-wrap my-1">
            {movie.genre && movie.genre.slice(0, 2).map((genre, idx) => (
              <span 
                key={idx}
                className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1"
              >
                {genre}
              </span>
            ))}
            {movie.genre && movie.genre.length > 2 && (
              <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1">
                +{movie.genre.length - 2}
              </span>
            )}
          </div>
          
          {/* Bottom actions */}
          {!isEditMode && (
            <div className="flex items-center justify-between mt-auto pt-1">
              <div className="flex space-x-2">
                <button 
                  className={`text-xs flex items-center ${movie.watched ? 'text-green-500' : colorScheme.textSecondary}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatched(movie.id);
                  }}
                >
                  {movie.watched ? (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Unwatched
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Watched
                    </>
                  )}
                </button>
                
                <button 
                  className={`text-xs flex items-center ${movie.favorite ? 'text-yellow-500' : colorScheme.textSecondary}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToFavorites(movie);
                  }}
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  {movie.favorite ? 'Unfavorite' : 'Favorite'}
                </button>
                
                <button 
                  className="text-xs flex items-center text-yellow-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showQuickRate === movie.id) {
                      setShowQuickRate(null);
                    } else {
                      setShowQuickRate(movie.id);
                    }
                  }}
                >
                  <Star className="w-3 h-3 mr-1" />
                  Rate
                </button>
              </div>
              
              <button
                className={`text-xs flex items-center ${colorScheme.textSecondary}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(movie);
                }}
              >
                <Info className="w-3 h-3 mr-1" />
                Details
              </button>
            </div>
          )}
          
          {/* Quick Rate - Star selector */}
          {showQuickRate === movie.id && (
            <div className="mt-2 p-2 bg-black bg-opacity-70 rounded-lg animate-fade-in">
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button 
                    key={rating}
                    className="p-1.5 rounded-full hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickRate(movie.id, rating);
                    }}
                  >
                    <Star 
                      className={`w-4 h-4 ${
                        (movie.userRating && rating <= movie.userRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Actions - Desktop */}
        {!isEditMode && (
          <div className={`${colorScheme.bg} flex flex-col justify-center px-2`}>
            <ChevronRight className={`w-5 h-5 ${colorScheme.textSecondary}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieLibraryCard;