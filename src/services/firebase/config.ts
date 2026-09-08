import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';

/*
 * FIREBASE CONFIGURATION INSTRUCTIONS
 * ===================================
 * 1. Go to the Firebase Console (console.firebase.google.com).
 * 2. Create a new project or open an existing one.
 * 3. Add a Web App to your project to get your configuration keys.
 * 4. Create a `.env` file in the root of your project (copy from `.env.example`).
 * 5. Paste the keys into the corresponding `VITE_FIREBASE_*` variables.
 * 
 * NOTE: Do not hardcode credentials in this file. They will be exposed in version control.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment1234567890",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Initialize Firebase only if it hasn't been initialized already
let app: FirebaseApp;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase App initialized successfully:", app.name);
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // This helps catch issues if environment variables are missing
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.warn("WARNING: Firebase API Key is missing. Ensure your .env file is set up correctly.");
  }
}

export { app };
