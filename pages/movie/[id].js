import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { addMovieRating, addToWatchlist } from '../../utils/firebase';
import { FaStar, FaPlus, FaCheck } from 'react-icons/fa';

// This would be replaced with real API calls to TMDB
const DUMMY_MOVIES = {
  '1': {
    id: 1,
    title: 'The Shawshank Redemption',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_path: '/j9XKiZrVeViAixVRzCta7h1VU9W.jpg',
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.',
    release_date: '1994-09-23',
    vote_average: 8.7,
    genres: ['Drama', 'Crime'],
    runtime: 142,
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler', 'Clancy Brown'],
    similar_movies: [2, 3, 4],
  },
  '2': {
    id: 2,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.',
    release_date: '1972-03-14',
    vote_average: 8.7,
    genres: ['Drama', 'Crime'],
    runtime: 175,
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan', 'Robert Duvall', 'Diane Keaton'],
    similar_movies: [1, 3, 4],
  },
  '3': {
    id: 3,
    title: 'The Dark Knight',
    poster_path: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    release_date: '2008-07-16',
    vote_average: 8.5,
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    runtime: 152,
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Gary Oldman'],
    similar_movies: [1, 2, 4],
  },
  '4': {
    id: 4,
    title: 'Pulp Fiction',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.',
    release_date: '1994-09-10',
    vote_average: 8.5,
    genres: ['Thriller', 'Crime'],
    runtime: 154,
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis', 'Tim Roth'],
    similar_movies: [1, 2, 3],
  },
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
      // In a real app, this would fetch from TMDB API and check user's watchlist
      setTimeout(() => {
        const movieData = DUMMY_MOVIES[id];
        if (movieData) {
          setMovie(movieData);
          
          // Get similar movies
          const similar = movieData.similar_movies
            .map(similarId => DUMMY_MOVIES[similarId])
            .filter(Boolean);
          setSimilarMovies(similar);
          
          // Random values for demo purposes
          setInWatchlist(Math.random() > 0.5);
          setUserRating(Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0);
        } else {
          setError('Movie not found');
        }
        
        setLoading(false);
      }, 1000);
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
      // In a real app, you might want to show a success message
    } catch (error) {
      console.error('Error adding rating:', error);
      // Handle error (show a message, etc.)
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
      // In a real app, you might want to show a success message
    } catch (error) {
      console.error('Error updating watchlist:', error);
      // Handle error (show a message, etc.)
    }
  };
  
  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (error || !movie) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error || 'Movie not found'}
          </h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
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
      {/* Backdrop with gradient overlay */}
      <div className="relative -mx-4 h-72 md:h-96 mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20"></div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto -mt-40 md:-mt-60 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie poster */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
            <div className="rounded-lg overflow-hidden shadow-lg border-2 border-gray-800">
              <img 
                src={posterUrl} 
                alt={`${movie.title} poster`} 
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Movie details */}
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-4">
              <span>{new Date(movie.release_date).getFullYear()}</span>
              <span>•</span>
              <span>{formatRuntime(movie.runtime)}</span>
              <span>•</span>
              <div className="flex items-center">
                <FaStar className="text-yellow-500 mr-1" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre, index) => (
                <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                  {genre}
                </span>
              ))}
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
              <p className="text-gray-300">{movie.overview}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Director</h2>
              <p className="text-gray-300">{movie.director}</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Cast</h2>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {actor}
                  </span>
                ))}
              </div>
            </div>
            
            {/* User actions */}
            <div className="flex flex-col sm:flex-row gap-6 mt-4 md:mt-8">
              {/* Rating */}
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Your Rating</h3>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl mr-1 focus:outline-none"
                    >
                      <FaStar
                        className={`${
                          star <= (hoverRating || userRating)
                            ? 'text-yellow-500'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Watchlist */}
              <div>
                <button
                  onClick={handleWatchlist}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    inWatchlist
                      ? 'bg-green-700 hover:bg-green-800'
                      : 'bg-primary hover:bg-primary-dark'
                  } text-white transition`}
                >
                  {inWatchlist ? (
                    <>
                      <FaCheck className="mr-2" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" />
                      Add to Watchlist
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar movies */}
        {similarMovies.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Similar Movies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarMovies.map((similar) => (
                <div 
                  key={similar.id} 
                  className="bg-secondary rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition duration-300"
                  onClick={() => router.push(`/movie/${similar.id}`)}
                >
                  <div className="relative h-64">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${similar.poster_path}`}
                      alt={`${similar.title} poster`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-1">{similar.title}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                      <span>{new Date(similar.release_date).getFullYear()}</span>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span>{similar.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}