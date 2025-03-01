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
  FaUsers
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  // Redirect to login if not authenticated (except for login and signup pages)
  useEffect(() => {
    if (!loading && !currentUser) {
      if (
        router.pathname !== '/login' &&
        router.pathname !== '/signup' && 
        router.pathname !== '/forgot-password'
      ) {
        router.push('/login');
      }
    }
  }, [currentUser, loading, router]);

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

  // Close menus when route changes
  useEffect(() => {
    setProfileMenuOpen(false);
    setSideMenuOpen(false);
  }, [router.pathname]);

  // Check if page is discover page (which has its own custom mobile UI)
  const isDiscoverPage = router.pathname === '/discover';
  
  // Determine if the current page needs full-width content
  const isFullWidthPage = isDiscoverPage || router.pathname === '/movie/[id]';
  
  // Check if current page is login or signup
  const isAuthPage = router.pathname === '/login' || router.pathname === '/signup' || router.pathname === '/forgot-password';

  // If loading auth state, show nothing
  if (loading) {
    return <div className="min-h-screen bg-background"></div>;
  }

  // Render only auth pages if not logged in
  if (!currentUser && !isAuthPage) {
    return null; // The redirect will handle this case
  }

  return (
    <div className="flex flex-col min-h-screen bg-background mobile-safe-top mobile-safe-bottom">
      {/* Mobile status bar spacer - for iOS safe area */}
      <div className="ios-status-height md:hidden"></div>

      {/* Mobile app-like header - only visible when logged in or on auth pages */}
      {(currentUser || isAuthPage) && (
        <header 
          className={`sticky top-0 z-30 transition-all duration-300 ${
            scrolled ? 'bg-background/90 backdrop-blur-md shadow-md' : 'bg-background'
          }`}
        >
          <div className="flex items-center justify-between py-3 px-4">
            {/* Logo - smaller on mobile */}
            <Link href={currentUser ? '/discover' : '/'} className="flex items-center">
              <div className="text-primary font-bold flex items-center">
                <FaFilm className="text-lg mr-1" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent text-lg">CineMagic</span>
              </div>
            </Link>
            
            {/* Hidden on mobile, visible on desktop */}
            <nav className="hidden md:flex space-x-1 items-center">
              {currentUser ? (
                <>
                  <NavLink href="/" icon={<FaHome />} title="Home" pathname={router.pathname} />
                  <NavLink href="/watchlist" icon={<FaBookmark />} title="Watchlist" pathname={router.pathname} />
                  <NavLink href="/discover" icon={<FaCompass />} title="Discover" pathname={router.pathname} />
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
            
            {/* Mobile header right actions */}
            {currentUser && !isDiscoverPage && (
              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setSideMenuOpen(true)}
                  className="p-2 text-white"
                  aria-label="Open menu"
                >
                  <FaUser />
                </button>
              </div>
            )}
          </div>
        </header>
      )}
      
      {/* Side menu for mobile */}
      <AnimatePresence>
        {sideMenuOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSideMenuOpen(false)}
            />
            
            <motion.div 
              className="fixed right-0 top-0 bottom-0 w-64 bg-background z-50 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="pt-6 pb-4 px-4 flex flex-col h-full">
                {/* User info */}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-3">
                    {userProfile && userProfile.displayName ? (
                      <span className="text-black text-xl font-semibold">{userProfile.displayName.charAt(0)}</span>
                    ) : (
                      <FaUser className="text-black text-xl" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {userProfile?.displayName || 'User'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {currentUser?.email}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link 
                    href="/profile" 
                    className="flex items-center text-white py-3 px-4 rounded-lg hover:bg-secondary-light"
                    onClick={() => setSideMenuOpen(false)}
                  >
                    <FaUser className="mr-3 text-primary" />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <Link 
                    href="/preferences" 
                    className="flex items-center text-white py-3 px-4 rounded-lg hover:bg-secondary-light"
                    onClick={() => setSideMenuOpen(false)}
                  >
                    <FaFilm className="mr-3 text-primary" />
                    <span>Movie Preferences</span>
                  </Link>
                </div>
                
                <div className="mt-auto">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-white py-3 px-4 w-full text-left rounded-lg hover:bg-secondary-light"
                  >
                    <FaSignOutAlt className="mr-3 text-primary" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <main className={`flex-grow ${isFullWidthPage ? '' : 'px-4 py-4'} ${!isAuthPage && currentUser ? 'pb-20 md:pb-6' : 'pb-6'}`}>
        {children}
      </main>
      
      {/* Mobile bottom navigation bar - only when logged in */}
      {currentUser && !isAuthPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-gray-800 z-30 mobile-nav shadow-lg">
          <div className="flex justify-around items-center h-16">
            <MobileNavIcon href="/" icon={<FaHome />} title="Home" pathname={router.pathname} />
            <MobileNavIcon href="/watchlist" icon={<FaBookmark />} title="Watchlist" pathname={router.pathname} />
            <MobileNavIcon href="/discover" icon={<FaCompass />} title="Discover" pathname={router.pathname} />
            <MobileNavIcon href="/social" icon={<FaUsers />} title="Social" pathname={router.pathname} />
            <MobileNavIcon href="/profile" icon={<FaUser />} title="Account" pathname={router.pathname} />
          </div>
        </nav>
      )}
      
      {/* Footer - only shown on desktop when logged in */}
      {currentUser && (
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
                    <li><Link href="/profile" className="text-gray-400 hover:text-primary">Profile</Link></li>
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

// Mobile navigation icon with animated active indicator
function MobileNavIcon({ href, icon, title, pathname }) {
  const isActive = pathname === href || 
    (href !== '/' && pathname.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center py-2 w-full ${
        isActive ? 'text-primary' : 'text-gray-400 active:text-gray-300'
      }`}
      aria-label={title}
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
          className="absolute top-0 w-full h-0.5 bg-primary"
          layoutId="activeTabIndicator"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}