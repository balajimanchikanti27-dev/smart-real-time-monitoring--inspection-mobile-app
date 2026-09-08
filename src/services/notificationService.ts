import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs, 
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Notification } from '../types';

const COLLECTION_NAME = 'notifications';

export const createNotification = async (
  notificationData: Omit<Notification, 'id' | 'read' | 'createdAt'>
) => {
  const newNotification = {
    ...notificationData,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newNotification);
  return { id: docRef.id, ...newNotification } as Notification;
};

/**
 * Listens to a user's notifications in real-time.
 * Returns an unsubscribe function to stop listening.
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    callback(notifications);
  }, (error) => {
    console.error("Error listening to notifications:", error);
  });
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

export const markAsRead = async (notificationId: string) => {
  const docRef = doc(db, COLLECTION_NAME, notificationId);
  await updateDoc(docRef, { read: true });
};

export const markAllAsRead = async (userId: string) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
};

export const deleteNotification = async (notificationId: string) => {
  const docRef = doc(db, COLLECTION_NAME, notificationId);
  await deleteDoc(docRef);
};

/**
 * Listens to unread count in real-time.
 */
export const subscribeToUnreadCount = (
  userId: string,
  callback: (count: number) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  }, (error) => {
    console.error("Error listening to unread count:", error);
  });
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};
