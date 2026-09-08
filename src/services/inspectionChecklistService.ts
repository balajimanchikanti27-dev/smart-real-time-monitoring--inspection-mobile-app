import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc,
  query, 
  where, 
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { inspectionChecklistsRef, inspectionsRef } from './firebase/firestore';
import type { InspectionChecklist, Inspection } from '../types/firestore';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'inspectionChecklists';

/**
 * Validates action authorization for basic operations.
 */
const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');
  return user.uid;
};

/**
 * Creates a new Checklist item for an inspection.
 */
export const createChecklist = async (
  data: Omit<InspectionChecklist, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>
): Promise<InspectionChecklist> => {
  requireAuth();
  
  // Validate inspection exists
  const inspectionDoc = await getDoc(doc(inspectionsRef, data.inspectionId));
  if (!inspectionDoc.exists()) {
    throw new Error('Inspection not found');
  }

  const checklistData: Omit<InspectionChecklist, 'id'> = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const newDocRef = doc(collection(db, COLLECTION_NAME));
  await setDoc(newDocRef, checklistData as any);
  
  await logClientAuditEvent('CREATE', COLLECTION_NAME, newDocRef.id, { after: checklistData });

  const newDoc = await getDoc(newDocRef);
  return { id: newDoc.id, ...(newDoc.data() as object) } as InspectionChecklist;
};

/**
 * Gets a single Checklist Item by ID.
 */
export const getChecklist = async (id: string): Promise<InspectionChecklist | null> => {
  const docRef = doc(inspectionChecklistsRef, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...(docSnap.data() as object) } as InspectionChecklist;
};

/**
 * Updates a checklist item.
 * Ensures the inspection is IN_PROGRESS and only the assigned inspector modifies it.
 */
export const updateChecklistItem = async (
  id: string, 
  updates: Partial<Omit<InspectionChecklist, 'id' | 'createdAt' | 'inspectionId'>>
): Promise<void> => {
  const userId = requireAuth();

  const docRef = doc(inspectionChecklistsRef, id);
  const beforeSnap = await getDoc(docRef);
  if (!beforeSnap.exists()) throw new Error('Checklist item not found');
  
  const currentData = beforeSnap.data() as InspectionChecklist;
  
  const inspectionRef = doc(inspectionsRef, currentData.inspectionId);
  const inspectionSnap = await getDoc(inspectionRef);
  
  if (!inspectionSnap.exists()) throw new Error('Associated inspection not found');
  const inspection = inspectionSnap.data() as Inspection;

  // Validate editing rules
  if (inspection.inspectorId !== userId) {
    throw new Error('Only the assigned inspector can modify checklist items.');
  }
  
  if (inspection.status !== 'IN_PROGRESS') {
    throw new Error('Checklist items can only be modified while the inspection is IN_PROGRESS.');
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
 * Completes a checklist item.
 */
export const completeChecklistItem = async (id: string, response: InspectionChecklist['response'], remarks?: string, score?: number): Promise<void> => {
  await updateChecklistItem(id, { 
    response, 
    remarks,
    score,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp() 
  });
};

/**
 * Gets checklist progress for a specific inspection.
 */
export const getChecklistProgress = async (inspectionId: string) => {
  requireAuth();
  
  const q = query(inspectionChecklistsRef, where('inspectionId', '==', inspectionId));
  const snapshot = await getDocs(q);
  
  const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as InspectionChecklist));
  const total = items.length;
  const completed = items.filter(i => i.response === 'PASS' || i.response === 'FAIL' || i.response === 'NOT_APPLICABLE').length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  return { items, total, completed, progress };
};
