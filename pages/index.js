// pages/index.js - Updated version
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaInfoCircle, FaStar, FaArrowRight, FaCompass, FaFilm, FaFire, FaClock } from 'react-icons/fa';
import RecommendationSwiper from '../components/RecommendationSwiper';
import EnhancedFilterSection from '../components/EnhancedFilterSection';
import MovieCard from '../components/MovieCard';
import FeaturedCarousel from '../components/FeaturedCarousel';
import { 
  getTrendingMovies, 
  getTopRatedMovies,
  getNewReleases
} from '../utils/movieService';
import { 
  getPersonalizedRecommendations,
  getMoodBasedRecommendations,
  updateRecommendationsBasedOnFeedback
} from '../utils/RecommendationEngine';

// Categories Section
const CategorySection = ({ title, movies, viewAllLink, emptyMessage, icon }) => {
  if (!movies || movies.length === 0) {
    return emptyMessage ? (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        <div className="bg-secondary/40 backdrop-blur-sm rounded-xl p-8 text-center">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    ) : null;
  }
  
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-primary hover:text-white flex items-center text-sm font-medium transition-colors">
            View All <FaArrowRight className="ml-1" />
          </Link>
        )}
      </div>
      
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-64">
              <MovieCard 
                movie={movie} 
                onWatchlistToggle={(movieId, isAdded) => {
                  console.log(`Movie ${movieId} ${isAdded ? 'added to' : 'removed from'} watchlist`);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { currentUser, userProfile } = useAuth();
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ genre: '', decade: '', mood: '' });
  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);
  const [page, setPage] = useState(1);
  
  // Define handleFilterChange using useCallback to memoize it
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // Reset liked/disliked movies when filters change
    setLikedMovies([]);
    setDislikedMovies([]);
    setPage(1);
  }, []);
  
  // Handle movie like
  const handleMovieLike = useCallback((movie) => {
    setLikedMovies(prev => [...prev, movie]);
  }, []);
  
  // Handle movie dislike
  const handleMovieDislike = useCallback((movie) => {
    setDislikedMovies(prev => [...prev, movie]);
  }, []);
  
  // Load more recommendations
  const handleLoadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);
  
  // Initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const trending = await getTrendingMovies();
        const topRated = await getTopRatedMovies();
        const newReleasesData = await getNewReleases();
        
        // Create featured movies array with labels
        const featured = [];
        
        // Add a trending movie if available
        if (trending.length > 0) {
          featured.push({
            ...trending[0],
            featuredLabel: "Trending Now"
          });
        }
        
        // Add a new release if available
        if (newReleasesData.length > 0) {
          featured.push({
            ...newReleasesData[0],
            featuredLabel: "New Release"
          });
        }
        
        // Add a top rated movie if available
        if (topRated.length > 0) {
          featured.push({
            ...topRated[0],
            featuredLabel: "Critically Acclaimed"
          });
        }
        
        setTrendingMovies(trending);
        setTopRatedMovies(topRated);
        setNewReleases(newReleasesData);
        setFeaturedMovies(featured);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Fetch recommended movies based on filters and feedback
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      
      try {
        let recommendations;
        
        // If there's enough feedback, use it to improve recommendations
        if (likedMovies.length > 0 && page === 1) {
          recommendations = await updateRecommendationsBasedOnFeedback(
            currentUser?.uid, 
            likedMovies, 
            dislikedMovies
          );
        } 
        // If there's a mood filter, prioritize that
        else if (filters.mood) {
          recommendations = await getMoodBasedRecommendations(
            filters.mood, 
            {
              genre: filters.genre,
              decade: filters.decade
            }
          );
        } 
        // Otherwise use personalized recommendations
        else if (userProfile && userProfile.preferences) {
          recommendations = await getPersonalizedRecommendations(
            currentUser?.uid, 
            userProfile.preferences,
            page
          );
        } 
        // Fallback to trending if no preferences
        else {
          recommendations = await getTrendingMovies();
        }
        
        if (page > 1) {
          // Append new movies to existing recommendations, avoiding duplicates
          setRecommendedMovies(prev => {
            const existingIds = new Set(prev.map(movie => movie.id));
            const newMovies = recommendations.filter(movie => !existingIds.has(movie.id));
            return [...prev, ...newMovies];
          });
        } else {
          setRecommendedMovies(recommendations);
        }
        
        // Add the top recommendation to featured if we're on the first page
        if (page === 1 && recommendations.length > 0) {
          setFeaturedMovies(prev => {
            const withRecommendation = [...prev];
            withRecommendation.unshift({
              ...recommendations[0],
              featuredLabel: filters.mood ? `${filters.mood.replace('-', ' ')} Pick` : "Recommended For You"
            });
            return withRecommendation.slice(0, 3); // Limit to 3 featured movies
          });
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchRecommendations();
    }
  }, [currentUser, userProfile, filters, likedMovies.length, dislikedMovies.length, page]);
  
  return (
    <Layout>
      {!currentUser ? (
        // Not logged in - show welcome screen
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="relative h-[600px] rounded-2xl overflow-hidden flex items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-background to-background/20"></div>
            <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg')] bg-cover bg-center opacity-50"></div>
            
            <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-md px-4 py-2 rounded-full text-primary mb-6 animate-pulse">
                AI-Powered Recommendations
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight drop-shadow-lg">
                Discover Movies Tailored Just For You
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Our AI-powered platform analyzes your preferences to recommend films you'll actually enjoy. Sign up now to start your personalized movie journey.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/signup" 
                  className="px-8 py-4 bg-primary text-background font-medium rounded-lg hover:bg-primary-dark transition transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
                <Link 
                  href="/login" 
                  className="px-8 py-4 bg-secondary text-white font-medium rounded-lg hover:bg-secondary-light transition transform hover:scale-105"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="py-12">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose CineMagic?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-secondary/40 backdrop-blur-sm p-8 rounded-xl transition-all hover:shadow-lg hover:bg-secondary-light/40 transform hover:scale-105">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <FaCompass className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Smart Recommendations</h3>
                <p className="text-gray-300">Our AI analyzes your preferences and viewing history to suggest films that match your unique taste.</p>
              </div>
              
              <div className="bg-secondary/40 backdrop-blur-sm p-8 rounded-xl transition-all hover:shadow-lg hover:bg-secondary-light/40 transform hover:scale-105">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <FaStar className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Discover Hidden Gems</h3>
                <p className="text-gray-300">Find lesser-known movies from your favorite directors, actors, or in genres you love.</p>
              </div>
              
              <div className="bg-secondary/40 backdrop-blur-sm p-8 rounded-xl transition-all hover:shadow-lg hover:bg-secondary-light/40 transform hover:scale-105">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <FaInfoCircle className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Curated Collections</h3>
                <p className="text-gray-300">Explore themed collections and curated lists that help you find your next favorite film.</p>
              </div>
            </div>
          </div>
          
          {/* Popular Movies Preview */}
          <div className="py-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaFire className="mr-2" />
              Popular Right Now
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingMovies.slice(0, 4).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/signup" 
                className="inline-flex items-center px-6 py-3 bg-primary text-background font-medium rounded-lg hover:bg-primary-dark transition transform hover:scale-105"
              >
                Sign Up to See More <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Logged in - show recommendations
        <div className="space-y-10">
          {/* Featured Movie Carousel */}
          {featuredMovies.length > 0 && (
            <FeaturedCarousel featuredMovies={featuredMovies} />
          )}
          
          {/* Greeting & Filter Section */}
          <div className="mb-6">
            {userProfile && (
              <h1 className="text-3xl font-bold text-white mb-6">
                Welcome back, {userProfile.displayName || 'Movie Fan'}!
              </h1>
            )}
            
            <EnhancedFilterSection onFilterChange={handleFilterChange} />
          </div>
          
          {/* Recommendation Swiper */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaCompass className="mr-2" />
              Your Personalized Picks
            </h2>
            
            <div className="flex flex-col items-center">
              <RecommendationSwiper 
                movies={recommendedMovies}
                onLike={handleMovieLike}
                onDislike={handleMovieDislike}
                onLoadMore={handleLoadMore}
              />
              
              <div className="mt-6 text-sm text-gray-400 text-center">
                Swipe right to like, left to skip, or use the buttons below
              </div>
            </div>
          </div>
          
          {/* Horizontal scrolling sections */}
          <div className="space-y-16">
            {/* New Releases */}
            <CategorySection 
              title="New Releases" 
              icon={<FaClock />}
              movies={newReleases} 
              viewAllLink="/discover?sort=new_releases" 
              emptyMessage="No new releases available at this time."
            />
            
            {/* Trending Now */}
            <CategorySection 
              title="Trending Now" 
              icon={<FaFire />}
              movies={trendingMovies} 
              viewAllLink="/discover?sort=trending" 
              emptyMessage="Trending movies will appear here soon."
            />
            
            {/* Top Rated */}
            <CategorySection 
              title="Top Rated" 
              icon={<FaStar />}
              movies={topRatedMovies} 
              viewAllLink="/discover?sort=top_rated" 
              emptyMessage="Top rated movies will appear here soon."
            />
          </div>
        </div>
      )}
    </Layout>
  );
}