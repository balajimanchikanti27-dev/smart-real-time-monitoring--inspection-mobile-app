import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Ensures the user is authenticated.
 */
export const requireAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  return context.auth;
};

/**
 * Retrieves the user's role from Firestore.
 */
export const getUserRole = async (uid: string): Promise<string | null> => {
  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  if (!userDoc.exists) return null;
  return userDoc.data()?.role || null;
};

/**
 * Ensures the user has SUPER_ADMIN role.
 */
export const requireSuperAdmin = async (context: functions.https.CallableContext) => {
  const auth = requireAuth(context);
  const role = await getUserRole(auth.uid);
  if (role !== 'SUPER_ADMIN') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'This operation requires SUPER_ADMIN privileges.'
    );
  }
  return auth;
};

/**
 * Ensures the user has ADMIN or SUPER_ADMIN role.
 */
export const requireAdmin = async (context: functions.https.CallableContext) => {
  const auth = requireAuth(context);
  const role = await getUserRole(auth.uid);
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'This operation requires ADMIN privileges.'
    );
  }
  return auth;
};
