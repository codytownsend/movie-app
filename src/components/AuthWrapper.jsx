// src/components/AuthWrapper.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import LoadingScreen from './LoadingScreen';

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