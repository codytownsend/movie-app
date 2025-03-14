// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
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
  limit,
  orderBy,
  Timestamp,
  writeBatch,
  increment,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (safe initialization that prevents duplicate apps)
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error("Firebase initialization error", error.stack);
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Sets up a listener for authentication state changes
 * @param {function} callback - Function to call when auth state changes
 * @returns {function} - Unsubscribe function
 */
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Authentication Functions

/**
 * Check if a username is available
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} - Whether the username is available
 */
export const checkUsernameAvailability = async (username) => {
  try {
    // Don't allow usernames that are too short
    if (username.length < 3) {
      return false;
    }
    
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('username', '==', username.toLowerCase())
    );
    
    const querySnapshot = await getDocs(usernameQuery);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

/**
 * Register a new user with email and password
 * @param {string} name - User's display name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - Unique username for the user
 * @returns {Promise} - User credentials
 */
export const registerUser = async (name, email, password, username) => {
  try {
    // Check if username is available
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      throw new Error('Username is already taken');
    }
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateFirebaseProfile(userCredential.user, {
      displayName: name
    });
    
    // Start a batch write
    const batch = writeBatch(db);
    
    // Create user profile document in Firestore
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    batch.set(userDocRef, {
      uid: userCredential.user.uid,
      email,
      displayName: name,
      username: username.toLowerCase(),
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      photoURL: null,
      bio: '',
      favoriteGenres: [],
      streamingServices: [],
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      movieCount: {
        watchlist: 0,
        watched: 0,
        favorites: 0
      },
      settings: {
        darkMode: true,
        notifications: true,
        emailNotifications: true,
        textSize: 'medium',
        animations: true,
        recentActivityPrivacy: 'friends', // 'public', 'friends', 'private'
        recommendationsPrivacy: 'friends'
      }
    });
    
    // Create username document for uniqueness validation
    const usernameDocRef = doc(db, 'usernames', username.toLowerCase());
    batch.set(usernameDocRef, {
      username: username.toLowerCase(),
      uid: userCredential.user.uid,
      createdAt: Timestamp.now()
    });
    
    // Commit the batch
    await batch.commit();
    
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
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
    
    // Update last login timestamp
    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLoginAt: Timestamp.now()
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise} - Void
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
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
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// User Profile Functions

/**
 * Search for users by username
 * @param {string} searchQuery - Search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - Array of user profiles
 */
export const searchUsers = async (searchQuery, maxResults = 10) => {
  try {
    if (!searchQuery || searchQuery.length < 3) {
      return [];
    }
    
    // Convert to lowercase for case-insensitive search
    const query_lowercase = searchQuery.toLowerCase();
    
    // Search for usernames that start with the query
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('username', '>=', query_lowercase),
      where('username', '<=', query_lowercase + '\uf8ff'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(usernameQuery);
    
    // Get details for each user
    const userResults = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const { uid } = docSnapshot.data();
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userResults.push({
          uid: userData.uid,
          username: userData.username,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          bio: userData.bio,
          favoriteGenres: userData.favoriteGenres,
          streamingServices: userData.streamingServices
        });
      }
    }
    
    return userResults;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

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
    console.error('Error getting user profile:', error);
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
    // Handle username change separately if it exists
    if (data.username) {
      const newUsername = data.username.toLowerCase();
      
      // Check if the username is changing
      const userDoc = await getDoc(doc(db, 'users', uid));
      const currentUsername = userDoc.data().username;
      
      if (newUsername !== currentUsername) {
        // Check if the new username is available
        const isUsernameAvailable = await checkUsernameAvailability(newUsername);
        if (!isUsernameAvailable) {
          throw new Error('Username is already taken');
        }
        
        // Start a batch write
        const batch = writeBatch(db);
        
        // Delete old username document
        const oldUsernameDocRef = doc(db, 'usernames', currentUsername);
        batch.delete(oldUsernameDocRef);
        
        // Create new username document
        const newUsernameDocRef = doc(db, 'usernames', newUsername);
        batch.set(newUsernameDocRef, {
          username: newUsername,
          uid,
          createdAt: Timestamp.now()
        });
        
        // Update user profile
        await batch.commit();
      }
    }
    
    // Update user profile with other data
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Upload profile picture to Firebase Storage
 * @param {string} uid - User ID
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadProfilePicture = async (uid, file) => {
  try {
    // Create a unique filename
    const storageRef = ref(storage, `profile_images/${uid}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update the user's profile with the new photo URL
    await updateDoc(doc(db, 'users', uid), {
      photoURL: downloadURL
    });
    
    // Also update the Auth profile
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid) {
      await updateFirebaseProfile(currentUser, {
        photoURL: downloadURL
      });
    }
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// Watchlist Functions

/**
 * Get user's movie lists
 * @param {string} uid - User ID
 * @returns {Promise<Object>} - User's movie lists
 */
export const getUserMovieLists = async (uid) => {
  try {
    // Get watchlist items
    const watchlistQuery = query(
      collection(db, 'users', uid, 'movies'),
      where('listType', '==', 'watchlist')
    );
    
    // Get watched items
    const watchedQuery = query(
      collection(db, 'users', uid, 'movies'),
      where('listType', '==', 'watched')
    );
    
    // Get favorites items
    const favoritesQuery = query(
      collection(db, 'users', uid, 'movies'),
      where('listType', '==', 'favorites'),
      orderBy('favoriteRank')
    );
    
    // Execute queries in parallel
    const [watchlistSnapshot, watchedSnapshot, favoritesSnapshot] = await Promise.all([
      getDocs(watchlistQuery),
      getDocs(watchedQuery),
      getDocs(favoritesQuery)
    ]);
    
    // Process results
    const watchlist = watchlistSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const watched = watchedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const favorites = favoritesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      watchlist,
      watched,
      favorites
    };
  } catch (error) {
    console.error('Error getting user movie lists:', error);
    throw error;
  }
};

/**
 * Add movie to watchlist
 * @param {string} uid - User ID
 * @param {object} movie - Movie data
 * @returns {Promise} - Movie ID
 */
export const addToWatchlist = async (uid, movie) => {
  try {
    const movieId = movie.id.toString();
    const movieRef = doc(db, 'users', uid, 'movies', movieId);
    
    // Check if movie already exists in user's collection
    const movieDoc = await getDoc(movieRef);
    
    if (movieDoc.exists()) {
      // Update existing movie document
      await updateDoc(movieRef, {
        listType: 'watchlist',
        addedAt: Timestamp.now(),
        // Keep existing fields like userRating if present
        ...movieDoc.data(),
        ...movie
      });
    } else {
      // Create new movie document
      await setDoc(movieRef, {
        ...movie,
        listType: 'watchlist',
        addedAt: Timestamp.now(),
        userRating: 0,
        userReview: '',
        watched: false,
        favorite: false,
        favoriteRank: null
      });
      
      // Increment watchlist count
      await updateDoc(doc(db, 'users', uid), {
        'movieCount.watchlist': increment(1)
      });
    }
    
    return movieId;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

/**
 * Remove movie from lists
 * @param {string} uid - User ID
 * @param {string} movieId - Movie ID
 * @returns {Promise} - Void
 */
export const removeMovie = async (uid, movieId) => {
  try {
    const movieRef = doc(db, 'users', uid, 'movies', movieId.toString());
    
    // Get the movie document to determine its list type
    const movieDoc = await getDoc(movieRef);
    
    if (movieDoc.exists()) {
      const { listType, favorite } = movieDoc.data();
      
      // Delete the movie document
      await deleteDoc(movieRef);
      
      // Update counts
      const updateData = {};
      
      if (listType === 'watchlist') {
        updateData['movieCount.watchlist'] = increment(-1);
      } else if (listType === 'watched') {
        updateData['movieCount.watched'] = increment(-1);
      }
      
      if (favorite) {
        updateData['movieCount.favorites'] = increment(-1);
      }
      
      await updateDoc(doc(db, 'users', uid), updateData);
      
      // If it was a favorite, reorder other favorites
      if (favorite) {
        await reorderFavorites(uid);
      }
    }
  } catch (error) {
    console.error('Error removing movie:', error);
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
    const movieRef = doc(db, 'users', uid, 'movies', movieId.toString());
    
    // Get the movie document
    const movieDoc = await getDoc(movieRef);
    
    if (movieDoc.exists()) {
      const movieData = movieDoc.data();
      const oldListType = movieData.listType;
      const newListType = watched ? 'watched' : 'watchlist';
      
      // Update the movie document
      await updateDoc(movieRef, {
        watched,
        listType: newListType,
        watchedAt: watched ? Timestamp.now() : null
      });
      
      // Only update counts if list type is changing
      if (oldListType !== newListType) {
        const updates = {};
        
        if (oldListType === 'watchlist') {
          updates['movieCount.watchlist'] = increment(-1);
        } else if (oldListType === 'watched') {
          updates['movieCount.watched'] = increment(-1);
        }
        
        if (newListType === 'watchlist') {
          updates['movieCount.watchlist'] = increment(1);
        } else if (newListType === 'watched') {
          updates['movieCount.watched'] = increment(1);
        }
        
        await updateDoc(doc(db, 'users', uid), updates);
      }
    }
  } catch (error) {
    console.error('Error marking movie as watched:', error);
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
    const movieRef = doc(db, 'users', uid, 'movies', movieId.toString());
    
    // Get the movie document
    const movieDoc = await getDoc(movieRef);
    
    if (movieDoc.exists()) {
      const movieData = movieDoc.data();
      const oldListType = movieData.listType;
      
      // Update the movie document
      await updateDoc(movieRef, {
        userRating: rating,
        userReview: review,
        watched: true,
        listType: 'watched',
        ratedAt: Timestamp.now(),
        watchedAt: movieData.watchedAt || Timestamp.now()
      });
      
      // Only update counts if list type is changing
      if (oldListType !== 'watched') {
        const updates = {};
        
        if (oldListType === 'watchlist') {
          updates['movieCount.watchlist'] = increment(-1);
          updates['movieCount.watched'] = increment(1);
        }
        
        await updateDoc(doc(db, 'users', uid), updates);
      }
      
      // Add to user's reviews collection (for social features)
      if (rating > 0 || review.trim() !== '') {
        await setDoc(doc(db, 'users', uid, 'reviews', movieId.toString()), {
          movieId: movieId.toString(),
          movie: {
            id: movieData.id,
            title: movieData.title,
            year: movieData.year,
            posterUrl: movieData.posterUrl,
            genres: movieData.genre || []
          },
          rating,
          review,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          likes: 0,
          visibility: 'friends' // 'public', 'friends', 'private'
        });
      } else {
        // Remove review if rating and review are both empty
        try {
          await deleteDoc(doc(db, 'users', uid, 'reviews', movieId.toString()));
        } catch (e) {
          // Ignore if review doesn't exist
        }
      }
    }
  } catch (error) {
    console.error('Error rating movie:', error);
    throw error;
  }
};

/**
 * Toggle favorite status for a movie
 * @param {string} uid - User ID
 * @param {string} movieId - Movie ID
 * @returns {Promise<boolean>} - New favorite status
 */
export const toggleFavorite = async (uid, movieId) => {
  try {
    const movieRef = doc(db, 'users', uid, 'movies', movieId.toString());
    
    // Get the movie document
    const movieDoc = await getDoc(movieRef);
    
    if (movieDoc.exists()) {
      const movieData = movieDoc.data();
      const currentFavorite = movieData.favorite || false;
      const newFavorite = !currentFavorite;
      
      // Get current favorite count
      const userDoc = await getDoc(doc(db, 'users', uid));
      const favoriteCount = userDoc.data().movieCount?.favorites || 0;
      
      // Check if adding would exceed max favorites (5)
      if (newFavorite && favoriteCount >= 5) {
        throw new Error('Maximum of 5 favorites allowed');
      }
      
      // Get new rank if adding to favorites
      let newRank = null;
      if (newFavorite) {
        // Get highest current rank
        const favoritesQuery = query(
          collection(db, 'users', uid, 'movies'),
          where('favorite', '==', true)
        );
        
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const ranks = favoritesSnapshot.docs.map(doc => doc.data().favoriteRank || 0);
        newRank = ranks.length > 0 ? Math.max(...ranks) + 1 : 1;
      }
      
      // Update the movie document
      await updateDoc(movieRef, {
        favorite: newFavorite,
        favoriteRank: newFavorite ? newRank : null
      });
      
      // Update favorite count
      await updateDoc(doc(db, 'users', uid), {
        'movieCount.favorites': increment(newFavorite ? 1 : -1)
      });
      
      return newFavorite;
    }
    
    return false;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

/**
 * Reorder favorites after changes
 * @param {string} uid - User ID
 * @param {array} orderedIds - Optional array of movie IDs in desired order
 * @returns {Promise} - Void
 */
export const reorderFavorites = async (uid, orderedIds = null) => {
  try {
    // Get current favorites
    const favoritesQuery = query(
      collection(db, 'users', uid, 'movies'),
      where('favorite', '==', true)
    );
    
    const favoritesSnapshot = await getDocs(favoritesQuery);
    
    if (favoritesSnapshot.empty) {
      return; // No favorites to reorder
    }
    
    const batch = writeBatch(db);
    
    if (orderedIds) {
      // Use provided order
      orderedIds.forEach((movieId, index) => {
        const movieRef = doc(db, 'users', uid, 'movies', movieId.toString());
        batch.update(movieRef, { favoriteRank: index + 1 });
      });
    } else {
      // Auto-reorder (fill gaps)
      const favorites = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => (a.favoriteRank || 999) - (b.favoriteRank || 999));
      
      favorites.forEach((movie, index) => {
        const movieRef = doc(db, 'users', uid, 'movies', movie.id.toString());
        batch.update(movieRef, { favoriteRank: index + 1 });
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error reordering favorites:', error);
    throw error;
  }
};

// Friend Functions

/**
 * Send friend request
 * @param {string} senderUid - Sender user ID
 * @param {string} receiverUid - Receiver user ID
 * @returns {Promise} - Void
 */
export const sendFriendRequest = async (senderUid, receiverUid) => {
  try {
    // Check if users are already friends
    const senderDoc = await getDoc(doc(db, 'users', senderUid));
    const receiverDoc = await getDoc(doc(db, 'users', receiverUid));
    
    if (!senderDoc.exists() || !receiverDoc.exists()) {
      throw new Error('User not found');
    }
    
    const senderFriends = senderDoc.data().friends || [];
    
    if (senderFriends.includes(receiverUid)) {
      throw new Error('Already friends with this user');
    }
    
    // Check if request is already pending
    const senderSentRequests = senderDoc.data().sentRequests || [];
    const receiverPendingRequests = receiverDoc.data().pendingRequests || [];
    
    if (senderSentRequests.includes(receiverUid) || receiverPendingRequests.includes(senderUid)) {
      throw new Error('Friend request already sent');
    }
    
    // Start a batch write
    const batch = writeBatch(db);
    
    // Add to sender's sent requests
    batch.update(doc(db, 'users', senderUid), {
      sentRequests: arrayUnion(receiverUid)
    });
    
    // Add to receiver's pending requests
    batch.update(doc(db, 'users', receiverUid), {
      pendingRequests: arrayUnion(senderUid)
    });
    
    // Create a notification for the receiver
    const notificationRef = doc(collection(db, 'users', receiverUid, 'notifications'));
    batch.set(notificationRef, {
      type: 'friendRequest',
      from: senderUid,
      createdAt: Timestamp.now(),
      read: false
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error sending friend request:', error);
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
    // Verify the request exists
    const accepterDoc = await getDoc(doc(db, 'users', accepterUid));
    
    if (!accepterDoc.exists()) {
      throw new Error('User not found');
    }
    
    const pendingRequests = accepterDoc.data().pendingRequests || [];
    
    if (!pendingRequests.includes(requesterUid)) {
      throw new Error('No pending request from this user');
    }
    
    // Start a batch write
    const batch = writeBatch(db);
    
    // Add each user to the other's friends list
    batch.update(doc(db, 'users', accepterUid), {
      friends: arrayUnion(requesterUid),
      pendingRequests: arrayRemove(requesterUid)
    });
    
    batch.update(doc(db, 'users', requesterUid), {
      friends: arrayUnion(accepterUid),
      sentRequests: arrayRemove(accepterUid)
    });
    
    // Create a notification for the requester
    const notificationRef = doc(collection(db, 'users', requesterUid, 'notifications'));
    batch.set(notificationRef, {
      type: 'friendRequestAccepted',
      from: accepterUid,
      createdAt: Timestamp.now(),
      read: false
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error accepting friend request:', error);
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
    // Start a batch write
    const batch = writeBatch(db);
    
    batch.update(doc(db, 'users', declinerUid), {
      pendingRequests: arrayRemove(requesterUid)
    });
    
    batch.update(doc(db, 'users', requesterUid), {
      sentRequests: arrayRemove(declinerUid)
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
};

/**
 * Get friend requests
 * @param {string} uid - User ID
 * @returns {Promise<Object>} - Friend requests
 */
export const getFriendRequests = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const pendingRequests = userData.pendingRequests || [];
    const sentRequests = userData.sentRequests || [];
    
    // Get profiles for pending requests
    const pendingProfiles = [];
    for (const requesterId of pendingRequests) {
      const requesterDoc = await getDoc(doc(db, 'users', requesterId));
      if (requesterDoc.exists()) {
        const { displayName, username, photoURL, bio } = requesterDoc.data();
        pendingProfiles.push({
          uid: requesterId,
          displayName,
          username,
          photoURL,
          bio
        });
      }
    }
    
    // Get profiles for sent requests
    const sentProfiles = [];
    for (const receiverId of sentRequests) {
      const receiverDoc = await getDoc(doc(db, 'users', receiverId));
      if (receiverDoc.exists()) {
        const { displayName, username, photoURL, bio } = receiverDoc.data();
        sentProfiles.push({
          uid: receiverId,
          displayName,
          username,
          photoURL,
          bio
        });
      }
    }
    
    return {
      pending: pendingProfiles,
      sent: sentProfiles
    };
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
};

/**
 * Get user's friends
 * @param {string} uid - User ID
 * @returns {Promise<Array>} - Array of friend profiles
 */
export const getUserFriends = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const friendsList = userData.friends || [];
    
    // Get profiles for friends
    const friendProfiles = [];
    for (const friendId of friendsList) {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        const friendData = friendDoc.data();
        friendProfiles.push({
          uid: friendId,
          displayName: friendData.displayName,
          username: friendData.username,
          photoURL: friendData.photoURL,
          bio: friendData.bio,
          favoriteGenres: friendData.favoriteGenres || []
        });
      }
    }
    
    return friendProfiles;
  } catch (error) {
    console.error('Error getting user friends:', error);
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
    const batch = writeBatch(db);
    
    batch.update(doc(db, 'users', uid1), {
      friends: arrayRemove(uid2)
    });
    
    batch.update(doc(db, 'users', uid2), {
      friends: arrayRemove(uid1)
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

// Recommendation Functions

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
    const batch = writeBatch(db);
    
    // Get sender info for the recommendation
    const senderDoc = await getDoc(doc(db, 'users', senderUid));
    const senderData = senderDoc.data();
    
    const senderInfo = {
      uid: senderUid,
      displayName: senderData.displayName,
      username: senderData.username,
      photoURL: senderData.photoURL
    };
    
    // Simplified movie data
    const movieInfo = {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      posterUrl: movie.posterUrl,
      genre: movie.genre || [],
      rating: movie.rating
    };
    
    // Only process up to 10 receivers at a time to stay within Firestore limits
    const processedReceivers = receiverUids.slice(0, 10);
    
    for (const receiverUid of processedReceivers) {
      // Make sure receiver exists and accepts recommendations
      const receiverDoc = await getDoc(doc(db, 'users', receiverUid));
      if (!receiverDoc.exists()) {
        continue;
      }
      
      const receiverData = receiverDoc.data();
      
      // Check privacy settings
      const recommendationsPrivacy = receiverData.settings?.recommendationsPrivacy || 'friends';
      
      if (recommendationsPrivacy === 'nobody') {
        continue; // Skip this user
      }
      
      if (recommendationsPrivacy === 'friends') {
        // Verify friendship
        const friends = receiverData.friends || [];
        if (!friends.includes(senderUid)) {
          continue; // Skip non-friends
        }
      }
      
      // Create recommendation
      const recRef = doc(collection(db, 'users', receiverUid, 'recommendations'));
      batch.set(recRef, {
        id: recRef.id,
        sender: senderInfo,
        movie: movieInfo,
        message,
        timestamp,
        read: false
      });
      
      // Create notification
      const notifRef = doc(collection(db, 'users', receiverUid, 'notifications'));
      batch.set(notifRef, {
        id: notifRef.id,
        type: 'recommendation',
        from: senderInfo,
        movieId: movie.id,
        movieTitle: movie.title,
        createdAt: timestamp,
        read: false
      });
      
      // Add recommendation to sender's sent history
      const sentRecRef = doc(collection(db, 'users', senderUid, 'sentRecommendations'));
      batch.set(sentRecRef, {
        receiverUid,
        receiverName: receiverData.displayName,
        movie: movieInfo,
        message,
        timestamp
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error recommending movie:', error);
    throw error;
  }
};

/**
 * Get movie recommendations
 * @param {string} uid - User ID
 * @returns {Promise<Array>} - Array of recommendations
 */
export const getRecommendations = async (uid) => {
  try {
    const recommendationsRef = collection(db, 'users', uid, 'recommendations');
    const recommendationsQuery = query(
      recommendationsRef,
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const recommendationsSnapshot = await getDocs(recommendationsQuery);
    
    return recommendationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recommendations:', error);
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
    console.error('Error marking recommendation as read:', error);
    throw error;
  }
};

/**
 * Get user's notifications
 * @param {string} uid - User ID
 * @returns {Promise<Array>} - Array of notifications
 */
export const getNotifications = async (uid) => {
  try {
    const notificationsRef = collection(db, 'users', uid, 'notifications');
    const notificationsQuery = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    return notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} uid - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise} - Void
 */
export const markNotificationAsRead = async (uid, notificationId) => {
  try {
    await updateDoc(doc(db, 'users', uid, 'notifications', notificationId), {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @param {string} uid - User ID
 * @returns {Promise} - Void
 */
export const markAllNotificationsAsRead = async (uid) => {
  try {
    const notificationsRef = collection(db, 'users', uid, 'notifications');
    const unreadQuery = query(
      notificationsRef,
      where('read', '==', false)
    );
    
    const unreadSnapshot = await getDocs(unreadQuery);
    
    const batch = writeBatch(db);
    unreadSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
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
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Movie Recommendation Engine Integration

/**
 * Get personalized movie recommendations for a user
 * @param {string} uid - User ID
 * @param {object} filters - Optional filters
 * @returns {Promise<Array>} - Array of recommended movies
 */
export const getPersonalizedRecommendations = async (uid, filters = {}) => {
  try {
    // Import the recommendation engine
    const recommendationEngine = await import('./RecommendationEngine');
    
    // Get user profile data
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    
    // Get user's movie lists
    const movieLists = await getUserMovieLists(uid);
    
    // Call the recommendation engine
    try {
      if (import.meta.env.VITE_TMDB_API_KEY) {
        const recommendations = await recommendationEngine.getPersonalizedRecommendations(
          uid, userData, movieLists, filters
        );
        
        if (recommendations && recommendations.length > 0) {
          // Log recommendations for analytics (optional)
          try {
            const recommendationLog = {
              userId: uid,
              timestamp: Timestamp.now(),
              filtersCriteria: filters,
              recommendationCount: recommendations.length,
              topRecommendedIds: recommendations.slice(0, 10).map(movie => movie.id)
            };
            
            await addDoc(collection(db, 'recommendationLogs'), recommendationLog);
          } catch (err) {
            console.error('Error logging recommendations:', err);
            // Continue even if logging fails
          }
          
          return recommendations;
        }
      }
    } catch (error) {
      console.error('Error using recommendation engine:', error);
      // Fall back to simple recommendations
    }
    
    // Fall back to a simpler recommendation algorithm
    return getSimpleRecommendations(userData, movieLists, filters);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    
    // Fallback to sample data in case of error
    const { sampleMovies } = await import('../data/sampleData');
    return sampleMovies;
  }
};

/**
 * Simplified recommendation algorithm as fallback
 * @param {object} userData - User profile data
 * @param {object} movieLists - User's movie lists
 * @param {object} filters - Optional filters
 * @returns {Promise<Array>} - Array of recommended movies
 */
async function getSimpleRecommendations(userData, movieLists, filters = {}) {
  try {
    // Get favorite genres from profile or extract from watch history
    let favoriteGenres = userData.favoriteGenres || [];
    
    // Extract genres from rated movies if user hasn't set preferences
    if (favoriteGenres.length === 0 && movieLists.watched.length > 0) {
      const genreCounts = {};
      
      movieLists.watched.forEach(movie => {
        const genres = movie.genre || [];
        genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + (movie.userRating ? movie.userRating / 5 : 0.5);
        });
      });
      
      // Get top genres
      favoriteGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre]) => genre);
    }
    
    // Try to get movies from API if key is available
    try {
      if (import.meta.env.VITE_TMDB_API_KEY) {
        // Import movie service functions
        const { getTrendingMovies, getMoviesByGenre, getGenres } = await import('./movieService');
        
        // Get genre IDs
        const genres = await getGenres();
        const genreMap = {};
        genres.forEach(genre => {
          genreMap[genre.name.toLowerCase()] = genre.id;
        });
        
        let movies = [];
        
        // If we have favorite genres, get movies for those genres
        if (favoriteGenres.length > 0) {
          for (const genre of favoriteGenres) {
            const genreId = genreMap[genre.toLowerCase()];
            if (genreId) {
              const genreMovies = await getMoviesByGenre(genreId);
              if (genreMovies.length > 0) {
                movies = [...movies, ...genreMovies];
                break; // Stop after getting movies for one genre
              }
            }
          }
        }
        
        // If no genre movies found, use trending
        if (movies.length === 0) {
          movies = await getTrendingMovies();
        }
        
        // Filter out duplicates
        const uniqueMovies = [];
        const movieIds = new Set();
        
        for (const movie of movies) {
          if (!movieIds.has(movie.id.toString())) {
            movieIds.add(movie.id.toString());
            uniqueMovies.push(movie);
          }
        }
        
        // Filter out movies in user's lists
        const userMovieIds = new Set([
          ...movieLists.watchlist.map(m => m.id.toString()),
          ...movieLists.watched.map(m => m.id.toString())
        ]);
        
        let filteredMovies = uniqueMovies.filter(movie => !userMovieIds.has(movie.id.toString()));
        
        // Apply basic filters
        if (filters.genres && filters.genres.length > 0) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.genre && movie.genre.some(g => filters.genres.includes(g))
          );
        }
        
        if (filters.minRating) {
          filteredMovies = filteredMovies.filter(movie => movie.rating >= filters.minRating);
        }
        
        if (filters.yearRange) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.year >= filters.yearRange[0] && movie.year <= filters.yearRange[1]
          );
        }
        
        if (filters.services && filters.services.length > 0) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.streamingOn && movie.streamingOn.some(s => filters.services.includes(s))
          );
        }
        
        return filteredMovies;
      }
    } catch (error) {
      console.error('Error getting movies from API:', error);
      // Fall back to sample data
    }
    
    // If all else fails, use sample data
    const { sampleMovies } = await import('../data/sampleData');
    
    let recommendedMovies = [...sampleMovies];
    
    // Apply filters
    if (filters.genres && filters.genres.length > 0) {
      recommendedMovies = recommendedMovies.filter(movie => 
        movie.genre && movie.genre.some(g => filters.genres.includes(g))
      );
    }
    
    if (filters.services && filters.services.length > 0) {
      recommendedMovies = recommendedMovies.filter(movie => 
        movie.streamingOn && movie.streamingOn.some(s => filters.services.includes(s))
      );
    }
    
    if (filters.minRating) {
      recommendedMovies = recommendedMovies.filter(movie => movie.rating >= filters.minRating);
    }
    
    if (filters.yearRange) {
      recommendedMovies = recommendedMovies.filter(movie => 
        movie.year >= filters.yearRange[0] && movie.year <= filters.yearRange[1]
      );
    }
    
    // Filter out movies in user's lists
    const userMovieIds = new Set([
      ...movieLists.watchlist.map(m => m.id.toString()),
      ...movieLists.watched.map(m => m.id.toString())
    ]);
    
    recommendedMovies = recommendedMovies.filter(movie => !userMovieIds.has(movie.id.toString()));
    
    return recommendedMovies;
  } catch (error) {
    console.error('Error getting simple recommendations:', error);
    
    // Return empty array as last resort
    return [];
  }
}

// Export Firebase instances
export { auth, db, storage };