//firebaseAdmin.ts
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app"; // cert 是憑證物件
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./software-serviceAccountKey.json";
import { getStorage } from 'firebase-admin/storage';


// Initialize Firebase Admin SDK only once.
// If the app is already initialized (e.g., in serverless environments like Next.js API routes),
// reuse the existing app instance to avoid errors.

const firebaseAdminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount as any),
        storageBucket: 'software-project-a060c.firebasestorage.app',
      })
    : getApp();

export const AUTH = getAuth(firebaseAdminApp);
export const DATABASE = getFirestore(firebaseAdminApp);
export const STORAGE = getStorage(firebaseAdminApp);
