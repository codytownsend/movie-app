import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { updateUserPreferences } from '../utils/firebase';
import Layout from '../components/Layout';

export default function Preferences() {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
  
  // State for storing selected preferences
  const [selectedGenres, setSelectedGenres] = useState(userProfile?.preferences?.genres || []);
  const [selectedDecades, setSelectedDecades] = useState(userProfile?.preferences?.decades || []);
  const [selectedMoods, setSelectedMoods] = useState(userProfile?.preferences?.moods || []);
  
  const toggleSelection = (item, current, setter) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await updateUserPreferences(currentUser.uid, {
        genres: selectedGenres,
        decades: selectedDecades,
        moods: selectedMoods
      });
      
      router.push('/');
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences. Please try again.');
    }
    
    setLoading(false);
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Set Your Movie Preferences</h1>
          <p className="text-gray-300 mt-2">
            Help us tailor recommendations specifically for you by selecting your preferences
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-600 text-white rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Genres */}
            <div className="bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Which genres do you enjoy?
              </h2>
              <div className="flex flex-wrap gap-2">
                {genreOptions.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Decades */}
            <div className="bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Which decades do you prefer?
              </h2>
              <div className="flex flex-wrap gap-2">
                {decadeOptions.map(decade => (
                  <button
                    key={decade}
                    type="button"
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedDecades.includes(decade)
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => toggleSelection(decade, selectedDecades, setSelectedDecades)}
                  >
                    {decade}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Moods */}
            <div className="bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                What moods or themes do you look for?
              </h2>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map(mood => (
                  <button
                    key={mood}
                    type="button"
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedMoods.includes(mood)
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => toggleSelection(mood, selectedMoods, setSelectedMoods)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}