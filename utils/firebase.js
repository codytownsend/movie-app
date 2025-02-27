// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVZBoYmoCLUS7C20EYrmxfGJpw5Lm-PGs",
  authDomain: "movie-app-36324.firebaseapp.com",
  projectId: "movie-app-36324",
  storageBucket: "movie-app-36324.firebasestorage.app",
  messagingSenderId: "86056384497",
  appId: "1:86056384497:web:56acf189964eb0a1777650"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth functions
export const signUpWithEmail = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: userData.displayName || '',
      preferences: {
        genres: [],
        decades: [],
        moods: []
      },
      ratings: [],
      watchlist: [],
      createdAt: new Date(),
      ...userData
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// User profile functions
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    throw error;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      "preferences": preferences
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Movie functions
export const addMovieRating = async (userId, movieId, rating) => {
  try {
    // Check if rating already exists
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("userId", "==", userId),
      where("movieId", "==", movieId)
    );
    
    const querySnapshot = await getDocs(ratingsQuery);
    
    if (!querySnapshot.empty) {
      // Update existing rating
      const ratingDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "ratings", ratingDoc.id), {
        rating,
        updatedAt: new Date()
      });
    } else {
      // Add new rating
      await addDoc(collection(db, "ratings"), {
        userId,
        movieId,
        rating,
        createdAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

export const addToWatchlist = async (userId, movieId, movieDetails) => {
  try {
    await addDoc(collection(db, "watchlist"), {
      userId,
      movieId,
      movieDetails,
      addedAt: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

export { auth, db, storage };
export default app;