import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import type { ServiceAccount } from "firebase-admin";

// Read service account from environment variable 
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT env var is not set. Please configure it in your environment."
  );
}

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
) as ServiceAccount;

// Initialize Firebase Admin SDK only once.
const firebaseAdminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
        storageBucket:"software-project-a060c.firebasestorage.app",
      })
    : getApp();

export const AUTH = getAuth(firebaseAdminApp);
export const DATABASE = getFirestore(firebaseAdminApp);
export const STORAGE = getStorage(firebaseAdminApp);