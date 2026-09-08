import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Ensure configuration is present
if (!firebaseConfig.apiKey) {
  throw new Error("Firebase configuration is missing! Please ensure your .env file is set up correctly.");
}

let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // Enable App Check debug token in local development
  if (import.meta.env.DEV) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  // Initialize App Check only if running in a browser environment
  if (typeof window !== 'undefined') {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (siteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
    } else {
      console.warn("App Check skipped: VITE_RECAPTCHA_SITE_KEY is not defined.");
    }
  }
} catch (error) {
  console.error("Firebase initialization error", error);
  throw error;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

