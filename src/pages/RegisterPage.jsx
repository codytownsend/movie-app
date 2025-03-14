// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Check, X, Loader } from 'lucide-react';
import { checkUsernameAvailability } from '../services/firebase';

const RegisterPage = ({ switchToLogin }) => {
  const { register, error, isAuthenticating } = useAuth();
  const { colorScheme, showToast } = useAppContext();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  
  // Check username availability after user stops typing
  const checkUsername = async (username) => {
    if (username.length < 3) {
      setUsernameChecked(false);
      return;
    }
    
    setCheckingUsername(true);
    setUsernameChecked(false);
    
    try {
      // This function will be implemented in firebase.js
      const isAvailable = await checkUsernameAvailability(username);
      setUsernameAvailable(isAvailable);
      setUsernameChecked(true);
    } catch (err) {
      console.error('Error checking username:', err);
    } finally {
      setCheckingUsername(false);
    }
  };
  
  // Debounce username input to avoid too many database calls
  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    
    // Clear timeout if it exists
    if (window.usernameTimeout) {
      clearTimeout(window.usernameTimeout);
    }
    
    // Set new timeout
    window.usernameTimeout = setTimeout(() => {
      checkUsername(newUsername);
    }, 500);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    try {
      // Validate fields
      if (!name.trim()) {
        setLocalError('Name is required');
        return;
      }
      
      if (!username.trim()) {
        setLocalError('Username is required');
        return;
      }
      
      if (username.length < 3) {
        setLocalError('Username must be at least 3 characters');
        return;
      }
      
      if (!usernameAvailable && usernameChecked) {
        setLocalError('Username is already taken');
        return;
      }
      
      if (!email.trim()) {
        setLocalError('Email is required');
        return;
      }
      
      // Add email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setLocalError('Please enter a valid email address');
        return;
      }
      
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      
      await register(name, email, password, username);
      showToast('Account created successfully!');
    } catch (err) {
      console.error('Registration error:', err);
      setLocalError(err.message || 'Error creating account');
    }
  };

  return (
    <div className={`min-h-screen ${colorScheme.bg} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${colorScheme.card} py-8 px-4 shadow sm:rounded-lg sm:px-10`}>
          {/* Logo and App Name */}
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
            <h1 className="text-center text-3xl font-extrabold">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                MovieMatch
              </span>
            </h1>
            <h2 className={`mt-2 text-center text-sm ${colorScheme.textSecondary}`}>
              Create your account
            </h2>
          </div>
          
          {/* Register Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {(error || localError) && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error || localError}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            {/* Name Field */}
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${colorScheme.text}`}>
                Full name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${colorScheme.border} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${colorScheme.bg} ${colorScheme.text}`}
                />
              </div>
            </div>
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${colorScheme.text}`}>
                Username <span className="text-xs text-gray-500">(for easy searching)</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  className={`appearance-none block w-full px-3 py-2 border ${usernameChecked ? (usernameAvailable ? 'border-green-500' : 'border-red-500') : colorScheme.border} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${colorScheme.bg} ${colorScheme.text}`}
                  placeholder="Choose a unique username"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {checkingUsername && (
                    <Loader className="w-4 h-4 text-gray-400 animate-spin" />
                  )}
                  {!checkingUsername && usernameChecked && usernameAvailable && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {!checkingUsername && usernameChecked && !usernameAvailable && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {usernameChecked && !usernameAvailable && (
                <p className="mt-1 text-xs text-red-500">
                  This username is already taken
                </p>
              )}
              {username && username.length < 3 && (
                <p className="mt-1 text-xs text-red-500">
                  Username must be at least 3 characters
                </p>
              )}
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${colorScheme.text}`}>
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${colorScheme.border} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${colorScheme.bg} ${colorScheme.text}`}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${colorScheme.text}`}>
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${colorScheme.border} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${colorScheme.bg} ${colorScheme.text}`}
                />
                {password && password.length < 6 && (
                  <p className="mt-1 text-xs text-red-500">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>
            </div>
            
            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${colorScheme.text}`}>
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${colorScheme.border} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${colorScheme.bg} ${colorScheme.text}`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isAuthenticating}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isAuthenticating ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isAuthenticating ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
          
          {/* Login Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${colorScheme.border}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${colorScheme.bg} ${colorScheme.textSecondary}`}>
                  Already have an account?
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={switchToLogin}
                className={`w-full flex justify-center py-2 px-4 border ${colorScheme.border} rounded-md shadow-sm text-sm font-medium ${colorScheme.text} hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;