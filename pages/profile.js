import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { updateUserPreferences, logOut } from '../utils/firebase';
import Link from 'next/link';
import { FaUser, FaEdit, FaStar, FaFilm, FaSave, FaSignOutAlt, FaBookmark, FaCog, FaHeart, FaHistory } from 'react-icons/fa';
import MovieCard from '../components/MovieCard';

// A list of ratings the user has given to movies (mock data)
const MOCK_RATED_MOVIES = [
  {
    id: 3,
    title: 'The Dark Knight',
    poster_path: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    userRating: 5
  },
  {
    id: 6,
    title: 'Inception',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    release_date: '2010-07-15',
    vote_average: 8.3,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    userRating: 4
  }
];

// A list of recently viewed movies (mock data)
const MOCK_RECENT_MOVIES = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    release_date: '1994-09-23',
    vote_average: 8.7,
    genres: ['Drama', 'Crime'],
    viewedAt: new Date('2023-05-10')
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    release_date: '1994-09-10',
    vote_average: 8.5,
    genres: ['Thriller', 'Crime'],
    viewedAt: new Date('2023-05-08')
  }
];

// Rating badge component
const RatingBadge = ({ rating }) => {
  const getColor = () => {
    if (rating >= 4) return 'bg-green-600';
    if (rating >= 3) return 'bg-accent';
    if (rating >= 2) return 'bg-yellow-600';
    return 'bg-red-600';
  };
  
  return (
    <div className={`absolute top-2 right-2 ${getColor()} rounded-full h-8 w-8 flex items-center justify-center text-white font-bold`}>
      {rating}
    </div>
  );
};

// Activity item component for the activity feed
const ActivityItem = ({ type, movie, date }) => {
  const getActivityIcon = () => {
    switch (type) {
      case 'rated':
        return <FaStar className="text-accent" />;
      case 'watched':
        return <FaHistory className="text-primary" />;
      case 'saved':
        return <FaBookmark className="text-primary" />;
      case 'liked':
        return <FaHeart className="text-red-500" />;
      default:
        return <FaFilm className="text-primary" />;
    }
  };
  
  const getActivityText = () => {
    switch (type) {
      case 'rated':
        return <span>You rated <span className="font-medium text-white">{movie.title}</span> {movie.userRating}/5</span>;
      case 'watched':
        return <span>You watched <span className="font-medium text-white">{movie.title}</span></span>;
      case 'saved':
        return <span>You added <span className="font-medium text-white">{movie.title}</span> to your watchlist</span>;
      case 'liked':
        return <span>You liked <span className="font-medium text-white">{movie.title}</span></span>;
      default:
        return <span>You interacted with <span className="font-medium text-white">{movie.title}</span></span>;
    }
  };
  
  return (
    <div className="flex items-start p-4 border-b border-gray-800">
      <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center mr-4 flex-shrink-0">
        {getActivityIcon()}
      </div>
      <div className="flex-grow">
        <p className="text-gray-300">
          {getActivityText()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

// Small movie card for horizontal scrolling lists
const SmallMovieCard = ({ movie, extraInfo }) => {
  const posterUrl = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
  
  return (
    <Link href={`/movie/${movie.id}`} className="flex-shrink-0 w-32 md:w-40 mr-4 group">
      <div className="relative rounded-lg overflow-hidden">
        <img 
          src={posterUrl} 
          alt={movie.title} 
          className="w-full h-auto aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {movie.userRating && (
          <RatingBadge rating={movie.userRating} />
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-white line-clamp-1 group-hover:text-primary transition-colors">
        {movie.title}
      </h3>
      {extraInfo && (
        <p className="text-xs text-gray-400">{extraInfo}</p>
      )}
    </Link>
  );
};

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();
  
  // States for user preferences
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedDecades, setSelectedDecades] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  
  // State for activity feed
  const [activityFeed, setActivityFeed] = useState([]);
  
  // Define preference options
  const genreOptions = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 
    'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 
    'War', 'Western'
  ];
  
  const decadeOptions = [
    '2020s', '2010s', '2000s', '1990s', '1980s', '1970s', '1960s', 'Older'
  ];
  
  const moodOptions = [
    'Feel-Good', 'Dark & Gritty', 'Thought-Provoking', 'Action-Packed', 
    'Emotional', 'Inspirational', 'Scary', 'Funny', 'Relaxing', 'Intense'
  ];
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    if (userProfile) {
      setSelectedGenres(userProfile.preferences?.genres || []);
      setSelectedDecades(userProfile.preferences?.decades || []);
      setSelectedMoods(userProfile.preferences?.moods || []);
      
      // Generate mock activity feed
      const mockActivities = [
        { type: 'rated', movie: MOCK_RATED_MOVIES[0], date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { type: 'saved', movie: MOCK_RECENT_MOVIES[1], date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { type: 'watched', movie: MOCK_RECENT_MOVIES[0], date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { type: 'liked', movie: MOCK_RATED_MOVIES[1], date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      ];
      
      setActivityFeed(mockActivities);
      setLoading(false);
    }
  }, [currentUser, userProfile, router]);
  
  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  const toggleSelection = (item, current, setter) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };
  
  const savePreferences = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      await updateUserPreferences(currentUser.uid, {
        genres: selectedGenres,
        decades: selectedDecades,
        moods: selectedMoods
      });
      
      setEditingPreferences(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Handle error (show a message, etc.)
    }
    
    setLoading(false);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary-light rounded-xl p-8 md:p-10 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-28 h-28 bg-primary/20 rounded-full flex items-center justify-center text-primary text-4xl">
            {userProfile?.displayName?.charAt(0).toUpperCase() || <FaUser />}
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold text-white">
              {userProfile?.displayName || 'Movie Fan'}
            </h1>
            <p className="text-gray-400">{currentUser?.email}</p>
            
            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="px-4 py-2 bg-secondary rounded-lg text-sm text-gray-300 flex items-center">
                <FaStar className="text-accent mr-2" />
                <span><b className="text-white">{MOCK_RATED_MOVIES.length}</b> Ratings</span>
              </div>
              <div className="px-4 py-2 bg-secondary rounded-lg text-sm text-gray-300 flex items-center">
                <FaBookmark className="text-primary mr-2" />
                <span><b className="text-white">{userProfile?.watchlist?.length || 3}</b> in Watchlist</span>
              </div>
              <div className="px-4 py-2 bg-secondary rounded-lg text-sm text-gray-300 flex items-center">
                <FaFilm className="text-primary mr-2" />
                <span><b className="text-white">{MOCK_RECENT_MOVIES.length}</b> Watched</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="md:self-start px-4 py-2 bg-secondary rounded-lg hover:bg-secondary-light text-white flex items-center transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Profile Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-800">
          <button
            className={`px-5 py-3 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Overview
          </button>
          <button
            className={`px-5 py-3 font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button
            className={`px-5 py-3 font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button
            className={`px-5 py-3 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Your Ratings</h2>
                <Link href="/discover" className="text-primary hover:text-primary-light text-sm">
                  Find More Movies
                </Link>
              </div>
              
              {MOCK_RATED_MOVIES.length > 0 ? (
                <div className="overflow-x-auto pb-4 -mx-4 px-4">
                  <div className="flex">
                    {MOCK_RATED_MOVIES.map(movie => (
                      <SmallMovieCard 
                        key={movie.id} 
                        movie={movie} 
                        extraInfo={`${movie.userRating}/5 stars`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-secondary rounded-lg p-6 text-center">
                  <p className="text-gray-400 mb-4">You haven't rated any movies yet.</p>
                  <Link 
                    href="/discover" 
                    className="px-4 py-2 bg-primary text-white rounded-lg inline-block hover:bg-primary-dark transition"
                  >
                    Discover Movies to Rate
                  </Link>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Recently Viewed</h2>
                <Link href="/watchlist" className="text-primary hover:text-primary-light text-sm">
                  View All
                </Link>
              </div>
              
              {MOCK_RECENT_MOVIES.length > 0 ? (
                <div className="overflow-x-auto pb-4 -mx-4 px-4">
                  <div className="flex">
                    {MOCK_RECENT_MOVIES.map(movie => (
                      <SmallMovieCard 
                        key={movie.id} 
                        movie={movie} 
                        extraInfo={movie.viewedAt.toLocaleDateString()}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-secondary rounded-lg p-6 text-center">
                  <p className="text-gray-400 mb-4">You haven't viewed any movies yet.</p>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Your Preferences</h2>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className="text-primary hover:text-primary-light text-sm flex items-center"
                >
                  <FaEdit className="mr-1" />
                  Edit
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Favorite Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGenres.length > 0 ? (
                      selectedGenres.map((genre) => (
                        <span key={genre} className="px-3 py-1 bg-secondary-light rounded-full text-sm text-gray-300">
                          {genre}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No genres selected</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Preferred Decades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDecades.length > 0 ? (
                      selectedDecades.map((decade) => (
                        <span key={decade} className="px-3 py-1 bg-secondary-light rounded-full text-sm text-gray-300">
                          {decade}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No decades selected</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-secondary rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Preferred Moods</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMoods.length > 0 ? (
                      selectedMoods.map((mood) => (
                        <span key={mood} className="px-3 py-1 bg-secondary-light rounded-full text-sm text-gray-300">
                          {mood}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No moods selected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'preferences' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Your Preferences</h2>
              <div className="flex gap-3">
                {editingPreferences ? (
                  <>
                    <button
                      onClick={() => setEditingPreferences(false)}
                      className="px-4 py-2 bg-secondary-light text-white rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePreferences}
                      className="px-4 py-2 bg-primary text-white rounded-lg flex items-center"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingPreferences(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Genres */}
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Favorite Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {genreOptions.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      disabled={!editingPreferences}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedGenres.includes(genre)
                          ? 'bg-primary text-white'
                          : 'bg-secondary-light text-gray-300 hover:bg-gray-600 hover:text-white'
                      } ${!editingPreferences && 'cursor-default'}`}
                      onClick={() => editingPreferences && toggleSelection(genre, selectedGenres, setSelectedGenres)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Decades */}
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Preferred Decades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {decadeOptions.map(decade => (
                    <button
                      key={decade}
                      type="button"
                      disabled={!editingPreferences}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDecades.includes(decade)
                          ? 'bg-primary text-white'
                          : 'bg-secondary-light text-gray-300 hover:bg-gray-600 hover:text-white'
                      } ${!editingPreferences && 'cursor-default'}`}
                      onClick={() => editingPreferences && toggleSelection(decade, selectedDecades, setSelectedDecades)}
                    >
                      {decade}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Moods */}
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Preferred Moods
                </h3>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map(mood => (
                    <button
                      key={mood}
                      type="button"
                      disabled={!editingPreferences}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedMoods.includes(mood)
                          ? 'bg-primary text-white'
                          : 'bg-secondary-light text-gray-300 hover:bg-gray-600 hover:text-white'
                      } ${!editingPreferences && 'cursor-default'}`}
                      onClick={() => editingPreferences && toggleSelection(mood, selectedMoods, setSelectedMoods)}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            
            <div className="bg-secondary rounded-xl overflow-hidden">
              {activityFeed.length > 0 ? (
                activityFeed.map((activity, index) => (
                  <ActivityItem 
                    key={index} 
                    type={activity.type} 
                    movie={activity.movie} 
                    date={activity.date}
                  />
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  Change Display Name
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="New display name"
                    className="flex-grow px-4 py-2 bg-secondary-light border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={userProfile?.displayName || ''}
                  />
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition whitespace-nowrap">
                    Update
                  </button>
                </div>
              </div>
              
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  Email Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="recommendation-notifications"
                      className="w-4 h-4 text-primary bg-secondary-light border-gray-700 rounded focus:ring-primary"
                      defaultChecked
                    />
                    <label htmlFor="recommendation-notifications" className="ml-3 text-gray-300">
                      New movie recommendations
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="watchlist-notifications"
                      className="w-4 h-4 text-primary bg-secondary-light border-gray-700 rounded focus:ring-primary"
                      defaultChecked
                    />
                    <label htmlFor="watchlist-notifications" className="ml-3 text-gray-300">
                      Watchlist reminders
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="w-4 h-4 text-primary bg-secondary-light border-gray-700 rounded focus:ring-primary"
                    />
                    <label htmlFor="newsletter" className="ml-3 text-gray-300">
                      Weekly newsletter
                    </label>
                  </div>
                </div>
                
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                  Save Preferences
                </button>
              </div>
              
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4 text-red-500">
                  Danger Zone
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-secondary-light text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Logout
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}