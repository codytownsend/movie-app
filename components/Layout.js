import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../utils/firebase';
import { FaHome, FaSearch, FaUser, FaList, FaSignOutAlt, FaFilm, FaCompass, FaHeart, FaBookmark } from 'react-icons/fa';

export default function Layout({ children }) {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [router.pathname]);

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="text-primary text-3xl font-bold flex items-center">
              <FaFilm className="mr-2" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">CineMagic</span>
            </div>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:flex-1 mx-6">
            {currentUser && (
              <div className="relative max-w-md w-full mx-auto">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    className={`w-full px-4 py-2 pl-10 bg-secondary-light text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-all ${searchFocused ? 'ring-2 ring-primary' : ''}`}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </form>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <div className="w-6 flex flex-col items-end space-y-1.5">
              <span className={`block h-0.5 bg-white transition-all duration-300 ease-out ${showMobileMenu ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
              <span className={`block h-0.5 bg-white transition-all duration-300 ease-out ${showMobileMenu ? 'opacity-0' : 'w-4'}`}></span>
              <span className={`block h-0.5 bg-white transition-all duration-300 ease-out ${showMobileMenu ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`}></span>
            </div>
          </button>
          
          {/* Desktop auth buttons */}
          <nav className="hidden md:flex space-x-1 items-center">
            {currentUser ? (
              <>
                <NavLink href="/" icon={<FaHome />} title="Home" pathname={router.pathname} />
                <NavLink href="/discover" icon={<FaCompass />} title="Discover" pathname={router.pathname} />
                <NavLink href="/watchlist" icon={<FaBookmark />} title="Watchlist" pathname={router.pathname} />
                
                <div className="relative group ml-2">
                  <button className="flex items-center space-x-1 px-3 py-2 text-white hover:text-primary">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      {userProfile && userProfile.displayName ? (
                        <span className="text-white font-semibold">{userProfile.displayName.charAt(0)}</span>
                      ) : (
                        <FaUser className="text-white" />
                      )}
                    </div>
                  </button>
                  
                  <div className="absolute right-0 mt-1 w-48 bg-secondary-light rounded-xl shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center px-4 py-3 text-white hover:bg-background transition-colors">
                        <FaUser className="mr-3 text-primary" />
                        <span>My Profile</span>
                      </Link>
                      <Link href="/watchlist" className="flex items-center px-4 py-3 text-white hover:bg-background transition-colors">
                        <FaBookmark className="mr-3 text-primary" />
                        <span>My Watchlist</span>
                      </Link>
                      <hr className="border-gray-700 my-1" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-3 text-white hover:bg-background transition-colors"
                      >
                        <FaSignOutAlt className="mr-3 text-primary" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-primary transition px-5 py-2 rounded-md">
                  Login
                </Link>
                <Link href="/signup" className="bg-primary text-white px-5 py-2 rounded-full hover:bg-primary-dark transition transform hover:scale-105">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
        
        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-secondary-light">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {currentUser ? (
                <>
                  <div className="relative">
                    <form onSubmit={handleSearchSubmit}>
                      <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-background text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </form>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <MobileNavLink href="/" icon={<FaHome />} title="Home" pathname={router.pathname} />
                    <MobileNavLink href="/discover" icon={<FaCompass />} title="Discover" pathname={router.pathname} />
                    <MobileNavLink href="/watchlist" icon={<FaBookmark />} title="Watchlist" pathname={router.pathname} />
                    <MobileNavLink href="/profile" icon={<FaUser />} title="Profile" pathname={router.pathname} />
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center text-white p-3 rounded-xl hover:bg-background/50"
                    >
                      <FaSignOutAlt className="mr-3 text-primary" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-white hover:text-primary p-4 text-center rounded-xl border border-gray-700">
                    Login
                  </Link>
                  <Link href="/signup" className="block bg-primary text-white p-4 text-center rounded-xl hover:bg-primary-dark transition">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-24 md:pb-16">
        {children}
      </main>
      
      {/* Mobile navigation bar */}
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/90 backdrop-blur-md border-t border-gray-800 flex justify-around items-center py-3 z-30">
          <MobileNavIcon href="/" icon={<FaHome />} title="Home" pathname={router.pathname} />
          <MobileNavIcon href="/discover" icon={<FaCompass />} title="Discover" pathname={router.pathname} />
          <MobileNavIcon href="/watchlist" icon={<FaBookmark />} title="Watchlist" pathname={router.pathname} />
          <MobileNavIcon href="/profile" icon={<FaUser />} title="Profile" pathname={router.pathname} />
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

// Desktop navigation link
function NavLink({ href, icon, title, pathname }) {
  const isActive = pathname === href || 
    (href !== '/' && pathname.startsWith(href));
    
  return (
    <Link 
      href={href} 
      className={`relative flex items-center px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'text-primary' 
          : 'text-white hover:text-primary'
      }`}
    >
      <span className="mr-1">{icon}</span>
      <span>{title}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full"></span>
      )}
    </Link>
  );
}

// Mobile navigation link
function MobileNavLink({ href, icon, title, pathname }) {
  const isActive = pathname === href || 
    (href !== '/' && pathname.startsWith(href));
    
  return (
    <Link 
      href={href} 
      className={`flex items-center p-3 rounded-xl ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-white hover:bg-background/50'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{title}</span>
    </Link>
  );
}

// Mobile bottom navigation icon
function MobileNavIcon({ href, icon, title, pathname }) {
  const isActive = pathname === href || 
    (href !== '/' && pathname.startsWith(href));
    
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center text-xs ${
        isActive ? 'text-primary' : 'text-gray-400'
      }`}
    >
      <div className={`text-xl mb-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span>{title}</span>
    </Link>
  );
}