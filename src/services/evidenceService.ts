import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase/config';
import { inspectionEvidenceRef, inspectionsRef } from './firebase/firestore';
import type { InspectionEvidence, Inspection } from '../types/firestore';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'inspectionEvidence';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];

const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');
  return user.uid;
};

export const uploadEvidence = async (
  inspectionId: string,
  findingId: string | undefined,
  file: File
): Promise<InspectionEvidence> => {
  const userId = requireAuth();

  // Validate File
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 10MB maximum.');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type.');
  }

  // Validate Inspection
  const inspectionDoc = await getDoc(doc(inspectionsRef, inspectionId));
  if (!inspectionDoc.exists()) {
    throw new Error('Inspection not found');
  }
  
  const inspection = inspectionDoc.data() as Inspection;
  if (inspection.inspectorId !== userId) {
    throw new Error('Only the assigned inspector can upload evidence for this inspection.');
  }
  
  // Can only upload during IN_PROGRESS
  if (inspection.status !== 'IN_PROGRESS') {
    throw new Error('Evidence can only be uploaded while the inspection is IN_PROGRESS.');
  }

  const fileTypeCategory = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
  const newDocRef = doc(collection(db, COLLECTION_NAME));
  
  const storagePath = `inspection-evidence/${inspectionId}/${findingId || 'general'}/${newDocRef.id}_${file.name}`;
  const storageRef = ref(storage, storagePath);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  const evidenceData: Omit<InspectionEvidence, 'id'> = {
    inspectionId,
    findingId: findingId || '',
    fileName: file.name,
    fileType: fileTypeCategory,
    fileSize: file.size,
    storagePath,
    downloadURL,
    uploadedBy: userId,
    createdAt: serverTimestamp(),
  };

  await setDoc(newDocRef, evidenceData as any);
  await logClientAuditEvent('CREATE', COLLECTION_NAME, newDocRef.id, { after: evidenceData });

  const newDoc = await getDoc(newDocRef);
  return { id: newDoc.id, ...(newDoc.data() as object) } as InspectionEvidence;
};

export const getEvidence = async (inspectionId: string, findingId?: string): Promise<InspectionEvidence[]> => {
  requireAuth();
  
  let q;
  if (findingId) {
    q = query(
      inspectionEvidenceRef, 
      where('inspectionId', '==', inspectionId), 
      where('findingId', '==', findingId), 
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      inspectionEvidenceRef, 
      where('inspectionId', '==', inspectionId), 
      orderBy('createdAt', 'desc')
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as InspectionEvidence));
};

export const deleteEvidence = async (id: string): Promise<void> => {
  const userId = requireAuth();

  const docRef = doc(inspectionEvidenceRef, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Evidence not found');
  }

  const evidence = docSnap.data() as InspectionEvidence;
  
  // Validate Inspection
  const inspectionDoc = await getDoc(doc(inspectionsRef, evidence.inspectionId));
  if (inspectionDoc.exists()) {
    const inspection = inspectionDoc.data() as Inspection;
    
    // Prevent unauthorized deletion
    if (inspection.inspectorId !== userId && inspection.createdBy !== userId) {
        throw new Error('Unauthorized deletion');
    }
    
    if (inspection.status !== 'IN_PROGRESS' && inspection.status !== 'CREATED') {
      throw new Error('Evidence cannot be deleted after the inspection has been submitted.');
    }
  }

  // Delete from storage
  const storageRef = ref(storage, evidence.storagePath);
  await deleteObject(storageRef);

  // Delete from firestore
  await deleteDoc(docRef);
  
  await logClientAuditEvent('DELETE', COLLECTION_NAME, id, { before: evidence });
};
