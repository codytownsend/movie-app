import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { addMovieRating, addToWatchlist } from '../../utils/firebase';
import { FaStar, FaPlus, FaCheck, FaPlay, FaInfoCircle, FaHeart, FaImdb, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { getMovieById } from '../../utils/movieService';
import Link from 'next/link';

// Movie component that contains the title, rating, and other info
const MovieMetadata = ({ movie, handleWatchlist, inWatchlist, handleRating, userRating, hoverRating, setHoverRating }) => {
  return (
    <div className="flex-grow z-10 text-white">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{movie.title}</h1>
      
      <div className="flex flex-wrap items-center gap-3 text-sm text-white/80 mb-4">
        <span>{new Date(movie.release_date).getFullYear()}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
        <span>{formatRuntime(movie.runtime || 120)}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
        <div className="flex items-center">
          <FaStar className="text-accent mr-1" />
          <span>{movie.vote_average?.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {movie.genres && movie.genres.map((genre, index) => (
          <Link 
            href={`/discover?genre=${encodeURIComponent(genre)}`} 
            key={index} 
            className="px-3 py-1 bg-secondary-light hover:bg-secondary text-gray-300 rounded-full text-sm transition-colors"
          >
            {genre}
          </Link>
        ))}
      </div>
      
      <p className="text-lg text-white/90 mb-8 max-w-3xl">{movie.overview}</p>
      
      {movie.director && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Director</h3>
          <p className="text-white/80">{movie.director}</p>
        </div>
      )}
      
      {movie.cast && movie.cast.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">Cast</h3>
          <div className="flex flex-wrap gap-2">
            {movie.cast.map((actor, index) => (
              <span key={index} className="px-3 py-1 bg-secondary-light text-gray-300 rounded-full text-sm">
                {actor}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* User actions */}
      <div className="flex flex-wrap gap-4 mt-8">
        <Link
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg flex items-center transition transform hover:scale-105 shadow-glow-accent"
        >
          <FaPlay className="mr-2" />
          Watch Trailer
        </Link>
        
        <button
          onClick={handleWatchlist}
          className={`flex items-center px-6 py-3 rounded-lg ${
            inWatchlist
              ? 'bg-secondary-light text-white border border-primary'
              : 'bg-primary hover:bg-primary-dark text-white'
          } transition transform hover:scale-105`}
        >
          {inWatchlist ? (
            <>
              <FaBookmark className="mr-2" />
              In Watchlist
            </>
          ) : (
            <>
              <FaRegBookmark className="mr-2" />
              Add to Watchlist
            </>
          )}
        </button>
        
        <a
          href={`https://www.imdb.com/find?q=${encodeURIComponent(movie.title)}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-3 bg-secondary-light hover:bg-secondary text-white font-medium rounded-lg flex items-center transition"
        >
          <FaImdb className="mr-2 text-yellow-400" />
          IMDb
        </a>
      </div>
      
      {/* Rating */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-3">Your Rating</h3>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl mr-1 focus:outline-none transition-colors duration-200"
            >
              <FaStar
                className={`transform transition-transform duration-200 hover:scale-110 ${
                  star <= (hoverRating || userRating)
                    ? 'text-accent'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
          <div className="ml-3 flex items-center text-gray-400">
            {userRating ? `You rated this ${userRating}/5` : 'Rate this movie'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to format runtime from minutes to hours and minutes
const formatRuntime = (minutes) => {
  if (!minutes) return 'Unknown';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Similar Movie Card for the horizontal scroller
const SimilarMovieCard = ({ movie, onClick }) => {
  const posterUrl = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
  
  return (
    <div 
      className="flex-shrink-0 w-36 md:w-48 mr-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className="rounded-lg overflow-hidden bg-secondary relative">
        <div className="aspect-[2/3] relative">
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <FaPlay className="text-white text-2xl" />
          </div>
        </div>
      </div>
      <h3 className="mt-2 text-sm font-medium text-white line-clamp-1 group-hover:text-primary transition-colors">
        {movie.title}
      </h3>
      <div className="flex items-center mt-1 text-xs text-gray-400">
        <span>{new Date(movie.release_date).getFullYear()}</span>
        <span className="mx-2">•</span>
        <div className="flex items-center">
          <FaStar className="text-accent mr-1" />
          <span>{movie.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default function MovieDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [similarMovies, setSimilarMovies] = useState([]);
  
  useEffect(() => {
    if (id) {
      const fetchMovie = async () => {
        setLoading(true);
        try {
          // Fetch movie details
          const movieData = await getMovieById(parseInt(id));
          setMovie(movieData);
          
          // For demo purposes - random similar movies
          // In a real app, you'd fetch these from an API
          const randomSimilarMovies = await Promise.all(
            (movieData.similar_movies || [1, 2, 3, 4, 5, 6].filter(mid => mid !== parseInt(id)))
              .slice(0, 6)
              .map(async (movieId) => {
                try {
                  return await getMovieById(movieId);
                } catch (error) {
                  console.error(`Error fetching similar movie ${movieId}:`, error);
                  return null;
                }
              })
          );
          
          setSimilarMovies(randomSimilarMovies.filter(Boolean));
          
          // Random values for demo purposes
          setInWatchlist(Math.random() > 0.5);
          setUserRating(Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0);
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching movie:', error);
          setError('Movie not found');
          setLoading(false);
        }
      };
      
      fetchMovie();
    }
  }, [id]);
  
  const handleRating = async (rating) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    setUserRating(rating);
    
    try {
      await addMovieRating(currentUser.uid, id, rating);
      // Success notification could be added here
    } catch (error) {
      console.error('Error adding rating:', error);
      // Error handling
    }
  };
  
  const handleWatchlist = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    try {
      await addToWatchlist(currentUser.uid, id, movie);
      setInWatchlist(!inWatchlist);
      // Success notification could be added here
    } catch (error) {
      console.error('Error updating watchlist:', error);
      // Error handling
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-24">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }
  
  if (error || !movie) {
    return (
      <Layout>
        <div className="bg-secondary rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error || 'Movie not found'}
          </h2>
          <p className="text-gray-300 mb-8">
            We couldn't find the movie you're looking for.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }
  
  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  
  return (
    <Layout>
      {/* Hero Section with Backdrop */}
      <div className="relative -mx-4 min-h-[80vh] mb-16">
        {/* Backdrop Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{ backgroundImage: `url(${backdropUrl})` }}></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pt-8 pb-16 flex flex-col md:flex-row items-start gap-8">
          {/* Movie Poster */}
          <div className="w-full max-w-[300px] md:sticky md:top-24 z-10 mx-auto md:mx-0">
            <div className="rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-300 hover:scale-105">
              <img 
                src={posterUrl} 
                alt={`${movie.title} poster`} 
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Movie Details */}
          <MovieMetadata 
            movie={movie}
            handleWatchlist={handleWatchlist}
            inWatchlist={inWatchlist}
            handleRating={handleRating}
            userRating={userRating}
            hoverRating={hoverRating}
            setHoverRating={setHoverRating}
          />
        </div>
      </div>
      
      {/* Similar Movies Section */}
      {similarMovies.length > 0 && (
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">You May Also Like</h2>
            <Link href="/discover" className="text-primary hover:text-primary-light text-sm font-medium">
              Explore More
            </Link>
          </div>
          
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex">
              {similarMovies.map((similar) => (
                <SimilarMovieCard 
                  key={similar.id} 
                  movie={similar} 
                  onClick={() => router.push(`/movie/${similar.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}