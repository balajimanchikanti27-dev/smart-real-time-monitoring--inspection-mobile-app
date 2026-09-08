import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getCountFromServer,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { inspectionsRef } from './firebase/firestore';
import type { Inspection } from '../types/firestore';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'inspections';

/**
 * Validates action authorization for basic operations.
 */
const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');
  return user.uid;
};

/**
 * Creates a new Inspection.
 * Starts in 'CREATED' status.
 */
export const createInspection = async (
  data: Omit<Inspection, 'id' | 'status' | 'inspectorId' | 'startedAt' | 'submittedAt' | 'reviewedAt' | 'closedAt' | 'complianceScore' | 'createdAt' | 'updatedAt' | 'createdBy'>
): Promise<Inspection> => {
  const userId = requireAuth();
  
  if (data.inspectionType !== 'ROUTINE' && data.inspectionType !== 'SURPRISE') {
    throw new Error('inspectionType must be either ROUTINE or SURPRISE');
  }
  
  const inspectionData: Omit<Inspection, 'id'> = {
    ...data,
    status: 'CREATED',
    inspectorId: '', // Will be set during assignment
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const newDocRef = doc(collection(db, COLLECTION_NAME));
  await setDoc(newDocRef, inspectionData as any);
  
  await logClientAuditEvent('CREATE', COLLECTION_NAME, newDocRef.id, { after: inspectionData });

  // If it's a SURPRISE inspection, automatically trigger the assignment
  if (data.inspectionType === 'SURPRISE') {
    try {
      const assignFn = httpsCallable(functions, 'assignInspectorAutomatically');
      await assignFn({ inspectionId: newDocRef.id });
    } catch (e: any) {
      console.error('Failed to trigger automatic assignment for surprise inspection:', e);
      // We do not fail the inspection creation, but log the error
    }
  }

  const newDoc = await getDoc(newDocRef);
  return { id: newDoc.id, ...(newDoc.data() as object) } as Inspection;
};

/**
 * Gets Surprise Inspections.
 */
export const getSurpriseInspections = async (): Promise<Inspection[]> => {
  requireAuth();
  const q = query(inspectionsRef, where('inspectionType', '==', 'SURPRISE'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Inspection));
};

/**
 * Gets Routine Inspections.
 */
export const getRoutineInspections = async (): Promise<Inspection[]> => {
  requireAuth();
  const q = query(inspectionsRef, where('inspectionType', '==', 'ROUTINE'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Inspection));
};

/**
 * Gets statistics about Surprise Inspections.
 */
export const getSurpriseInspectionStatistics = async () => {
  requireAuth();
  
  const baseQuery = query(inspectionsRef, where('inspectionType', '==', 'SURPRISE'));
  const totalSnap = await getCountFromServer(baseQuery);
  const total = totalSnap.data().count;

  const completedQuery = query(inspectionsRef, where('inspectionType', '==', 'SURPRISE'), where('status', '==', 'CLOSED'));
  const completedSnap = await getCountFromServer(completedQuery);
  const completed = completedSnap.data().count;

  return { total, completed };
};

/**
 * Gets a single Inspection by ID.
 */
export const getInspection = async (id: string): Promise<Inspection | null> => {
  const docRef = doc(inspectionsRef, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...(docSnap.data() as object) } as Inspection;
};

/**
 * Gets a list of all Inspections.
 */
export const getInspections = async (): Promise<Inspection[]> => {
  requireAuth(); // basic check
  const q = query(inspectionsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Inspection));
};

/**
 * Subscribes to Active Inspections in real-time.
 */
export const subscribeToActiveInspections = (
  callback: (inspections: Inspection[]) => void
) => {
  const q = query(
    inspectionsRef,
    where('status', 'in', ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEW'])
  );

  return onSnapshot(q, (snapshot) => {
    const inspections = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Inspection));
    callback(inspections);
  }, (error) => {
    console.error('Error subscribing to active inspections:', error);
  });
};

/**
 * Subscribes to Inspector Assignments in real-time.
 */
export const subscribeToInspectorAssignments = (
  inspectorId: string,
  callback: (assignments: Inspection[]) => void
) => {
  if (!inspectorId) return () => {};

  const q = query(
    inspectionsRef,
    where('inspectorId', '==', inspectorId),
    where('status', 'in', ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'])
  );

  return onSnapshot(q, (snapshot) => {
    const assignments = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Inspection));
    callback(assignments);
  }, (error) => {
    console.error('Error subscribing to inspector assignments:', error);
  });
};

/**
 * Validates status transitions strictly.
 */
const validateTransition = (currentStatus: string, newStatus: string) => {
  const allowedTransitions: Record<string, string[]> = {
    'CREATED': ['ASSIGNED', 'CANCELLED'],
    'ASSIGNED': ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    'ACCEPTED': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['SUBMITTED', 'CANCELLED'],
    'SUBMITTED': ['REVIEWED'],
    'REVIEWED': ['CLOSED']
  };

  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }
};

/**
 * Updates an Inspection.
 * Status and inspectorId should be managed by Cloud Functions or specific endpoint functions.
 */
export const updateInspection = async (
  id: string, 
  updates: Partial<Omit<Inspection, 'id' | 'createdAt'>>
): Promise<void> => {
  requireAuth();

  const docRef = doc(inspectionsRef, id);
  const beforeSnap = await getDoc(docRef);
  if (!beforeSnap.exists()) throw new Error('Inspection not found');

  const currentData = beforeSnap.data() as Inspection;

  if (updates.status && updates.status !== currentData.status) {
    validateTransition(currentData.status, updates.status);
  }

  const updateData = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, updateData);
  
  await logClientAuditEvent('UPDATE', COLLECTION_NAME, id, { 
    before: currentData, 
    after: { ...currentData, ...updateData } 
  });
};

/**
 * Starts an inspection.
 */
export const startInspection = async (id: string): Promise<void> => {
  await updateInspection(id, { 
    status: 'IN_PROGRESS', 
    startedAt: serverTimestamp() 
  });
};

/**
 * Submits an inspection.
 */
export const submitInspection = async (id: string, summary: string, complianceScore: number, hasCriticalFinding: boolean): Promise<void> => {
  await updateInspection(id, { 
    status: 'SUBMITTED', 
    submittedAt: serverTimestamp(),
    summary,
    complianceScore,
    hasCriticalFinding
  });
};

/**
 * Reviews an inspection.
 */
export const reviewInspection = async (id: string): Promise<void> => {
  await updateInspection(id, { 
    status: 'REVIEWED', 
    reviewedAt: serverTimestamp() 
  });
};

/**
 * Closes an inspection.
 * NOTE: When an inspection is closed, inspector workload should be decreased. 
 * This is better handled via a Cloud Function, but we expose this to trigger the transition.
 */
export const closeInspection = async (id: string): Promise<void> => {
  await updateInspection(id, { 
    status: 'CLOSED', 
    closedAt: serverTimestamp() 
  });
};
