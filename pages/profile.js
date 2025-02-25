import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { updateUserPreferences, logOut } from '../utils/firebase';
import Link from 'next/link';
import { FaUser, FaEdit, FaStar, FaFilm, FaCog, FaSignOutAlt } from 'react-icons/fa';

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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {/* Profile Header */}
      <div className="bg-secondary rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl">
            <FaUser />
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {userProfile?.displayName || 'Movie Fan'}
            </h1>
            <p className="text-gray-400">{currentUser?.email}</p>
            
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <div className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300 flex items-center">
                <FaStar className="text-yellow-500 mr-2" />
                <span>{userProfile?.ratings?.length || 0} Ratings</span>
              </div>
              <div className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300 flex items-center">
                <FaFilm className="text-primary mr-2" />
                <span>{userProfile?.watchlist?.length || 0} in Watchlist</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white flex items-center"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Profile Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'preferences'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button
            className={`px-4 py-2 font-medium ${
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
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Profile Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">Recent Activity</h3>
                <div className="space-y-4">
                  <p className="text-gray-400">No recent activity to display.</p>
                  <Link href="/discover" className="text-primary hover:text-primary-light">
                    Discover movies to get started
                  </Link>
                </div>
              </div>
              
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">Your Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Favorite Genres</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGenres.length > 0 ? (
                        selectedGenres.map((genre) => (
                          <span key={genre} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                            {genre}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No genres selected</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Preferred Decades</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDecades.length > 0 ? (
                        selectedDecades.map((decade) => (
                          <span key={decade} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                            {decade}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No decades selected</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Preferred Moods</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMoods.length > 0 ? (
                        selectedMoods.map((mood) => (
                          <span key={mood} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                            {mood}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No moods selected</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveTab('preferences')}
                  className="mt-4 text-primary hover:text-primary-light flex items-center"
                >
                  <FaEdit className="mr-1" />
                  Edit Preferences
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'preferences' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Your Preferences</h2>
              {editingPreferences ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPreferences(false)}
                    className="px-3 py-1 bg-gray-700 text-white rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePreferences}
                    className="px-3 py-1 bg-primary text-white rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPreferences(true)}
                  className="px-3 py-1 bg-primary text-white rounded-md flex items-center"
                >
                  <FaEdit className="mr-1" />
                  Edit
                </button>
              )}
            </div>
            
            <div className="space-y-8">
              {/* Genres */}
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Favorite Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {genreOptions.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      disabled={!editingPreferences}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedGenres.includes(genre)
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } ${!editingPreferences && 'cursor-default'}`}
                      onClick={() => editingPreferences && toggleSelection(genre, selectedGenres, setSelectedGenres)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Decades */}
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Preferred Decades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {decadeOptions.map(decade => (
                    <button
                      key={decade}
                      type="button"
                      disabled={!editingPreferences}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedDecades.includes(decade)
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } ${!editingPreferences && 'cursor-default'}`}
                      onClick={() => editingPreferences && toggleSelection(decade, selectedDecades, setSelectedDecades)}
                    >
                      {decade}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Moods */}
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Preferred Moods
                </h3>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map(mood => (
                    <button
                      key={mood}
                      type="button"
                      disabled={!editingPreferences}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedMoods.includes(mood)
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
        
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">
                  Change Display Name
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="New display name"
                    className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={userProfile?.displayName || ''}
                  />
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
                    Update
                  </button>
                </div>
              </div>
              
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">
                  Email Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="recommendation-notifications"
                      className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                      defaultChecked
                    />
                    <label htmlFor="recommendation-notifications" className="ml-2 text-gray-300">
                      New movie recommendations
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="watchlist-notifications"
                      className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                      defaultChecked
                    />
                    <label htmlFor="watchlist-notifications" className="ml-2 text-gray-300">
                      Watchlist reminders
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                    />
                    <label htmlFor="newsletter" className="ml-2 text-gray-300">
                      Weekly newsletter
                    </label>
                  </div>
                </div>
                
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
                  Save Preferences
                </button>
              </div>
              
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3 text-red-500">
                  Danger Zone
                </h3>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                >
                  Logout
                </button>
                <button className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}