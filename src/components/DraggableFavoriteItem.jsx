// src/components/DraggableFavoriteItem.jsx
import React, { useRef } from 'react';
import { Check, Eye, EyeOff, Info, GripVertical } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const DraggableFavoriteItem = ({ 
  movie, 
  index, 
  isEditMode, 
  isEditing, 
  dragHandlers,
  selectedMovies,
  toggleSelection,
  toggleWatched,
  handleViewDetails
}) => {
  const itemRef = useRef(null);
  const { colorScheme } = useAppContext();
  
  const dragProps = isEditing ? {
    draggable: true,
    onDragStart: (e) => dragHandlers.onDragStart(e, index),
    onDragEnter: (e) => dragHandlers.onDragEnter(e, index),
    onDragOver: (e) => e.preventDefault(),
    ref: itemRef
  } : {};
  
  return (
    <div 
      className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md transition-all relative ${
        isEditing ? 'cursor-move draggable hover:shadow-lg' : ''
      }`}
      {...dragProps}
      ref={itemRef}
    >
      {/* Favorite Rank Badge */}
      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-lg shadow-md">
        {movie.favoriteRank || index + 1}
      </div>
      
      {/* Selection checkbox for edit mode */}
      {isEditMode && (
        <div className="absolute top-3 right-3 z-10">
          <div 
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              selectedMovies?.includes(movie.id)
                ? 'bg-purple-500 text-white'
                : 'bg-black bg-opacity-50 border border-white'
            }`}
            onClick={() => toggleSelection(movie.id)}
          >
            {selectedMovies?.includes(movie.id) && <Check className="w-3 h-3" />}
          </div>
        </div>
      )}
      
      {/* Drag handle */}
      {isEditing && (
        <div className="absolute top-3 right-3 z-10 p-1 bg-black bg-opacity-50 rounded-md">
          <GripVertical className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className="flex">
        {/* Movie Poster */}
        <div 
          className="w-1/3 aspect-[2/3] relative flex-shrink-0"
          onClick={() => !isEditMode && !isEditing && handleViewDetails(movie)}
        >
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
          
          {/* Watched Badge */}
          {movie.watched && !isEditMode && (
            <div className="absolute bottom-2 left-2 z-10 bg-green-500 rounded-full p-1 shadow">
              <Eye className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        {/* Movie Info */}
        <div 
          className="p-3 flex-1 flex flex-col relative"
          onClick={() => !isEditMode && !isEditing && handleViewDetails(movie)}
        >
          <h3 className={`font-bold ${colorScheme.text} text-base leading-tight`}>
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
          
          {/* User Rating */}
          {movie.userRating && (
            <div className="mt-2 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <div 
                  key={star}
                  className={`w-4 h-4 flex items-center justify-center ${
                    star <= movie.userRating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              ))}
            </div>
          )}
          
          {/* Genre Tags */}
          <div className="flex flex-wrap mt-2">
            {movie.genre && movie.genre.slice(0, 2).map((genre, idx) => (
              <span 
                key={idx}
                className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 mr-1 mb-1"
              >
                {genre}
              </span>
            ))}
          </div>
          
          {/* Action Buttons */}
          {!isEditMode && !isEditing && (
            <div className="flex justify-between mt-auto pt-2">
              <button 
                className={`px-3 py-1 rounded-full text-xs ${
                  movie.watched
                    ? 'bg-green-500 bg-opacity-20 text-green-500'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatched(movie.id);
                }}
              >
                {movie.watched ? (
                  <span className="flex items-center">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Unwatched
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Watched
                  </span>
                )}
              </button>
              
              <button
                className="px-3 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(movie);
                }}
              >
                <span className="flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Details
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraggableFavoriteItem;