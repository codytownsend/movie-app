// components/MobileStyles.js
import { useEffect } from 'react';
import Head from 'next/head';

export default function MobileStyles() {
  // This component will add mobile-specific meta tags and styles
  
  useEffect(() => {
    // Add a class to the document for touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.documentElement.classList.add('touch-device');
    }
    
    // Prevent overscroll/bounce effect on iOS
    document.body.addEventListener('touchmove', function(e) {
      if (e._isScroller) return;
      e.preventDefault();
    }, { passive: false });
    
    // Clean up
    return () => {
      document.body.removeEventListener('touchmove', function(e) {
        if (e._isScroller) return;
        e.preventDefault();
      });
    };
  }, []);
  
  return (
    <Head>
      {/* Mobile viewport settings */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      
      {/* Apple specific meta tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* App name when added to home screen */}
      <meta name="apple-mobile-web-app-title" content="CineMagic" />
      
      {/* PWA related tags */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* App icons */}
      <link rel="apple-touch-icon" href="/icon-192x192.png" />
      
      {/* Prevent phone number detection */}
      <meta name="format-detection" content="telephone=no" />
    </Head>
  );
}