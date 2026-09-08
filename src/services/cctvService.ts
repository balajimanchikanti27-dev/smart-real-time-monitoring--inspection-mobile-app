import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CCTVDevice } from '../types';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'cctvDevices';

const NOTIFICATIONS_COLLECTION = 'alerts'; // Using alerts for notifications as per existing Alert type

export const createCCTVDevice = async (deviceData: Omit<CCTVDevice, 'id' | 'createdAt' | 'updatedAt' | 'lastHeartbeat'>) => {
  const newDocRef = doc(collection(db, COLLECTION_NAME));
  const newDevice: CCTVDevice = {
    ...deviceData,
    id: newDocRef.id,
    lastHeartbeat: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(newDocRef, newDevice);
  await logClientAuditEvent('CREATE', COLLECTION_NAME, newDocRef.id, newDevice);
  return newDevice;
};

export const getCCTVDevices = async (organizationId?: string): Promise<CCTVDevice[]> => {
  let q = collection(db, COLLECTION_NAME);
  if (organizationId) {
    q = query(q, where('organizationId', '==', organizationId)) as any;
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as CCTVDevice);
};
export const subscribeToCCTVDevices = (
  organizationId: string | undefined,
  callback: (devices: CCTVDevice[]) => void
) => {
  let q: any = collection(db, COLLECTION_NAME);
  if (organizationId) {
    q = query(q, where('organizationId', '==', organizationId));
  }
  
  return onSnapshot(q, (snapshot: any) => {
    const devices = snapshot.docs.map((doc: any) => doc.data() as CCTVDevice);
    callback(devices);
  }, (error: any) => {
    console.error("Error subscribing to CCTV devices:", error);
  });
};
export const updateCCTVDevice = async (id: string, updates: Partial<CCTVDevice>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(docRef, updatedData);
  await logClientAuditEvent('UPDATE', COLLECTION_NAME, id, updatedData);
};

export const deleteCCTVDevice = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
  await logClientAuditEvent('DELETE', COLLECTION_NAME, id, { deleted: true });
};

export const updateCCTVStatus = async (id: string, status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'MAINTENANCE') => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updatedData = {
    status,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(docRef, updatedData);
  await logClientAuditEvent('STATUS_CHANGE', COLLECTION_NAME, id, { status });

  if (status === 'OFFLINE') {
    const alertRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    await setDoc(alertRef, {
      type: 'CCTV_OFFLINE',
      severity: 'HIGH',
      message: `CCTV Device ${id} went offline.`,
      entityId: id,
      timestamp: new Date().toISOString(),
      isRead: false,
      createdAt: new Date().toISOString(),
      dataSourceType: 'OFFICIAL'
    });
  }
};

export const recordHeartbeat = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    lastHeartbeat: new Date().toISOString(),
    status: 'ONLINE',
    updatedAt: new Date().toISOString(),
  });
};
