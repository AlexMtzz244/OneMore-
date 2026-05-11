import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  Auth
} from 'firebase/auth';

// Firebase configuration with your credentials
const firebaseConfig = {
  apiKey: "AIzaSyB381DMu-0XKvFvHA-_of80BuNXkTndUws",
  authDomain: "onemore-843b8.firebaseapp.com",
  projectId: "onemore-843b8",
  storageBucket: "onemore-843b8.firebasestorage.app",
  messagingSenderId: "487770302561",
  appId: "1:487770302561:web:c841ad0ea78cfc12fae220",
  measurementId: "G-MGL0YR4RJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth: Auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to LOCAL by default (user stays logged in across sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting persistence:', error);
});

export { app, auth, db };
