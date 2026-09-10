import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config';

// Initialize Cloud Functions
const functions = getFunctions(app);

export interface SmsPayload {
  moduleType: string;
  recordName: string;
  recordId: string;
  mobileNumber: string;
}

export interface SmsResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Triggers the backend Cloud Function to send an SMS notification.
 */
export const sendSmsNotification = async (payload: SmsPayload): Promise<SmsResult> => {
  try {
    const sendSmsCallable = httpsCallable<SmsPayload, SmsResult>(functions, 'sendSubmissionSms');
    const result = await sendSmsCallable(payload);
    return result.data;
  } catch (error: any) {
    console.error('Error calling sendSubmissionSms function:', error);
    return { success: false, error: error.message || 'Failed to send SMS' };
  }
};
