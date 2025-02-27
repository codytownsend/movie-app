// utils/tmdbApiService.js
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '566cd2db71935d6f0167001d17187f9c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Creates API request options with authorization headers
 */
const createRequestOptions = (method = 'GET') => {
  return {
    method,
    headers: {
      'Authorization': `Bearer ${TMDB_API_KEY}`,
      'Content-Type': 'application/json;charset=utf-8'
    }
  };
};

/**
 * Fetches data from TMDB API
 */
const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    // Build URL with query parameters
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    
    // Add API key as a query parameter if using key-based auth
    if (!TMDB_API_KEY.startsWith('eyJ')) {
      url.searchParams.append('api_key', TMDB_API_KEY);
    }
    
    // Add other query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    // Fetch data
    const response = await fetch(url.toString(), createRequestOptions());
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    throw error;
  }
};

/**
 * Get configuration data from TMDB
 */
export const getConfiguration = async () => {
  return await fetchFromTMDB('/configuration');
};

/**
 * Search movies by query
 */
export const searchMovies = async (query, page = 1) => {
  return await fetchFromTMDB('/search/movie', {
    query,
    page,
    include_adult: false,
    language: 'en-US'
  });
};

/**
 * Get movie details by ID
 */
export const getMovieDetails = async (movieId) => {
  return await fetchFromTMDB(`/movie/${movieId}`, {
    append_to_response: 'credits,similar,recommendations,videos,release_dates',
    language: 'en-US'
  });
};

/**
 * Get now playing movies
 */
export const getNowPlayingMovies = async (page = 1) => {
  return await fetchFromTMDB('/movie/now_playing', {
    page,
    language: 'en-US'
  });
};

/**
 * Get popular movies
 */
export const getPopularMovies = async (page = 1) => {
  return await fetchFromTMDB('/movie/popular', {
    page,
    language: 'en-US'
  });
};

/**
 * Get top rated movies
 */
export const getTopRatedMovies = async (page = 1) => {
  return await fetchFromTMDB('/movie/top_rated', {
    page,
    language: 'en-US'
  });
};

/**
 * Get upcoming movies
 */
export const getUpcomingMovies = async (page = 1) => {
  return await fetchFromTMDB('/movie/upcoming', {
    page,
    language: 'en-US'
  });
};

/**
 * Get movies by genre
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
  return await fetchFromTMDB('/discover/movie', {
    with_genres: genreId,
    page,
    language: 'en-US',
    sort_by: 'popularity.desc'
  });
};

/**
 * Get movie genres list
 */
export const getGenres = async () => {
  return await fetchFromTMDB('/genre/movie/list', {
    language: 'en-US'
  });
};

/**
 * Discover movies with advanced filtering
 */
export const discoverMovies = async (options = {}) => {
  const {
    genres,
    year,
    decade,
    sortBy = 'popularity.desc',
    minRating,
    maxRating,
    minVoteCount = 100,
    page = 1,
    withPeople,
    withKeywords,
    withCompanies,
    excludeGenres,
    releaseYearLte,
    releaseYearGte,
  } = options;
  
  const params = {
    page,
    sort_by: sortBy,
    'vote_count.gte': minVoteCount,
    language: 'en-US',
    include_adult: false,
  };
  
  // Add genre filtering
  if (genres && genres.length > 0) {
    params.with_genres = Array.isArray(genres) ? genres.join(',') : genres;
  }
  
  // Add year filtering
  if (year) {
    params.primary_release_year = year;
  }
  
  // Add decade filtering
  if (decade) {
    switch (decade) {
      case '2020s':
        params.primary_release_date_gte = '2020-01-01';
        params.primary_release_date_lte = '2029-12-31';
        break;
      case '2010s':
        params.primary_release_date_gte = '2010-01-01';
        params.primary_release_date_lte = '2019-12-31';
        break;
      case '2000s':
        params.primary_release_date_gte = '2000-01-01';
        params.primary_release_date_lte = '2009-12-31';
        break;
      case '1990s':
        params.primary_release_date_gte = '1990-01-01';
        params.primary_release_date_lte = '1999-12-31';
        break;
      case '1980s':
        params.primary_release_date_gte = '1980-01-01';
        params.primary_release_date_lte = '1989-12-31';
        break;
      case '1970s':
        params.primary_release_date_gte = '1970-01-01';
        params.primary_release_date_lte = '1979-12-31';
        break;
      case 'Older':
        params.primary_release_date_lte = '1969-12-31';
        break;
    }
  }
  
  // Add explicit date range if provided
  if (releaseYearGte) {
    params.primary_release_date_gte = `${releaseYearGte}-01-01`;
  }
  
  if (releaseYearLte) {
    params.primary_release_date_lte = `${releaseYearLte}-12-31`;
  }
  
  // Add rating filtering
  if (minRating) {
    params['vote_average.gte'] = minRating;
  }
  
  if (maxRating) {
    params['vote_average.lte'] = maxRating;
  }
  
  // Add people filtering (cast or crew)
  if (withPeople) {
    params.with_people = Array.isArray(withPeople) ? withPeople.join(',') : withPeople;
  }
  
  // Add keyword filtering
  if (withKeywords) {
    params.with_keywords = Array.isArray(withKeywords) ? withKeywords.join(',') : withKeywords;
  }
  
  // Add company filtering
  if (withCompanies) {
    params.with_companies = Array.isArray(withCompanies) ? withCompanies.join(',') : withCompanies;
  }
  
  // Add excluded genres
  if (excludeGenres) {
    params.without_genres = Array.isArray(excludeGenres) ? excludeGenres.join(',') : excludeGenres;
  }
  
  return await fetchFromTMDB('/discover/movie', params);
};

/**
 * Transform TMDB movie data to a consistent format for our app
 */
export const transformMovieData = (movie) => {
  // Extract director from credits if available
  let director = null;
  if (movie.credits && movie.credits.crew) {
    const directorInfo = movie.credits.crew.find(person => person.job === 'Director');
    director = directorInfo ? directorInfo.name : null;
  }
  
  // Extract cast if available
  let cast = [];
  if (movie.credits && movie.credits.cast) {
    cast = movie.credits.cast.slice(0, 5).map(person => person.name);
  }
  
  // Extract trailer if available
  let trailer = null;
  if (movie.videos && movie.videos.results) {
    const trailerVideo = movie.videos.results.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    trailer = trailerVideo ? `https://www.youtube.com/watch?v=${trailerVideo.key}` : null;
  }
  
  // Extract genres
  let genres = [];
  if (movie.genres) {
    genres = movie.genres.map(genre => genre.name);
  } else if (movie.genre_ids && window.genreMap) {
    // If we have a genre map available (stored globally)
    genres = movie.genre_ids.map(id => window.genreMap[id]).filter(Boolean);
  }
  
  // Extract certification
  let certification = null;
  if (movie.release_dates && movie.release_dates.results) {
    const usCertification = movie.release_dates.results.find(
      country => country.iso_3166_1 === 'US'
    );
    
    if (usCertification && usCertification.release_dates && usCertification.release_dates.length > 0) {
      certification = usCertification.release_dates.find(
        release => release.certification && release.certification !== ''
      )?.certification || null;
    }
  }
  
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    popularity: movie.popularity,
    genres,
    runtime: movie.runtime,
    director,
    cast,
    trailer,
    certification,
    similar_movies: movie.similar ? movie.similar.results.slice(0, 6).map(m => m.id) : [],
    recommendations: movie.recommendations ? movie.recommendations.results.slice(0, 6).map(m => m.id) : [],
  };
};

/**
 * Get image URL for TMDB images
 */
export const getImageUrl = (path, size = 'original') => {
  if (!path) {
    return null;
  }
  
  // Map common size names to actual TMDB sizes
  const sizeMap = {
    tiny: 'w92',
    small: 'w185',
    medium: 'w300',
    large: 'w500',
    xlarge: 'w780',
    xxlarge: 'w1280',
    original: 'original'
  };
  
  const actualSize = sizeMap[size] || size;
  return `${TMDB_IMAGE_BASE_URL}/${actualSize}${path}`;
};

/**
 * Initialize the API service by preloading genre data
 */
export const initializeApiService = async () => {
  try {
    const genresData = await getGenres();
    
    // Create a map of genre IDs to genre names
    window.genreMap = {};
    genresData.genres.forEach(genre => {
      window.genreMap[genre.id] = genre.name;
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing API service:', error);
    return false;
  }
};

/**
 * Get movie recommendations based on genre and rating
 */
export const getRecommendedMovies = async (genreIds, minRating = 7.0, page = 1) => {
  return await discoverMovies({
    genres: genreIds,
    minRating,
    sortBy: 'popularity.desc',
    page
  });
};

/**
 * Get movie recommendations based on a specific mood
 */
export const getMoodBasedMovies = async (mood, page = 1) => {
  // Map moods to genre combinations and other parameters
  const moodParams = {
    'date-night': {
      genres: [10749, 18, 35], // Romance, Drama, Comedy
      minRating: 6.5,
      excludeGenres: [27, 10752, 99], // Horror, War, Documentary
    },
    'feel-good': {
      genres: [35, 10751, 12], // Comedy, Family, Adventure
      minRating: 7.0,
      excludeGenres: [27, 10752, 53], // Horror, War, Thriller
    },
    'adrenaline': {
      genres: [28, 53, 12], // Action, Thriller, Adventure
      excludeGenres: [99, 10751], // Documentary, Family
    },
    'thought-provoking': {
      genres: [18, 9648, 878], // Drama, Mystery, Science Fiction
      minRating: 7.0,
      excludeGenres: [10751, 35], // Family, Comedy
    },
    'spooky': {
      genres: [27, 53, 9648], // Horror, Thriller, Mystery
      excludeGenres: [10751, 35, 16], // Family, Comedy, Animation
    },
    'adventure': {
      genres: [12, 28, 14], // Adventure, Action, Fantasy
      excludeGenres: [27, 10752], // Horror, War
    },
    'family': {
      genres: [10751, 16, 12], // Family, Animation, Adventure
      excludeGenres: [27, 53, 10752], // Horror, Thriller, War
    },
    'classics': {
      releaseYearLte: 2000,
      minRating: 7.5,
      minVoteCount: 500,
      sortBy: 'vote_average.desc'
    }
  };
  
  const params = moodParams[mood] || {};
  return await discoverMovies({
    ...params,
    page
  });
};

export default {
  searchMovies,
  getMovieDetails,
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getGenres,
  discoverMovies,
  transformMovieData,
  getImageUrl,
  initializeApiService,
  getRecommendedMovies,
  getMoodBasedMovies,
  getMoviesByGenre
};