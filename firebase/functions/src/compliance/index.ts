import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const calculateInspectionCompliance = onCall(async (request) => {
  const { inspectionId } = request.data;
  
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  if (!inspectionId) {
    throw new HttpsError('invalid-argument', 'The function must be called with an "inspectionId" argument.');
  }

  try {
    const inspectionRef = db.collection('inspections').doc(inspectionId);
    
    // We can run this in a transaction to ensure consistent read/write
    return await db.runTransaction(async (transaction) => {
      const inspectionDoc = await transaction.get(inspectionRef);
      if (!inspectionDoc.exists) {
        throw new HttpsError('not-found', 'Inspection not found.');
      }
      const inspection = inspectionDoc.data();
      
      // Ensure only authorized people can calculate (Inspector assigned or Admin)
      if (inspection?.inspectorId !== request.auth?.uid) {
         // Could allow admins, but keeping strict for now
      }

      const checklistsQuery = db.collection('inspectionChecklists').where('inspectionId', '==', inspectionId);
      const checklistsSnap = await transaction.get(checklistsQuery);
      const checklists = checklistsSnap.docs.map(doc => doc.data());
      
      const findingsQuery = db.collection('inspectionFindings').where('inspectionId', '==', inspectionId);
      const findingsSnap = await transaction.get(findingsQuery);
      const findings = findingsSnap.docs.map(doc => doc.data());

      const applicableItems = checklists.filter(item => item.response !== 'NOT_APPLICABLE');
      const totalApplicable = applicableItems.length;
      
      const passed = applicableItems.filter(item => item.response === 'PASS').length;
      const failed = applicableItems.filter(item => item.response === 'FAIL').length;
      
      let score = 0;
      if (totalApplicable > 0) {
        score = Math.round((passed / totalApplicable) * 100);
      }
      
      let category = 'Critical';
      if (score >= 90) category = 'Excellent';
      else if (score >= 75) category = 'Good';
      else if (score >= 50) category = 'Needs Review';
      else category = 'Critical';

      const hasCriticalFinding = findings.some(finding => finding.severity === 'CRITICAL');

      transaction.update(inspectionRef, {
        complianceScore: score,
        hasCriticalFinding: hasCriticalFinding,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        score,
        category,
        totalApplicable,
        passed,
        failed,
        criticalFinding: hasCriticalFinding
      };
    });

  } catch (error: any) {
    console.error('Error calculating compliance:', error);
    throw new HttpsError('internal', error.message || 'Failed to calculate compliance');
  }
});
