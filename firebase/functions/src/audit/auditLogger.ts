import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export interface AuditContext {
  uid: string;
  role?: string;
  ipAddress?: string;
}

/**
 * Creates an immutable audit log entry in the 'audit_logs' collection.
 */
export const logAuditEvent = async (
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'STATUS_CHANGE' | 'ROLE_CHANGE',
  collectionName: string,
  documentId: string,
  changes: { before?: any; after?: any; fieldsChanged?: string[] } | null,
  context: AuditContext
) => {
  try {
    const db = admin.firestore();
    const logRef = db.collection('audit_logs').doc();
    
    await logRef.set({
      id: logRef.id,
      action,
      collectionName,
      documentId,
      changes: changes || {},
      performedBy: context.uid,
      actorRole: context.role || 'UNKNOWN',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: context.ipAddress || null,
    });
    
  } catch (error) {
    functions.logger.error('Failed to write audit log:', error);
    // We intentionally don't throw to prevent failing the main business logic
    // just because auditing failed, though in ultra-strict systems you might.
  }
};
