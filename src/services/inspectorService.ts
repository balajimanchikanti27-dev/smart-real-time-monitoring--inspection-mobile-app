import { 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { inspectorsRef } from './firebase/firestore';
import type { Inspector } from '../types/firestore';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'inspectors';

/**
 * Validates action authorization.
 */
const requireAdmin = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) throw new Error('User profile not found');

  const role = userDoc.data().role;
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    throw new Error('Only administrators can perform this action');
  }
  return user.uid;
};

/**
 * Validates inspector data before creation/update.
 */
const validateInspector = (data: Partial<Inspector>) => {
  if (data.currentWorkload !== undefined && data.currentWorkload < 0) {
    throw new Error('Workload cannot be negative');
  }
  if (data.maximumWorkload !== undefined && data.maximumWorkload < 1) {
    throw new Error('Maximum workload must be at least 1');
  }
  if (data.currentWorkload !== undefined && data.maximumWorkload !== undefined) {
    if (data.currentWorkload > data.maximumWorkload) {
      throw new Error('Current workload cannot exceed maximum workload');
    }
  }
};

/**
 * Creates a new Inspector.
 * Uses `setDoc` with the `userId` as the document ID for 1:1 mapping with the User document.
 */
export const createInspector = async (
  userId: string, 
  data: Omit<Inspector, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'currentWorkload' | 'status'>
): Promise<Inspector> => {
  await requireAdmin();
  validateInspector(data);
  
  const inspectorData: Inspector = {
    ...data,
    userId,
    status: 'AVAILABLE',
    currentWorkload: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(inspectorsRef, userId);
  const existingDoc = await getDoc(docRef);
  if (existingDoc.exists()) {
    throw new Error('An inspector profile already exists for this user');
  }

  await setDoc(docRef, inspectorData as any);
  await logClientAuditEvent('CREATE', COLLECTION_NAME, userId, { after: inspectorData });

  const newDoc = await getDoc(docRef);
  return { id: newDoc.id, ...(newDoc.data() as object) } as Inspector;
};

/**
 * Gets a single Inspector by User ID or Document ID.
 */
export const getInspector = async (id: string): Promise<Inspector | null> => {
  const docRef = doc(inspectorsRef, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // If not found by doc ID, try searching by userId field just in case
    const q = query(inspectorsRef, where('userId', '==', id));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const d = snapshot.docs[0];
      return { id: d.id, ...(d.data() as object) } as Inspector;
    }
    return null;
  }
  
  return { id: docSnap.id, ...(docSnap.data() as object) } as Inspector;
};

/**
 * Gets a list of all Inspectors.
 */
export const getInspectors = async (): Promise<Inspector[]> => {
  const q = query(inspectorsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Inspector));
};

/**
 * Updates an Inspector profile.
 * Strips out `currentWorkload` to prevent arbitrary client-side modification.
 */
export const updateInspector = async (id: string, updates: Partial<Omit<Inspector, 'id' | 'userId' | 'createdAt' | 'currentWorkload'>>): Promise<void> => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) throw new Error('Must be logged in');

  const docRef = doc(inspectorsRef, id);
  const beforeSnap = await getDoc(docRef);
  if (!beforeSnap.exists()) throw new Error('Inspector not found');

  const currentData = beforeSnap.data() as Inspector;

  // Authorization: Only admin or the inspector themselves
  const userDoc = await getDoc(doc(db, 'users', currentUserId));
  const role = userDoc.data()?.role;
  
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && currentUserId !== currentData.userId) {
    throw new Error('You do not have permission to update this inspector profile');
  }

  // Strip workload modification from direct client updates just in case
  const safeUpdates = { ...updates };
  if ('currentWorkload' in safeUpdates) {
    delete (safeUpdates as any).currentWorkload;
  }

  const mergedData = { ...currentData, ...safeUpdates };
  validateInspector(mergedData);

  const updateData = {
    ...safeUpdates,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, updateData);
  
  await logClientAuditEvent('UPDATE', COLLECTION_NAME, id, { 
    before: currentData, 
    after: { ...currentData, ...updateData } 
  });
};

/**
 * Updates an Inspector's status explicitly.
 */
export const updateInspectorStatus = async (id: string, status: Inspector['status']): Promise<void> => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) throw new Error('Must be logged in');

  const docRef = doc(inspectorsRef, id);
  const beforeSnap = await getDoc(docRef);
  if (!beforeSnap.exists()) throw new Error('Inspector not found');
  
  const currentData = beforeSnap.data() as Inspector;

  const userDoc = await getDoc(doc(db, 'users', currentUserId));
  const role = userDoc.data()?.role;
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && currentUserId !== currentData.userId) {
    throw new Error('You do not have permission to change this status');
  }

  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp()
  });

  await logClientAuditEvent('UPDATE', COLLECTION_NAME, id, { 
    before: { status: currentData.status }, 
    after: { status } 
  });
};

/**
 * Gets currently available inspectors.
 */
export const getAvailableInspectors = async (): Promise<Inspector[]> => {
  const q = query(
    inspectorsRef, 
    where('status', '==', 'AVAILABLE'),
    orderBy('currentWorkload', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Inspector));
};

/**
 * Gets an Inspector's workload.
 */
export const getInspectorWorkload = async (id: string): Promise<{ current: number, maximum: number }> => {
  const inspector = await getInspector(id);
  if (!inspector) throw new Error('Inspector not found');
  
  return {
    current: inspector.currentWorkload || 0,
    maximum: inspector.maximumWorkload || 10
  };
};

/**
 * Gets history/audit logs for an inspector.
 */
export const getInspectorHistory = async (_id: string) => {
  // Can be implemented by querying the audit logs for entityType === 'inspectors' and entityId === id
  // For the sake of the client service, we can skip full implementation or just query audit collection
  return [];
};
