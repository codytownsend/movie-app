import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

// This would eventually be replaced with real API calls to TMDB
const DUMMY_MOVIES = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    release_date: '1994-09-23',
    vote_average: 8.7,
    genres: ['Drama', 'Crime']
  },
  {
    id: 2,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.',
    release_date: '1972-03-14',
    vote_average: 8.7,
    genres: ['Drama', 'Crime']
  },
  {
    id: 3,
    title: 'The Dark Knight',
    poster_path: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    release_date: '2008-07-16',
    vote_average: 8.5,
    genres: ['Action', 'Crime', 'Drama', 'Thriller']
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.',
    release_date: '1994-09-10',
    vote_average: 8.5,
    genres: ['Thriller', 'Crime']
  },
  {
    id: 5,
    title: 'Fight Club',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.',
    release_date: '1999-10-15',
    vote_average: 8.4,
    genres: ['Drama', 'Thriller']
  },
  {
    id: 6,
    title: 'Inception',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    release_date: '2010-07-15',
    vote_average: 8.3,
    genres: ['Action', 'Science Fiction', 'Adventure']
  }
];

// Movie Card Component
const MovieCard = ({ movie }) => {
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const fallbackPosterUrl = '/placeholder-poster.jpg';
  
  return (
    <div className="flex flex-col rounded-lg overflow-hidden bg-secondary hover:shadow-lg transition duration-300 h-full">
      <div className="relative h-64 w-full">
        <img
          src={posterUrl}
          alt={`${movie.title} poster`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackPosterUrl;
          }}
        />
        <div className="absolute top-2 right-2 bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
          {movie.vote_average.toFixed(1)}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{movie.title}</h3>
        <p className="text-sm text-gray-400 mb-2">{new Date(movie.release_date).getFullYear()}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genres.slice(0, 3).map((genre, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
              {genre}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-300 line-clamp-3 mb-3">{movie.overview}</p>
        <Link 
          href={`/movie/${movie.id}`} 
          className="mt-auto text-primary hover:text-primary-light text-sm font-medium"
        >
          View details
        </Link>
      </div>
    </div>
  );
};

// Filter Component
const FilterSection = ({ onFilterChange }) => {
  const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'];
  const decades = ['2020s', '2010s', '2000s', '1990s', '1980s', 'Older'];
  const moods = ['Feel-Good', 'Dark & Gritty', 'Thought-Provoking', 'Action-Packed', 'Emotional', 'Inspirational'];
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  useEffect(() => {
    onFilterChange({
      genre: selectedGenre,
      decade: selectedDecade,
      mood: selectedMood
    });
  }, [selectedGenre, selectedDecade, selectedMood, onFilterChange]);
  
  return (
    <div className="mb-6 p-4 bg-secondary rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Filter Recommendations</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 8).map((genre) => (
              <button
                key={genre}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedGenre === genre 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Decade</label>
          <div className="flex flex-wrap gap-2">
            {decades.map((decade) => (
              <button
                key={decade}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedDecade === decade 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedDecade(selectedDecade === decade ? '' : decade)}
              >
                {decade}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedMood === mood 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedMood(selectedMood === mood ? '' : mood)}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { currentUser, userProfile } = useAuth();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ genre: '', decade: '', mood: '' });
  
  useEffect(() => {
    // This would eventually be replaced with real API calls to fetch personalized recommendations
    // based on user preferences and filters
    setTimeout(() => {
      setMovies(DUMMY_MOVIES);
      setIsLoading(false);
    }, 1000);
  }, [filters]);
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setIsLoading(true);
  };
  
  return (
    <Layout>
      {!currentUser ? (
        // Not logged in - show welcome screen
        <div className="flex flex-col items-center text-center py-12">
          <h1 className="text-4xl font-bold text-white mb-4">Discover Movies You'll Love</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl">
            Get personalized movie recommendations based on your preferences. Sign up now to start your journey.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition"
            >
              Log In
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Personalized Recommendations</h3>
              <p className="text-gray-300">Our AI analyzes your preferences to suggest movies you'll actually enjoy.</p>
            </div>
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Discover Hidden Gems</h3>
              <p className="text-gray-300">Find movies you might have missed but are perfectly matched to your taste.</p>
            </div>
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Build Your Watchlist</h3>
              <p className="text-gray-300">Save movies to watch later and keep track of what you've seen.</p>
            </div>
          </div>
        </div>
      ) : (
        // Logged in - show recommendations
        <div>
          {userProfile && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {userProfile.displayName || 'Movie Fan'}
              </h1>
              <p className="text-gray-300">
                Here are some movie recommendations just for you.
              </p>
            </div>
          )}
          
          <FilterSection onFilterChange={handleFilterChange} />
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}