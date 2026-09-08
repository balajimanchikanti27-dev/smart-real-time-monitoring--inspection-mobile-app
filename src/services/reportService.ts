import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'reports';

export const triggerReportGeneration = async (inspectionId: string) => {
  const generateInspectionReport = httpsCallable(functions, 'generateInspectionReport');
  
  try {
    const result = await generateInspectionReport({ inspectionId });
    await logClientAuditEvent('CREATE', COLLECTION_NAME, (result.data as any).reportId, { 
      inspectionId, 
      action: 'GENERATED_REPORT' 
    });
    return result.data as { success: boolean; reportId: string; reportUrl: string; storagePath: string };
  } catch (error) {
    console.error('Failed to trigger report generation:', error);
    throw error;
  }
};

export const getReportsByInspection = async (inspectionId: string) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('inspectionId', '==', inspectionId),
    orderBy('generatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getReportsByOrganization = async (organizationId: string) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('organizationId', '==', organizationId),
    orderBy('generatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getReportById = async (reportId: string) => {
  const docRef = doc(db, COLLECTION_NAME, reportId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Report not found');
  }
  return { id: snap.id, ...snap.data() };
};
