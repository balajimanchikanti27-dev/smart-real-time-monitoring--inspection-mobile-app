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
exports.logAuditEvent = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
/**
 * Creates an immutable audit log entry in the 'audit_logs' collection.
 */
const logAuditEvent = async (action, collectionName, documentId, changes, context) => {
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
    }
    catch (error) {
        functions.logger.error('Failed to write audit log:', error);
        // We intentionally don't throw to prevent failing the main business logic
        // just because auditing failed, though in ultra-strict systems you might.
    }
};
exports.logAuditEvent = logAuditEvent;
//# sourceMappingURL=auditLogger.js.map