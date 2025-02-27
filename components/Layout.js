// components/ImprovedLayout.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../utils/firebase';
import { 
  FaHome, 
  FaSearch, 
  FaUser, 
  FaList, 
  FaSignOutAlt, 
  FaFilm, 
  FaCompass, 
  FaBookmark,
  FaFilter,
  FaEllipsisH,
  FaBell
} from 'react-icons/fa';

export default function Layout({ children }) {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  // Check if the route is "discover" to highlight in the mobile nav
  const isDiscover = router.pathname === '/discover';
  const isHome = router.pathname === '/';
  const isWatchlist = router.pathname === '/watchlist';
  const isProfile = router.pathname === '/profile';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background-light to-background">
      {/* Header */}
      <header className={`fixed top-0 w-full z-30 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center z-20">
            <div className="text-primary text-2xl font-bold flex items-center">
              <FaFilm className="mr-2" />
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">CineMagic</span>
            </div>
          </Link>
          
          {/* Center search bar (only for non-mobile) */}
          {currentUser && (
            <div className="hidden md:flex md:flex-1 max-w-md mx-auto px-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className={`w-full px-4 py-2 pl-10 bg-secondary-light/50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary border border-secondary transition-all ${searchFocused ? 'ring-2 ring-primary' : ''}`}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </form>
            </div>
          )}
          
          {/* Right-side icons/buttons */}
          <div className="flex items-center space-x-2 z-20">
            {currentUser ? (
              <>
                {/* Filter button - only visible on discover page for mobile */}
                {isDiscover && (
                  <button className="md:hidden p-2 text-white hover:text-primary transition-colors">
                    <FaFilter />
                  </button>
                )}
                
                {/* Notifications */}
                <button className="hidden md:block p-2 text-white hover:text-primary transition-colors relative">
                  <FaBell />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* User profile button */}
                <div className="relative">
                  <button 
                    className="flex items-center p-1.5"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary overflow-hidden border border-primary/30">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-semibold">
                          {userProfile?.displayName?.charAt(0) || <FaUser />}
                        </span>
                      )}
                    </div>
                  </button>
                  
                  {/* Profile dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-secondary-light rounded-xl shadow-lg overflow-hidden z-50">
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowProfileMenu(false)}
                      ></div>
                      <div className="relative z-50">
                        <Link 
                          href="/profile" 
                          className="flex items-center px-4 py-3 text-white hover:bg-background transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <FaUser className="mr-3 text-primary" />
                          <span>Profile</span>
                        </Link>
                        <Link 
                          href="/watchlist" 
                          className="flex items-center px-4 py-3 text-white hover:bg-background transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <FaBookmark className="mr-3 text-primary" />
                          <span>Watchlist</span>
                        </Link>
                        <Link 
                          href="/settings" 
                          className="flex items-center px-4 py-3 text-white hover:bg-background transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <FaEllipsisH className="mr-3 text-primary" />
                          <span>Settings</span>
                        </Link>
                        <hr className="border-gray-700 my-1" />
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-white hover:bg-background transition-colors"
                        >
                          <FaSignOutAlt className="mr-3 text-primary" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-white hover:text-primary transition px-4 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-primary text-background px-4 py-2 rounded-full hover:bg-primary-dark transition transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-24 md:pb-12 mt-16">
        {children}
      </main>
      
      {/* Mobile navigation bar */}
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/90 backdrop-blur-md border-t border-gray-800 z-30">
          <div className="flex items-stretch h-16">
            {/* Home */}
            <Link 
              href="/" 
              className={`flex-1 flex flex-col items-center justify-center text-xs ${
                isHome ? 'text-primary' : 'text-gray-400'
              } transition-colors`}
            >
              <FaHome className={`text-xl mb-1 ${isHome ? 'text-primary' : 'text-gray-400'}`} />
              <span>Home</span>
            </Link>
            
            {/* Watchlist */}
            <Link 
              href="/watchlist" 
              className={`flex-1 flex flex-col items-center justify-center text-xs ${
                isWatchlist ? 'text-primary' : 'text-gray-400'
              } transition-colors`}
            >
              <FaBookmark className={`text-xl mb-1 ${isWatchlist ? 'text-primary' : 'text-gray-400'}`} />
              <span>Watchlist</span>
            </Link>
            
            {/* Discover - Center button with special styling */}
            <Link 
              href="/discover" 
              className="relative px-5"
            >
              <div className={`absolute -top-5 w-14 h-14 rounded-full ${
                isDiscover ? 'bg-primary text-background' : 'bg-gray-700 text-white'
              } flex items-center justify-center shadow-lg transition-colors`}>
                <FaCompass className="text-2xl" />
              </div>
              <div className={`absolute -bottom-1 w-full text-center text-xs ${
                isDiscover ? 'text-primary' : 'text-gray-400'
              }`}>
                Discover
              </div>
            </Link>
            
            {/* Search - for mobile */}
            <Link 
              href="/search" 
              className="flex-1 flex flex-col items-center justify-center text-xs text-gray-400"
            >
              <FaSearch className="text-xl mb-1" />
              <span>Search</span>
            </Link>
            
            {/* Profile */}
            <Link 
              href="/profile" 
              className={`flex-1 flex flex-col items-center justify-center text-xs ${
                isProfile ? 'text-primary' : 'text-gray-400'
              } transition-colors`}
            >
              <FaUser className={`text-xl mb-1 ${isProfile ? 'text-primary' : 'text-gray-400'}`} />
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      )}
      
      {/* Footer - only shown on larger screens or when not logged in */}
      {(!currentUser || !router.pathname.startsWith('/movie/')) && (
        <footer className="bg-secondary py-12 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-8 md:mb-0">
                <Link href="/" className="text-primary text-2xl font-bold flex items-center">
                  <FaFilm className="mr-2" />
                  CineMagic
                </Link>
                <p className="text-gray-400 mt-2 max-w-md">
                  Your personalized movie recommendation platform powered by advanced AI to help you discover films you'll love.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-white font-semibold mb-4">Navigation</h3>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-gray-400 hover:text-primary">Home</Link></li>
                    <li><Link href="/discover" className="text-gray-400 hover:text-primary">Discover</Link></li>
                    <li><Link href="/watchlist" className="text-gray-400 hover:text-primary">Watchlist</Link></li>
                    <li><Link href="/profile" className="text-gray-400 hover:text-primary">Profile</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-4">Account</h3>
                  <ul className="space-y-2">
                    <li><Link href="/login" className="text-gray-400 hover:text-primary">Login</Link></li>
                    <li><Link href="/signup" className="text-gray-400 hover:text-primary">Sign Up</Link></li>
                    <li><Link href="/preferences" className="text-gray-400 hover:text-primary">Preferences</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li><Link href="/terms" className="text-gray-400 hover:text-primary">Terms of Service</Link></li>
                    <li><Link href="/privacy" className="text-gray-400 hover:text-primary">Privacy Policy</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-400">© {new Date().getFullYear()} CineMagic. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}