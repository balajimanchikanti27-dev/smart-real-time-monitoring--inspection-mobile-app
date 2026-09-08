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
import type { Institution, InstitutionStatus } from '../types';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'institutions';

export interface InstitutionFilters {
  state?: string;
  district?: string;
  status?: InstitutionStatus;
  searchQuery?: string;
}

export interface PaginationParams {
  pageSize: number;
  lastVisible?: any;
}

/**
 * Creates a new Institution.
 */
export const createInstitution = async (data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Institution> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in to create an institution');

  const institutionData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user.uid,
    updatedBy: user.uid,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), institutionData);
  
  await logClientAuditEvent('CREATE', COLLECTION_NAME, docRef.id, { after: institutionData });

  const newDoc = await getDoc(docRef);
  return { id: newDoc.id, ...newDoc.data() } as Institution;
};

/**
 * Gets a single Institution by ID.
 */
export const getInstitution = async (id: string): Promise<Institution | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Institution;
};

/**
 * Gets a paginated list of Institutions with optional filters.
 */
export const getInstitutions = async (
  filters?: InstitutionFilters,
  pagination?: PaginationParams
): Promise<{ institutions: Institution[], lastVisible: any }> => {
  
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

  // Always order by createdAt for stable pagination (unless searching by name, which requires ordering by name first due to Firestore limits)
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

  const institutions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Institution));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return { institutions, lastVisible };
};

/**
 * Updates an Institution.
 */
export const updateInstitution = async (id: string, updates: Partial<Omit<Institution, 'id' | 'createdAt' | 'createdBy'>>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in to update an institution');

  const docRef = doc(db, COLLECTION_NAME, id);
  const beforeSnap = await getDoc(docRef);
  
  if (!beforeSnap.exists()) throw new Error('Institution not found');

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
 * Deletes an Institution.
 */
export const deleteInstitution = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const beforeSnap = await getDoc(docRef);
  
  if (beforeSnap.exists()) {
    await deleteDoc(docRef);
    await logClientAuditEvent('DELETE', COLLECTION_NAME, id, { before: beforeSnap.data() });
  }
};

/**
 * Subscribes to real-time Institution updates based on filters.
 */
export const subscribeToInstitutions = (
  filters: InstitutionFilters,
  onUpdate: (institutions: Institution[]) => void
) => {
  const constraints: QueryConstraint[] = [];

  if (filters.state) constraints.push(where('state', '==', filters.state));
  if (filters.district) constraints.push(where('district', '==', filters.district));
  if (filters.status) constraints.push(where('status', '==', filters.status));
  
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(50));

  const q = query(collection(db, COLLECTION_NAME), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const institutions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Institution));
    onUpdate(institutions);
  });
};
