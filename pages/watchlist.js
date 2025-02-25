import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaEye, FaStar } from 'react-icons/fa';
import Link from 'next/link';

// Dummy watchlist data - in a real app, this would come from Firebase
const DUMMY_WATCHLIST = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    release_date: '1994-09-23',
    vote_average: 8.7,
    genres: ['Drama', 'Crime'],
    addedAt: new Date('2023-01-15')
  },
  {
    id: 3,
    title: 'The Dark Knight',
    poster_path: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    addedAt: new Date('2023-02-20')
  },
  {
    id: 6,
    title: 'Inception',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    release_date: '2010-07-15',
    vote_average: 8.3,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    addedAt: new Date('2023-03-10')
  }
];

export default function Watchlist() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('dateAdded');
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    // In a real app, this would fetch the user's watchlist from Firebase
    setLoading(true);
    setTimeout(() => {
      setWatchlist(DUMMY_WATCHLIST);
      setLoading(false);
    }, 1000);
  }, [currentUser, router]);
  
  const handleRemoveFromWatchlist = (movieId) => {
    // In a real app, this would remove the movie from Firebase
    setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
  };
  
  const sortWatchlist = (movies, sortOption) => {
    const sortedMovies = [...movies];
    
    switch (sortOption) {
      case 'dateAdded':
        return sortedMovies.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      case 'title':
        return sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
      case 'rating':
        return sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
      case 'releaseDate':
        return sortedMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      default:
        return sortedMovies;
    }
  };
  
  const sortedWatchlist = sortWatchlist(watchlist, sortBy);
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Your Watchlist</h1>
        <p className="text-gray-300">
          Movies you've saved to watch later.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-12 bg-secondary rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Your watchlist is empty</h2>
          <p className="text-gray-300 mb-6">
            Start adding movies to your watchlist to keep track of what you want to watch.
          </p>
          <Link 
            href="/discover" 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Discover Movies
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-300">
              {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} in your watchlist
            </p>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="dateAdded">Date Added (Newest)</option>
                <option value="title">Title (A-Z)</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="releaseDate">Release Date (Newest)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {sortedWatchlist.map((movie) => (
              <div key={movie.id} className="bg-secondary rounded-lg overflow-hidden shadow-md">
                <div className="flex flex-col sm:flex-row">
                  {/* Movie poster - mobile & desktop */}
                  <div className="sm:w-40 md:w-48 flex-shrink-0">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Movie details */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
                        <div className="flex items-center bg-gray-800 px-2 py-1 rounded-full">
                          <FaStar className="text-yellow-500 mr-1" />
                          <span className="text-sm text-white">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">
                        {new Date(movie.release_date).getFullYear()} • {movie.genres.join(', ')}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        Added on {movie.addedAt.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex mt-4 space-x-2">
                      <Link 
                        href={`/movie/${movie.id}`} 
                        className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                      >
                        <FaEye className="mr-1" />
                        View
                      </Link>
                      <button 
                        onClick={() => handleRemoveFromWatchlist(movie.id)}
                        className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                      >
                        <FaTrash className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}