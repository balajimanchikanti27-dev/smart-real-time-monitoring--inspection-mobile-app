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
exports.enableUser = exports.disableUser = exports.getUsers = exports.updateUserProfile = exports.getUserProfile = exports.createUserProfile = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const authMiddleware_1 = require("./authMiddleware");
const auditLogger_1 = require("../audit/auditLogger");
const db = admin.firestore();
/**
 * Creates a new user profile via Cloud Functions (Admin only).
 */
exports.createUserProfile = functions.https.onCall(async (data, context) => {
    const auth = await (0, authMiddleware_1.requireAdmin)(context);
    const callerRole = await (0, authMiddleware_1.getUserRole)(auth.uid) || 'UNKNOWN';
    // Only SUPER_ADMIN can create SUPER_ADMIN or ADMIN
    if (data.role === 'SUPER_ADMIN' || data.role === 'ADMIN') {
        if (callerRole !== 'SUPER_ADMIN') {
            throw new functions.https.HttpsError('permission-denied', 'Only SUPER_ADMIN can create administrative roles.');
        }
    }
    try {
        // Provision Auth Account
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.name,
        });
        const now = admin.firestore.FieldValue.serverTimestamp();
        const userDoc = {
            id: userRecord.uid,
            uid: userRecord.uid,
            email: data.email,
            name: data.name,
            role: data.role,
            organizationId: data.organizationId || null,
            phone: data.phone || null,
            state: data.state || null,
            district: data.district || null,
            status: 'ACTIVE',
            photoURL: data.photoURL || null,
            createdAt: now,
            updatedAt: now,
        };
        await db.collection('users').doc(userRecord.uid).set(userDoc);
        const auditCtx = { uid: auth.uid, role: callerRole };
        await (0, auditLogger_1.logAuditEvent)('CREATE', 'users', userRecord.uid, { after: userDoc }, auditCtx);
        return { success: true, uid: userRecord.uid, message: 'User created successfully.' };
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create user');
    }
});
/**
 * Gets a user profile. Admins can get any, normal users can only get their own.
 */
exports.getUserProfile = functions.https.onCall(async (data, context) => {
    const auth = (0, authMiddleware_1.requireAuth)(context);
    const callerRole = await (0, authMiddleware_1.getUserRole)(auth.uid);
    const targetUid = data.uid;
    if (auth.uid !== targetUid && callerRole !== 'ADMIN' && callerRole !== 'SUPER_ADMIN') {
        throw new functions.https.HttpsError('permission-denied', 'Cannot read other user profiles.');
    }
    const docSnap = await db.collection('users').doc(targetUid).get();
    if (!docSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found.');
    }
    return docSnap.data();
});
/**
 * Updates a user profile.
 * SUPER_ADMIN can update anything.
 * ADMIN can update anything except role (or elevate roles).
 * Normal users cannot call this function directly (they use firestore updates via client SDK).
 */
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
    const auth = await (0, authMiddleware_1.requireAdmin)(context);
    const callerRole = await (0, authMiddleware_1.getUserRole)(auth.uid) || 'UNKNOWN';
    const targetUid = data.uid;
    if (data.updates.role && callerRole !== 'SUPER_ADMIN') {
        throw new functions.https.HttpsError('permission-denied', 'Only SUPER_ADMIN can change roles.');
    }
    try {
        const docRef = db.collection('users').doc(targetUid);
        const beforeSnap = await docRef.get();
        if (!beforeSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found.');
        }
        const updates = {
            ...data.updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        // Remove protected fields from updates if provided
        delete updates.id;
        delete updates.uid;
        delete updates.createdAt;
        await docRef.update(updates);
        // Also update auth if email/password/name changed
        if (updates.email || updates.password || updates.name) {
            const authUpdates = {};
            if (updates.email)
                authUpdates.email = updates.email;
            if (updates.password)
                authUpdates.password = updates.password;
            if (updates.name)
                authUpdates.displayName = updates.name;
            await admin.auth().updateUser(targetUid, authUpdates);
        }
        const auditCtx = { uid: auth.uid, role: callerRole };
        await (0, auditLogger_1.logAuditEvent)('UPDATE', 'users', targetUid, { before: beforeSnap.data(), after: updates }, auditCtx);
        return { success: true };
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', error.message || 'Failed to update user');
    }
});
/**
 * Gets multiple users.
 */
exports.getUsers = functions.https.onCall(async (data, context) => {
    await (0, authMiddleware_1.requireAdmin)(context);
    let query = db.collection('users');
    if (data.role) {
        query = query.where('role', '==', data.role);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
});
/**
 * Disables a user.
 */
exports.disableUser = functions.https.onCall(async (data, context) => {
    const auth = await (0, authMiddleware_1.requireAdmin)(context);
    const callerRole = await (0, authMiddleware_1.getUserRole)(auth.uid) || 'UNKNOWN';
    await admin.auth().updateUser(data.uid, { disabled: true });
    await db.collection('users').doc(data.uid).update({
        status: 'INACTIVE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    const auditCtx = { uid: auth.uid, role: callerRole };
    await (0, auditLogger_1.logAuditEvent)('STATUS_CHANGE', 'users', data.uid, { fieldsChanged: ['status'] }, auditCtx);
    return { success: true };
});
/**
 * Enables a user.
 */
exports.enableUser = functions.https.onCall(async (data, context) => {
    const auth = await (0, authMiddleware_1.requireAdmin)(context);
    const callerRole = await (0, authMiddleware_1.getUserRole)(auth.uid) || 'UNKNOWN';
    await admin.auth().updateUser(data.uid, { disabled: false });
    await db.collection('users').doc(data.uid).update({
        status: 'ACTIVE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    const auditCtx = { uid: auth.uid, role: callerRole };
    await (0, auditLogger_1.logAuditEvent)('STATUS_CHANGE', 'users', data.uid, { fieldsChanged: ['status'] }, auditCtx);
    return { success: true };
});
//# sourceMappingURL=users.js.map