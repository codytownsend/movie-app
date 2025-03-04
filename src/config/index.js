// src/config/index.js

// API Configuration
export const API_CONFIG = {
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  API_URL: import.meta.env.VITE_API_URL || "https://api.themoviedb.org/3",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w500",
};

// App Configuration
export const APP_CONFIG = {
  APP_VERSION: import.meta.env.VITE_VERSION || "1.0.0",
  DEBUG_MODE: import.meta.env.MODE === "development",
};

// Feature Flags
export const FEATURE_FLAGS = {
  USE_REAL_API: !!import.meta.env.VITE_TMDB_API_KEY,
  ENABLE_SOCIAL_FEATURES: import.meta.env.VITE_ENABLE_SOCIAL === "true" || false,
};