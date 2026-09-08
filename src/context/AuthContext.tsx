import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User, Role } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  devLogin: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  logout: async () => {},
  hasRole: () => false,
  devLogin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Add timeout so it doesn't hang if Firestore is offline
          const userDocRef = doc(db, 'users', user.uid);
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
          const userDoc: any = await Promise.race([
            getDoc(userDocRef),
            timeoutPromise
          ]);

          if (userDoc && userDoc.exists()) {
            setUserData(userDoc.data() as User);
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const hasRole = (roles: Role[]) => {
    if (!userData) return false;
    // SUPER_ADMIN has access to everything
    if (userData.role === 'SUPER_ADMIN') return true;
    return roles.includes(userData.role);
  };

  const devLogin = (role: Role) => {
    // Mock user for UI testing without real Firebase
    setCurrentUser({ uid: 'dev-mock-uid', email: 'dev@mosje.gov.in' } as FirebaseUser);
    setUserData({
      id: 'dev-mock-uid',
      uid: 'dev-mock-uid',
      email: 'dev@mosje.gov.in',
      name: `Dev ${role}`,
      role: role,
      status: 'ACTIVE',
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    });
  };

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, logout, hasRole, devLogin }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
