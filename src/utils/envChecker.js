// src/utils/envChecker.js

/**
 * Utility function to validate required environment variables
 * and provide warnings in development mode
 */
export const checkRequiredEnvVars = () => {
  // Only run checks in development
  if (import.meta.env.MODE !== 'development') return;
  
  // List of variables to check
  const requiredVars = [
    { name: 'VITE_TMDB_API_KEY', critical: false }
  ];
  
  // Check each variable
  requiredVars.forEach(variable => {
    const value = import.meta.env[variable.name];
    
    if (!value) {
      if (variable.critical) {
        console.error(`Critical environment variable ${variable.name} is missing!`);
      } else {
        console.warn(`Environment variable ${variable.name} is not set. Some features may be limited.`);
      }
    }
  });
  
  // For TMDB API specifically
  if (!import.meta.env.VITE_TMDB_API_KEY) {
    console.info(
      '%c🎬 MovieMatch will use sample data because TMDB API key is not configured.', 
      'background: #f0f0f0; color: #333; padding: 4px; border-radius: 4px; font-weight: bold;'
    );
    console.info(
      'To use real movie data, get an API key from https://www.themoviedb.org/settings/api and add it to your .env file'
    );
  }
};