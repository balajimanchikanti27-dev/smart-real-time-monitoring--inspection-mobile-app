import { getStorage } from 'firebase/storage';
import { app } from './config';

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Boilerplate exports for future storage logic
export const uploadFile = async (_file: File, _path: string) => {
  // TODO: Implement file upload logic
};
