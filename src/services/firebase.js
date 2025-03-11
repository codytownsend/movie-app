// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your Firebase configuration
// Replace with your actual Firebase config values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication Functions

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User's display name
 * @returns {Promise} - User credentials
 */
export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Create user profile document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName: name,
      createdAt: Timestamp.now(),
      photoURL: null,
      bio: '',
      favoriteGenres: [],
      streamingServices: [],
      settings: {
        darkMode: true,
        notifications: true
      }
    });
    
    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - User credentials
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise} - Void
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise} - Void
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

/**
 * Listen to auth state changes
 * @param {function} callback - Callback to execute on auth state change
 * @returns {function} - Unsubscribe function
 */
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// User Profile Functions

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise} - User profile data
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile in Firestore
 * @param {string} uid - User ID
 * @param {object} data - Profile data to update
 * @returns {Promise} - Void
 */
export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    throw error;
  }
};

/**
 * Upload user profile picture
 * @param {string} uid - User ID
 * @param {File} file - Image file
 * @returns {Promise} - Download URL of the uploaded image
 */
export const uploadProfilePicture = async (uid, file) => {
  try {
    const storageRef = ref(storage, `profile_pictures/${uid}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user profile with new photo URL
    await updateDoc(doc(db, 'users', uid), {
      photoURL: downloadURL
    });
    
    // Also update auth profile
    await updateProfile(auth.currentUser, {
      photoURL: downloadURL
    });
    
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

// Watchlist Functions

/**
 * Get user's watchlist
 * @param {string} uid - User ID
 * @returns {Promise} - Array of watchlist items
 */
export const getWatchlist = async (uid) => {
  try {
    const watchlistRef = collection(db, 'users', uid, 'watchlist');
    const watchlistSnapshot = await getDocs(watchlistRef);
    return watchlistSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Add movie to watchlist
 * @param {string} uid - User ID
 * @param {object} movie - Movie data
 * @returns {Promise} - Void
 */
export const addToWatchlist = async (uid, movie) => {
  try {
    await setDoc(doc(db, 'users', uid, 'watchlist', movie.id.toString()), {
      ...movie,
      addedAt: Timestamp.now(),
      watched: false,
      userRating: null,
      userReview: '',
      favorite: false,
      favoriteRank: null
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Remove movie from watchlist
 * @param {string} uid - User ID
 * @param {string} movieId - Movie ID
 * @returns {Promise} - Void
 */
export const removeFromWatchlist = async (uid, movieId) => {
  try {
    await setDoc(doc(db, 'users', uid, 'watchlist', movieId.toString()), {
      deleted: true,
      deletedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    throw error;
  }
};

/**
 * Update movie in watchlist
 * @param {string} uid - User ID
 * @param {string} movieId - Movie ID
 * @param {object} data - Data to update
 * @returns {Promise} - Void
 */
export const updateWatchlistItem = async (uid, movieId, data) => {
  try {
    await updateDoc(doc(db, 'users', uid, 'watchlist', movieId.toString()), data);
  } catch (error) {
    throw error;
  }
};

/**
 * Mark movie as watched
 * @param {string} uid - User ID
 * @param {string} movieId - Movie ID
 * @param {boolean} watched - Watched status
 * @returns {Promise} - Void
 */
export const markAsWatched = async (uid, movieId, watched = true) => {
  try {
    await updateDoc(doc(db, 'users', uid, 'watchlist', movieId.toString()), {
      watched,
      watchedAt: watched ? Timestamp.now() : null
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Rate a movie
 * @param {string} uid - User ID
 * @param {string} movieId - Movie ID
 * @param {number} rating - Rating value (1-5)
 * @param {string} review - Optional review text
 * @returns {Promise} - Void
 */
export const rateMovie = async (uid, movieId, rating, review = '') => {
  try {
    await updateDoc(doc(db, 'users', uid, 'watchlist', movieId.toString()), {
      userRating: rating,
      userReview: review,
      watched: true,
      ratedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle favorite status and update rank
 * @param {string} uid - User ID
 * @param {string} movieId - Movie ID
 * @param {boolean} favorite - Favorite status
 * @param {number} rank - Optional favorite rank
 * @returns {Promise} - Void
 */
export const toggleFavorite = async (uid, movieId, favorite, rank = null) => {
  try {
    await updateDoc(doc(db, 'users', uid, 'watchlist', movieId.toString()), {
      favorite,
      favoriteRank: rank
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update favorite rankings
 * @param {string} uid - User ID
 * @param {array} rankedMovies - Array of movie IDs in ranked order
 * @returns {Promise} - Void
 */
export const updateFavoriteRankings = async (uid, rankedMovies) => {
  try {
    // Get a batch to perform multiple operations
    const batch = db.batch();
    
    // First, remove favorite status from all movies not in the rankings
    const watchlistRef = collection(db, 'users', uid, 'watchlist');
    const favoritesQuery = query(watchlistRef, where('favorite', '==', true));
    const favoritesSnapshot = await getDocs(favoritesQuery);
    
    favoritesSnapshot.docs.forEach(doc => {
      const movieId = doc.id;
      if (!rankedMovies.includes(movieId)) {
        batch.update(doc.ref, {
          favorite: false,
          favoriteRank: null
        });
      }
    });
    
    // Then update the ranking for the movies in the list
    rankedMovies.forEach((movieId, index) => {
      const movieRef = doc(db, 'users', uid, 'watchlist', movieId.toString());
      batch.update(movieRef, {
        favorite: true,
        favoriteRank: index + 1
      });
    });
    
    // Commit the batch
    await batch.commit();
  } catch (error) {
    throw error;
  }
};

// Settings Functions

/**
 * Update user settings
 * @param {string} uid - User ID
 * @param {object} settings - Settings object
 * @returns {Promise} - Void
 */
export const updateUserSettings = async (uid, settings) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      settings
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get user settings
 * @param {string} uid - User ID
 * @returns {Promise} - Settings object
 */
export const getUserSettings = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists() && userDoc.data().settings) {
      return userDoc.data().settings;
    } else {
      return {
        darkMode: true,
        notifications: true
      };
    }
  } catch (error) {
    throw error;
  }
};

// Social Functions

/**
 * Get user's friends
 * @param {string} uid - User ID
 * @returns {Promise} - Array of friend objects
 */
export const getUserFriends = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) throw new Error('User not found');
    
    const userData = userDoc.data();
    const friendsList = userData.friends || [];
    
    // Get details for each friend
    const friendsDetails = [];
    
    for (const friendId of friendsList) {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        // Only include necessary fields, not the entire user document
        const { displayName, photoURL, favoriteGenres } = friendDoc.data();
        friendsDetails.push({
          id: friendId,
          name: displayName,
          avatar: photoURL,
          favoriteGenres
        });
      }
    }
    
    return friendsDetails;
  } catch (error) {
    throw error;
  }
};

/**
 * Send friend request
 * @param {string} senderUid - Sender user ID
 * @param {string} receiverUid - Receiver user ID
 * @returns {Promise} - Void
 */
export const sendFriendRequest = async (senderUid, receiverUid) => {
  try {
    // Add to sender's sent requests
    await updateDoc(doc(db, 'users', senderUid), {
      sentRequests: arrayUnion(receiverUid)
    });
    
    // Add to receiver's pending requests
    await updateDoc(doc(db, 'users', receiverUid), {
      pendingRequests: arrayUnion(senderUid)
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Accept friend request
 * @param {string} accepterUid - User accepting the request
 * @param {string} requesterUid - User who sent the request
 * @returns {Promise} - Void
 */
export const acceptFriendRequest = async (accepterUid, requesterUid) => {
  try {
    // Add each user to the other's friends list
    await updateDoc(doc(db, 'users', accepterUid), {
      friends: arrayUnion(requesterUid),
      pendingRequests: arrayRemove(requesterUid)
    });
    
    await updateDoc(doc(db, 'users', requesterUid), {
      friends: arrayUnion(accepterUid),
      sentRequests: arrayRemove(accepterUid)
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Decline friend request
 * @param {string} declinerUid - User declining the request
 * @param {string} requesterUid - User who sent the request
 * @returns {Promise} - Void
 */
export const declineFriendRequest = async (declinerUid, requesterUid) => {
  try {
    await updateDoc(doc(db, 'users', declinerUid), {
      pendingRequests: arrayRemove(requesterUid)
    });
    
    await updateDoc(doc(db, 'users', requesterUid), {
      sentRequests: arrayRemove(declinerUid)
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Remove friend
 * @param {string} uid1 - First user ID
 * @param {string} uid2 - Second user ID
 * @returns {Promise} - Void
 */
export const removeFriend = async (uid1, uid2) => {
  try {
    await updateDoc(doc(db, 'users', uid1), {
      friends: arrayRemove(uid2)
    });
    
    await updateDoc(doc(db, 'users', uid2), {
      friends: arrayRemove(uid1)
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Recommend a movie to friends
 * @param {string} senderUid - Sender user ID
 * @param {array} receiverUids - Array of receiver user IDs
 * @param {object} movie - Movie data
 * @param {string} message - Recommendation message
 * @returns {Promise} - Void
 */
export const recommendMovie = async (senderUid, receiverUids, movie, message) => {
  try {
    const timestamp = Timestamp.now();
    
    for (const receiverUid of receiverUids) {
      await setDoc(doc(db, 'users', receiverUid, 'recommendations', `${senderUid}_${movie.id}`), {
        sender: senderUid,
        movie,
        message,
        timestamp,
        read: false
      });
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Get movie recommendations
 * @param {string} uid - User ID
 * @returns {Promise} - Array of recommendations
 */
export const getRecommendations = async (uid) => {
  try {
    const recommendationsRef = collection(db, 'users', uid, 'recommendations');
    const recommendationsSnapshot = await getDocs(recommendationsRef);
    
    const recommendations = [];
    
    for (const doc of recommendationsSnapshot.docs) {
      const data = doc.data();
      
      // Get sender details
      const senderDoc = await getDoc(doc(db, 'users', data.sender));
      if (senderDoc.exists()) {
        const { displayName, photoURL } = senderDoc.data();
        
        recommendations.push({
          id: doc.id,
          sender: {
            id: data.sender,
            name: displayName,
            avatar: photoURL
          },
          movie: data.movie,
          message: data.message,
          timestamp: data.timestamp,
          read: data.read
        });
      }
    }
    
    // Sort by timestamp, newest first
    return recommendations.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    throw error;
  }
};

/**
 * Mark recommendation as read
 * @param {string} uid - User ID
 * @param {string} recommendationId - Recommendation ID
 * @returns {Promise} - Void
 */
export const markRecommendationAsRead = async (uid, recommendationId) => {
  try {
    await updateDoc(doc(db, 'users', uid, 'recommendations', recommendationId), {
      read: true
    });
  } catch (error) {
    throw error;
  }
};

export { auth, db, storage };