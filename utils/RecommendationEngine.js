// utils/RecommendationEngine.js
import { getAIRecommendations, getMovieDetails, parseMovieData } from './tmdb';

// Cache for movie details
const movieCache = new Map();

// Function to get personalized movie recommendations
export const getPersonalizedRecommendations = async (userId, preferences, page = 1) => {
  try {
    // Get initial AI recommendations based on user preferences
    const recommendedMovies = await getAIRecommendations(userId, preferences);
    
    // Enhance the movie data with additional details
    const enhancedMovies = await Promise.all(
      recommendedMovies.map(async (movie) => {
        // Check if movie details are already cached
        if (movieCache.has(movie.id)) {
          return movieCache.get(movie.id);
        }
        
        try {
          // Fetch detailed movie data
          const details = await getMovieDetails(movie.id);
          const enhancedMovie = parseMovieData(details);
          
          // Cache the enhanced movie data
          movieCache.set(movie.id, enhancedMovie);
          
          return enhancedMovie;
        } catch (error) {
          console.error(`Error fetching details for movie ${movie.id}:`, error);
          return parseMovieData(movie);
        }
      })
    );
    
    return enhancedMovies;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw error;
  }
};

// Function to get recommendations based on a specific mood/category
export const getMoodBasedRecommendations = async (mood, additionalFilters = {}) => {
  try {
    // Map moods to genre combinations and other parameters for the API
    const moodToParamsMap = {
      'date-night': {
        genres: ['Romance', 'Drama', 'Comedy'],
        certification: 'PG-13,R',
        excludeGenres: ['Horror', 'War', 'Documentary'],
        voteAverageGte: 6.5
      },
      'feel-good': {
        genres: ['Comedy', 'Family', 'Adventure'],
        certification: 'G,PG,PG-13',
        excludeGenres: ['Horror', 'War', 'Thriller'],
        voteAverageGte: 7
      },
      'adrenaline': {
        genres: ['Action', 'Thriller', 'Adventure'],
        excludeGenres: ['Documentary', 'Family'],
        voteAverageGte: 6.5
      },
      'thought-provoking': {
        genres: ['Drama', 'Mystery', 'Science Fiction'],
        excludeGenres: ['Family', 'Comedy'],
        voteAverageGte: 7
      },
      'spooky': {
        genres: ['Horror', 'Thriller', 'Mystery'],
        excludeGenres: ['Family', 'Comedy', 'Animation'],
        voteAverageGte: 6
      },
      'adventure': {
        genres: ['Adventure', 'Action', 'Fantasy'],
        excludeGenres: ['Horror', 'War'],
        voteAverageGte: 6.5
      },
      'award-winners': {
        sort: 'vote_average.desc',
        certification: 'PG-13,R',
        voteAverageGte: 8,
        voteCountGte: 1000
      },
      'sci-fi': {
        genres: ['Science Fiction', 'Fantasy'],
        excludeGenres: ['Documentary', 'Western'],
        voteAverageGte: 6.5
      },
      'family': {
        genres: ['Family', 'Animation', 'Adventure'],
        certification: 'G,PG',
        excludeGenres: ['Horror', 'Thriller', 'War'],
        voteAverageGte: 6.5
      },
      'classics': {
        releaseDateLte: '2000-12-31',
        voteAverageGte: 7.5,
        voteCountGte: 500
      }
    };
    
    // Get parameters for the selected mood
    const moodParams = mood ? moodToParamsMap[mood] || {} : {};
    
    // Merge mood parameters with additional filters
    const filters = {
      ...moodParams,
      ...additionalFilters
    };
    
    // If genre filter is provided, override the mood genres
    if (additionalFilters.genres && additionalFilters.genres.length > 0) {
      filters.genres = additionalFilters.genres;
    }
    
    // If decade filter is provided, add year range
    if (additionalFilters.decade) {
      const decade = additionalFilters.decade;
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
      } else if (decade === 'Older') {
        filters.releaseYearLte = 1979;
      }
    }
    
    // Get movies based on the combined filters
    // This is a placeholder - in a real implementation, you would call your API
    // with these filters
    const recommendedMovies = await getAIRecommendations(null, filters);
    
    // Enhance the movie data with additional details
    const enhancedMovies = await Promise.all(
      recommendedMovies.map(async (movie) => {
        // Check if movie details are already cached
        if (movieCache.has(movie.id)) {
          return movieCache.get(movie.id);
        }
        
        try {
          // Fetch detailed movie data
          const details = await getMovieDetails(movie.id);
          const enhancedMovie = parseMovieData(details);
          
          // Cache the enhanced movie data
          movieCache.set(movie.id, enhancedMovie);
          
          return enhancedMovie;
        } catch (error) {
          console.error(`Error fetching details for movie ${movie.id}:`, error);
          return parseMovieData(movie);
        }
      })
    );
    
    return enhancedMovies;
  } catch (error) {
    console.error('Error getting mood-based recommendations:', error);
    throw error;
  }
};

// Function to get recommendations based on a specific movie (similar movies)
export const getRelatedRecommendations = async (movieId) => {
  try {
    // Fetch movie details including similar movies
    const movieDetails = await getMovieDetails(movieId);
    
    // Get similar movies
    const similarMovies = movieDetails.similar?.results || [];
    
    // Enhance the movie data with additional details
    const enhancedMovies = await Promise.all(
      similarMovies.slice(0, 10).map(async (movie) => {
        // Check if movie details are already cached
        if (movieCache.has(movie.id)) {
          return movieCache.get(movie.id);
        }
        
        try {
          // Fetch detailed movie data
          const details = await getMovieDetails(movie.id);
          const enhancedMovie = parseMovieData(details);
          
          // Cache the enhanced movie data
          movieCache.set(movie.id, enhancedMovie);
          
          return enhancedMovie;
        } catch (error) {
          console.error(`Error fetching details for movie ${movie.id}:`, error);
          return parseMovieData(movie);
        }
      })
    );
    
    return enhancedMovies;
  } catch (error) {
    console.error(`Error getting related recommendations for movie ${movieId}:`, error);
    throw error;
  }
};

// Function to update recommendations based on user feedback
export const updateRecommendationsBasedOnFeedback = async (userId, likedMovies, dislikedMovies) => {
  try {
    // In a real implementation, you would send this feedback to your recommendation
    // algorithm to improve future recommendations. For now, we'll just simulate this
    // by getting recommendations based on the most recently liked movie.
    
    // If there are liked movies, get recommendations based on the most recent one
    if (likedMovies.length > 0) {
      const mostRecentLikedMovie = likedMovies[likedMovies.length - 1];
      return await getRelatedRecommendations(mostRecentLikedMovie.id);
    }
    
    // If no liked movies, fall back to user preferences
    return await getPersonalizedRecommendations(userId);
  } catch (error) {
    console.error('Error updating recommendations based on feedback:', error);
    throw error;
  }
};

export default {
  getPersonalizedRecommendations,
  getMoodBasedRecommendations,
  getRelatedRecommendations,
  updateRecommendationsBasedOnFeedback
};