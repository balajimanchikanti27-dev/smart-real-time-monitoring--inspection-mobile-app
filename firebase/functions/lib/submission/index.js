"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitInspection = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.submitInspection = (0, https_1.onCall)(async (request) => {
    const { inspectionId } = request.data;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    if (!inspectionId) {
        throw new https_1.HttpsError('invalid-argument', 'The function must be called with an "inspectionId" argument.');
    }
    try {
        const inspectionRef = db.collection('inspections').doc(inspectionId);
        return await db.runTransaction(async (transaction) => {
            const inspectionDoc = await transaction.get(inspectionRef);
            if (!inspectionDoc.exists) {
                throw new https_1.HttpsError('not-found', 'Inspection not found.');
            }
            const inspection = inspectionDoc.data();
            if (inspection.inspectorId !== request.auth?.uid) {
                throw new https_1.HttpsError('permission-denied', 'Only the assigned inspector can submit this inspection.');
            }
            if (inspection.status !== 'IN_PROGRESS') {
                throw new https_1.HttpsError('failed-precondition', 'Inspection must be IN_PROGRESS to submit.');
            }
            // 4. Verify checklists are completed
            const checklistsQuery = db.collection('inspectionChecklists').where('inspectionId', '==', inspectionId);
            const checklistsSnap = await transaction.get(checklistsQuery);
            const checklists = checklistsSnap.docs.map(doc => doc.data());
            const hasPendingChecklists = checklists.some(item => item.response === 'PENDING' || !item.response);
            if (hasPendingChecklists) {
                throw new https_1.HttpsError('failed-precondition', 'All checklist items must be completed before submission.');
            }
            // 5. Calculate Compliance internally (so client can't supply a fake score)
            const findingsQuery = db.collection('inspectionFindings').where('inspectionId', '==', inspectionId);
            const findingsSnap = await transaction.get(findingsQuery);
            const findings = findingsSnap.docs.map(doc => doc.data());
            const applicableItems = checklists.filter(item => item.response !== 'NOT_APPLICABLE');
            const totalApplicable = applicableItems.length;
            const passed = applicableItems.filter(item => item.response === 'PASS').length;
            let score = 0;
            if (totalApplicable > 0) {
                score = Math.round((passed / totalApplicable) * 100);
            }
            const hasCriticalFinding = findings.some(finding => finding.severity === 'CRITICAL');
            // 8. Atomically update
            transaction.update(inspectionRef, {
                status: 'SUBMITTED',
                submittedAt: admin.firestore.FieldValue.serverTimestamp(),
                complianceScore: score,
                hasCriticalFinding: hasCriticalFinding,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // Update Inspector status to AVAILABLE since they finished this inspection
            // Assuming inspector only does 1 at a time, or we decrement workload
            const inspectorRef = db.collection('inspectors').doc(inspection.inspectorId);
            const inspectorDoc = await transaction.get(inspectorRef);
            if (inspectorDoc.exists) {
                const currentWorkload = inspectorDoc.data()?.currentWorkload || 1;
                const newWorkload = Math.max(0, currentWorkload - 1);
                const status = newWorkload === 0 ? 'AVAILABLE' : 'ASSIGNED'; // Simplistic logic
                transaction.update(inspectorRef, {
                    currentWorkload: newWorkload,
                    status,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            // Note: notification and audit logs can be triggered here or via Firestore Triggers.
            // For this implementation, we can write an audit log doc
            const auditRef = db.collection('auditLogs').doc();
            transaction.set(auditRef, {
                userId: request.auth?.uid,
                role: 'INSPECTOR',
                action: 'SUBMIT_INSPECTION',
                entityType: 'inspections',
                entityId: inspectionId,
                description: `Inspector submitted inspection ${inspectionId} with score ${score}`,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            return {
                success: true,
                score,
                status: 'SUBMITTED',
                message: 'Inspection submitted successfully.'
            };
        });
    }
    catch (error) {
        console.error('Error submitting inspection:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', error.message || 'Failed to submit inspection');
    }
});
//# sourceMappingURL=index.js.map