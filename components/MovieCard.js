import Link from 'next/link';
import { useState } from 'react';
import { FaStar, FaBookmark, FaRegBookmark, FaInfoCircle } from 'react-icons/fa';
import { addToWatchlist } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function MovieCard({ movie, inWatchlist: initialInWatchlist = false, onWatchlistToggle }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialInWatchlist);
  const [isToggling, setIsToggling] = useState(false);
  const { currentUser } = useAuth();
  
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const fallbackPosterUrl = '/placeholder-poster.jpg';
  
  // Format release year
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
  
  // Handle watchlist toggle
  const handleWatchlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigation to movie details
    e.stopPropagation(); // Stop event from bubbling up
    
    if (isToggling) return; // Prevent multiple clicks
    
    if (!currentUser) {
      // If user is not logged in, redirect to login page
      window.location.href = '/login';
      return;
    }
    
    setIsToggling(true);
    
    try {
      // Call the Firebase function to update the watchlist
      await addToWatchlist(currentUser.uid, movie.id, movie);
      
      // Toggle the bookmark state
      setIsBookmarked(!isBookmarked);
      
      // Call optional callback if provided
      if (onWatchlistToggle) {
        onWatchlistToggle(movie.id, !isBookmarked);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      // You could add error handling here (e.g., show a notification)
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <div 
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative rounded-xl overflow-hidden transition-all duration-300 transform bg-secondary hover:scale-105 hover:shadow-xl"
      >
        {/* Movie Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <Link href={`/movie/${movie.id}`}>
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackPosterUrl;
              }}
            />
          </Link>
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          
          {/* Rating badge */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center text-sm">
            <FaStar className="text-accent mr-1" />
            <span className="font-semibold text-white">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>
          
          {/* Watchlist button */}
          <button
            onClick={handleWatchlistToggle}
            disabled={isToggling}
            className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full text-lg ${
              isBookmarked ? 'text-accent bg-background/80' : 'text-white/70 bg-background/50'
            } backdrop-blur-sm hover:text-accent transition-colors duration-200`}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
          
          {/* Info hover overlay */}
          <div className={`absolute inset-0 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            <Link 
              href={`/movie/${movie.id}`}
              className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transform transition-transform duration-300 hover:scale-110"
            >
              <FaInfoCircle className="text-white text-xl" />
            </Link>
          </div>
        </div>
        
        {/* Movie Info */}
        <div className="p-4">
          <Link href={`/movie/${movie.id}`}>
            <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {movie.title}
            </h3>
          </Link>
          
          <div className="flex items-center text-sm text-gray-400 mt-1 mb-2">
            <span>{releaseYear}</span>
            {movie.genres && movie.genres.length > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>{movie.genres[0]}</span>
              </>
            )}
          </div>
          
          {movie.genres && movie.genres.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genres.slice(0, 3).map((genre, index) => (
                <span 
                  key={index} 
                  className="inline-block px-2 py-1 text-xs bg-secondary-light text-gray-300 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}