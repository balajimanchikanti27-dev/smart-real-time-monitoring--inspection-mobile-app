import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User, Role } from '../types';

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  role: Role;
  organizationId?: string;
  phone?: string;
  state?: string;
  district?: string;
  photoURL?: string;
}

/**
 * Registers a new user with Firebase Auth and creates their profile in Firestore.
 */
export const registerUser = async (data: RegisterUserData): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    const userDoc: Partial<User> = {
      id: user.uid,
      uid: user.uid,
      email: data.email,
      name: data.name,
      role: data.role,
      status: 'ACTIVE',
      organizationId: data.organizationId || '',
      phone: data.phone || '',
      state: data.state || '',
      district: data.district || '',
      photoURL: data.photoURL || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Include server timestamp separately as it cannot be typed as string cleanly without 'any' in frontend types
    const firestoreData = {
      ...userDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), firestoreData);

    return userDoc as User;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw new Error(error.message || 'Failed to register user.');
  }
};

/**
 * Logs in a user and retrieves their Firestore profile.
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      throw new Error('User profile not found in database.');
    }

    const userData = userSnapshot.data() as User;
    
    if (userData.status === 'INACTIVE' || userData.status === 'SUSPENDED') {
      await signOut(auth);
      throw new Error('This account has been disabled or suspended.');
    }

    return userData;
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw new Error(error.message || 'Failed to log in. Please check your credentials.');
  }
};

/**
 * Logs out the current user.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error logging out:', error);
    throw new Error(error.message || 'Failed to log out.');
  }
};

/**
 * Sends a password reset email.
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.message || 'Failed to send password reset email.');
  }
};

/**
 * Gets the current user's Firestore profile if authenticated.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDocRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) return null;
    return userSnapshot.data() as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Listens to authentication state changes.
 */
export const onAuthStateChanged = (
  callback: (user: User | null, firebaseUser: FirebaseUser | null) => void
) => {
  return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          callback(userSnapshot.data() as User, firebaseUser);
        } else {
          callback(null, firebaseUser);
        }
      } catch (error) {
        console.error('Error in auth state change listener:', error);
        callback(null, firebaseUser);
      }
    } else {
      callback(null, null);
    }
  });
};

