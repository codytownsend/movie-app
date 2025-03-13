// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChangedListener, 
  signInUser, 
  registerUser, 
  signOutUser,
  getUserProfile,
  updateUserProfile
} from '../services/firebase';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [error, setError] = useState(null);
  
  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (user) => {
      try {
        if (user) {
          // User is signed in
          const userProfileData = await getUserProfile(user.uid);
          
          setCurrentUser(user);
          setUserProfile(userProfileData);
        } else {
          // User is signed out
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(err.message);
      } finally {
        setIsAuthenticating(false);
      }
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const userCredential = await signInUser(email, password);
      const userProfile = await getUserProfile(userCredential.user.uid);
      
      setCurrentUser(userCredential.user);
      setUserProfile(userProfile);
      
      return userCredential.user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Register function
  const register = async (name, email, password, username) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Check if username is available before registering
      // This would be handled in the registerUser function in firebase.js
      const userCredential = await registerUser(name, email, password, username);
      const userProfile = await getUserProfile(userCredential.user.uid);
      
      setCurrentUser(userCredential.user);
      setUserProfile(userProfile);
      
      return userCredential.user;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      throw err;
    }
  };
  
  // Update profile function
  const updateProfile = async (updates) => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      await updateUserProfile(currentUser.uid, updates);
      
      // Get the updated profile
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
      
      return updatedProfile;
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const contextValue = {
    currentUser,
    userProfile,
    isAuthenticating,
    error,
    login,
    register,
    logout,
    updateProfile,
    setError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};