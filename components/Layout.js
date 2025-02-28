import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../utils/firebase';
import { 
  FaHome, 
  FaUser, 
  FaSignOutAlt, 
  FaFilm, 
  FaCompass, 
  FaBookmark, 
  FaUsers,
  FaSearch
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Layout({ children }) {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

  // Close profile menu when route changes
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [router.pathname]);

  // Check if page is discover page to add extra styling
  const isDiscoverPage = router.pathname === '/discover';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile app-like status bar - generally hidden, but shown on some pages for app-like experience */}
      {currentUser && !isDiscoverPage && (
        <div className="h-6 bg-background hidden">
          {/* This is just a spacer for iOS-like status bar */}
        </div>
      )}

      {/* Header - hidden on discover page for more app-like experience */}
      <header 
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isDiscoverPage ? 'md:block hidden' : ''
        } ${
          scrolled ? 'bg-background/90 backdrop-blur-md shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="text-primary text-2xl font-bold flex items-center">
              <FaFilm className="mr-2" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">CineMagic</span>
            </div>
          </Link>
          
          {/* Desktop nav links */}
          <nav className="hidden md:flex space-x-1 items-center">
            {currentUser ? (
              <>
                <NavLink href="/" icon={<FaHome />} title="Home" pathname={router.pathname} />
                <NavLink href="/discover" icon={<FaCompass />} title="Discover" pathname={router.pathname} />
                <NavLink href="/watchlist" icon={<FaBookmark />} title="Watchlist" pathname={router.pathname} />
                <NavLink href="/social" icon={<FaUsers />} title="Social" pathname={router.pathname} />
                
                <div className="relative group ml-2">
                  <button 
                    className="flex items-center space-x-1 px-3 py-2 text-white hover:text-primary"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      {userProfile && userProfile.displayName ? (
                        <span className="text-black font-semibold">{userProfile.displayName.charAt(0)}</span>
                      ) : (
                        <FaUser className="text-black" />
                      )}
                    </div>
                  </button>
                  
                  {profileMenuOpen && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-48 bg-secondary rounded-xl shadow-xl overflow-hidden z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
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
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-primary transition px-5 py-2 rounded-md">
                  Login
                </Link>
                <Link href="/signup" className="bg-primary text-black px-5 py-2 rounded-full hover:bg-primary-dark transition transform hover:scale-105">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile header actions */}
          {currentUser && !isDiscoverPage && (
            <div className="flex md:hidden items-center">
              <Link href="/profile" className="p-2 text-white">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  {userProfile && userProfile.displayName ? (
                    <span className="text-primary font-semibold">{userProfile.displayName.charAt(0)}</span>
                  ) : (
                    <FaUser className="text-primary" />
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className={`flex-grow ${isDiscoverPage ? '' : 'container mx-auto px-4 py-4'}`}>
        {children}
      </main>
      
      {/* Mobile navigation bar */}
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/90 backdrop-blur-md z-30 shadow-top">
          <div className="flex justify-around items-center">
            <MobileNavIcon href="/" icon={<FaHome />} title="Home" pathname={router.pathname} />
            <MobileNavIcon href="/discover" icon={<FaCompass />} title="Discover" pathname={router.pathname} />
            <MobileNavIcon href="/search" icon={<FaSearch />} title="Search" pathname={router.pathname} />
            <MobileNavIcon href="/watchlist" icon={<FaBookmark />} title="Watchlist" pathname={router.pathname} />
            <MobileNavIcon href="/profile" icon={<FaUser />} title="Profile" pathname={router.pathname} />
          </div>
        </nav>
      )}
      
      {/* Footer - only shown on desktop or when not logged in */}
      {(!currentUser || window.innerWidth >= 768) && (
        <footer className="bg-secondary py-12 mt-12 hidden md:block">
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
                    <li><Link href="/social" className="text-gray-400 hover:text-primary">Social</Link></li>
                    <li><Link href="/watchlist" className="text-gray-400 hover:text-primary">Watchlist</Link></li>
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
                    <li><Link href="/terms" className="text-gray-400 hover:text-primary">Terms</Link></li>
                    <li><Link href="/privacy" className="text-gray-400 hover:text-primary">Privacy</Link></li>
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

// Mobile navigation icon
function MobileNavIcon({ href, icon, title, pathname }) {
  const isActive = pathname === href || 
    (href !== '/' && pathname.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center py-3 w-full ${
        isActive ? 'text-primary' : 'text-gray-400 active:text-gray-300'
      }`}
    >
      <motion.div 
        className={`text-lg mb-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}
        whileTap={{ scale: 0.8 }}
      >
        {icon}
      </motion.div>
      <span className="text-xs">{title}</span>
      
      {isActive && (
        <motion.div 
          className="absolute top-0 w-1/5 h-0.5 bg-primary rounded-b-full"
          layoutId="activeTabIndicator"
          initial={false}
        />
      )}
    </Link>
  );
}