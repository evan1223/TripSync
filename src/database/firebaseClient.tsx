import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};
// Debug: Log the configuration (temporarily)
// console.log('Firebase Config:', {
//   apiKey: firebaseConfig.apiKey ? 'exists' : 'missing',
//   authDomain: firebaseConfig.authDomain ? 'exists' : 'missing',
//   projectId: firebaseConfig.projectId ? 'exists' : 'missing',
//   storageBucket: firebaseConfig.storageBucket ? 'exists' : 'missing',
//   messagingSenderId: firebaseConfig.messagingSenderId ? 'exists' : 'missing',
//   appId: firebaseConfig.appId ? 'exists' : 'missing',
//   measurementId: firebaseConfig.measurementId ? 'exists' : 'missing'
// });

// 	Initializes Firebase app using the project's config.
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, storage };
export default firebaseApp;
