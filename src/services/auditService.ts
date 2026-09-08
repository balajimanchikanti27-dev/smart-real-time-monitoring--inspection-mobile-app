import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { AuditLog, AuditAction } from '../types';

const COLLECTION_NAME = 'auditLogs';

export const createAuditLog = async (
  action: AuditAction,
  entityType: string,
  entityId: string,
  description: string
) => {
  try {
    const user = auth.currentUser;
    if (!user) return; // Silent return for unauthenticated users as we can't reliably log them here

    // Note: We might not have the user's role synchronously in auth.currentUser. 
    // We typically set custom claims for role. If not available, we use a placeholder or decode the token.
    const role = 'USER'; // Assuming default, in a real app this would come from claims or context

    const newLog: Omit<AuditLog, 'id' | 'timestamp'> = {
      userId: user.uid,
      role,
      action,
      entityType,
      entityId,
      description
    };

    await addDoc(collection(db, COLLECTION_NAME), {
      ...newLog,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

// Legacy wrapper to preserve backward compatibility for previous calls
export const logClientAuditEvent = async (
  action: AuditAction | string,
  collectionName: string,
  documentId: string,
  _changes: any
) => {
  await createAuditLog(
    action as AuditAction,
    collectionName,
    documentId,
    `Performed ${action} on ${collectionName} with ID ${documentId}`
  );
};
