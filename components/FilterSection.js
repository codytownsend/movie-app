import { useState, useEffect } from 'react';

export default function FilterSection({ onFilterChange }) {
  const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'];
  const decades = ['2020s', '2010s', '2000s', '1990s', '1980s', 'Older'];
  const moods = ['Feel-Good', 'Dark & Gritty', 'Thought-Provoking', 'Action-Packed', 'Emotional', 'Inspirational'];
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  useEffect(() => {
    onFilterChange({
      genre: selectedGenre,
      decade: selectedDecade,
      mood: selectedMood
    });
  }, [selectedGenre, selectedDecade, selectedMood, onFilterChange]);
  
  return (
    <div className="mb-6 p-4 bg-secondary rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Filter Recommendations</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 8).map((genre) => (
              <button
                key={genre}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedGenre === genre 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Decade</label>
          <div className="flex flex-wrap gap-2">
            {decades.map((decade) => (
              <button
                key={decade}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedDecade === decade 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedDecade(selectedDecade === decade ? '' : decade)}
              >
                {decade}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedMood === mood 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedMood(selectedMood === mood ? '' : mood)}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}