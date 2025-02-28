import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { FaStar, FaUser, FaBookmark, FaHeart, FaComment, FaCalendarAlt } from 'react-icons/fa';

// Mock data for social feed - in a real app this would come from Firebase
const MOCK_SOCIAL_FEED = [
  {
    id: 1,
    userId: 'user123',
    userName: 'Jane Smith',
    userAvatar: null,
    type: 'rating',
    movieId: 3,
    movieTitle: 'The Dark Knight',
    moviePoster: '/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg',
    rating: 5,
    comment: "This film completely redefined the superhero genre. Heath Ledger's performance was legendary!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 2,
    userId: 'user456',
    userName: 'Michael Johnson',
    userAvatar: null,
    type: 'watchlist',
    movieId: 6,
    movieTitle: 'Inception',
    moviePoster: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
  },
  {
    id: 3,
    userId: 'user789',
    userName: 'Sarah Williams',
    userAvatar: null,
    type: 'rating',
    movieId: 1,
    movieTitle: 'The Shawshank Redemption',
    moviePoster: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    rating: 4,
    comment: "A timeless classic. The story of hope and redemption never gets old.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 4,
    userId: 'user101',
    userName: 'Alex Chen',
    userAvatar: null,
    type: 'rating',
    movieId: 4,
    movieTitle: 'Pulp Fiction',
    moviePoster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    rating: 5,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  }
];

// Activity card component
const ActivityCard = ({ activity }) => {
  const router = useRouter();
  const posterUrl = `https://image.tmdb.org/t/p/w200${activity.moviePoster}`;
  
  // Format timestamp to relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Get icon and text based on activity type
  const getActivityContent = () => {
    switch (activity.type) {
      case 'rating':
        return (
          <>
            <div className="flex items-center mb-2 text-gray-300">
              <FaStar className="text-accent mr-1" />
              <span>rated {activity.rating}/5</span>
            </div>
            {activity.comment && (
              <p className="text-gray-200 mb-3">{activity.comment}</p>
            )}
          </>
        );
      case 'watchlist':
        return (
          <div className="flex items-center mb-2 text-gray-300">
            <FaBookmark className="text-primary mr-1" />
            <span>added to watchlist</span>
          </div>
        );
      case 'review':
        return (
          <div className="flex items-center mb-2 text-gray-300">
            <FaComment className="text-primary mr-1" />
            <span>wrote a review</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg mb-4 hover:shadow-xl transition-shadow duration-300">
      {/* Header with user info */}
      <div className="p-4 flex items-center border-b border-gray-700">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
          {activity.userAvatar ? (
            <img 
              src={activity.userAvatar} 
              alt={activity.userName} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FaUser className="text-primary" />
          )}
        </div>
        <div>
          <div className="font-medium text-white">{activity.userName}</div>
          <div className="text-xs text-gray-400 flex items-center">
            <FaCalendarAlt className="mr-1" />
            {getRelativeTime(activity.timestamp)}
          </div>
        </div>
      </div>
      
      {/* Activity body */}
      <div className="p-4">
        {getActivityContent()}
        
        {/* Movie card */}
        <div 
          onClick={() => router.push(`/movie/${activity.movieId}`)}
          className="flex bg-secondary-light rounded-lg overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors"
        >
          {/* Movie poster */}
          <div className="w-20 flex-shrink-0">
            <img 
              src={posterUrl} 
              alt={activity.movieTitle} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Movie info */}
          <div className="p-3 flex-grow">
            <h3 className="font-medium text-white">{activity.movieTitle}</h3>
            
            {activity.type === 'rating' && (
              <div className="flex items-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={`${i < activity.rating ? 'text-accent' : 'text-gray-600'} text-sm`} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer with interaction buttons */}
      <div className="px-4 py-3 bg-secondary-light flex items-center space-x-6">
        <button className="flex items-center text-gray-400 hover:text-primary transition-colors">
          <FaHeart className="mr-1" />
          <span className="text-sm">Like</span>
        </button>
        <button className="flex items-center text-gray-400 hover:text-primary transition-colors">
          <FaComment className="mr-1" />
          <span className="text-sm">Comment</span>
        </button>
      </div>
    </div>
  );
};

export default function Social() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following'); // 'following' or 'trending'
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    // In a real app, fetch activities from Firebase
    // For now, use mock data
    setLoading(true);
    setTimeout(() => {
      setActivities(MOCK_SOCIAL_FEED);
      setLoading(false);
    }, 1000);
  }, [currentUser, router]);
  
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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Social Feed</h1>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-secondary rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'following' 
                  ? 'bg-primary-dark text-black' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Following
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'trending' 
                  ? 'bg-primary-dark text-black' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Trending
            </button>
          </div>
        </div>
        
        {activities.length === 0 ? (
          <div className="bg-secondary rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">No activities yet</h2>
            <p className="text-gray-300 mb-6">
              {activeTab === 'following' 
                ? 'Start following other users to see their activities here.' 
                : 'No trending activities at the moment.'}
            </p>
            <Link
              href="/discover"
              className="px-4 py-2 bg-primary text-black rounded-lg inline-block hover:bg-primary-dark transition"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}