import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { requireAdmin, requireAuth, getUserRole } from './authMiddleware';
import { logAuditEvent, AuditContext } from '../audit/auditLogger';

const db = admin.firestore();

/**
 * Creates a new user profile via Cloud Functions (Admin only).
 */
export const createUserProfile = functions.https.onCall(async (data, context) => {
  const auth = await requireAdmin(context);
  const callerRole = await getUserRole(auth.uid) || 'UNKNOWN';

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

    const auditCtx: AuditContext = { uid: auth.uid, role: callerRole };
    await logAuditEvent('CREATE', 'users', userRecord.uid, { after: userDoc }, auditCtx);

    return { success: true, uid: userRecord.uid, message: 'User created successfully.' };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message || 'Failed to create user');
  }
});

/**
 * Gets a user profile. Admins can get any, normal users can only get their own.
 */
export const getUserProfile = functions.https.onCall(async (data, context) => {
  const auth = requireAuth(context);
  const callerRole = await getUserRole(auth.uid);
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
export const updateUserProfile = functions.https.onCall(async (data, context) => {
  const auth = await requireAdmin(context);
  const callerRole = await getUserRole(auth.uid) || 'UNKNOWN';
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
       const authUpdates: any = {};
       if (updates.email) authUpdates.email = updates.email;
       if (updates.password) authUpdates.password = updates.password;
       if (updates.name) authUpdates.displayName = updates.name;
       await admin.auth().updateUser(targetUid, authUpdates);
    }

    const auditCtx: AuditContext = { uid: auth.uid, role: callerRole };
    await logAuditEvent('UPDATE', 'users', targetUid, { before: beforeSnap.data(), after: updates }, auditCtx);

    return { success: true };
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message || 'Failed to update user');
  }
});

/**
 * Gets multiple users.
 */
export const getUsers = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  let query: admin.firestore.Query = db.collection('users');
  
  if (data.role) {
    query = query.where('role', '==', data.role);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => doc.data());
});

/**
 * Disables a user.
 */
export const disableUser = functions.https.onCall(async (data, context) => {
  const auth = await requireAdmin(context);
  const callerRole = await getUserRole(auth.uid) || 'UNKNOWN';
  
  await admin.auth().updateUser(data.uid, { disabled: true });
  await db.collection('users').doc(data.uid).update({ 
    status: 'INACTIVE', 
    updatedAt: admin.firestore.FieldValue.serverTimestamp() 
  });

  const auditCtx: AuditContext = { uid: auth.uid, role: callerRole };
  await logAuditEvent('STATUS_CHANGE', 'users', data.uid, { fieldsChanged: ['status'] }, auditCtx);

  return { success: true };
});

/**
 * Enables a user.
 */
export const enableUser = functions.https.onCall(async (data, context) => {
  const auth = await requireAdmin(context);
  const callerRole = await getUserRole(auth.uid) || 'UNKNOWN';
  
  await admin.auth().updateUser(data.uid, { disabled: false });
  await db.collection('users').doc(data.uid).update({ 
    status: 'ACTIVE', 
    updatedAt: admin.firestore.FieldValue.serverTimestamp() 
  });

  const auditCtx: AuditContext = { uid: auth.uid, role: callerRole };
  await logAuditEvent('STATUS_CHANGE', 'users', data.uid, { fieldsChanged: ['status'] }, auditCtx);

  return { success: true };
});
