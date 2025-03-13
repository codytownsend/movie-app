// src/components/AuthWrapper.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import LoadingScreen from './LoadingScreen';

const handleAuthError = (error) => {
  let message = "Authentication error";
  if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    message = "Invalid email or password";
  } else if (error.code === 'auth/email-already-in-use') {
    message = "Email already in use";
  } else if (error.code === 'auth/weak-password') {
    message = "Password is too weak";
  } else if (error.code === 'auth/network-request-failed') {
    message = "Network error. Check your connection";
  }
  showToast(message);
};

const AuthWrapper = ({ children }) => {
  const { currentUser, isAuthenticating } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  
  // Show loading screen while checking authentication
  if (isAuthenticating) {
    return <LoadingScreen />;
  }
  
  // If user is not authenticated, show login/register pages
  if (!currentUser) {
    if (showLogin) {
      return <LoginPage switchToRegister={() => setShowLogin(false)} />;
    } else {
      return <RegisterPage switchToLogin={() => setShowLogin(true)} />;
    }
  }
  
  // If user is authenticated, render the children (app content)
  return children;
};

export default AuthWrapper;