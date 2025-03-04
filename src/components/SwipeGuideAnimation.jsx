// src/components/SwipeGuideAnimation.jsx
import React, { useEffect, useState, useRef } from 'react';
import { X, Heart, Bookmark } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SwipeGuideAnimation = ({ onComplete }) => {
  const { colorScheme } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const cardRef = useRef(null);
  const animationRef = useRef(null);
  
  // Steps for the guide animation
  // 0: Initial (card centered)
  // 1: Right swipe demo (like)
  // 2: Left swipe demo (dislike)
  // 3: Down swipe demo (bookmark)
  // 4: Complete (fade out)
  
  useEffect(() => {
    // Set a fixed sequence of animations for the guide
    const sequence = [
      { delay: 800, action: () => showRightSwipe() },  // Show right swipe after initial pause
      { delay: 1500, action: () => showLeftSwipe() },  // Show left swipe after right completes
      { delay: 1500, action: () => showDownSwipe() },  // Show down swipe after left completes
      { delay: 1500, action: () => fadeOutGuide() }    // Fade out the entire guide
    ];
    
    let timeoutIds = [];
    
    // Chain the animations with specified delays
    let cumulativeDelay = 0;
    sequence.forEach(step => {
      cumulativeDelay += step.delay;
      const id = setTimeout(step.action, cumulativeDelay);
      timeoutIds.push(id);
    });
    
    // Clean up timeouts if component unmounts
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Animate card swiping right
  const showRightSwipe = () => {
    setCurrentStep(1);
    if (!cardRef.current) return;
    
    const startTime = performance.now();
    const duration = 400; // All animations have same duration
    
    const animateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 2); // Quadratic ease out
      
      const translateX = easeProgress * window.innerWidth * 0.5;
      const rotate = easeProgress * 20;
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        // Reset card position after animation completes
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = 'transform 300ms ease';
            cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
            // Remove transition after it completes
            setTimeout(() => {
              if (cardRef.current) {
                cardRef.current.style.transition = '';
              }
            }, 300);
          }
        }, 400);
      }
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  };
  
  // Animate card swiping left
  const showLeftSwipe = () => {
    setCurrentStep(2);
    if (!cardRef.current) return;
    
    const startTime = performance.now();
    const duration = 400; // All animations have same duration
    
    const animateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 2); // Quadratic ease out
      
      const translateX = easeProgress * window.innerWidth * -0.5;
      const rotate = easeProgress * -20;
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        // Reset card position after animation completes
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = 'transform 300ms ease';
            cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
            // Remove transition after it completes
            setTimeout(() => {
              if (cardRef.current) {
                cardRef.current.style.transition = '';
              }
            }, 300);
          }
        }, 400);
      }
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  };
  
  // Animate card swiping down
  const showDownSwipe = () => {
    setCurrentStep(3);
    if (!cardRef.current) return;
    
    const startTime = performance.now();
    const duration = 400; // All animations have same duration
    
    const animateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 2); // Quadratic ease out
      
      const translateY = easeProgress * window.innerHeight * 0.3;
      const scale = 1 - (easeProgress * 0.1); // Slight scale down for perspective
      
      if (cardRef.current) {
        cardRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        // Reset card position after animation completes
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = 'transform 300ms ease';
            cardRef.current.style.transform = 'translateY(0) scale(1)';
            // Remove transition after it completes
            setTimeout(() => {
              if (cardRef.current) {
                cardRef.current.style.transition = '';
              }
            }, 300);
          }
        }, 400);
      }
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  };
  
  // Fade out the entire guide animation
  const fadeOutGuide = () => {
    setCurrentStep(4);
    setVisible(false);
    // Call the completion callback after fade animation (500ms)
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };
  
  // Skip the guide animation
  const handleSkip = () => {
    // Cancel any ongoing animations
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    fadeOutGuide();
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Skip button */}
      <button 
        className="absolute top-8 right-8 text-white bg-gray-800 bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70 transition"
        onClick={handleSkip}
      >
        Skip Tutorial
      </button>
      
      {/* Animation guidance text */}
      <div className="absolute top-20 text-center px-8">
        <h2 className="text-white text-2xl font-bold mb-2">
          {currentStep === 0 && "How to use MovieMatch"}
          {currentStep === 1 && "Swipe Right to Like"}
          {currentStep === 2 && "Swipe Left to Skip"}
          {currentStep === 3 && "Swipe Down to Bookmark"}
        </h2>
        <p className="text-gray-200 max-w-xs mx-auto">
          {currentStep === 0 && "Watch how to interact with movie cards"}
          {currentStep === 1 && "Add movies you like to your watchlist"}
          {currentStep === 2 && "Pass on movies you're not interested in"}
          {currentStep === 3 && "Save a movie to view later"}
        </p>
      </div>
      
      {/* Demo card - using the existing MovieCard styling */}
      <div 
        ref={cardRef}
        className={`w-[90%] max-w-sm ${colorScheme.card} rounded-xl shadow-xl overflow-hidden`}
        style={{ 
          transition: '', 
          transform: 'translateX(0) rotate(0deg)'
        }}
      >
        {/* Movie poster */}
        <div className="relative">
          <div className="w-full h-[65vh] bg-gray-300 flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80"></div>
          
          {/* Like/Dislike/Bookmark badges */}
          {currentStep === 1 && (
            <div className="absolute top-6 left-6 bg-green-500 bg-opacity-90 text-white rounded-lg px-4 py-2 transform -rotate-12 border-2 border-white scale-in-center">
              <span className="font-bold text-xl">LIKE</span>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="absolute top-6 right-6 bg-red-500 bg-opacity-90 text-white rounded-lg px-4 py-2 transform rotate-12 border-2 border-white scale-in-center">
              <span className="font-bold text-xl">NOPE</span>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-yellow-500 bg-opacity-90 text-white rounded-lg px-4 py-2 border-2 border-white scale-in-center">
              <span className="font-bold text-xl">BOOKMARK</span>
            </div>
          )}
          
          {/* Action indicators overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {currentStep === 1 && (
              <div className="w-20 h-20 rounded-full bg-green-500 bg-opacity-40 flex items-center justify-center pulse">
                <Heart className="w-10 h-10 text-white fill-current" />
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="w-20 h-20 rounded-full bg-red-500 bg-opacity-40 flex items-center justify-center pulse">
                <X className="w-10 h-10 text-white" />
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="w-20 h-20 rounded-full bg-yellow-500 bg-opacity-40 flex items-center justify-center pulse">
                <Bookmark className="w-10 h-10 text-white fill-current" />
              </div>
            )}
          </div>
          
          {/* Movie info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold">Sample Movie</h2>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm">8.5/10</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">2023</span>
                </div>
              </div>
              
              {/* Streaming services */}
              <div className="flex">
                <span className="ml-1 text-xs bg-gray-800 bg-opacity-80 rounded-md px-2 py-1">
                  Netflix
                </span>
              </div>
            </div>
            
            {/* Genres */}
            <div className="flex flex-wrap mt-2">
              <span className="text-xs bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1 mr-1 mt-1">
                Action
              </span>
              <span className="text-xs bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1 mr-1 mt-1">
                Sci-Fi
              </span>
            </div>
            
            {/* Description */}
            <p className="mt-3 text-sm text-white line-clamp-2 leading-snug">
              This is a sample movie description to demonstrate the card swiping functionality.
            </p>
          </div>
        </div>
      </div>
      
      {/* Gesture hint */}
      <div className="absolute bottom-32 text-center">
        {currentStep === 1 && (
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white">
              <span className="transform rotate-45">→</span>
            </div>
            <span className="text-white ml-2">Swipe Right</span>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white">
              <span className="transform -rotate-135">→</span>
            </div>
            <span className="text-white ml-2">Swipe Left</span>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white">
              <span className="transform rotate-90">→</span>
            </div>
            <span className="text-white ml-2">Swipe Down</span>
          </div>
        )}
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-16 flex space-x-3">
        {[0, 1, 2, 3].map((step) => (
          <div 
            key={step}
            className={`w-3 h-3 rounded-full ${
              currentStep > step 
                ? 'bg-white' 
                : currentStep === step 
                  ? 'bg-purple-500' 
                  : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
      
      <style jsx>{`
        .scale-in-center {
          animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1) ${currentStep === 1 ? 'rotate(-12deg)' : currentStep === 2 ? 'rotate(12deg)' : ''};
            opacity: 1;
          }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default SwipeGuideAnimation;