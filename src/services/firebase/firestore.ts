import { 
  getFirestore, 
  collection, 
  serverTimestamp
} from 'firebase/firestore';
import type { CollectionReference, DocumentData } from 'firebase/firestore';
import { app } from './config';
import * as T from '../../types/firestore';

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Helper function to create strongly-typed collection references
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

// Strongly-typed Collection References
export const usersRef = createCollection<T.User>('users');
export const institutionsRef = createCollection<T.Institution>('institutions');
export const ngosRef = createCollection<T.NGO>('ngos');
export const projectsRef = createCollection<T.Project>('projects');
export const inspectorsRef = createCollection<T.Inspector>('inspectors');
export const inspectionsRef = createCollection<T.Inspection>('inspections');
export const inspectionAssignmentsRef = createCollection<T.InspectionAssignment>('inspectionAssignments');
export const inspectionChecklistsRef = createCollection<T.InspectionChecklist>('inspectionChecklists');
export const inspectionFindingsRef = createCollection<T.InspectionFinding>('inspectionFindings');
export const inspectionEvidenceRef = createCollection<T.InspectionEvidence>('inspectionEvidence');
export const cctvDevicesRef = createCollection<T.CctvDevice>('cctvDevices');
export const cctvEventsRef = createCollection<T.CctvEvent>('cctvEvents');
export const notificationsRef = createCollection<T.Notification>('notifications');
export const reportsRef = createCollection<T.Report>('reports');
export const documentsRef = createCollection<T.Document>('documents');
export const auditLogsRef = createCollection<T.AuditLog>('auditLogs');

// Export serverTimestamp for convenience when creating documents
export { serverTimestamp };

