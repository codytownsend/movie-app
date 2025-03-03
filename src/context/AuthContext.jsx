// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sampleUsers } from '../data/sampleData';

// Demo user account
const demoUser = {
  id: 0,
  name: "Cody",
  email: "cody@email.com",
  password: "password", // This would be hashed in a real app
  username: "cody",
  avatar: "C",
  bio: "Movie Enthusiast | Cinema Lover",
  following: 112,
  followers: 89,
  favoriteGenres: ["Action", "Sci-Fi", "Thriller", "Comedy"],
  streamingServices: ["Netflix", "Prime Video", "Disney+"],
  recentActivity: []
};

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already logged in (via localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('An error occurred while checking your authentication status.');
        setCurrentUser(null);
      } finally {
        setIsAuthenticating(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Check for demo account first
      if (email === demoUser.email && password === demoUser.password) {
        // Demo login successful
        const { password: _, ...userWithoutPassword } = demoUser;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        setCurrentUser(userWithoutPassword);
        return userWithoutPassword;
      }
      
      // Otherwise check sample users
      const user = sampleUsers.find(user => 
        user.email === email && user.password === password
      );
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password before storing
      const { password: _, ...userWithoutPassword } = user;
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      setCurrentUser(userWithoutPassword);
      return userWithoutPassword;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Register function
  const register = async (name, email, password) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Check if email already exists
      const existingUser = sampleUsers.find(user => user.email === email);
      
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser = {
        id: sampleUsers.length + 1,
        name,
        email,
        username: email.split('@')[0],
        avatar: name.charAt(0).toUpperCase(),
        bio: "Movie Enthusiast",
        following: 0,
        followers: 0,
        favoriteGenres: [],
        streamingServices: [],
        recentActivity: []
      };
      
      // Save to localStorage (in a real app, this would be saved to a database)
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setCurrentUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };
  
  // Update user profile
  const updateProfile = (updates) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const updatedUser = { ...currentUser, ...updates };
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const contextValue = {
    currentUser,
    isAuthenticating,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};