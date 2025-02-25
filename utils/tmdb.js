// This file will contain utility functions for interacting with The Movie Database (TMDB) API
// You'll need to replace 'YOUR_API_KEY' with your actual TMDB API key

const TMDB_API_KEY = '566cd2db71935d6f0167001d17187f9c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Fetch popular movies
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch popular movies');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

// Search movies by query
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
        query
      )}&page=${page}&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search movies');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

// Get movie details by ID
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,similar,recommendations`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

// Discover movies with filters
export const discoverMovies = async (filters, page = 1) => {
  try {
    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    
    // Add filters to the URL
    if (filters.genres && filters.genres.length > 0) {
      url += `&with_genres=${filters.genres.join(',')}`;
    }
    
    if (filters.releaseYear) {
      // For a specific year
      url += `&primary_release_year=${filters.releaseYear}`;
    } else if (filters.releaseYearGte && filters.releaseYearLte) {
      // For a range of years
      url += `&primary_release_date.gte=${filters.releaseYearGte}-01-01`;
      url += `&primary_release_date.lte=${filters.releaseYearLte}-12-31`;
    }
    
    if (filters.voteAverageGte) {
      url += `&vote_average.gte=${filters.voteAverageGte}`;
    }
    
    if (filters.sortBy) {
      url += `&sort_by=${filters.sortBy}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to discover movies');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error discovering movies:', error);
    throw error;
  }
};

// Get genre list
export const getGenres = async () => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch genres');
    }
    
    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

// Get trending movies (daily or weekly)
export const getTrendingMovies = async (timeWindow = 'day') => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending movies');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};

// Helper function to generate TMDB image URLs
export const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Parse movie data to a consistent format
export const parseMovieData = (movie) => {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    genres: movie.genres ? movie.genres.map(g => g.name) : [],
    genre_ids: movie.genre_ids || [],
    runtime: movie.runtime,
    // Parse credits if available
    director: movie.credits ? 
      movie.credits.crew.find(person => person.job === 'Director')?.name : null,
    cast: movie.credits ? 
      movie.credits.cast.slice(0, 10).map(person => person.name) : [],
    // For recommendations
    similar_movies: movie.similar ? 
      movie.similar.results.slice(0, 6).map(m => m.id) : [],
  };
};

// AI recommendation function (This would be expanded with actual AI logic or calls to Firebase Cloud Functions)
export const getAIRecommendations = async (userId, preferences) => {
  // In a real app, this would call a Firebase Cloud Function that implements the AI logic
  // For now, we'll simulate by using the discover API with the user's preferences
  
  try {
    const filters = {
      genres: preferences.genres.slice(0, 3), // Use top 3 genres
      voteAverageGte: 7, // Only highly rated movies
      sortBy: 'popularity.desc' // Sort by popularity
    };
    
    // If decades are in preferences, convert them to year ranges
    if (preferences.decades && preferences.decades.length > 0) {
      const decade = preferences.decades[0]; // Just use the first decade for simplicity
      if (decade === '2020s') {
        filters.releaseYearGte = 2020;
        filters.releaseYearLte = 2029;
      } else if (decade === '2010s') {
        filters.releaseYearGte = 2010;
        filters.releaseYearLte = 2019;
      } else if (decade === '2000s') {
        filters.releaseYearGte = 2000;
        filters.releaseYearLte = 2009;
      } else if (decade === '1990s') {
        filters.releaseYearGte = 1990;
        filters.releaseYearLte = 1999;
      } else if (decade === '1980s') {
        filters.releaseYearGte = 1980;
        filters.releaseYearLte = 1989;
      } else if (decade === '1970s') {
        filters.releaseYearGte = 1970;
        filters.releaseYearLte = 1979;
      } else if (decade === 'Older') {
        filters.releaseYearLte = 1969;
      }
    }
    
    const data = await discoverMovies(filters);
    return data.results.slice(0, 10); // Return top 10 recommendations
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    throw error;
  }
};