import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

// This would be replaced with real API calls to TMDB
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

export default function Discover() {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedDecades, setSelectedDecades] = useState([]);
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  
  const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'];
  const decades = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s', 'Older'];
  const ratings = ['9+', '8+', '7+', '6+', 'Any'];
  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'release_date', label: 'Release Date (Newest)' },
    { value: 'title_asc', label: 'Title (A-Z)' },
  ];
  
  useEffect(() => {
    // In a real app, this would fetch from TMDB API based on filters
    setIsLoading(true);
    setTimeout(() => {
      setMovies(DUMMY_MOVIES);
      setFilteredMovies(DUMMY_MOVIES);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  useEffect(() => {
    if (movies.length === 0) return;
    
    // Apply filters
    let results = [...movies];
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(movie => 
        movie.title.toLowerCase().includes(query) || 
        movie.overview.toLowerCase().includes(query)
      );
    }
    
    // Genre filter
    if (selectedGenres.length > 0) {
      results = results.filter(movie => 
        selectedGenres.some(genre => movie.genres.includes(genre))
      );
    }
    
    // Decade filter
    if (selectedDecades.length > 0) {
      results = results.filter(movie => {
        const year = new Date(movie.release_date).getFullYear();
        return selectedDecades.some(decade => {
          if (decade === '2020s') return year >= 2020;
          if (decade === '2010s') return year >= 2010 && year < 2020;
          if (decade === '2000s') return year >= 2000 && year < 2010;
          if (decade === '1990s') return year >= 1990 && year < 2000;
          if (decade === '1980s') return year >= 1980 && year < 1990;
          if (decade === '1970s') return year >= 1970 && year < 1980;
          if (decade === 'Older') return year < 1970;
          return false;
        });
      });
    }
    
    // Rating filter
    if (selectedRating) {
      const minRating = parseInt(selectedRating.replace('+', ''));
      results = results.filter(movie => movie.vote_average >= minRating);
    }
    
    // Sort results
    if (sortBy === 'rating') {
      results.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortBy === 'release_date') {
      results.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (sortBy === 'title_asc') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredMovies(results);
  }, [movies, searchQuery, selectedGenres, selectedDecades, selectedRating, sortBy]);
  
  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };
  
  const toggleDecade = (decade) => {
    setSelectedDecades(prev => 
      prev.includes(decade) 
        ? prev.filter(d => d !== decade)
        : [...prev, decade]
    );
  };
  
  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedDecades([]);
    setSelectedRating('');
    setSearchQuery('');
    setSortBy('popularity');
  };
  
  const hasActiveFilters = selectedGenres.length > 0 || selectedDecades.length > 0 || selectedRating || searchQuery;
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Discover Movies</h1>
        <p className="text-gray-300">
          Find new movies to watch based on your preferences.
        </p>
      </div>
      
      {/* Search and Filter UI */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FaTimes className="text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          
          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-secondary text-white rounded-lg flex items-center justify-center hover:bg-secondary-light transition"
          >
            <FaFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>Sort By</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <div className="bg-secondary p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Filter Movies</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary-light"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Genres */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        selectedGenres.includes(genre)
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Decades */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Release Decade</h3>
                <div className="flex flex-wrap gap-2">
                  {decades.map((decade) => (
                    <button
                      key={decade}
                      onClick={() => toggleDecade(decade)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        selectedDecades.includes(decade)
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {decade}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rating */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Minimum Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {ratings.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? '' : rating)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        selectedRating === rating
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-white mb-4">No movies found</h2>
            <p className="text-gray-300 mb-6">Try adjusting your filters or search query</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {filteredMovies.length} {filteredMovies.length === 1 ? 'Movie' : 'Movies'} Found
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}