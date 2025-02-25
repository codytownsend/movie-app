import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaInfoCircle, FaPlayCircle, FaStar, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const FeaturedCarousel = ({ featuredMovies }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Auto-advance slides
  useEffect(() => {
    if (!featuredMovies || featuredMovies.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 8000); // Change slide every 8 seconds
    
    return () => clearInterval(interval);
  }, [currentSlide, featuredMovies]);
  
  const nextSlide = () => {
    if (isTransitioning || !featuredMovies || featuredMovies.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === featuredMovies.length - 1 ? 0 : prev + 1));
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 500);
  };
  
  const prevSlide = () => {
    if (isTransitioning || !featuredMovies || featuredMovies.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1));
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 500);
  };
  
  if (!featuredMovies || featuredMovies.length === 0) {
    return null;
  }

  const currentMovie = featuredMovies[currentSlide];
  const backdropUrl = `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`;
  
  return (
    <div className="relative w-full h-[70vh] max-h-[600px] overflow-hidden rounded-2xl mb-12">
      {/* Backdrop Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 py-8 lg:py-0">
          <div className="max-w-2xl">
            <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              {currentMovie.featuredLabel && (
                <div className="inline-block bg-secondary/80 backdrop-blur-sm text-accent px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {currentMovie.featuredLabel}
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {currentMovie.title}
              </h1>
              
              <div className="flex items-center mb-4 text-sm text-white/80">
                <span>{new Date(currentMovie.release_date).getFullYear()}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <FaStar className="text-accent mr-1" />
                  <span>{currentMovie.vote_average.toFixed(1)}</span>
                </div>
              </div>
              
              <p className="text-lg text-white/90 mb-8 drop-shadow-md line-clamp-3">
                {currentMovie.overview}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link href={`/movie/${currentMovie.id}`} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg flex items-center transition-all transform hover:scale-105">
                  <FaInfoCircle className="mr-2" />
                  More Info
                </Link>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentMovie.title + ' trailer')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg flex items-center transition-all transform hover:scale-105"
                >
                  <FaPlayCircle className="mr-2" />
                  Watch Trailer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Controls */}
      {featuredMovies.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 transition-all focus:outline-none z-10"
            disabled={isTransitioning}
          >
            <FaArrowLeft />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 transition-all focus:outline-none z-10"
            disabled={isTransitioning}
          >
            <FaArrowRight />
          </button>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentSlide(index);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedCarousel;