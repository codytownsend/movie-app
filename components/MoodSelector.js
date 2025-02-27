// components/MoodSelector.js
import { useState, useEffect } from 'react';
import { FaTheaterMasks, FaLaughBeam, FaHeart, FaRunning, FaGhost, FaGlobe, FaStar, FaRocket, FaBirthdayCake, FaFilm } from 'react-icons/fa';

// Mood data with icons, colors, and descriptions
const moodData = [
  { 
    id: 'date-night', 
    name: 'Date Night', 
    icon: <FaHeart />, 
    color: 'bg-pink-500', 
    description: 'Romantic films perfect for a cozy evening together'
  },
  { 
    id: 'feel-good', 
    name: 'Feel-Good', 
    icon: <FaLaughBeam />, 
    color: 'bg-yellow-500', 
    description: 'Uplifting movies that leave you feeling happy'
  },
  { 
    id: 'adrenaline', 
    name: 'Adrenaline Rush', 
    icon: <FaRunning />, 
    color: 'bg-red-500', 
    description: 'Heart-pumping action and suspense'
  },
  { 
    id: 'thought-provoking', 
    name: 'Mind-Bending', 
    icon: <FaTheaterMasks />, 
    color: 'bg-purple-500', 
    description: 'Films that make you think and challenge perceptions'
  },
  { 
    id: 'spooky', 
    name: 'Spooky', 
    icon: <FaGhost />, 
    color: 'bg-gray-700', 
    description: 'Thrills and chills for those brave enough'
  },
  { 
    id: 'adventure', 
    name: 'Adventure', 
    icon: <FaGlobe />, 
    color: 'bg-blue-500', 
    description: 'Journey to new worlds and exciting places'
  },
  { 
    id: 'award-winners', 
    name: 'Award Winners', 
    icon: <FaStar />, 
    color: 'bg-amber-500', 
    description: 'Critically acclaimed masterpieces'
  },
  { 
    id: 'sci-fi', 
    name: 'Sci-Fi', 
    icon: <FaRocket />, 
    color: 'bg-cyan-500', 
    description: 'Futuristic tales and space adventures'
  },
  { 
    id: 'family', 
    name: 'Family Friendly', 
    icon: <FaBirthdayCake />, 
    color: 'bg-green-500', 
    description: 'Fun for everyone from kids to adults'
  },
  { 
    id: 'classics', 
    name: 'Classics', 
    icon: <FaFilm />, 
    color: 'bg-amber-700', 
    description: 'Timeless movies that defined generations'
  }
];

const MoodSelector = ({ onMoodSelect, selectedMood }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Set active index based on selectedMood prop
  useEffect(() => {
    if (selectedMood) {
      const index = moodData.findIndex(mood => mood.id === selectedMood);
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [selectedMood]);
  
  const handleMoodClick = (mood, index) => {
    setActiveIndex(index === activeIndex ? null : index);
    onMoodSelect(mood.id === selectedMood ? null : mood.id);
  };
  
  return (
    <div className="mb-8">
      {/* Heading with toggle */}
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-bold text-white">What's your mood today?</h3>
        <button className="text-primary hover:text-white transition-colors">
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {/* Mood selection */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-36 opacity-100'
      }`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {moodData.map((mood, index) => (
            <div 
              key={mood.id}
              className={`relative cursor-pointer transform transition-transform hover:scale-105 ${
                index >= 5 && !isExpanded ? 'hidden' : ''
              }`}
              onClick={() => handleMoodClick(mood, index)}
            >
              <div className={`${
                activeIndex === index 
                  ? 'ring-4 ring-primary transform scale-105' 
                  : 'bg-secondary/80 hover:bg-secondary'
              } rounded-xl p-4 flex flex-col items-center text-center h-36 shadow-md transition-all`}>
                <div className={`w-12 h-12 ${mood.color} rounded-full flex items-center justify-center text-white text-xl mb-2`}>
                  {mood.icon}
                </div>
                <h4 className="text-white font-medium">{mood.name}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{mood.description}</p>
                
                {activeIndex === index && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full text-background text-xs flex items-center justify-center font-bold">
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Show more button */}
        {!isExpanded && (
          <div className="mt-2 text-center">
            <button 
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center px-3 py-1 bg-primary/20 hover:bg-primary/30 rounded-full text-primary text-sm transition-colors"
            >
              Show More Options
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodSelector;