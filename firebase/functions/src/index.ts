// import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Cloud Functions
export * from './auth/users';
// export * from './inspections';
export * from './assignments';
export * from './compliance';
export * from './submission';
// export * from './notifications';
export * from './reports';
// export * from './compliance';
// export * from './audit';
export * from './cctv';
