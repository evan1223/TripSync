import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLfYjV9dfKOalCwBISsROQz_zgs9M65Dg",
  authDomain: "software-project-a060c.firebaseapp.com",
  projectId: "software-project-a060c",
  storageBucket: "software-project-a060c.firebasestorage.app",
  messagingSenderId: "163710286863",
  appId: "1:163710286863:web:c68c9c05fe96e87d54f77a",
  measurementId: "G-2F00Q3B6MQ"
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
