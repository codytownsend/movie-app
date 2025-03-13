// src/services/recommendationEngine.js
import { getGenres, searchMovies, getMoviesByGenre, getTrendingMovies } from './movieService';

/**
 * Advanced recommendation engine that weighs multiple factors:
 * - User's favorite genres (from profile)
 * - Watch history and ratings
 * - Movies in watchlist
 * - Actor/director preferences
 * - Available streaming services
 * - Applied filters
 * - Trending/popular content
 */
export const getPersonalizedRecommendations = async (uid, userData, movieLists, filters = {}) => {
  try {
    // 1. Build user preference profile
    const userProfile = buildUserPreferenceProfile(userData, movieLists);
    
    // 2. Get candidate movies from multiple sources
    const candidateMovies = await getCandidateMovies(userProfile, filters);
    
    // 3. Score each movie based on user preferences
    const scoredMovies = scoreMovies(candidateMovies, userProfile, filters);
    
    // 4. Filter out movies in watchlist/watched lists
    const userMovieIds = new Set([
      ...movieLists.watchlist.map(m => m.id.toString()),
      ...movieLists.watched.map(m => m.id.toString())
    ]);
    
    const filteredMovies = scoredMovies.filter(movie => !userMovieIds.has(movie.id.toString()));
    
    // 5. Sort by recommendation score and return
    return filteredMovies.sort((a, b) => b.recommendationScore - a.recommendationScore);
  } catch (error) {
    console.error('Error in recommendation engine:', error);
    throw error;
  }
};

/**
 * Builds a comprehensive user preference profile from all available data
 */
function buildUserPreferenceProfile(userData, movieLists) {
  const profile = {
    // Explicit preferences from user profile
    favoriteGenres: userData.favoriteGenres || [],
    streamingServices: userData.streamingServices || [],
    
    // Implicit preferences derived from watch history
    genrePreferences: {},
    actorPreferences: {},
    directorPreferences: {},
    decadePreferences: {},
    
    // Ratings data
    averageRating: 0,
    ratingVariance: 0,
    ratedGenres: {},
    
    // Watchlist signals
    watchlistGenres: {},
    recentlyViewed: []
  };
  
  // Process watched movies to extract implicit preferences
  if (movieLists.watched.length > 0) {
    let totalRating = 0;
    let ratingCount = 0;
    
    movieLists.watched.forEach(movie => {
      // Track ratings
      if (movie.userRating) {
        totalRating += movie.userRating;
        ratingCount++;
        
        // Add weighted genre preferences based on ratings
        (movie.genre || []).forEach(genre => {
          profile.ratedGenres[genre] = profile.ratedGenres[genre] || { count: 0, totalRating: 0 };
          profile.ratedGenres[genre].count += 1;
          profile.ratedGenres[genre].totalRating += movie.userRating;
        });
      }
      
      // Count genre occurrences
      (movie.genre || []).forEach(genre => {
        profile.genrePreferences[genre] = (profile.genrePreferences[genre] || 0) + 1;
      });
      
      // Count actor occurrences
      (movie.cast || []).forEach(actor => {
        profile.actorPreferences[actor] = (profile.actorPreferences[actor] || 0) + 1;
      });
      
      // Count director occurrences
      if (movie.director) {
        profile.directorPreferences[movie.director] = 
          (profile.directorPreferences[movie.director] || 0) + 1;
      }
      
      // Track decade preferences
      const decade = Math.floor((movie.year || 2000) / 10) * 10;
      profile.decadePreferences[decade] = (profile.decadePreferences[decade] || 0) + 1;
    });
    
    // Calculate average rating
    if (ratingCount > 0) {
      profile.averageRating = totalRating / ratingCount;
    }
    
    // Calculate rating variance
    if (ratingCount > 1) {
      let sumSquaredDiffs = 0;
      movieLists.watched
        .filter(movie => movie.userRating)
        .forEach(movie => {
          const diff = movie.userRating - profile.averageRating;
          sumSquaredDiffs += diff * diff;
        });
      profile.ratingVariance = sumSquaredDiffs / ratingCount;
    }
    
    // Sort for top preferences in each category
    profile.topGenres = Object.entries(profile.genrePreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
      
    profile.topActors = Object.entries(profile.actorPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([actor]) => actor);
      
    profile.topDirectors = Object.entries(profile.directorPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([director]) => director);
  }
  
  // Add signals from watchlist
  if (movieLists.watchlist.length > 0) {
    movieLists.watchlist.forEach(movie => {
      // Count watchlist genre occurrences
      (movie.genre || []).forEach(genre => {
        profile.watchlistGenres[genre] = (profile.watchlistGenres[genre] || 0) + 1;
      });
    });
    
    // Recently added to watchlist (for recency bias)
    profile.recentlyAdded = [...movieLists.watchlist]
      .sort((a, b) => {
        const dateA = a.addedAt ? new Date(a.addedAt.seconds * 1000) : new Date(0);
        const dateB = b.addedAt ? new Date(b.addedAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5);
  }
  
  return profile;
}

/**
 * Gets candidate movies from multiple sources including:
 * - Genre-based recommendations
 * - Actor/director recommendations
 * - Trending/popular movies
 * - Movies similar to highly rated or recently added
 */
async function getCandidateMovies(userProfile, filters) {
  const candidates = [];
  const seenMovieIds = new Set();
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  
  if (!API_KEY) {
    throw new Error('API key not configured');
  }
  
  try {
    // 1. Get movies based on top genres
    const genreIds = await mapGenresToIds(userProfile.topGenres || userProfile.favoriteGenres);
    if (genreIds.length > 0) {
      const genreMovies = await getMoviesByGenre(genreIds[0]);
      addUniqueCandidates(candidates, genreMovies, seenMovieIds);
    }
    
    // 2. Get trending movies as another source
    const trendingMovies = await getTrendingMovies();
    addUniqueCandidates(candidates, trendingMovies, seenMovieIds);
    
    // 3. Get movies by applied filters if any
    if (filters.genres && filters.genres.length > 0) {
      const filterGenreIds = await mapGenresToIds(filters.genres);
      const filterGenreMovies = await getMoviesByGenre(filterGenreIds[0]);
      addUniqueCandidates(candidates, filterGenreMovies, seenMovieIds);
    }
    
    // If we have at least 20 candidates, that's enough for scoring
    if (candidates.length >= 20) {
      return candidates;
    }
    
    // 4. Search for movies by top directors if we need more candidates
    if (userProfile.topDirectors && userProfile.topDirectors.length > 0) {
      const directorMovies = await searchMovies(userProfile.topDirectors[0]);
      addUniqueCandidates(candidates, directorMovies, seenMovieIds);
    }
    
    return candidates;
  } catch (error) {
    console.error('Error getting candidate movies:', error);
    // If API fails, return empty array - will be handled by caller
    return [];
  }
}

/**
 * Helper function to add unique movies to candidates list
 */
function addUniqueCandidates(candidates, newMovies, seenMovieIds) {
  newMovies.forEach(movie => {
    if (!seenMovieIds.has(movie.id.toString())) {
      seenMovieIds.add(movie.id.toString());
      candidates.push(movie);
    }
  });
}

/**
 * Maps genre names to TMDB genre IDs
 */
async function mapGenresToIds(genreNames) {
  try {
    const genres = await getGenres();
    const genreMap = {};
    
    genres.forEach(genre => {
      genreMap[genre.name.toLowerCase()] = genre.id;
    });
    
    return genreNames
      .map(name => genreMap[name.toLowerCase()])
      .filter(id => id !== undefined);
  } catch (error) {
    console.error('Error mapping genres to IDs:', error);
    return [];
  }
}

/**
 * Scores movies based on multiple weighted factors
 */
function scoreMovies(movies, userProfile, filters) {
  return movies.map(movie => {
    let score = 50; // Base score
    
    // Get normalized values for various attributes
    const genreScore = calculateGenreScore(movie, userProfile);
    const recencyScore = calculateRecencyScore(movie);
    const popularityScore = calculatePopularityScore(movie);
    const streamingScore = calculateStreamingScore(movie, userProfile);
    const yearScore = calculateYearScore(movie, userProfile, filters);
    
    // Apply weights to different factors
    score += genreScore * 15;
    score += recencyScore * 5;
    score += popularityScore * 10;
    score += streamingScore * 5;
    score += yearScore * 5;
    
    // Add director/actor bonus
    score += calculatePeopleBonus(movie, userProfile);
    
    // Adjust based on applied filters
    score = applyFilterAdjustments(score, movie, filters);
    
    return {
      ...movie,
      recommendationScore: score
    };
  });
}

/**
 * Calculate how well this movie matches the user's genre preferences
 * Returns a value between 0 and 1
 */
function calculateGenreScore(movie, userProfile) {
  if (!movie.genre || movie.genre.length === 0) {
    return 0;
  }
  
  let score = 0;
  const userGenres = new Set([
    ...(userProfile.favoriteGenres || []),
    ...(userProfile.topGenres || [])
  ]);
  
  // Weighted score for each matching genre
  movie.genre.forEach(genre => {
    // Explicit preference (from profile)
    if (userProfile.favoriteGenres && userProfile.favoriteGenres.includes(genre)) {
      score += 0.3;
    }
    
    // Implicit preference (from watch history)
    if (userProfile.genrePreferences && userProfile.genrePreferences[genre]) {
      // Normalize by dividing by the max count
      const maxCount = Math.max(...Object.values(userProfile.genrePreferences));
      score += (userProfile.genrePreferences[genre] / maxCount) * 0.3;
    }
    
    // Boost for highly rated genres
    if (userProfile.ratedGenres && userProfile.ratedGenres[genre]) {
      const avgRating = userProfile.ratedGenres[genre].totalRating / userProfile.ratedGenres[genre].count;
      score += (avgRating / 5) * 0.2;
    }
    
    // Bonus for watchlist genres
    if (userProfile.watchlistGenres && userProfile.watchlistGenres[genre]) {
      score += 0.2;
    }
  });
  
  // Normalize to 0-1 range
  return Math.min(score, 1);
}

/**
 * Calculate recency score (newer movies get higher scores)
 * Returns a value between 0 and 1
 */
function calculateRecencyScore(movie) {
  if (!movie.year) {
    return 0.5; // Neutral score if year is unknown
  }
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - movie.year;
  
  // Movies from the last 2 years get highest scores
  if (age <= 2) {
    return 1;
  }
  
  // Linear decay over 20 years
  return Math.max(0, 1 - (age / 20));
}

/**
 * Calculate popularity score based on rating
 * Returns a value between 0 and 1
 */
function calculatePopularityScore(movie) {
  if (!movie.rating) {
    return 0.5; // Neutral score if rating is unknown
  }
  
  // Normalize the rating to 0-1 range (assumes rating is 0-10)
  return movie.rating / 10;
}

/**
 * Calculate streaming availability score
 * Returns a value between 0 and 1
 */
function calculateStreamingScore(movie, userProfile) {
  if (!movie.streamingOn || movie.streamingOn.length === 0 || 
      !userProfile.streamingServices || userProfile.streamingServices.length === 0) {
    return 0.5; // Neutral score
  }
  
  // Check if the movie is available on any of the user's streaming services
  const hasMatchingService = movie.streamingOn.some(
    service => userProfile.streamingServices.includes(service)
  );
  
  return hasMatchingService ? 1 : 0;
}

/**
 * Calculate year preference score
 * Returns a value between 0 and 1
 */
function calculateYearScore(movie, userProfile, filters) {
  if (!movie.year) {
    return 0.5; // Neutral score if year is unknown
  }
  
  // If user has a year range filter, prioritize movies in that range
  if (filters.yearRange && filters.yearRange.length === 2) {
    if (movie.year >= filters.yearRange[0] && movie.year <= filters.yearRange[1]) {
      return 1;
    }
    return 0.2; // Much lower score for movies outside the filter range
  }
  
  // If no explicit year filter, use decade preferences from watch history
  if (userProfile.decadePreferences && Object.keys(userProfile.decadePreferences).length > 0) {
    const decade = Math.floor(movie.year / 10) * 10;
    if (userProfile.decadePreferences[decade]) {
      const maxCount = Math.max(...Object.values(userProfile.decadePreferences));
      return (userProfile.decadePreferences[decade] / maxCount) * 0.8 + 0.2;
    }
  }
  
  return 0.5; // Neutral score
}

/**
 * Calculate bonus points for matching directors or actors
 * Returns an additional score to add
 */
function calculatePeopleBonus(movie, userProfile) {
  let bonus = 0;
  
  // Director bonus
  if (movie.director && userProfile.topDirectors && 
      userProfile.topDirectors.includes(movie.director)) {
    bonus += 10;
  }
  
  // Cast bonus
  if (movie.cast && userProfile.topActors) {
    const matchingActors = movie.cast.filter(
      actor => userProfile.topActors.includes(actor)
    );
    
    // Add 2 points per matching actor, up to 10 points
    bonus += Math.min(matchingActors.length * 2, 10);
  }
  
  return bonus;
}

/**
 * Apply final adjustments based on active filters
 */
function applyFilterAdjustments(score, movie, filters) {
  let adjustedScore = score;
  
  // Genre filter - strongly prefer movies that match filter genres
  if (filters.genres && filters.genres.length > 0) {
    const matchesGenreFilter = movie.genre && movie.genre.some(
      genre => filters.genres.includes(genre)
    );
    
    if (matchesGenreFilter) {
      adjustedScore += 20;
    } else {
      adjustedScore -= 30; // Strong penalty for not matching genre filter
    }
  }
  
  // Rating filter
  if (filters.minRating && movie.rating) {
    if (movie.rating >= filters.minRating) {
      adjustedScore += 10;
    } else {
      adjustedScore -= 20; // Strong penalty for being below minimum rating
    }
  }
  
  // Streaming service filter
  if (filters.services && filters.services.length > 0 && movie.streamingOn) {
    const matchesServiceFilter = movie.streamingOn.some(
      service => filters.services.includes(service)
    );
    
    if (matchesServiceFilter) {
      adjustedScore += 15;
    } else {
      adjustedScore -= 25; // Strong penalty for not being on selected services
    }
  }
  
  return adjustedScore;
}