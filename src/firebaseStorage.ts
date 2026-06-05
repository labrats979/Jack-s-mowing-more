import { initializeApp, getApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Safe singleton initialization for Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const storage = getStorage(app);

/**
 * Uploads a base64 data URL to Firebase Storage.
 * @param base64DataUrl The image file as a data URL (e.g., data:image/jpeg;base64,...)
 * @param path The destination path in the Firebase Storage bucket (e.g., 'covers/hero.jpg')
 */
export async function uploadBase64ToStorage(base64DataUrl: string, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadResult = await uploadString(storageRef, base64DataUrl, 'data_url');
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  return downloadUrl;
}

/**
 * Uploads a Raw File/Blob to Firebase Storage.
 * @param file The File or Blob object to upload.
 * @param path The destination path in the Firebase Storage bucket.
 */
export async function uploadFileToStorage(file: File | Blob, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadResult = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  return downloadUrl;
}
