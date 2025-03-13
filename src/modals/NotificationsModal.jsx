// src/modals/NotificationsModal.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Star, Heart, UserPlus, X, Check, Film } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../services/firebase';

const NotificationsModal = ({ setNotificationsOpen }) => {
  const {
    colorScheme,
    showToast,
    setCurrentIndex,
    movies,
    setActiveTab
  } = useAppContext();

  const { currentUser } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications when modal opens
  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        const notificationData = await getNotifications(currentUser.uid);
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [currentUser]);

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await markAllNotificationsAsRead(currentUser.uid);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read: true
        }))
      );
      
      showToast("All notifications marked as read");
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast('Error updating notifications');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    if (!currentUser) return;
    
    try {
      await markNotificationAsRead(currentUser.uid, notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // No toast here to avoid being too noisy
    }
  };
  
  const handleNotificationAction = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    
    // Handle different notification types
    switch (notification.type) {
      case 'recommendation':
        // Find the movie and view it
        const movieIndex = movies.findIndex(m => m.id.toString() === notification.movieId.toString());
        if (movieIndex !== -1) {
          setCurrentIndex(movieIndex);
          setActiveTab('discover');
        }
        break;
      
      case 'friendRequest':
        // Navigate to social tab
        setActiveTab('social');
        break;
        
      case 'friendRequestAccepted':
        // Navigate to social tab
        setActiveTab('social');
        break;
        
      default:
        // Default action is to close the modal
        break;
    }
    
    setNotificationsOpen(false);
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate(); // Handle Firestore timestamps
    const now = new Date();
    const diff = now - date;
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours < 1) {
        const minutes = Math.floor(diff / (60 * 1000));
        return minutes < 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days}d ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  };

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
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        </header>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {/* Today Section */}
              {(() => {
                const todayNotifications = notifications.filter(notif => {
                  const date = notif.createdAt instanceof Date ? notif.createdAt : notif.createdAt.toDate();
                  const now = new Date();
                  return date.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0);
                });
                
                return todayNotifications.length > 0 ? (
                  <div>
                    <h3 className={`text-sm font-medium ${colorScheme.textSecondary} mb-3`}>Today</h3>
                    {todayNotifications.map(notification => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        handleAction={() => handleNotificationAction(notification)}
                        colorScheme={colorScheme}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                ) : null;
              })()}
              
              {/* This Week Section */}
              {(() => {
                const now = new Date();
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                
                const thisWeekNotifications = notifications.filter(notif => {
                  const date = notif.createdAt instanceof Date ? notif.createdAt : notif.createdAt.toDate();
                  const today = new Date().setHours(0, 0, 0, 0);
                  return date >= weekStart && date.setHours(0, 0, 0, 0) < today;
                });
                
                return thisWeekNotifications.length > 0 ? (
                  <div>
                    <h3 className={`text-sm font-medium ${colorScheme.textSecondary} mb-3`}>This Week</h3>
                    {thisWeekNotifications.map(notification => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        handleAction={() => handleNotificationAction(notification)}
                        colorScheme={colorScheme}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                ) : null;
              })()}
              
              {/* Earlier Section */}
              {(() => {
                const now = new Date();
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                
                const earlierNotifications = notifications.filter(notif => {
                  const date = notif.createdAt instanceof Date ? notif.createdAt : notif.createdAt.toDate();
                  return date < weekStart;
                });
                
                return earlierNotifications.length > 0 ? (
                  <div>
                    <h3 className={`text-sm font-medium ${colorScheme.textSecondary} mb-3`}>Earlier</h3>
                    {earlierNotifications.map(notification => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        handleAction={() => handleNotificationAction(notification)}
                        colorScheme={colorScheme}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className={`font-medium ${colorScheme.text} mb-2`}>No notifications</h3>
              <p className={`text-sm ${colorScheme.textSecondary} max-w-xs`}>
                When someone recommends a movie or sends you a friend request, you'll see it here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for individual notification items
const NotificationItem = ({ notification, handleAction, colorScheme, formatDate }) => {
  // Define colors and icons based on notification type
  let icon;
  let borderColor;
  let bgColor;
  let content;
  
  switch (notification.type) {
    case 'recommendation':
      icon = <Film className="w-5 h-5 text-purple-500" />;
      borderColor = 'border-purple-500';
      bgColor = notification.read ? 'bg-gray-800/60' : 'bg-purple-900/20';
      content = (
        <>
          <div className="flex items-center mb-2">
            <h4 className={`font-medium ${colorScheme.text}`}>New Recommendation!</h4>
          </div>
          <p className={`text-sm ${colorScheme.textSecondary}`}>
            <span className="font-medium">{notification.from?.displayName || 'Someone'}</span> recommended 
            {' '}<span className="font-medium">"{notification.movieTitle}"</span> to you
          </p>
        </>
      );
      break;
      
    case 'friendRequest':
      icon = <UserPlus className="w-5 h-5 text-blue-500" />;
      borderColor = 'border-blue-500';
      bgColor = notification.read ? 'bg-gray-800/60' : 'bg-blue-900/20';
      content = (
        <>
          <div className="flex items-center mb-2">
            <h4 className={`font-medium ${colorScheme.text}`}>Friend Request</h4>
          </div>
          <p className={`text-sm ${colorScheme.textSecondary}`}>
            <span className="font-medium">{notification.from?.displayName || 'Someone'}</span> sent you a friend request
          </p>
        </>
      );
      break;
      
    case 'friendRequestAccepted':
      icon = <Check className="w-5 h-5 text-green-500" />;
      borderColor = 'border-green-500';
      bgColor = notification.read ? 'bg-gray-800/60' : 'bg-green-900/20';
      content = (
        <>
          <div className="flex items-center mb-2">
            <h4 className={`font-medium ${colorScheme.text}`}>Friend Request Accepted</h4>
          </div>
          <p className={`text-sm ${colorScheme.textSecondary}`}>
            <span className="font-medium">{notification.from?.displayName || 'Someone'}</span> accepted your friend request
          </p>
        </>
      );
      break;
      
    default:
      icon = <Bell className="w-5 h-5 text-gray-500" />;
      borderColor = 'border-gray-500';
      bgColor = notification.read ? 'bg-gray-800/60' : 'bg-gray-800';
      content = (
        <>
          <div className="flex items-center mb-2">
            <h4 className={`font-medium ${colorScheme.text}`}>Notification</h4>
          </div>
          <p className={`text-sm ${colorScheme.textSecondary}`}>
            You have a new notification
          </p>
        </>
      );
  }
  
  return (
    <div 
      className={`${bgColor} rounded-lg overflow-hidden shadow-md mb-4 border-l-4 ${borderColor} cursor-pointer hover:bg-opacity-80 transition-colors`}
      onClick={handleAction}
    >
      <div className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            {content}
          </div>
          <div className="ml-4 text-xs text-gray-400 whitespace-nowrap">
            {formatDate(notification.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;