import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Threshold for a heartbeat to be considered stale (in milliseconds) - e.g., 10 minutes
const HEARTBEAT_THRESHOLD_MS = 10 * 60 * 1000;

/**
 * processCCTVHeartbeat - Trusted backend function to update heartbeat
 * Triggered by the device itself or a trusted relay
 */
export const processCCTVHeartbeat = functions.https.onCall(async (data, context) => {
  const deviceId = data.deviceId;

  if (!deviceId) {
    throw new functions.https.HttpsError('invalid-argument', 'deviceId is required');
  }

  const db = admin.firestore();
  const deviceRef = db.collection('cctvDevices').doc(deviceId);

  try {
    const deviceSnap = await deviceRef.get();
    if (!deviceSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Device not found');
    }

    const now = new Date().toISOString();
    await deviceRef.update({
      lastHeartbeat: now,
      status: 'ONLINE',
      updatedAt: now,
    });

    return { success: true, timestamp: now };
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process heartbeat');
  }
});

/**
 * checkStaleCCTVHeartbeats - Scheduled process to check for offline devices
 * Runs every 5 minutes
 */
export const checkStaleCCTVHeartbeats = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const db = admin.firestore();
  const now = new Date();
  const thresholdTime = new Date(now.getTime() - HEARTBEAT_THRESHOLD_MS).toISOString();

  try {
    // Only fetch devices that are currently ONLINE but their last heartbeat is older than the threshold
    const staleDevicesSnapshot = await db.collection('cctvDevices')
      .where('status', '==', 'ONLINE')
      .where('lastHeartbeat', '<', thresholdTime)
      .get();

    if (staleDevicesSnapshot.empty) {
      console.log('No stale devices found.');
      return null;
    }

    const batch = db.batch();
    const notificationsToCreate: any[] = [];

    staleDevicesSnapshot.forEach(doc => {
      // Transition to OFFLINE
      batch.update(doc.ref, {
        status: 'OFFLINE',
        updatedAt: now.toISOString()
      });

      // Prepare Notification/Alert
      const alertRef = db.collection('alerts').doc();
      notificationsToCreate.push({
        ref: alertRef,
        data: {
          type: 'CCTV_OFFLINE',
          severity: 'HIGH',
          message: `CCTV Device ${doc.id} went offline. No heartbeat received.`,
          entityId: doc.id,
          timestamp: now.toISOString(),
          isRead: false,
          createdAt: now.toISOString(),
          dataSourceType: 'OFFICIAL'
        }
      });
    });

    // Add notifications to batch
    notificationsToCreate.forEach(notification => {
      batch.set(notification.ref, notification.data);
    });

    await batch.commit();
    console.log(`Successfully transitioned ${staleDevicesSnapshot.size} devices to OFFLINE and generated notifications.`);

  } catch (error) {
    console.error('Error checking stale heartbeats:', error);
  }

  return null;
});
