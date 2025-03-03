// src/data/sampleData.js
export const sampleUsers = [
  {
    id: 1,
    name: "Alex Johnson",
    username: "alexj",
    avatar: "A",
    bio: "Movie Enthusiast | Sci-Fi Lover | Film Student",
    following: 124,
    followers: 186,
    favoriteGenres: ["Sci-Fi", "Thriller", "Drama", "Comedy"],
    streamingServices: ["Netflix", "Hulu", "Prime Video"],
    recentActivity: [
      { type: "liked", movieId: 1, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { type: "added", movieId: 3, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { type: "reviewed", movieId: 2, rating: 4.5, comment: "Amazing performance by Anya Taylor-Joy!", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    ]
  },
  {
    id: 2,
    name: "Sarah Miller",
    username: "sarahm",
    avatar: "S",
    bio: "Documentary Fanatic | Filmmaker | Coffee Addict",
    following: 215,
    followers: 342,
    favoriteGenres: ["Documentary", "Drama", "Indie"],
    streamingServices: ["Netflix", "HBO Max", "Disney+"],
    recentActivity: [
      { type: "added", movieId: 1, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      { type: "liked", movieId: 4, timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000) },
      { type: "reviewed", movieId: 3, rating: 5, comment: "A masterpiece! Bong Joon Ho deserved all the awards.", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) }
    ]
  },
  {
    id: 3,
    name: "Michael Chen",
    username: "mikechen",
    avatar: "M",
    bio: "Horror Buff | VFX Artist | Movie Marathon Expert",
    following: 98,
    followers: 156,
    favoriteGenres: ["Horror", "Sci-Fi", "Thriller"],
    streamingServices: ["Prime Video", "Shudder", "Netflix"],
    recentActivity: [
      { type: "reviewed", movieId: 4, rating: 5, comment: "Best sci-fi series ever made. Can't wait for the next season!", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { type: "added", movieId: 2, timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
      { type: "liked", movieId: 1, timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000) }
    ]
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    username: "emilyr",
    avatar: "E",
    bio: "Rom-Com Enthusiast | TV Critic | Always Binging Something",
    following: 172,
    followers: 243,
    favoriteGenres: ["Comedy", "Romance", "Drama"],
    streamingServices: ["Netflix", "Hulu", "Apple TV+"],
    recentActivity: [
      { type: "added", movieId: 4, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { type: "reviewed", movieId: 1, rating: 4, comment: "Mind-bending in the best way. Leo was incredible!", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      { type: "liked", movieId: 2, timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000) }
    ]
  }
];

export const sampleLists = [
  {
    id: 1,
    title: "Best Sci-Fi of the Decade",
    creator: 1,
    movies: [1, 4],
    likes: 243,
    public: true,
    description: "My collection of the most mind-bending sci-fi films released in the past 10 years."
  },
  {
    id: 2,
    title: "Oscar Winners Marathon",
    creator: 2,
    movies: [3, 1],
    likes: 187,
    public: true,
    description: "All the best picture winners you need to see before the next Academy Awards."
  },
  {
    id: 3,
    title: "Perfect Date Night Movies",
    creator: 4,
    movies: [2, 1],
    likes: 329,
    public: true,
    description: "Guaranteed to impress your date - movies that everyone will enjoy!"
  },
  {
    id: 4,
    title: "Movies That Will Keep You Up at Night",
    creator: 3,
    movies: [1, 3],
    likes: 156,
    public: true,
    description: "Psychological thrillers and horror films that will haunt your dreams."
  }
];

export const friendRecommendations = [
  {
    userId: 2,
    movieId: 3,
    message: "You have to see this! Best film I've watched all year.",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    userId: 3,
    movieId: 1,
    message: "This reminded me of our conversation about dreams. Let me know what you think!",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    userId: 4,
    movieId: 2,
    message: "Based on your watchlist, I think you'll love this series!",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

export const sampleMovies = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    genre: ["Sci-Fi", "Action", "Thriller"],
    director: "Christopher Nolan",
    rating: 8.8,
    duration: "2h 28m",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterUrl: "https://placehold.co/500x750/png",
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    streamingOn: ["Netflix", "HBO Max"],
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page", "Tom Hardy"],
    similarTo: [2, 3]
  },
  {
    id: 2,
    title: "The Queen's Gambit",
    year: 2020,
    genre: ["Drama", "Sport"],
    director: "Scott Frank, Allan Scott",
    rating: 8.6,
    duration: "Limited Series",
    description: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA. But child stardom comes at a price.",
    posterUrl: "https://placehold.co/500x750/png",
    trailerUrl: "https://www.youtube.com/watch?v=CDrieqwSdgI",
    streamingOn: ["Netflix"],
    cast: ["Anya Taylor-Joy", "Bill Camp", "Moses Ingram", "Thomas Brodie-Sangster"],
    similarTo: [3, 4]
  },
  {
    id: 3,
    title: "Parasite",
    year: 2019,
    genre: ["Thriller", "Drama", "Comedy"],
    director: "Bong Joon Ho",
    rating: 8.5,
    duration: "2h 12m",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    posterUrl: "https://placehold.co/500x750/png",
    trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
    streamingOn: ["Hulu", "Prime Video"],
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    similarTo: [1, 4]
  },
  {
    id: 4,
    title: "Stranger Things",
    year: 2016,
    genre: ["Sci-Fi", "Horror", "Drama"],
    director: "The Duffer Brothers",
    rating: 8.7,
    duration: "Series",
    description: "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
    posterUrl: "https://placehold.co/500x750/png",
    trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
    streamingOn: ["Netflix"],
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
    similarTo: [1, 2]
  }
];
