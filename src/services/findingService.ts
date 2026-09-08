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
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { inspectionFindingsRef, inspectionsRef, usersRef } from './firebase/firestore';
import type { InspectionFinding, Inspection } from '../types/firestore';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'inspectionFindings';

const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');
  return user.uid;
};

export const createFinding = async (
  data: Omit<InspectionFinding, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'verifiedAt'>
): Promise<InspectionFinding> => {
  const userId = requireAuth();
  console.log(userId);

  const inspectionDoc = await getDoc(doc(inspectionsRef, data.inspectionId));
  if (!inspectionDoc.exists()) {
    throw new Error('Inspection not found');
  }

  const findingData: Omit<InspectionFinding, 'id'> = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const newDocRef = doc(collection(db, COLLECTION_NAME));
  await setDoc(newDocRef, findingData as any);

  // If critical, update inspection
  if (data.severity === 'CRITICAL') {
    await updateDoc(inspectionDoc.ref, {
      hasCriticalFinding: true,
      updatedAt: serverTimestamp(),
    });
    
    // Create high-priority notification
    const inspection = inspectionDoc.data() as Inspection;
    // Notify organization admin if we have an organizationId in project/inspection (assume inspection has it via project)
    // For now, create a system alert for the inspector or admin
    // In a real app we'd call a proper notification service
    console.log('CRITICAL FINDING: Created for ', inspection.id);
  }

  await logClientAuditEvent('CREATE', COLLECTION_NAME, newDocRef.id, { after: findingData });

  const newDoc = await getDoc(newDocRef);
  return { id: newDoc.id, ...(newDoc.data() as object) } as InspectionFinding;
};

export const getFinding = async (id: string): Promise<InspectionFinding | null> => {
  const docRef = doc(inspectionFindingsRef, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...(docSnap.data() as object) } as InspectionFinding;
};

export const getFindings = async (inspectionId?: string): Promise<InspectionFinding[]> => {
  requireAuth();
  let q;
  if (inspectionId) {
    q = query(inspectionFindingsRef, where('inspectionId', '==', inspectionId), orderBy('createdAt', 'desc'));
  } else {
    q = query(inspectionFindingsRef, orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as InspectionFinding));
};

export const subscribeToCriticalFindings = (
  callback: (findings: InspectionFinding[]) => void
) => {
  const q = query(
    inspectionFindingsRef,
    where('severity', '==', 'CRITICAL')
  );

  return onSnapshot(q, (snapshot) => {
    const findings = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as InspectionFinding));
    callback(findings);
  }, (error) => {
    console.error('Error subscribing to critical findings:', error);
  });
};

export const updateFinding = async (
  id: string, 
  updates: Partial<Omit<InspectionFinding, 'id' | 'createdAt' | 'inspectionId'>>
): Promise<void> => {
  requireAuth();
  const docRef = doc(inspectionFindingsRef, id);
  const beforeSnap = await getDoc(docRef);
  if (!beforeSnap.exists()) throw new Error('Finding not found');
  
  const currentData = beforeSnap.data() as InspectionFinding;
  
  const updateData = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, updateData);
  await logClientAuditEvent('UPDATE', COLLECTION_NAME, id, { before: currentData, after: { ...currentData, ...updateData } });
};

export const updateFindingStatus = async (id: string, status: InspectionFinding['status']): Promise<void> => {
  await updateFinding(id, { status });
};

export const resolveFinding = async (id: string, correctiveAction: string): Promise<void> => {
  await updateFinding(id, { 
    status: 'RESOLVED',
    correctiveAction,
    resolvedAt: serverTimestamp() 
  });
};

export const verifyFinding = async (id: string): Promise<void> => {
  const userId = requireAuth();
  
  // Do not allow an organization to mark its own finding VERIFIED
  const userDoc = await getDoc(doc(usersRef, userId));
  const userData = userDoc.data() as any; // Using any since UserProfile is not in firestore.ts
  
  if (userData?.role === 'ORGANIZATION') {
    throw new Error('Unauthorized verification: Organizations cannot verify their own findings.');
  }

  await updateFinding(id, { 
    status: 'VERIFIED',
    verifiedAt: serverTimestamp() 
  });
};

export const closeFinding = async (id: string): Promise<void> => {
  await updateFinding(id, { status: 'CLOSED' });
};
