import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaInfoCircle, FaStar, FaArrowRight, FaCompass } from 'react-icons/fa';
import FilterSection from '../components/FilterSection';
import MovieCard from '../components/MovieCard';
import FeaturedCarousel from '../components/FeaturedCarousel';
import { 
  getRecommendations, 
  getTrendingMovies, 
  getTopRatedMovies,
  getNewReleases,
  filterMovies
} from '../utils/movieService';

// Categories Section
const CategorySection = ({ title, movies, viewAllLink, emptyMessage }) => {
  if (!movies || movies.length === 0) {
    return emptyMessage ? (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        <div className="bg-secondary rounded-xl p-8 text-center">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    ) : null;
  }
  
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-primary hover:text-primary-light flex items-center text-sm font-medium">
            View All <FaArrowRight className="ml-1" />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            onWatchlistToggle={(movieId, isAdded) => {
              // You could update local state here if needed
              console.log(`Movie ${movieId} ${isAdded ? 'added to' : 'removed from'} watchlist`);
            }}
          />
        ))}
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
  
  // Define handleFilterChange using useCallback to memoize it
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);
  
  // Use useEffect with proper dependency array to prevent infinite loop
  useEffect(() => {
    // Fetch movies function
    const fetchMovies = async () => {
      setIsLoading(true);
      
      try {
        // For demo purposes, let's use our mock data services
        let recommendations;
        if (userProfile && userProfile.preferences) {
          recommendations = await getRecommendations(userProfile.preferences);
        } else {
          recommendations = await getTrendingMovies(); // Fallback if no preferences
        }
        
        // If there are filters active, apply them
        if (filters.genre || filters.decade || filters.mood) {
          recommendations = await filterMovies(filters);
        }
        
        const trending = await getTrendingMovies();
        const topRated = await getTopRatedMovies();
        const newReleasesData = await getNewReleases();
        
        // Create featured movies array with labels
        const featured = [];
        
        // Add top recommendation if available
        if (recommendations.length > 0) {
          featured.push({
            ...recommendations[0],
            featuredLabel: "Recommended For You"
          });
        }
        
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
        
        setRecommendedMovies(recommendations);
        setTrendingMovies(trending);
        setTopRatedMovies(topRated);
        setNewReleases(newReleasesData);
        setFeaturedMovies(featured);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovies();
  }, [userProfile, filters]); // Only re-run if userProfile or filters change
  
  return (
    <Layout>
      {!currentUser ? (
        // Not logged in - show welcome screen
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden flex items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-background to-background/20"></div>
            <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg')] bg-cover bg-center opacity-50"></div>
            
            <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl leading-tight drop-shadow-lg">
                Discover Movies Tailored Just For You
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Our AI-powered platform analyzes your preferences to recommend films you'll actually enjoy. Sign up now to start your personalized movie journey.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/signup" 
                  className="px-8 py-4 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition transform hover:scale-105 shadow-glow"
                >
                  Get Started
                </Link>
                <Link 
                  href="/login" 
                  className="px-8 py-4 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition transform hover:scale-105"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="py-12">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Our Platform?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-secondary p-8 rounded-xl transition-all hover:shadow-glow hover:bg-secondary-light">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <FaCompass className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Smart Recommendations</h3>
                <p className="text-gray-300">Our AI analyzes your preferences and viewing history to suggest films that match your unique taste.</p>
              </div>
              
              <div className="bg-secondary p-8 rounded-xl transition-all hover:shadow-glow hover:bg-secondary-light">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <FaStar className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Discover Hidden Gems</h3>
                <p className="text-gray-300">Find lesser-known movies from your favorite directors, actors, or in genres you love.</p>
              </div>
              
              <div className="bg-secondary p-8 rounded-xl transition-all hover:shadow-glow hover:bg-secondary-light">
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
            <h2 className="text-2xl font-bold text-white mb-6">Popular Right Now</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingMovies.slice(0, 4).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/signup" 
                className="inline-flex items-center px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition"
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
                Welcome back, {userProfile.displayName || 'Movie Fan'}! 👋
              </h1>
            )}
            
            <FilterSection onFilterChange={handleFilterChange} />
          </div>
          
          {isLoading ? (
            <div className="py-20">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/80">Loading your recommendations...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Recommended for You */}
              <CategorySection 
                title="Recommended for You" 
                movies={recommendedMovies} 
                viewAllLink="/discover" 
                emptyMessage="We're preparing personalized recommendations for you. Check back soon!"
              />
              
              {/* New Releases */}
              <CategorySection 
                title="New Releases" 
                movies={newReleases} 
                viewAllLink="/discover?sort=new_releases" 
                emptyMessage="No new releases available at this time."
              />
              
              {/* Trending Now */}
              <CategorySection 
                title="Trending Now" 
                movies={trendingMovies} 
                viewAllLink="/discover?sort=trending" 
                emptyMessage="Trending movies will appear here soon."
              />
              
              {/* Top Rated */}
              <CategorySection 
                title="Top Rated" 
                movies={topRatedMovies} 
                viewAllLink="/discover?sort=top_rated" 
                emptyMessage="Top rated movies will appear here soon."
              />
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}