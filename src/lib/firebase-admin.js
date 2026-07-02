// ponytail: server-side Firebase Admin untuk Server Actions & Route Handlers
// Inisialisasi hanya di server, ga perlu di client

const admin = require('firebase-admin');

function initAdmin() {
  if (admin.apps.length) return admin;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (!serviceAccount) return null;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  return admin;
}

const adminApp = initAdmin();

export const adminDb = adminApp ? adminApp.firestore() : null;
export const adminAuth = adminApp ? adminApp.auth() : null;
