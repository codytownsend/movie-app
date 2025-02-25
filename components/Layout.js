import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../utils/firebase';
import { FaHome, FaSearch, FaUser, FaList, FaSignOutAlt } from 'react-icons/fa';

export default function Layout({ children }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-secondary shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-primary text-2xl font-bold">
            MovieRec
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-4 items-center">
            {currentUser ? (
              <>
                <Link href="/" className="text-white hover:text-primary transition px-3 py-2 rounded-md">
                  Home
                </Link>
                <Link href="/discover" className="text-white hover:text-primary transition px-3 py-2 rounded-md">
                  Discover
                </Link>
                <Link href="/watchlist" className="text-white hover:text-primary transition px-3 py-2 rounded-md">
                  Watchlist
                </Link>
                <Link href="/profile" className="text-white hover:text-primary transition px-3 py-2 rounded-md">
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-primary transition px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
        
        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-secondary-light">
            <div className="container mx-auto px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {currentUser ? (
                <>
                  <Link href="/" className="flex items-center text-white hover:bg-secondary-light hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    <FaHome className="mr-2" /> Home
                  </Link>
                  <Link href="/discover" className="flex items-center text-white hover:bg-secondary-light hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    <FaSearch className="mr-2" /> Discover
                  </Link>
                  <Link href="/watchlist" className="flex items-center text-white hover:bg-secondary-light hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    <FaList className="mr-2" /> Watchlist
                  </Link>
                  <Link href="/profile" className="flex items-center text-white hover:bg-secondary-light hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    <FaUser className="mr-2" /> Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left text-white hover:bg-secondary-light hover:text-primary px-3 py-2 rounded-md text-base font-medium"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white hover:bg-secondary-light hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </Link>
                  <Link href="/signup" className="text-white hover:bg-secondary-light hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Mobile navigation bar */}
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-gray-700 flex justify-around items-center py-3 z-30">
          <Link href="/" className={`flex flex-col items-center text-sm ${router.pathname === '/' ? 'text-primary' : 'text-white'}`}>
            <FaHome className="text-xl mb-1" />
            <span>Home</span>
          </Link>
          <Link href="/discover" className={`flex flex-col items-center text-sm ${router.pathname === '/discover' ? 'text-primary' : 'text-white'}`}>
            <FaSearch className="text-xl mb-1" />
            <span>Discover</span>
          </Link>
          <Link href="/watchlist" className={`flex flex-col items-center text-sm ${router.pathname === '/watchlist' ? 'text-primary' : 'text-white'}`}>
            <FaList className="text-xl mb-1" />
            <span>Watchlist</span>
          </Link>
          <Link href="/profile" className={`flex flex-col items-center text-sm ${router.pathname === '/profile' ? 'text-primary' : 'text-white'}`}>
            <FaUser className="text-xl mb-1" />
            <span>Profile</span>
          </Link>
        </nav>
      )}
    </div>
  );
}