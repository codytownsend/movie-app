// pages/discover.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import EnhancedMovieCard from '../components/EnhancedMovieCard';
import RevampedRecommendation from '../components/RecommendationSwiper';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaSortAmountDown, 
  FaCircleNotch,
  FaFire,
  FaStar,
  FaCalendarAlt
} from 'react-icons/fa';
import MoodSelector from '../components/MoodSelector';
import tmdbApi from '../utils/tmdb';

const DiscoverPage = () => {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecommendationSwiper, setShowRecommendationSwiper] = useState(true);
  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'swiper'
  
  const genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];
  
  const decades = [
    '2020s', '2010s', '2000s', '1990s', '1980s', 'Older'
  ];
  
  const ratings = ['9+', '8+', '7+', '6+', 'Any'];
  
  const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity ↓' },
    { value: 'vote_average.desc', label: 'Rating ↓' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'revenue.desc', label: 'Highest Grossing' },
    { value: 'original_title.asc', label: 'Title A-Z' },
  ];
  
  // Initialize from URL query parameters
  useEffect(() => {
    if (router.isReady) {
      if (router.query.search) {
        setSearchQuery(router.query.search);
      }
      
      if (router.query.genre) {
        const genre = genres.find(g => g.name.toLowerCase() === router.query.genre.toLowerCase());
        if (genre) {
          setSelectedGenres([genre.id]);
        }
      }
      
      if (router.query.decade) {
        setSelectedDecade(router.query.decade);
      }
      
      if (router.query.mood) {
        setSelectedMood(router.query.mood);
      }
      
      if (router.query.sort) {
        setSortBy(router.query.sort);
      }
      
      if (router.query.view) {
        setViewMode(router.query.view);
      }
      
      setInitialLoadComplete(true);
    }
  }, [router.isReady, router.query, genres]);
  
  // Handle movie like
  const handleMovieLike = useCallback((movie) => {
    setLikedMovies(prev => [...prev, movie]);
  }, []);
  
  // Handle movie dislike
  const handleMovieDislike = useCallback((movie) => {
    setDislikedMovies(prev => [...prev, movie]);
  }, []);
  
  // Load more recommendations
  const handleLoadMoreRecommendations = useCallback(() => {
    fetchRecommendedMovies(currentPage + 1);
  }, [currentPage]);
  
  // Fetch movies based on current filters
  const fetchMovies = useCallback(async (page = 1) => {
    setIsLoading(true);
    
    try {
      let results;
      
      // Searching
      if (searchQuery.trim()) {
        const searchResults = await tmdbApi.searchMovies(searchQuery, page);
        results = searchResults;
      } 
      // Mood-based filtering (takes precedence)
      else if (selectedMood) {
        const moodResults = await tmdbApi.getMoodBasedMovies(
          selectedMood,
          page
        );
        results = moodResults;
      } 
      // General discover with filters
      else {
        const filterOptions = {
          page,
          sortBy,
        };
        
        // Add genre filter
        if (selectedGenres.length > 0) {
          filterOptions.genres = selectedGenres;
        }
        
        // Add decade filter
        if (selectedDecade) {
          filterOptions.decade = selectedDecade;
        }
        
        // Add rating filter
        if (selectedRating) {
          const minRating = parseInt(selectedRating.replace('+', ''));
          filterOptions.minRating = minRating;
        }
        
        const discoverResults = await tmdbApi.discoverMovies(filterOptions);
        results = discoverResults;
      }
      
      // Set total results and pages for pagination
      setTotalResults(results.total_results);
      setTotalPages(results.total_pages);
      
      // Transform results to our app format
      const transformedMovies = results.results.map(tmdbApi.transformMovieData);
      
      if (page === 1) {
        setMovies(transformedMovies);
        setFilteredMovies(transformedMovies);
      } else {
        setMovies(prev => [...prev, ...transformedMovies]);
        setFilteredMovies(prev => [...prev, ...transformedMovies]);
      }
      
      // Update current page
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedMood, sortBy, selectedGenres, selectedDecade, selectedRating]);
  
  // Fetch recommended movies
  const fetchRecommendedMovies = useCallback(async (page = 1) => {
    try {
      let results;
      
      // If there are liked movies, get recommendations based on their genres
      if (likedMovies.length > 0) {
        // Extract all genres from liked movies
        const genreIds = [];
        likedMovies.forEach(movie => {
          if (movie.genres) {
            // Convert genre names to IDs
            movie.genres.forEach(genreName => {
              const genre = genres.find(g => g.name === genreName);
              if (genre && !genreIds.includes(genre.id)) {
                genreIds.push(genre.id);
              }
            });
          }
        });
        
        results = await tmdbApi.getRecommendedMovies(
          genreIds.slice(0, 3), // Use top 3 genres
          7.0,
          page
        );
      } 
      // Mood-based recommendations
      else if (selectedMood) {
        results = await tmdbApi.getMoodBasedMovies(selectedMood, page);
      } 
      // User preference based recommendations
      else if (userProfile && userProfile.preferences) {
        const userGenreIds = [];
        
        // Convert user's preferred genres to genre IDs
        if (userProfile.preferences.genres) {
          userProfile.preferences.genres.forEach(genreName => {
            const genre = genres.find(g => g.name === genreName);
            if (genre) {
              userGenreIds.push(genre.id);
            }
          });
        }
        
        if (userGenreIds.length > 0) {
          results = await tmdbApi.getRecommendedMovies(userGenreIds, 7.0, page);
        } else {
          // Fallback to popular movies
          results = await tmdbApi.getPopularMovies(page);
        }
      } else {
        // Fallback to popular movies
        results = await tmdbApi.getPopularMovies(page);
      }
      
      // Transform results to our app format
      const transformedMovies = results.results.map(tmdbApi.transformMovieData);
      
      if (page === 1) {
        setRecommendedMovies(transformedMovies);
      } else {
        setRecommendedMovies(prev => [...prev, ...transformedMovies]);
      }
    } catch (error) {
      console.error('Error fetching recommended movies:', error);
    }
  }, [likedMovies, selectedMood, userProfile, genres]);
  
  // Initial data loading
  useEffect(() => {
    if (initialLoadComplete) {
      fetchMovies(1);
      fetchRecommendedMovies(1);
    }
  }, [initialLoadComplete, fetchMovies, fetchRecommendedMovies]);
  
  // Update when filters change
  useEffect(() => {
    if (initialLoadComplete) {
      // Reset pagination
      setCurrentPage(1);
      
      // Update URL with filters
      const query = {};
      
      if (searchQuery) {
        query.search = searchQuery;
      }
      
      if (selectedGenres.length > 0) {
        const genreName = genres.find(g => g.id === selectedGenres[0])?.name;
        if (genreName) {
          query.genre = genreName;
        }
      }
      
      if (selectedDecade) {
        query.decade = selectedDecade;
      }
      
      if (selectedMood) {
        query.mood = selectedMood;
      }
      
      if (sortBy && sortBy !== 'popularity.desc') {
        query.sort = sortBy;
      }
      
      if (viewMode !== 'grid') {
        query.view = viewMode;
      }
      
      router.push({ pathname: '/discover', query }, undefined, { shallow: true });
      
      // Fetch new data with filters
      fetchMovies(1);
    }
  }, [
    initialLoadComplete,
    fetchMovies,
    searchQuery,
    selectedGenres,
    selectedDecade,
    selectedMood,
    selectedRating,
    sortBy,
    viewMode,
    genres,
    router
  ]);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies(1);
  };
  
  // Toggle view mode between grid and swiper
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'swiper' : 'grid');
  };
  
  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedDecade('');
    setSelectedMood('');
    setSelectedRating('');
    setSearchQuery('');
    setSortBy('popularity.desc');
    
    // Clear URL query params
    router.push('/discover', undefined, { shallow: true });
  };
  
  // Track if any filter is active
  const hasActiveFilters = selectedGenres.length > 0 || selectedDecade || selectedMood || selectedRating || searchQuery || sortBy !== 'popularity.desc';
  
  // Load more movies
  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      fetchMovies(currentPage + 1);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-8 mt-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Discover Movies</h1>
          <p className="text-gray-300">
            Find your next favorite film with personalized recommendations.
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
                  className="block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-lg bg-secondary/60 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
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
              className="px-4 py-3 bg-secondary/60 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-secondary transition"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Filters'}
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
                }}
                className="block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-lg bg-secondary/60 backdrop-blur-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
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
            
            {/* View mode toggle */}
            <button
              onClick={toggleViewMode}
              className="px-4 py-3 bg-secondary/60 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-secondary transition"
            >
              {viewMode === 'grid' ? 'Swiper View' : 'Grid View'}
            </button>
          </div>
          
          {/* Mood selector - only show if filters are visible */}
          {showFilters && (
            <div className="bg-secondary/40 backdrop-blur-sm rounded-xl p-6 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-4">What's your mood today?</h3>
                <MoodSelector onMoodSelect={(mood) => setSelectedMood(mood)} selectedMood={selectedMood} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Genres */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <button
                        key={genre.id}
                        onClick={() => {
                          if (selectedGenres.includes(genre.id)) {
                            setSelectedGenres(selectedGenres.filter(id => id !== genre.id));
                          } else {
                            setSelectedGenres([...selectedGenres, genre.id]);
                          }
                        }}
                        className={`px-3 py-2 text-sm rounded-lg ${
                          selectedGenres.includes(genre.id)
                            ? 'bg-primary text-background'
                            : 'bg-secondary-light text-gray-300 hover:bg-secondary hover:text-white'
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Decades */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Release Decade</h3>
                  <div className="flex flex-wrap gap-2">
                    {decades.map((decade) => (
                      <button
                        key={decade}
                        onClick={() => setSelectedDecade(selectedDecade === decade ? '' : decade)}
                        className={`px-3 py-2 text-sm rounded-lg ${
                          selectedDecade === decade
                            ? 'bg-primary text-background'
                            : 'bg-secondary-light text-gray-300 hover:bg-secondary hover:text-white'
                        }`}
                      >
                        {decade}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Rating */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Minimum Rating</h3>
                  <div className="flex flex-wrap gap-2">
                    {ratings.map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(selectedRating === rating ? '' : rating)}
                        className={`px-3 py-2 text-sm rounded-lg ${
                          selectedRating === rating
                            ? 'bg-primary text-background'
                            : 'bg-secondary-light text-gray-300 hover:bg-secondary hover:text-white'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-primary hover:text-white transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-secondary/20 backdrop-blur-sm rounded-lg p-4">
              <span className="text-sm text-gray-400">Active filters:</span>
              
              {searchQuery && (
                <div className="bg-secondary-light text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <FaSearch className="mr-1 text-xs" />
                  {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-2 hover:text-primary"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
              
              {selectedGenres.map(genreId => {
                const genre = genres.find(g => g.id === genreId);
                return genre ? (
                  <div key={genreId} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                    {genre.name}
                    <button 
                      onClick={() => setSelectedGenres(selectedGenres.filter(id => id !== genreId))}
                      className="ml-2 hover:text-white"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : null;
              })}
              
              {selectedDecade && (
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                  <FaCalendarAlt className="mr-1 text-xs" />
                  {selectedDecade}
                  <button 
                    onClick={() => setSelectedDecade('')}
                    className="ml-2 hover:text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
              
              {selectedMood && (
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                  Mood: {selectedMood.replace('-', ' ')}
                  <button 
                    onClick={() => setSelectedMood('')}
                    className="ml-2 hover:text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
              
              {selectedRating && (
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                  <FaStar className="mr-1 text-xs" />
                  Rating: {selectedRating}
                  <button 
                    onClick={() => setSelectedRating('')}
                    className="ml-2 hover:text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
              
              {sortBy !== 'popularity.desc' && (
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                  <FaSortAmountDown className="mr-1 text-xs" />
                  {sortOptions.find(opt => opt.value === sortBy)?.label || 'Custom Sort'}
                  <button 
                    onClick={() => setSortBy('popularity.desc')}
                    className="ml-2 hover:text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Results */}
        <div>
          {isLoading && movies.length === 0 ? (
            <div className="py-20">
              <div className="flex flex-col items-center justify-center space-y-4">
                <FaCircleNotch className="w-16 h-16 text-primary animate-spin" />
                <p className="text-white/80">Finding movies for you...</p>
              </div>
            </div>
          ) : viewMode === 'swiper' ? (
            <div className="py-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <FaFire className="mr-2 text-primary" />
                Recommended for You
              </h2>
              <RevampedRecommendation 
                movies={selectedMood ? filteredMovies : recommendedMovies.length > 0 ? recommendedMovies : filteredMovies} 
                onLike={handleMovieLike}
                onDislike={handleMovieDislike}
                onLoadMore={handleLoadMoreRecommendations}
              />
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="bg-secondary/40 backdrop-blur-sm rounded-xl p-8 text-center">
              <h2 className="text-xl font-semibold text-white mb-4">No movies found</h2>
              <p className="text-gray-300 mb-6">Try adjusting your filters or search query</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {totalResults} {totalResults === 1 ? 'Movie' : 'Movies'} Found
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMovies.map((movie) => (
                  <EnhancedMovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              
              {/* Load more button */}
              {currentPage < totalPages && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary font-medium rounded-lg transition flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <FaCircleNotch className="animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DiscoverPage;