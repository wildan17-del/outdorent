// ponytail: Firebase init - lazy singleton, init sekali aja
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// ponytail: storage dihapus karena Firebase Storage butuh billing

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// ponytail: inisialisasi jalan kalo config ada, baik SSR maupun client
// Firebase SDK handle sendiri kalo di-server (gak akan crash, cuma warning)
let app = null;
let auth = null;
let db = null;

try {
  if (hasConfig) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  // silent - env var mungkin dummy pas build
}

export { app, auth, db, hasConfig };
