import Link from 'next/link';
import { FaStar } from 'react-icons/fa';

export default function MovieCard({ movie }) {
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const fallbackPosterUrl = '/placeholder-poster.jpg';
  
  return (
    <div className="flex flex-col rounded-lg overflow-hidden bg-secondary hover:shadow-lg transition duration-300 h-full">
      <div className="relative h-64 w-full">
        <img
          src={posterUrl}
          alt={`${movie.title} poster`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackPosterUrl;
          }}
        />
        <div className="absolute top-2 right-2 bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
          {movie.vote_average.toFixed(1)}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{movie.title}</h3>
        <p className="text-sm text-gray-400 mb-2">{new Date(movie.release_date).getFullYear()}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genres?.slice(0, 3).map((genre, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
              {genre}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-300 line-clamp-3 mb-3">{movie.overview}</p>
        <Link 
          href={`/movie/${movie.id}`} 
          className="mt-auto text-primary hover:text-primary-light text-sm font-medium"
        >
          View details
        </Link>
      </div>
    </div>
  );
}