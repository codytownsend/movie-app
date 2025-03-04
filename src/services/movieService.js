// src/services/movieService.js

// Use environment variables correctly for Vite
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_API_URL || "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Check if API key is available
const isApiAvailable = !!API_KEY;

// Utility to handle API requests
const fetchFromAPI = async (endpoint, params = {}) => {
  if (!isApiAvailable) {
    console.warn('API key not available. Using sample data instead.');
    throw new Error('API key not configured');
  }
  
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  
  // Add additional params
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// Get trending movies
export const getTrendingMovies = async () => {
  try {
    if (!isApiAvailable) {
      // Return empty array to trigger fallback to sample data
      return [];
    }
    
    const data = await fetchFromAPI("/trending/movie/week");
    return transformMovies(data.results);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId) => {
  try {
    if (!isApiAvailable) {
      return [];
    }
    
    const data = await fetchFromAPI("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc"
    });
    return transformMovies(data.results);
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    return [];
  }
};

// Search movies
export const searchMovies = async (query) => {
  try {
    if (!isApiAvailable) {
      return [];
    }
    
    const data = await fetchFromAPI("/search/movie", { query });
    return transformMovies(data.results);
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

// Get movie details
export const getMovieDetails = async (movieId) => {
  try {
    if (!isApiAvailable) {
      return null;
    }
    
    const data = await fetchFromAPI(`/movie/${movieId}`, {
      append_to_response: "credits,recommendations,videos"
    });
    return transformMovieDetails(data);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

// Get movie genres
export const getGenres = async () => {
  try {
    if (!isApiAvailable) {
      return [];
    }
    
    const data = await fetchFromAPI("/genre/movie/list");
    return data.genres;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

// Transform movie data from API to our app format
const transformMovies = (movies) => {
  return movies.map(movie => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown",
    genre: movie.genre_ids, // This would need to be mapped to genre names in a real app
    rating: movie.vote_average,
    description: movie.overview,
    posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://placehold.co/500x750/png",
    backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null,
    popularity: movie.popularity,
    streamingOn: [] // This information is not available from TMDB's free API
  }));
};

// Transform detailed movie data
const transformMovieDetails = (movie) => {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown",
    genre: movie.genres.map(g => g.name),
    director: movie.credits?.crew?.find(person => person.job === "Director")?.name || "Unknown",
    rating: movie.vote_average,
    duration: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "Unknown",
    description: movie.overview,
    posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://placehold.co/500x750/png",
    backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null,
    trailerUrl: movie.videos?.results?.find(video => video.type === "Trailer")?.key 
      ? `https://www.youtube.com/watch?v=${movie.videos.results.find(video => video.type === "Trailer").key}` 
      : null,
    streamingOn: [], // Not available from TMDB's free API
    cast: movie.credits?.cast?.slice(0, 10).map(person => person.name) || [],
    similarTo: movie.recommendations?.results?.slice(0, 5).map(m => m.id) || []
  };
};

// Mock streaming data (since TMDB doesn't provide this in their free API)
export const getStreamingServices = (movieId) => {
  // This is just a mock function
  const streamingPlatforms = ["Netflix", "Hulu", "Prime Video", "Disney+", "HBO Max", "Apple TV+"];
  
  // Generate random streaming services for each movie
  const randomServices = [];
  const numberOfServices = Math.floor(Math.random() * 3) + 1; // 1-3 services
  
  for (let i = 0; i < numberOfServices; i++) {
    const randomIndex = Math.floor(Math.random() * streamingPlatforms.length);
    const service = streamingPlatforms[randomIndex];
    if (!randomServices.includes(service)) {
      randomServices.push(service);
    }
  }
  
  return randomServices;
};

// Fallback to use sample data if API integration is not available
export const useSampleMovies = () => {
  return import('../data/sampleData').then(module => module.sampleMovies);
};