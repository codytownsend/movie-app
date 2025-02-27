// components/EnhancedMovieCard.js
import Link from 'next/link';
import { useState } from 'react';
import { FaStar, FaBookmark, FaRegBookmark, FaInfoCircle, FaPlay } from 'react-icons/fa';
import { addToWatchlist } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

const EnhancedMovieCard = ({ movie, inWatchlist: initialInWatchlist = false, onWatchlistToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialInWatchlist);
  const [isToggling, setIsToggling] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();
  
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
      router.push('/login');
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
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <div 
      className="group w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative rounded-xl overflow-hidden transition-all duration-300 bg-secondary/40 backdrop-blur-sm shadow-md hover:shadow-xl transform hover:scale-[1.02]"
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
          
          {/* Overlay gradient */}
          <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          
          {/* Rating badge */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1 flex items-center text-xs font-semibold">
            <FaStar className="text-yellow-500 mr-1" />
            <span className="text-white">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>
          
          {/* Watchlist button */}
          <button
            onClick={handleWatchlistToggle}
            disabled={isToggling}
            className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-md backdrop-blur-sm transition-colors ${
              isBookmarked ? 'bg-primary/80 text-black' : 'bg-black/50 text-white hover:bg-black/70'
            }`}
            aria-label={isBookmarked ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
          
          {/* Action buttons overlay */}
          <div className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Link 
              href={`/movie/${movie.id}`}
              className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center text-black transition-transform duration-300 hover:scale-110"
              aria-label="View movie details"
            >
              <FaInfoCircle size={20} />
            </Link>
            
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center text-white transition-transform duration-300 hover:scale-110"
              aria-label="Watch trailer"
              onClick={(e) => e.stopPropagation()}
            >
              <FaPlay size={18} />
            </a>
          </div>
        </div>
        
        {/* Movie Info */}
        <div className="p-4">
          <Link href={`/movie/${movie.id}`} className="block">
            <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {movie.title}
            </h3>
          </Link>
          
          <div className="flex items-center text-sm text-gray-400 mt-1">
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
                  className="inline-block px-2 py-0.5 text-xs bg-secondary-light text-gray-300 rounded-md"
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
};

export default EnhancedMovieCard;