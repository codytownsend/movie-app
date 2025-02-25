import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';
import { FaSearch, FaFilter, FaTimes, FaSortAmountDown } from 'react-icons/fa';
import { getAllMovies, filterMovies } from '../utils/movieService';

export default function Discover() {
  const { currentUser } = useAuth();
  const router = useRouter();
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
  
  const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Thriller', 'Science Fiction'];
  const decades = ['2020s', '2010s', '2000s', '1990s', '1980s', 'Older'];
  const ratings = ['9+', '8+', '7+', '6+', 'Any'];
  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'rating', label: 'Rating (High to Low)' },
    { value: 'release_date', label: 'Release Date (Newest)' },
    { value: 'title_asc', label: 'Title (A-Z)' },
  ];
  
  // Initialize from URL query parameters if present
  useEffect(() => {
    if (router.query.search) {
      setSearchQuery(router.query.search);
    }
    if (router.query.genre) {
      setSelectedGenres([router.query.genre]);
    }
    if (router.query.decade) {
      setSelectedDecades([router.query.decade]);
    }
    if (router.query.sort) {
      setSortBy(router.query.sort);
    }
  }, [router.query]);
  
  // Fetch all movies on initial load
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const allMovies = await getAllMovies();
        setMovies(allMovies);
        setFilteredMovies(allMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, []);
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    const applyFilters = async () => {
      if (movies.length === 0) return;
      
      setIsLoading(true);
      
      try {
        // Start with all movies
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
              if (decade === 'Older') return year < 1980;
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
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    applyFilters();
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
    
    // Clear URL query params
    router.push('/discover', undefined, { shallow: true });
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Update URL with search query
    const query = { ...router.query };
    if (searchQuery) {
      query.search = searchQuery;
    } else {
      delete query.search;
    }
    router.push({ pathname: '/discover', query }, undefined, { shallow: true });
  };
  
  const hasActiveFilters = selectedGenres.length > 0 || selectedDecades.length > 0 || selectedRating || searchQuery;
  
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Discover Movies</h1>
          <p className="text-gray-300">
            Explore our collection and find your next favorite film.
          </p>
        </div>
        
        {/* Search and Filter UI */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search bar */}
            <div className="relative flex-grow">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-lg bg-secondary text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      const query = { ...router.query };
                      delete query.search;
                      router.push({ pathname: '/discover', query }, undefined, { shallow: true });
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FaTimes className="text-gray-400 hover:text-white" />
                  </button>
                )}
              </form>
            </div>
            
            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-secondary text-white rounded-lg flex items-center justify-center hover:bg-secondary-light transition"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {/* Sort dropdown */}
            <div className="relative min-w-[180px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSortAmountDown className="text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  // Update URL with sort parameter
                  const query = { ...router.query, sort: e.target.value };
                  router.push({ pathname: '/discover', query }, undefined, { shallow: true });
                }}
                className="block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-lg bg-secondary text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
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
            <div className="bg-secondary rounded-xl overflow-hidden transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Filter Movies</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:text-primary-light flex items-center"
                    >
                      <FaTimes className="mr-1" />
                      Clear All Filters
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Genres */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            selectedGenres.includes(genre)
                              ? 'bg-primary text-white'
                              : 'bg-secondary-light text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Decades */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Release Decade</h3>
                    <div className="flex flex-wrap gap-2">
                      {decades.map((decade) => (
                        <button
                          key={decade}
                          onClick={() => toggleDecade(decade)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            selectedDecades.includes(decade)
                              ? 'bg-primary text-white'
                              : 'bg-secondary-light text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {decade}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Minimum Rating</h3>
                    <div className="flex flex-wrap gap-2">
                      {ratings.map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSelectedRating(selectedRating === rating ? '' : rating)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            selectedRating === rating
                              ? 'bg-primary text-white'
                              : 'bg-secondary-light text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            
            {searchQuery && (
              <div className="bg-secondary-light text-white px-3 py-1 rounded-full text-sm flex items-center">
                Search: {searchQuery}
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    const query = { ...router.query };
                    delete query.search;
                    router.push({ pathname: '/discover', query }, undefined, { shallow: true });
                  }}
                  className="ml-2 hover:text-primary"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}
            
            {selectedGenres.map(genre => (
              <div key={genre} className="bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                {genre}
                <button 
                  onClick={() => toggleGenre(genre)}
                  className="ml-2 hover:text-white"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
            
            {selectedDecades.map(decade => (
              <div key={decade} className="bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                {decade}
                <button 
                  onClick={() => toggleDecade(decade)}
                  className="ml-2 hover:text-white"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
            
            {selectedRating && (
              <div className="bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                Rating: {selectedRating}
                <button 
                  onClick={() => setSelectedRating('')}
                  className="ml-2 hover:text-white"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Results */}
        <div>
          {isLoading ? (
            <div className="py-20">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/80">Finding movies for you...</p>
              </div>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="bg-secondary rounded-xl p-8 text-center">
              <h2 className="text-xl font-semibold text-white mb-4">No movies found</h2>
              <p className="text-gray-300 mb-6">Try adjusting your filters or search query</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {filteredMovies.length} {filteredMovies.length === 1 ? 'Movie' : 'Movies'} Found
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}