// src/modals/NotificationsModal.js
import React from 'react';
import { ArrowLeft, Zap, Bell, Star } from 'lucide-react';

const NotificationsModal = ({ colorScheme, setNotificationsOpen, showToast, setCurrentIndex }) => {
  return (
    <div className={`fixed inset-0 z-50 ${colorScheme.bg}`}>
      <div className="h-full overflow-y-auto pb-20">
        <header className={`${colorScheme.card} shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between`}>
          <div className="flex items-center">
            <button 
              className="mr-3"
              onClick={() => setNotificationsOpen(false)}
            >
              <ArrowLeft className={`w-6 h-6 ${colorScheme.text}`} />
            </button>
            <h2 className={`text-lg font-bold ${colorScheme.text}`}>Notifications</h2>
          </div>
          <button 
            className={colorScheme.textSecondary}
            onClick={() => showToast("All notifications marked as read")}
          >
            Mark all as read
          </button>
        </header>
        <div className="p-4">
          <div className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md mb-4`}>
            <div className="p-4 border-l-4 border-purple-500">
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 text-purple-500 mr-2" />
                <h4 className={`font-medium ${colorScheme.text}`}>New Recommendation!</h4>
              </div>
              <p className={`text-sm ${colorScheme.textSecondary}`}>We found a new title that matches your preferences.</p>
              <p className={`text-sm font-medium ${colorScheme.text} mt-1`}>"Inception" is now available on Netflix</p>
              <div className="flex justify-end mt-2">
                <button 
                  className="text-purple-500 text-sm"
                  onClick={() => {
                    setNotificationsOpen(false);
                    setCurrentIndex(0);
                  }}
                >
                  View
                </button>
              </div>
            </div>
          </div>
          <div className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md mb-4 opacity-60`}>
            <div className="p-4 border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <Bell className="w-5 h-5 text-blue-500 mr-2" />
                <h4 className={`font-medium ${colorScheme.text}`}>Price Drop Alert</h4>
              </div>
              <p className={`text-sm ${colorScheme.textSecondary}`}>"Parasite" is now available to rent for $2.99</p>
              <div className="flex justify-end mt-2">
                <button className="text-blue-500 text-sm">View Offer</button>
              </div>
            </div>
          </div>
          <div className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md mb-4 opacity-60`}>
            <div className="p-4 border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                <h4 className={`font-medium ${colorScheme.text}`}>New on Your Watchlist</h4>
              </div>
              <p className={`text-sm ${colorScheme.textSecondary}`}>"Stranger Things" Season 4 is now available on Netflix</p>
              <div className="flex justify-end mt-2">
                <button className="text-green-500 text-sm">Watch Now</button>
              </div>
            </div>
          </div>
          <h3 className={`font-medium mt-6 mb-3 ${colorScheme.text}`}>Earlier</h3>
          <div className={`${colorScheme.card} rounded-lg overflow-hidden shadow-md mb-4 opacity-60`}>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                <h4 className={`font-medium ${colorScheme.text}`}>Rate Your Watch</h4>
              </div>
              <p className={`text-sm ${colorScheme.textSecondary}`}>How would you rate "The Queen's Gambit"?</p>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
