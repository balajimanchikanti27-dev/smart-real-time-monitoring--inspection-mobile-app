import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  onSnapshot, 
  serverTimestamp, 
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { NGO } from '../types/firestore';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'ngos';

export interface NGOFilters {
  state?: string;
  district?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';
  searchQuery?: string;
}

export interface PaginationParams {
  pageSize: number;
  lastVisible?: any;
}

/**
 * Creates a new NGO.
 */
export const createNGO = async (data: Omit<NGO, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<NGO> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in to create an NGO');

  const ngoData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user.uid,
    updatedBy: user.uid,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), ngoData);
  
  await logClientAuditEvent('CREATE', COLLECTION_NAME, docRef.id, { after: ngoData });

  const newDoc = await getDoc(docRef);
  return { id: newDoc.id, ...newDoc.data() } as NGO;
};

/**
 * Gets a single NGO by ID.
 */
export const getNGO = async (id: string): Promise<NGO | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as NGO;
};

/**
 * Gets a paginated list of NGOs with optional filters.
 */
export const getNGOs = async (
  filters?: NGOFilters,
  pagination?: PaginationParams
): Promise<{ ngos: NGO[], lastVisible: any }> => {
  
  const constraints: QueryConstraint[] = [];

  // Apply filters
  if (filters?.state) constraints.push(where('state', '==', filters.state));
  if (filters?.district) constraints.push(where('district', '==', filters.district));
  if (filters?.status) constraints.push(where('status', '==', filters.status));

  // Basic search workaround using prefix matching on 'name'
  if (filters?.searchQuery) {
    constraints.push(where('name', '>=', filters.searchQuery));
    constraints.push(where('name', '<=', filters.searchQuery + '\uf8ff'));
  }

  // Always order by createdAt for stable pagination (unless searching by name)
  if (filters?.searchQuery) {
    constraints.push(orderBy('name'));
  } else {
    constraints.push(orderBy('createdAt', 'desc'));
  }

  // Apply pagination
  if (pagination?.pageSize) constraints.push(limit(pagination.pageSize));
  if (pagination?.lastVisible) constraints.push(startAfter(pagination.lastVisible));

  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  const snapshot = await getDocs(q);

  const ngos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NGO));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return { ngos, lastVisible };
};

/**
 * Updates an NGO.
 */
export const updateNGO = async (id: string, updates: Partial<Omit<NGO, 'id' | 'createdAt' | 'createdBy'>>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in to update an NGO');

  const docRef = doc(db, COLLECTION_NAME, id);
  const beforeSnap = await getDoc(docRef);
  
  if (!beforeSnap.exists()) throw new Error('NGO not found');

  const updateData = {
    ...updates,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
  };

  await updateDoc(docRef, updateData);
  
  await logClientAuditEvent('UPDATE', COLLECTION_NAME, id, { 
    before: beforeSnap.data(), 
    after: updateData 
  });
};

/**
 * Deletes an NGO.
 */
export const deleteNGO = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const beforeSnap = await getDoc(docRef);
  
  if (beforeSnap.exists()) {
    await deleteDoc(docRef);
    await logClientAuditEvent('DELETE', COLLECTION_NAME, id, { before: beforeSnap.data() });
  }
};

/**
 * Subscribes to real-time NGO updates based on filters.
 */
export const subscribeToNGOs = (
  filters: NGOFilters,
  onUpdate: (ngos: NGO[]) => void
) => {
  const constraints: QueryConstraint[] = [];

  if (filters.state) constraints.push(where('state', '==', filters.state));
  if (filters.district) constraints.push(where('district', '==', filters.district));
  if (filters.status) constraints.push(where('status', '==', filters.status));
  
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(50));

  const q = query(collection(db, COLLECTION_NAME), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const ngos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NGO));
    onUpdate(ngos);
  });
};
