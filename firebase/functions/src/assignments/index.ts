import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Assigns an inspector automatically to an inspection.
 */
export const assignInspectorAutomatically = onCall(async (request) => {
  const { auth, data } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in to assign inspectors.');
  }

  // Ensure user is an admin
  const userDoc = await db.collection('users').doc(auth.uid).get();
  if (!userDoc.exists || (userDoc.data()?.role !== 'SUPER_ADMIN' && userDoc.data()?.role !== 'ADMIN')) {
    throw new HttpsError('permission-denied', 'Only admins can perform automatic assignment.');
  }

  const inspectionId = data.inspectionId;
  if (!inspectionId) {
    throw new HttpsError('invalid-argument', 'inspectionId is required.');
  }

  try {
    return await db.runTransaction(async (transaction) => {
      const inspectionRef = db.collection('inspections').doc(inspectionId);
      const inspectionDoc = await transaction.get(inspectionRef);

      if (!inspectionDoc.exists) {
        throw new HttpsError('not-found', 'Inspection not found.');
      }

      const inspectionData = inspectionDoc.data()!;
      if (inspectionData.status !== 'CREATED' && inspectionData.status !== 'REJECTED') {
        throw new HttpsError('failed-precondition', 'Inspection is already assigned or in an invalid state for assignment.');
      }

      if (inspectionData.inspectorId) {
        throw new HttpsError('failed-precondition', 'Inspection already has an inspector assigned.');
      }

      // Query available inspectors. 
      // Note: In transactions, queries run before modifications. We can't use transaction.get() directly on queries in older SDKs,
      // but in admin SDK `transaction.get(query)` is supported.
      const inspectorsQuery = db.collection('inspectors')
        .where('status', '==', 'AVAILABLE')
        .orderBy('currentWorkload', 'asc');
      
      const inspectorsSnapshot = await transaction.get(inspectorsQuery);
      
      if (inspectorsSnapshot.empty) {
        throw new HttpsError('unavailable', 'No available inspectors found.');
      }

      // Filter locally for workload
      let candidates = inspectorsSnapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(inspector => (inspector.currentWorkload || 0) < (inspector.maximumWorkload || 10));

      if (candidates.length === 0) {
        throw new HttpsError('unavailable', 'All available inspectors are at maximum workload.');
      }

      // Calculate suitability score
      const orgState = inspectionData.location?.state || null;
      const orgDistrict = inspectionData.location?.district || null;
      const reqSpecialization = inspectionData.inspectionType || null;

      const scoredCandidates = candidates.map(inspector => {
        let score = 0;
        let reasons: string[] = [];

        if (orgState && inspector.state === orgState) {
          score += 10;
          reasons.push('Same State');
        }
        if (orgDistrict && inspector.district === orgDistrict) {
          score += 20;
          reasons.push('Same District');
        }
        if (reqSpecialization && inspector.specialization === reqSpecialization) {
          score += 30;
          reasons.push('Matching Specialization');
        }

        // Penalty for high workload
        const workloadRatio = (inspector.currentWorkload || 0) / (inspector.maximumWorkload || 10);
        score -= (workloadRatio * 15);

        return { inspector, score, reasons };
      });

      // Sort by descending score
      scoredCandidates.sort((a, b) => b.score - a.score);

      const topScore = scoredCandidates[0].score;
      // Get all candidates within a reasonable margin of the top score (e.g., within 5 points) to randomly select from best tier
      const bestCandidates = scoredCandidates.filter(c => c.score >= topScore - 5);

      const selectedIndex = Math.floor(Math.random() * bestCandidates.length);
      const selectedMatch = bestCandidates[selectedIndex];
      const selectedInspector = selectedMatch.inspector;
      const assignmentReason = `Automated Smart Assignment. Factors: ${selectedMatch.reasons.join(', ') || 'Available Capacity'}`;

      // Perform updates
      const inspectorRef = db.collection('inspectors').doc(selectedInspector.id);
      
      const newAssignmentRef = db.collection('inspectionAssignments').doc();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      transaction.update(inspectionRef, {
        status: 'ASSIGNED',
        inspectorId: selectedInspector.id,
        updatedAt: timestamp
      });

      transaction.update(inspectorRef, {
        status: 'ASSIGNED',
        currentWorkload: admin.firestore.FieldValue.increment(1),
        updatedAt: timestamp
      });

      transaction.set(newAssignmentRef, {
        inspectionId: inspectionId,
        inspectorId: selectedInspector.id,
        assignedBy: auth.uid,
        assignmentReason: assignmentReason,
        status: 'PENDING',
        createdAt: timestamp,
        updatedAt: timestamp
      });

      // Audit Log
      const auditRef = db.collection('auditLogs').doc();
      transaction.set(auditRef, {
        userId: auth.uid,
        role: userDoc.data()?.role || 'SYSTEM',
        action: 'create',
        entityType: 'inspectionAssignments',
        entityId: newAssignmentRef.id,
        description: `Automated assignment created for inspection ${inspectionId} to inspector ${selectedInspector.id}`,
        timestamp: timestamp
      });

      // Notification
      const notifRef = db.collection('notifications').doc();
      transaction.set(notifRef, {
        userId: selectedInspector.userId || selectedInspector.id,
        title: 'New Inspection Assignment',
        message: `You have been assigned a new inspection (${inspectionId}). Please review and accept.`,
        type: 'assignment',
        priority: 'high',
        read: false,
        createdAt: timestamp
      });

      return {
        success: true,
        assignmentId: newAssignmentRef.id,
        assignmentReason: assignmentReason,
        inspector: selectedInspector
      };
    });
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Transaction failed: ' + error.message);
  }
});

/**
 * Inspector accepts assignment.
 */
export const acceptAssignment = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'Must be logged in.');

  const assignmentId = data.assignmentId;
  if (!assignmentId) throw new HttpsError('invalid-argument', 'assignmentId required.');

  try {
    return await db.runTransaction(async (t) => {
      const assignmentRef = db.collection('inspectionAssignments').doc(assignmentId);
      const assignmentDoc = await t.get(assignmentRef);

      if (!assignmentDoc.exists) throw new HttpsError('not-found', 'Assignment not found.');
      const assignment = assignmentDoc.data()!;

      if (assignment.inspectorId !== auth.uid) {
        throw new HttpsError('permission-denied', 'You can only accept your own assignments.');
      }
      if (assignment.status !== 'PENDING') {
        throw new HttpsError('failed-precondition', 'Assignment is not pending.');
      }

      const inspectionRef = db.collection('inspections').doc(assignment.inspectionId);
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      t.update(assignmentRef, { status: 'ACCEPTED', updatedAt: timestamp });
      t.update(inspectionRef, { status: 'ACCEPTED', updatedAt: timestamp });

      return { success: true };
    });
  } catch (e: any) {
    if (e instanceof HttpsError) throw e;
    throw new HttpsError('internal', e.message);
  }
});

/**
 * Inspector rejects assignment.
 */
export const rejectAssignment = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'Must be logged in.');

  const { assignmentId, reason } = data;
  if (!assignmentId) throw new HttpsError('invalid-argument', 'assignmentId required.');

  try {
    return await db.runTransaction(async (t) => {
      const assignmentRef = db.collection('inspectionAssignments').doc(assignmentId);
      const assignmentDoc = await t.get(assignmentRef);
      if (!assignmentDoc.exists) throw new HttpsError('not-found', 'Assignment not found.');
      
      const assignment = assignmentDoc.data()!;
      if (assignment.inspectorId !== auth.uid) {
        throw new HttpsError('permission-denied', 'Only the assigned inspector can reject this.');
      }
      if (assignment.status !== 'PENDING') {
        throw new HttpsError('failed-precondition', 'Assignment is not pending.');
      }

      const inspectionRef = db.collection('inspections').doc(assignment.inspectionId);
      const inspectorRef = db.collection('inspectors').doc(assignment.inspectorId);
      const inspectorDoc = await t.get(inspectorRef);
      const inspector = inspectorDoc.data()!;

      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Reverse assignment
      t.update(assignmentRef, { 
        status: 'REJECTED', 
        notes: reason || 'Rejected by inspector', 
        updatedAt: timestamp 
      });
      t.update(inspectionRef, { 
        status: 'CREATED', 
        inspectorId: '', 
        updatedAt: timestamp 
      });

      const newWorkload = Math.max(0, (inspector.currentWorkload || 0) - 1);
      t.update(inspectorRef, {
        currentWorkload: newWorkload,
        status: newWorkload === 0 ? 'AVAILABLE' : inspector.status,
        updatedAt: timestamp
      });

      return { success: true };
    });
  } catch (e: any) {
    if (e instanceof HttpsError) throw e;
    throw new HttpsError('internal', e.message);
  }
});

/**
 * Completes an assignment when inspection closes.
 */
export const completeAssignment = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'Must be logged in.');

  const { assignmentId } = data;
  if (!assignmentId) throw new HttpsError('invalid-argument', 'assignmentId required.');

  try {
    return await db.runTransaction(async (t) => {
      const assignmentRef = db.collection('inspectionAssignments').doc(assignmentId);
      const assignmentDoc = await t.get(assignmentRef);
      if (!assignmentDoc.exists) throw new HttpsError('not-found', 'Assignment not found.');
      
      const assignment = assignmentDoc.data()!;
      // Allow inspector or admin
      const userDoc = await t.get(db.collection('users').doc(auth.uid));
      const role = userDoc.data()?.role;
      if (assignment.inspectorId !== auth.uid && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        throw new HttpsError('permission-denied', 'Unauthorized.');
      }
      
      if (assignment.status !== 'ACCEPTED') {
        throw new HttpsError('failed-precondition', 'Assignment must be ACCEPTED to be COMPLETED.');
      }

      const inspectorRef = db.collection('inspectors').doc(assignment.inspectorId);
      const inspectorDoc = await t.get(inspectorRef);
      const inspector = inspectorDoc.data()!;

      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      t.update(assignmentRef, { status: 'COMPLETED', updatedAt: timestamp });
      
      const newWorkload = Math.max(0, (inspector.currentWorkload || 0) - 1);
      t.update(inspectorRef, {
        currentWorkload: newWorkload,
        status: newWorkload === 0 ? 'AVAILABLE' : inspector.status,
        updatedAt: timestamp
      });

      return { success: true };
    });
  } catch (e: any) {
    if (e instanceof HttpsError) throw e;
    throw new HttpsError('internal', e.message);
  }
});
