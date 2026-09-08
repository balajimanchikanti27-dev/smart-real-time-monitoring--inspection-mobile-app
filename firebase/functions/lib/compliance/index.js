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
exports.calculateInspectionCompliance = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.calculateInspectionCompliance = (0, https_1.onCall)(async (request) => {
    const { inspectionId } = request.data;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    if (!inspectionId) {
        throw new https_1.HttpsError('invalid-argument', 'The function must be called with an "inspectionId" argument.');
    }
    try {
        const inspectionRef = db.collection('inspections').doc(inspectionId);
        // We can run this in a transaction to ensure consistent read/write
        return await db.runTransaction(async (transaction) => {
            const inspectionDoc = await transaction.get(inspectionRef);
            if (!inspectionDoc.exists) {
                throw new https_1.HttpsError('not-found', 'Inspection not found.');
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
            if (score >= 90)
                category = 'Excellent';
            else if (score >= 75)
                category = 'Good';
            else if (score >= 50)
                category = 'Needs Review';
            else
                category = 'Critical';
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
    }
    catch (error) {
        console.error('Error calculating compliance:', error);
        throw new https_1.HttpsError('internal', error.message || 'Failed to calculate compliance');
    }
});
//# sourceMappingURL=index.js.map