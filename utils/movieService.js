// utils/movieService.js - Centralized place for movie data handling

// This would eventually be replaced with real API calls to TMDB and Firebase
const DUMMY_MOVIES = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdrop_path: '/j9XKiZrVeViAixVRzCta7h1VU9W.jpg',
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    release_date: '1994-09-23',
    vote_average: 8.7,
    genres: ['Drama', 'Crime']
  },
  {
    id: 2,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.',
    release_date: '1972-03-14',
    vote_average: 8.7,
    genres: ['Drama', 'Crime']
  },
  {
    id: 3,
    title: 'The Dark Knight',
    poster_path: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    release_date: '2008-07-16',
    vote_average: 8.5,
    genres: ['Action', 'Crime', 'Drama', 'Thriller']
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.',
    release_date: '1994-09-10',
    vote_average: 8.5,
    genres: ['Thriller', 'Crime']
  },
  {
    id: 5,
    title: 'Fight Club',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.',
    release_date: '1999-10-15',
    vote_average: 8.4,
    genres: ['Drama', 'Thriller']
  },
  {
    id: 6,
    title: 'Inception',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    release_date: '2010-07-15',
    vote_average: 8.3,
    genres: ['Action', 'Science Fiction', 'Adventure']
  },
  {
    id: 7,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    release_date: '2014-11-05',
    vote_average: 8.3,
    genres: ['Adventure', 'Drama', 'Science Fiction']
  },
  {
    id: 8,
    title: 'Parasite',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/ApiBzeaa95TNYliSbQ8pJv4Fje7.jpg',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    release_date: '2019-05-30',
    vote_average: 8.5,
    genres: ['Comedy', 'Thriller', 'Drama']
  }
];

// Function to get all movies
export const getAllMovies = async () => {
  // In a real app, this would fetch from an API
  // Simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...DUMMY_MOVIES]);
    }, 500);
  });
};

// Function to get movie by ID
export const getMovieById = async (id) => {
  // In a real app, this would fetch from an API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const movie = DUMMY_MOVIES.find(movie => movie.id === parseInt(id));
      if (movie) {
        resolve(movie);
      } else {
        reject(new Error('Movie not found'));
      }
    }, 300);
  });
};

// Function to filter movies based on criteria
export const filterMovies = async (filters) => {
  // In a real app, this would use API filters
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredMovies = [...DUMMY_MOVIES];
      
      // Apply genre filter
      if (filters.genre) {
        filteredMovies = filteredMovies.filter(movie => 
          movie.genres.includes(filters.genre)
        );
      }
      
      // Apply decade filter
      if (filters.decade) {
        filteredMovies = filteredMovies.filter(movie => {
          const year = new Date(movie.release_date).getFullYear();
          if (filters.decade === '2020s') return year >= 2020;
          if (filters.decade === '2010s') return year >= 2010 && year < 2020;
          if (filters.decade === '2000s') return year >= 2000 && year < 2010;
          if (filters.decade === '1990s') return year >= 1990 && year < 2000;
          if (filters.decade === '1980s') return year >= 1980 && year < 1990;
          if (filters.decade === 'Older') return year < 1980;
          return true;
        });
      }
      
      // Apply mood filter
      if (filters.mood) {
        // This is a simplification. In a real app, you'd have more 
        // sophisticated mood-to-genre/tag mapping
        const moodToGenreMap = {
          'Feel-Good': ['Comedy', 'Family', 'Adventure'],
          'Dark & Gritty': ['Crime', 'Thriller', 'Drama'],
          'Thought-Provoking': ['Drama', 'Science Fiction', 'Mystery'],
          'Action-Packed': ['Action', 'Adventure', 'Science Fiction'],
          'Emotional': ['Drama', 'Romance'],
          'Inspirational': ['Drama', 'Biography', 'Sport']
        };
        
        const relevantGenres = moodToGenreMap[filters.mood] || [];
        if (relevantGenres.length > 0) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.genres.some(genre => relevantGenres.includes(genre))
          );
        }
      }
      
      resolve(filteredMovies);
    }, 600);
  });
};

// Function to get personalized recommendations
export const getRecommendations = async (userPreferences) => {
  // In a real app, this would use an algorithm or ML model
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple mock recommendation logic
      let recommendations = [...DUMMY_MOVIES];
      
      // If user has genre preferences, prioritize those
      if (userPreferences?.genres?.length > 0) {
        // Sort by matching genres
        recommendations.sort((a, b) => {
          const aMatches = a.genres.filter(genre => 
            userPreferences.genres.includes(genre)
          ).length;
          
          const bMatches = b.genres.filter(genre => 
            userPreferences.genres.includes(genre)
          ).length;
          
          return bMatches - aMatches;
        });
      }
      
      resolve(recommendations.slice(0, 4)); // Return top 4
    }, 800);
  });
};

// Function to get trending movies
export const getTrendingMovies = async () => {
  // In a real app, this would fetch from an API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Just return a shuffled subset for now
      const shuffled = [...DUMMY_MOVIES].sort(() => 0.5 - Math.random());
      resolve(shuffled.slice(0, 4));
    }, 500);
  });
};

// Function to get top rated movies
export const getTopRatedMovies = async () => {
  // In a real app, this would fetch from an API
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = [...DUMMY_MOVIES].sort((a, b) => b.vote_average - a.vote_average);
      resolve(sorted.slice(0, 4));
    }, 500);
  });
};

// Function to get new releases
export const getNewReleases = async () => {
  // In a real app, this would fetch from an API
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demo purposes, we'll just filter movies from 2019 or later
      const newReleases = DUMMY_MOVIES.filter(movie => {
        const releaseYear = new Date(movie.release_date).getFullYear();
        return releaseYear >= 2019;
      });
      
      // Sort by release date, newest first
      const sorted = newReleases.sort((a, b) => 
        new Date(b.release_date) - new Date(a.release_date)
      );
      
      resolve(sorted.slice(0, 4));
    }, 500);
  });
};

// Helper function to generate TMDB image URLs
export const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default {
  getAllMovies,
  getMovieById,
  filterMovies,
  getRecommendations,
  getTrendingMovies,
  getTopRatedMovies,
  getImageUrl
};